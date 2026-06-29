import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDbState, mockWriteAuditLog } = vi.hoisted(() => {
  let selectQueue: unknown[][] = [];
  let queueIndex = 0;
  let insertValues: unknown[] = [];
  let updateSets: unknown[] = [];
  const auditLog = vi.fn().mockResolvedValue(undefined);
  return {
    mockWriteAuditLog: auditLog,
    mockDbState: {
      get insertValues() {
        return insertValues;
      },
      get updateSets() {
        return updateSets;
      },
      setQueue: (results: unknown[][]) => {
        selectQueue = [...results];
        queueIndex = 0;
      },
      clearWrites: () => {
        insertValues = [];
        updateSets = [];
      },
      advance: () => {
        const result = queueIndex < selectQueue.length ? selectQueue[queueIndex] : [];
        queueIndex++;
        return result;
      },
    },
  };
});

vi.mock("@backspace/db", () => {
  const chainableThen = vi.fn((resolve: (value: unknown) => void) =>
    resolve(mockDbState.advance()),
  );
  const chainable = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    values: vi.fn((value: unknown) => {
      mockDbState.insertValues.push(value);
      return chainable;
    }),
    set: vi.fn((value: unknown) => {
      mockDbState.updateSets.push(value);
      return chainable;
    }),
    returning: vi.fn().mockReturnThis(),
    // oxlint-disable-next-line unicorn/no-thenable -- Drizzle query builders are awaitable.
    then: chainableThen,
    catch: vi.fn(),
  };
  const mockDb: Record<string, unknown> = {
    select: vi.fn().mockReturnValue(chainable),
    insert: vi.fn().mockReturnValue(chainable),
    update: vi.fn().mockReturnValue(chainable),
  };
  mockDb.transaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(mockDb));
  return {
    db: mockDb,
    and: vi.fn((...args: unknown[]) => ({ and: true, args })),
    eq: vi.fn((a: unknown, b: unknown) => ({ eq: true, a, b })),
    payment: {
      amountCents: "payment.amountCents",
      method: "payment.method",
      shiftId: "payment.shiftId",
      status: "payment.status",
    },
    shift: {
      id: "shift.id",
      branchId: "shift.branchId",
      openedByUserId: "shift.openedByUserId",
      status: "shift.status",
    },
  };
});

vi.mock("../audit/audit", () => ({
  writeAuditLog: mockWriteAuditLog,
}));

import { db } from "@backspace/db";
import { closeShift, getCurrentShift, openShift } from "./shifts";

function resetMockDb() {
  vi.mocked(db.select).mockClear();
  vi.mocked(db.insert).mockClear();
  vi.mocked(db.update).mockClear();
  vi.mocked(db.transaction as never).mockClear();
  mockWriteAuditLog.mockClear();
  mockDbState.setQueue([]);
  mockDbState.clearWrites();
}

function openShiftRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "shift-open",
    branchId: "branch-main",
    openedByUserId: "staff-user-1",
    closedByUserId: null,
    status: "open",
    openedAt: new Date("2026-06-30T08:00:00Z"),
    closedAt: null,
    expectedCashCents: 0,
    actualCashCents: null,
    currency: "EGP",
    notes: null,
    ...overrides,
  };
}

function insertedRows() {
  return mockDbState.insertValues as Record<string, unknown>[];
}

function updateSets() {
  return mockDbState.updateSets as Record<string, unknown>[];
}

describe("shift service", () => {
  beforeEach(() => resetMockDb());

  it("returns the current open shift with expected cash derived from cash payments", async () => {
    mockDbState.setQueue([[openShiftRow()], [{ amountCents: 1200 }, { amountCents: 800 }]]);

    const result = await getCurrentShift({
      branchId: "branch-main",
      staffActorUserId: "staff-user-1",
    });

    expect(result.status).toBe("open");
    expect(result.shift?.id).toBe("shift-open");
    expect(result.expectedCashCents).toBe(2000);
    expect(result.cashPaymentCount).toBe(2);
  });

  it("opens a shift transactionally and writes audit", async () => {
    mockDbState.setQueue([[], [openShiftRow()]]);

    const result = await openShift({ branchId: "branch-main", staffActorUserId: "staff-user-1" });

    expect(result.status).toBe("open");
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(insertedRows()[0]).toMatchObject({
      branchId: "branch-main",
      openedByUserId: "staff-user-1",
      status: "open",
      expectedCashCents: 0,
    });
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "shift.open",
        branchId: "branch-main",
        actorUserId: "staff-user-1",
        entityType: "shift",
      }),
      expect.anything(),
    );
  });

  it("rejects duplicate open shifts for the same staff and branch", async () => {
    mockDbState.setQueue([[openShiftRow()]]);

    await expect(
      openShift({ branchId: "branch-main", staffActorUserId: "staff-user-1" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    expect(db.insert).not.toHaveBeenCalled();
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });

  it("closes an open shift with expected, actual, and difference cash values", async () => {
    mockDbState.setQueue([
      [openShiftRow({ status: "closed", closedAt: new Date("2026-06-30T16:00:00Z") })],
      [{ amountCents: 2500 }, { amountCents: 500 }],
      [openShiftRow({ status: "closed", expectedCashCents: 3000, actualCashCents: 2800 })],
    ]);

    const result = await closeShift({
      branchId: "branch-main",
      staffActorUserId: "staff-user-1",
      shiftId: "shift-open",
      actualCashCents: 2800,
      notes: "Short by 2.00 EGP after drawer count",
    });

    expect(result.status).toBe("closed");
    expect(result.expectedCashCents).toBe(3000);
    expect(result.actualCashCents).toBe(2800);
    expect(result.differenceCents).toBe(-200);
    expect(updateSets()).toContainEqual(
      expect.objectContaining({ status: "closed", actualCashCents: 2800 }),
    );
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "shift.close",
        metadata: expect.stringContaining('"differenceCents":-200'),
      }),
      expect.anything(),
    );
  });

  it("rejects already closed shifts without audit", async () => {
    mockDbState.setQueue([[]]);

    await expect(
      closeShift({
        branchId: "branch-main",
        staffActorUserId: "staff-user-1",
        shiftId: "shift-open",
        actualCashCents: 1000,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });

  it("rejects negative actual cash before writing", async () => {
    await expect(
      closeShift({
        branchId: "branch-main",
        staffActorUserId: "staff-user-1",
        shiftId: "shift-open",
        actualCashCents: -1,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(db.transaction).not.toHaveBeenCalled();
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });
});
