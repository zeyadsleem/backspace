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
    orderBy: vi.fn().mockReturnThis(),
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
    gte: vi.fn((a: unknown, b: unknown) => ({ gte: true, a, b })),
    inArray: vi.fn((a: unknown, b: unknown) => ({ inArray: true, a, b })),
    lte: vi.fn((a: unknown, b: unknown) => ({ lte: true, a, b })),
    or: vi.fn((...args: unknown[]) => ({ or: true, args })),
    booking: {
      id: "booking.id",
      personId: "booking.personId",
      spaceId: "booking.spaceId",
      status: "booking.status",
      startsAt: "booking.startsAt",
      endsAt: "booking.endsAt",
      depositCents: "booking.depositCents",
      currency: "booking.currency",
      notes: "booking.notes",
    },
    person: {
      id: "person.id",
      displayName: "person.displayName",
      phone: "person.phone",
      email: "person.email",
    },
    space: {
      id: "space.id",
      branchId: "space.branchId",
      name: "space.name",
      kind: "space.kind",
      status: "space.status",
    },
    usageSession: {
      id: "usageSession.id",
      spaceId: "usageSession.spaceId",
      status: "usageSession.status",
    },
  };
});

vi.mock("../audit/audit", () => ({
  writeAuditLog: mockWriteAuditLog,
}));

vi.stubGlobal("crypto", {
  randomUUID: () => "test-booking-id",
});

import { db } from "@backspace/db";
import {
  cancelBooking,
  createBooking,
  getBookingCalendar,
  getBookingQueue,
  markBookingNoShow,
} from "./bookings";

const start = new Date("2026-06-30T09:00:00Z");
const end = new Date("2026-06-30T23:00:00Z");

function resetMockDb() {
  vi.mocked(db.select).mockClear();
  vi.mocked(db.insert).mockClear();
  vi.mocked(db.update).mockClear();
  vi.mocked(db.transaction as never).mockClear();
  mockWriteAuditLog.mockClear();
  mockDbState.setQueue([]);
  mockDbState.clearWrites();
}

function bookingRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "booking-1",
    personId: "person-1",
    spaceId: "space-1",
    status: "confirmed",
    startsAt: start,
    endsAt: end,
    depositCents: 5000,
    currency: "EGP",
    notes: "Focus room",
    ...overrides,
  };
}

function personRow(overrides: Record<string, unknown> = {}) {
  return { id: "person-1", displayName: "Mona Ali", phone: "0100", email: null, ...overrides };
}

function spaceRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "space-1",
    branchId: "branch-main",
    name: "Meeting Room A",
    kind: "meeting_room",
    status: "available",
    ...overrides,
  };
}

function insertedRows() {
  return mockDbState.insertValues as Record<string, unknown>[];
}

function updateSets() {
  return mockDbState.updateSets as Record<string, unknown>[];
}

describe("booking service", () => {
  beforeEach(() => resetMockDb());

  it("returns a branch-scoped calendar read model with deposits and action metadata", async () => {
    mockDbState.setQueue([
      [bookingRow(), bookingRow({ id: "other-branch", spaceId: "space-other" })],
      [spaceRow()],
      [personRow()],
      [],
      [],
      [spaceRow({ id: "space-other", branchId: "branch-other" })],
    ]);

    const result = await getBookingCalendar({
      branchId: "branch-main",
      rangeStart: new Date("2026-06-30T00:00:00Z"),
      rangeEnd: new Date("2026-06-30T23:59:59Z"),
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: "booking-1",
      branchId: "branch-main",
      person: { displayName: "Mona Ali" },
      space: { name: "Meeting Room A" },
      deposit: { amountCents: 5000, state: "recorded" },
      actions: { canCheckIn: true, canCancel: true, canMarkNoShow: true },
    });
  });

  it("surfaces conflict warnings for overlapping active bookings and active sessions", async () => {
    mockDbState.setQueue([
      [bookingRow(), bookingRow({ id: "booking-conflict" })],
      [spaceRow()],
      [personRow()],
      [bookingRow({ id: "booking-conflict" })],
      [{ id: "session-1", spaceId: "space-1", status: "active" }],
    ]);

    const result = await getBookingCalendar({
      branchId: "branch-main",
      rangeStart: new Date("2026-06-30T00:00:00Z"),
      rangeEnd: new Date("2026-06-30T23:59:59Z"),
    });

    expect(result.items[0]?.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "booking_overlap" }),
        expect.objectContaining({ code: "active_session" }),
      ]),
    );
    expect(result.items[0]?.actions.canCheckIn).toBe(false);
    expect(result.items[0]?.actions.disabledReason).toContain("Resolve conflicts");
  });

  it("builds a today queue with overdue and upcoming groups", async () => {
    mockDbState.setQueue([
      [
        bookingRow({ id: "overdue", startsAt: new Date("2026-06-30T08:00:00Z") }),
        bookingRow({ id: "upcoming", startsAt: new Date("2026-06-30T12:00:00Z") }),
      ],
      [spaceRow()],
      [personRow()],
      [],
      [],
      [spaceRow()],
      [personRow()],
      [],
      [],
    ]);

    const result = await getBookingQueue({
      branchId: "branch-main",
      now: new Date("2026-06-30T10:00:00Z"),
    });

    expect(result.overdue.map((item) => item.id)).toEqual(["overdue"]);
    expect(result.upcoming.map((item) => item.id)).toEqual(["upcoming"]);
  });

  it("creates a confirmed booking transactionally and writes audit", async () => {
    mockDbState.setQueue([[spaceRow()], [], [], [bookingRow({ id: "test-booking-id" })]]);

    const result = await createBooking({
      branchId: "branch-main",
      personId: "person-1",
      spaceId: "space-1",
      startsAt: start,
      endsAt: end,
      depositCents: 1000,
      staffActorUserId: "staff-user-1",
    });

    expect(result.id).toBe("test-booking-id");
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(insertedRows()[0]).toMatchObject({
      id: "test-booking-id",
      personId: "person-1",
      spaceId: "space-1",
      status: "confirmed",
      depositCents: 1000,
    });
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "booking.create", branchId: "branch-main" }),
      expect.anything(),
    );
  });

  it("rejects invalid ranges and negative deposits before writing", async () => {
    await expect(
      createBooking({
        branchId: "branch-main",
        personId: "person-1",
        spaceId: "space-1",
        startsAt: end,
        endsAt: start,
        depositCents: -1,
        staffActorUserId: "staff-user-1",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(db.insert).not.toHaveBeenCalled();
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });

  it("rejects create when the booking space belongs to another branch", async () => {
    mockDbState.setQueue([[spaceRow({ branchId: "branch-other" })]]);

    await expect(
      createBooking({
        branchId: "branch-main",
        personId: "person-1",
        spaceId: "space-1",
        startsAt: start,
        endsAt: end,
        staffActorUserId: "staff-user-1",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(db.insert).not.toHaveBeenCalled();
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });

  it("rejects create conflicts without audit", async () => {
    mockDbState.setQueue([[spaceRow()], [bookingRow({ id: "existing" })]]);

    await expect(
      createBooking({
        branchId: "branch-main",
        personId: "person-1",
        spaceId: "space-1",
        startsAt: start,
        endsAt: end,
        staffActorUserId: "staff-user-1",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    expect(db.insert).not.toHaveBeenCalled();
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });

  it("cancels and marks no-show only through allowed transitions with audit", async () => {
    mockDbState.setQueue([
      [bookingRow()],
      [spaceRow()],
      [bookingRow({ status: "cancelled" })],
      [bookingRow()],
      [spaceRow()],
      [bookingRow({ status: "no_show" })],
    ]);

    const cancelled = await cancelBooking({
      branchId: "branch-main",
      bookingId: "booking-1",
      staffActorUserId: "staff-user-1",
      reason: "Customer called",
    });
    const noShow = await markBookingNoShow({
      branchId: "branch-main",
      bookingId: "booking-1",
      staffActorUserId: "staff-user-1",
      now: new Date("2026-06-30T11:00:00Z"),
    });

    expect(cancelled.status).toBe("cancelled");
    expect(noShow.status).toBe("no_show");
    expect(updateSets()).toContainEqual(expect.objectContaining({ status: "cancelled" }));
    expect(updateSets()).toContainEqual(expect.objectContaining({ status: "no_show" }));
    expect(mockWriteAuditLog).toHaveBeenCalledTimes(2);
  });
});
