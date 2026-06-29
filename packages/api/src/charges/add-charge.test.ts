import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDbState, mockWriteAuditLog } = vi.hoisted(() => {
  let selectQueue: unknown[][] = [];
  let queueIndex = 0;
  let insertValues: unknown[] = [];
  const auditLog = vi.fn().mockResolvedValue(undefined);
  return {
    mockWriteAuditLog: auditLog,
    mockDbState: {
      get insertValues() {
        return insertValues;
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
    set: vi.fn().mockReturnThis(),
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
    charge: { id: "charge" },
    customerAccount: { id: "customer-account" },
    visit: { id: "visit", branchId: "visit-branch-id", status: "visit-status" },
    usageSession: { id: "usage-session" },
    workspaceEvent: { id: "workspace-event" },
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

import { db } from "@backspace/db";
import { addCharge } from "./add-charge";

function resetMockDb() {
  vi.mocked(db.select).mockClear();
  vi.mocked(db.insert).mockClear();
  vi.mocked(db.update).mockClear();
  vi.mocked(db.transaction as never).mockClear();
  mockWriteAuditLog.mockClear();
  mockDbState.setQueue([]);
  mockDbState.clearWrites();
}

function validInput() {
  return {
    branchId: "branch-main",
    targetType: "visit" as const,
    targetId: "visit-active",
    type: "product" as const,
    label: "Bottled Water",
    quantity: 2,
    amountCents: 2000,
    currency: "EGP",
    billingResponsibility: "visitor" as const,
    staffActorUserId: "staff-user-1",
  };
}

describe("addCharge", () => {
  beforeEach(() => resetMockDb());

  describe("input validation", () => {
    it("rejects missing branchId", async () => {
      await expect(addCharge({ ...validInput(), branchId: "" })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects missing target", async () => {
      await expect(
        addCharge({ ...validInput(), targetType: "" as never, targetId: "" }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("rejects invalid quantity (zero)", async () => {
      await expect(addCharge({ ...validInput(), quantity: 0 })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects invalid quantity (negative)", async () => {
      await expect(addCharge({ ...validInput(), quantity: -1 })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects invalid amountCents (negative)", async () => {
      await expect(addCharge({ ...validInput(), amountCents: -100 })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects missing label", async () => {
      await expect(addCharge({ ...validInput(), label: "" })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects invalid currency (XYZ)", async () => {
      await expect(addCharge({ ...validInput(), currency: "XYZ" })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects discount without reason", async () => {
      await expect(addCharge({ ...validInput(), type: "discount" })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects complimentary without complimentary responsibility", async () => {
      await expect(
        addCharge({
          ...validInput(),
          type: "complimentary",
          billingResponsibility: "visitor",
          reason: "promo",
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("rejects invalid charge type", async () => {
      await expect(addCharge({ ...validInput(), type: "invalid" as never })).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects invalid billing responsibility", async () => {
      await expect(
        addCharge({ ...validInput(), billingResponsibility: "invalid" as never }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("rejects unsupported target type", async () => {
      await expect(
        addCharge({ ...validInput(), targetType: "invoice_draft" as never }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });
  });

  describe("target validation", () => {
    it("rejects missing visit target", async () => {
      mockDbState.setQueue([[]]);
      await expect(addCharge(validInput())).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("rejects cross-branch visit", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-active",
            branchId: "branch-other",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      await expect(addCharge(validInput())).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    });

    it("rejects checked-out visit", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-checkedout",
            branchId: "branch-main",
            status: "checked_out",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      await expect(
        addCharge({ ...validInput(), targetId: "visit-checkedout" }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("rejects missing event target", async () => {
      mockDbState.setQueue([[]]);
      await expect(
        addCharge({ ...validInput(), targetType: "event", targetId: "event-none", type: "fee" }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("rejects cross-branch event", async () => {
      mockDbState.setQueue([
        [
          {
            id: "event-other",
            branchId: "branch-other",
            hostAccountId: null,
            settlementMode: "host_account",
          },
        ],
      ]);
      await expect(
        addCharge({ ...validInput(), targetType: "event", targetId: "event-other", type: "fee" }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("rejects missing host account target", async () => {
      mockDbState.setQueue([[]]);
      await expect(
        addCharge({
          ...validInput(),
          targetType: "host_account",
          targetId: "account-none",
          type: "fee",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("rejects cross-branch host account", async () => {
      mockDbState.setQueue([
        [
          {
            id: "account-other",
            branchId: "branch-other",
            name: "Other",
            accountType: "individual",
          },
        ],
      ]);
      await expect(
        addCharge({
          ...validInput(),
          targetType: "host_account",
          targetId: "account-other",
          type: "fee",
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("rejects missing usage session target", async () => {
      mockDbState.setQueue([[]]);
      await expect(
        addCharge({
          ...validInput(),
          targetType: "usage_session",
          targetId: "session-none",
          type: "service",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("rejects usage session with missing parent visit", async () => {
      mockDbState.setQueue([
        [
          {
            id: "session-orphan",
            visitId: "visit-nonexistent",
            spaceId: "space-1",
            status: "active",
          },
        ],
        [],
      ]);
      await expect(
        addCharge({
          ...validInput(),
          targetType: "usage_session",
          targetId: "session-orphan",
          type: "service",
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("rejects ended usage session", async () => {
      mockDbState.setQueue([
        [
          {
            id: "session-ended",
            visitId: "visit-active",
            spaceId: "space-1",
            status: "ended",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      await expect(
        addCharge({
          ...validInput(),
          targetType: "usage_session",
          targetId: "session-ended",
          type: "service",
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });
  });

  describe("success", () => {
    it("creates charge successfully for a valid visit target", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      const result = await addCharge(validInput());
      expect(result.chargeId).toBeDefined();
      expect(typeof result.chargeId).toBe("string");
      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(db.insert).toHaveBeenCalledTimes(1);
    });

    it("locks the active visit before inserting a visit charge", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);

      await addCharge(validInput());

      const lockOrder = vi.mocked(db.update).mock.invocationCallOrder[0];
      const insertOrder = vi.mocked(db.insert).mock.invocationCallOrder[0];
      expect(lockOrder).toBeLessThan(insertOrder);
    });

    it("does not insert if the visit is no longer active when locked", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
        [],
      ]);

      await expect(addCharge(validInput())).rejects.toMatchObject({ code: "CONFLICT" });

      expect(db.insert).not.toHaveBeenCalled();
      expect(mockWriteAuditLog).not.toHaveBeenCalled();
    });

    it("creates charge successfully for a valid event target", async () => {
      mockDbState.setQueue([
        [
          {
            id: "event-workshop",
            branchId: "branch-main",
            hostAccountId: null,
            settlementMode: "host_account",
          },
        ],
      ]);
      const result = await addCharge({
        ...validInput(),
        targetType: "event",
        targetId: "event-workshop",
        type: "fee",
      });
      expect(result.chargeId).toBeDefined();
    });

    it("creates charge successfully for a valid host account target", async () => {
      mockDbState.setQueue([
        [
          {
            id: "account-host",
            branchId: "branch-main",
            name: "Host Co",
            accountType: "individual",
          },
        ],
      ]);
      const result = await addCharge({
        ...validInput(),
        targetType: "host_account",
        targetId: "account-host",
        type: "fee",
      });
      expect(result.chargeId).toBeDefined();
    });

    it("creates charge for usage session target", async () => {
      mockDbState.setQueue([
        [
          {
            id: "session-active",
            visitId: "visit-active",
            spaceId: "space-1",
            status: "active",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      const result = await addCharge({
        ...validInput(),
        targetType: "usage_session",
        targetId: "session-active",
        type: "service",
      });
      expect(result.chargeId).toBeDefined();
      expect(mockDbState.insertValues[0]).toMatchObject({
        visitId: null,
        usageSessionId: "session-active",
        eventId: null,
        hostAccountId: null,
        invoiceId: null,
      });

      const auditCall = mockWriteAuditLog.mock.calls[0][0];
      const metadata = JSON.parse(auditCall.metadata);
      expect(metadata.visitId).toBe("visit-active");
      expect(metadata.usageSessionId).toBe("session-active");
    });

    it("writes audit on success", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      await addCharge(validInput());
      expect(mockWriteAuditLog).toHaveBeenCalledTimes(1);
      const auditCall = mockWriteAuditLog.mock.calls[0][0];
      expect(auditCall).toMatchObject({
        action: "charge.create",
        branchId: "branch-main",
        entityType: "charge",
        actorUserId: "staff-user-1",
        entityId: expect.any(String),
      });
    });

    it("audit metadata includes target type and id", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      await addCharge(validInput());
      const call = mockWriteAuditLog.mock.calls[0][0];
      const metadata = JSON.parse(call.metadata);
      expect(metadata.targetType).toBe("visit");
      expect(metadata.targetId).toBe("visit-active");
      expect(metadata.amountCents).toBe(2000);
      expect(metadata.currency).toBe("EGP");
      expect(metadata.quantity).toBe(2);
    });
  });

  describe("audit on failure", () => {
    it("does not write audit on validation failure", async () => {
      await expect(addCharge({ ...validInput(), branchId: "" })).rejects.toThrow();
      expect(mockWriteAuditLog).not.toHaveBeenCalled();
    });

    it("does not write audit on target not found", async () => {
      mockDbState.setQueue([[]]);
      await expect(addCharge(validInput())).rejects.toThrow();
      expect(mockWriteAuditLog).not.toHaveBeenCalled();
    });

    it("rejects if audit write fails inside transaction (no partial write)", async () => {
      mockDbState.setQueue([
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
        [
          {
            id: "visit-active",
            branchId: "branch-main",
            status: "active",
            personId: "p1",
            visitType: "walk_in",
            billingResponsibility: "visitor",
          },
        ],
      ]);
      mockWriteAuditLog.mockRejectedValueOnce(new Error("Audit write failed"));
      await expect(addCharge(validInput())).rejects.toThrow("Audit write failed");
      expect(db.transaction).toHaveBeenCalledTimes(1);
    });
  });
});
