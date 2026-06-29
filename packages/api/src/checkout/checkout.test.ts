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
      get selectResult() {
        if (queueIndex < selectQueue.length) {
          return selectQueue[queueIndex];
        }
        return selectQueue.length > 0 ? selectQueue[selectQueue.length - 1] : [];
      },
      set selectResult(v: unknown[]) {
        selectQueue = [v];
        queueIndex = 0;
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
    inArray: vi.fn((a: unknown, b: unknown) => ({ inArray: true, a, b })),
    isNull: vi.fn((col: unknown) => ({ isNull: true, col })),
    or: vi.fn((...args: unknown[]) => ({ or: true, args })),
    charge: {
      id: "charge.id",
      visitId: "charge.visitId",
      usageSessionId: "charge.usageSessionId",
      invoiceId: "charge.invoiceId",
    },
    visit: { id: "visit.id", branchId: "visit.branchId", status: "visit.status" },
    usageSession: {
      id: "usage-session.id",
      visitId: "usage-session.visitId",
      status: "usage-session.status",
    },
    invoice: { id: "invoice" },
    invoiceItem: { id: "invoice-item" },
    payment: { id: "payment" },
    branch: { id: "branch" },
    chargeTypeEnum: {
      enumValues: ["product", "service", "fee", "discount", "complimentary", "adjustment"],
    },
    billingResponsibilityEnum: {
      enumValues: [
        "visitor",
        "host",
        "company",
        "event",
        "subscription",
        "complimentary",
        "pay_later",
      ],
    },
    visitStatusEnum: { enumValues: ["active", "checked_out", "cancelled"] },
    usageSessionStatusEnum: { enumValues: ["active", "ended", "cancelled"] },
  };
});

vi.mock("../audit/audit", () => ({
  writeAuditLog: mockWriteAuditLog,
}));

import { db, inArray, or } from "@backspace/db";
import { previewCheckout, finalizeCheckout } from "./checkout";

function resetMockDb() {
  vi.mocked(db.select).mockClear();
  vi.mocked(db.insert).mockClear();
  vi.mocked(db.update).mockClear();
  vi.mocked(db.transaction as never).mockClear();
  vi.mocked(inArray).mockClear();
  vi.mocked(or).mockClear();
  mockWriteAuditLog.mockClear();
  mockDbState.setQueue([]);
  mockDbState.clearWrites();
}

function activeVisit() {
  return {
    id: "visit-active",
    branchId: "branch-main",
    personId: "person-1",
    visitType: "walk_in",
    billingResponsibility: "visitor",
    status: "active",
    bookingId: null,
    membershipId: null,
    hostAccountId: null,
    checkedInAt: new Date(),
    checkedOutAt: null,
    nonBillableReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function chargeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "c1",
    visitId: "visit-active",
    label: "Water",
    type: "product",
    quantity: 1,
    amountCents: 1000,
    currency: "EGP",
    billingResponsibility: "visitor",
    reason: null,
    invoiceId: null,
    usageSessionId: null,
    eventId: null,
    hostAccountId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function sessionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    visitId: "visit-active",
    spaceId: "space-1",
    status: "active",
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function insertedRows() {
  return mockDbState.insertValues as Record<string, unknown>[];
}

function updateSets() {
  return mockDbState.updateSets as Record<string, unknown>[];
}

describe("previewCheckout", () => {
  beforeEach(() => resetMockDb());

  it("rejects missing visit", async () => {
    mockDbState.setQueue([[], []]);
    await expect(
      previewCheckout({ branchId: "branch-main", visitId: "visit-nonexistent" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects cross-branch visit", async () => {
    mockDbState.setQueue([[activeVisit()], [], [], []]);
    await expect(
      previewCheckout({ branchId: "branch-other", visitId: "visit-active" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects non-active visit", async () => {
    mockDbState.setQueue([[{ ...activeVisit(), status: "checked_out" }], [], [], []]);
    await expect(
      previewCheckout({ branchId: "branch-main", visitId: "visit-active" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns line items for visit charges", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "charge-1",
          visitId: "visit-active",
          label: "Water",
          type: "product",
          quantity: 2,
          amountCents: 2000,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
    ]);
    const result = await previewCheckout({ branchId: "branch-main", visitId: "visit-active" });
    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0]).toMatchObject({ label: "Water", amountCents: 2000 });
  });

  it("collects usage-session-targeted charges for active sessions owned by the visit", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        chargeRow({
          id: "session-charge",
          visitId: null,
          usageSessionId: "session-1",
          label: "Desk usage",
          type: "service",
          amountCents: 5000,
        }),
      ],
      [sessionRow()],
    ]);

    const result = await previewCheckout({ branchId: "branch-main", visitId: "visit-active" });

    expect(result.lineItems).toEqual([
      expect.objectContaining({
        chargeId: "session-charge",
        label: "Desk usage",
        amountCents: 5000,
      }),
    ]);
    expect(inArray).toHaveBeenCalled();
    expect(or).toHaveBeenCalled();
  });

  it("calculates totals using integer minor units", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Water",
          type: "product",
          quantity: 2,
          amountCents: 2000,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "c2",
          visitId: "visit-active",
          label: "Coffee",
          type: "product",
          quantity: 1,
          amountCents: 2500,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
    ]);
    const result = await previewCheckout({ branchId: "branch-main", visitId: "visit-active" });
    expect(result.totals.subtotalCents).toBe(6500);
    expect(result.totals.totalCents).toBe(6500);
    expect(result.totals.currency).toBe("EGP");
  });

  it("groups responsibility split", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Day Pass",
          type: "fee",
          quantity: 1,
          amountCents: 20000,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
    ]);
    const result = await previewCheckout({ branchId: "branch-main", visitId: "visit-active" });
    expect(result.responsibilityGroups).toHaveLength(1);
    expect(result.responsibilityGroups[0]).toMatchObject({
      responsibility: "visitor",
      totalCents: 20000,
    });
  });

  it("marks included/subscription responsibility", async () => {
    mockDbState.setQueue([
      [{ ...activeVisit(), billingResponsibility: "subscription" }],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Desk usage",
          type: "service",
          quantity: 1,
          amountCents: 0,
          currency: "EGP",
          billingResponsibility: "subscription",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
    ]);
    const result = await previewCheckout({ branchId: "branch-main", visitId: "visit-active" });
    expect(result.totals.totalCents).toBe(0);
    const group = result.responsibilityGroups.find((g) => g.responsibility === "subscription");
    expect(group?.outcome).toBe("included");
  });

  it("preview performs no writes", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [],
      [],
    ]);
    await previewCheckout({ branchId: "branch-main", visitId: "visit-active" });
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });
});

describe("finalizeCheckout", () => {
  beforeEach(() => resetMockDb());

  it("rejects missing visit", async () => {
    mockDbState.setQueue([[], []]);
    await expect(
      finalizeCheckout({
        branchId: "branch-main",
        visitId: "visit-nonexistent",
        staffActorUserId: "staff-user-1",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects cross-branch visit", async () => {
    mockDbState.setQueue([[activeVisit()], [], [], []]);
    await expect(
      finalizeCheckout({
        branchId: "branch-other",
        visitId: "visit-active",
        staffActorUserId: "staff-user-1",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects already checked-out visit", async () => {
    mockDbState.setQueue([[{ ...activeVisit(), status: "checked_out" }], [], [], []]);
    await expect(
      finalizeCheckout({
        branchId: "branch-main",
        visitId: "visit-active",
        staffActorUserId: "staff-user-1",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("creates invoice and records payment for visitor responsibility", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Water",
          type: "product",
          quantity: 2,
          amountCents: 2000,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
      [activeVisit()],
    ]);
    const result = await finalizeCheckout({
      branchId: "branch-main",
      visitId: "visit-active",
      staffActorUserId: "staff-user-1",
      payments: [{ responsibility: "visitor", method: "cash", amountCents: 4000 }],
    });
    expect(result.invoiceIds).toHaveLength(1);
    expect(result.paymentIds).toHaveLength(1);
    expect(result.endedSessionIds).toBeDefined();
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(insertedRows()[0]).toMatchObject({ status: "paid" });
  });

  it("rejects if the visit is no longer active when finalization claims it", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [chargeRow()],
      [],
      [],
    ]);

    await expect(
      finalizeCheckout({
        branchId: "branch-main",
        visitId: "visit-active",
        staffActorUserId: "staff-user-1",
        payments: [{ responsibility: "visitor", method: "cash", amountCents: 1000 }],
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    expect(db.insert).not.toHaveBeenCalled();
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });

  it("rejects payment amount mismatch", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Water",
          type: "product",
          quantity: 1,
          amountCents: 1000,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
      [activeVisit()],
    ]);
    await expect(
      finalizeCheckout({
        branchId: "branch-main",
        visitId: "visit-active",
        staffActorUserId: "staff-user-1",
        payments: [{ responsibility: "visitor", method: "cash", amountCents: 500 }],
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("handles zero-due included outcome", async () => {
    mockDbState.setQueue([
      [{ ...activeVisit(), billingResponsibility: "subscription" }],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Desk",
          type: "service",
          quantity: 1,
          amountCents: 0,
          currency: "EGP",
          billingResponsibility: "subscription",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
      [activeVisit()],
    ]);
    const result = await finalizeCheckout({
      branchId: "branch-main",
      visitId: "visit-active",
      staffActorUserId: "staff-user-1",
    });
    expect(result.invoiceIds).toHaveLength(1);
    expect(result.paymentIds).toHaveLength(0);
    expect(insertedRows()[0]).toMatchObject({ status: "finalized" });
  });

  it("finalizes pay-later and complimentary invoices without leaving them as draft", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        chargeRow({
          id: "pay-later-charge",
          billingResponsibility: "pay_later",
          amountCents: 3000,
        }),
        chargeRow({
          id: "complimentary-charge",
          type: "complimentary",
          billingResponsibility: "complimentary",
          amountCents: 0,
        }),
      ],
      [],
      [activeVisit()],
    ]);

    const result = await finalizeCheckout({
      branchId: "branch-main",
      visitId: "visit-active",
      staffActorUserId: "staff-user-1",
    });

    expect(result.invoiceIds).toHaveLength(2);
    expect(insertedRows()[0]).toMatchObject({ status: "finalized", totalCents: 3000 });
    expect(insertedRows()[2]).toMatchObject({ status: "finalized", totalCents: 0 });
  });

  it("invoices and links usage-session-targeted charges", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        chargeRow({
          id: "session-charge",
          visitId: null,
          usageSessionId: "session-1",
          label: "Desk usage",
          type: "service",
          amountCents: 5000,
        }),
      ],
      [sessionRow()],
      [activeVisit()],
    ]);

    const result = await finalizeCheckout({
      branchId: "branch-main",
      visitId: "visit-active",
      staffActorUserId: "staff-user-1",
      payments: [{ responsibility: "visitor", method: "cash", amountCents: 5000 }],
    });

    expect(result.invoiceIds).toHaveLength(1);
    expect(insertedRows()).toContainEqual(
      expect.objectContaining({ chargeId: "session-charge", label: "Desk usage" }),
    );
    expect(updateSets()).toContainEqual(
      expect.objectContaining({
        invoiceId: expect.any(String),
        visitId: null,
        usageSessionId: null,
        eventId: null,
        hostAccountId: null,
      }),
    );
  });

  it("ends active usage sessions", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Water",
          type: "product",
          quantity: 1,
          amountCents: 1000,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [
        {
          id: "session-1",
          visitId: "visit-active",
          spaceId: "space-1",
          status: "active",
          startedAt: new Date(),
          endedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [activeVisit()],
    ]);
    const result = await finalizeCheckout({
      branchId: "branch-main",
      visitId: "visit-active",
      staffActorUserId: "staff-user-1",
      payments: [{ responsibility: "visitor", method: "cash", amountCents: 1000 }],
    });
    expect(result.endedSessionIds).toContain("session-1");
  });

  it("writes audit on success", async () => {
    mockDbState.setQueue([
      [activeVisit()],
      [{ id: "branch-main", name: "Downtown", timezone: "Africa/Cairo", currency: "EGP" }],
      [
        {
          id: "c1",
          visitId: "visit-active",
          label: "Water",
          type: "product",
          quantity: 1,
          amountCents: 1000,
          currency: "EGP",
          billingResponsibility: "visitor",
          reason: null,
          invoiceId: null,
          usageSessionId: null,
          eventId: null,
          hostAccountId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [],
      [activeVisit()],
    ]);
    await finalizeCheckout({
      branchId: "branch-main",
      visitId: "visit-active",
      staffActorUserId: "staff-user-1",
      payments: [{ responsibility: "visitor", method: "cash", amountCents: 1000 }],
    });
    expect(mockWriteAuditLog).toHaveBeenCalledTimes(1);
    const auditCall = mockWriteAuditLog.mock.calls[0][0];
    expect(auditCall).toMatchObject({
      action: "checkout.finalize",
      branchId: "branch-main",
      actorUserId: "staff-user-1",
      entityType: "visit",
      entityId: "visit-active",
    });
  });

  it("does not write audit on validation failure", async () => {
    mockDbState.setQueue([[], []]);
    await expect(
      finalizeCheckout({
        branchId: "branch-main",
        visitId: "visit-nonexistent",
        staffActorUserId: "staff-user-1",
      }),
    ).rejects.toThrow();
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });
});
