import { describe, expect, it, vi } from "vitest";

/* eslint-disable unicorn/no-thenable */

type ResolveFn = (value: unknown) => void;

vi.mock("@backspace/db", () => {
  const chainableThen = vi.fn((resolve: ResolveFn) => {
    resolve([]);
  });
  const chainable = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    then: chainableThen,
  };
  const db = {
    select: vi.fn().mockReturnValue(chainable),
    insert: vi.fn().mockReturnValue(chainable),
    update: vi.fn().mockReturnValue(chainable),
  };
  return {
    db,
    and: vi.fn((...args: unknown[]) => ({ and: true, args })),
    eq: vi.fn((a: unknown, b: unknown) => ({ eq: true, a, b })),
    auditLog: { id: "al-id" },
    approvalRequest: { id: "ar-id" },
    __chainable: chainable,
    __chainableThen: chainableThen,
  };
});

import { db } from "@backspace/db";

import { createApprovalRequest, reviewApprovalRequest, writeAuditLog } from "./audit";

type MockChainable = ReturnType<typeof db.select> & { then: ReturnType<typeof vi.fn> };
const getChainable = () => db.select() as MockChainable;

describe("writeAuditLog", () => {
  it("inserts an audit log entry", async () => {
    await writeAuditLog({
      id: "log-1",
      branchId: "branch-1",
      actorUserId: "user-1",
      action: "visit.create",
      entityType: "visit",
      entityId: "visit-1",
    });

    expect(db.insert).toHaveBeenCalled();
  });

  it("inserts with optional metadata", async () => {
    await writeAuditLog({
      id: "log-2",
      branchId: "branch-1",
      actorUserId: "user-1",
      action: "invoice.finalize",
      entityType: "invoice",
      entityId: "inv-1",
      metadata: JSON.stringify({ total: 10000 }),
    });

    expect(db.insert).toHaveBeenCalled();
  });

  it("inserts without optional branchId", async () => {
    await writeAuditLog({
      id: "log-3",
      actorUserId: "user-1",
      action: "system.config",
      entityType: "config",
      entityId: "config-1",
    });

    expect(db.insert).toHaveBeenCalled();
  });
});

describe("createApprovalRequest", () => {
  it("creates a pending approval request", async () => {
    await createApprovalRequest({
      id: "req-1",
      branchId: "branch-1",
      requestedByUserId: "user-1",
      action: "invoice.void",
      targetType: "invoice",
      targetId: "inv-1",
    });

    expect(db.insert).toHaveBeenCalled();
  });

  it("creates without optional branchId", async () => {
    await createApprovalRequest({
      id: "req-2",
      requestedByUserId: "user-1",
      action: "refund.process",
      targetType: "payment",
      targetId: "pay-1",
    });

    expect(db.insert).toHaveBeenCalled();
  });
});

describe("reviewApprovalRequest", () => {
  it("approves a pending request", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) =>
      resolve([{ id: "req-1", status: "pending" }]),
    );

    await reviewApprovalRequest({
      id: "req-1",
      reviewedByUserId: "manager-1",
      status: "approved",
    });

    expect(db.update).toHaveBeenCalled();
  });

  it("rejects a pending request with reason", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) =>
      resolve([{ id: "req-2", status: "pending" }]),
    );

    await reviewApprovalRequest({
      id: "req-2",
      reviewedByUserId: "manager-1",
      status: "rejected",
      reason: "Insufficient documentation",
    });
  });

  it("throws NOT_FOUND when request does not exist", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) => resolve([]));

    await expect(
      reviewApprovalRequest({
        id: "req-nonexistent",
        reviewedByUserId: "manager-1",
        status: "approved",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws BAD_REQUEST when request is not pending", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) =>
      resolve([{ id: "req-3", status: "approved" }]),
    );

    await expect(
      reviewApprovalRequest({
        id: "req-3",
        reviewedByUserId: "manager-1",
        status: "rejected",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("allows cancelling a pending request", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) =>
      resolve([{ id: "req-4", status: "pending" }]),
    );

    await reviewApprovalRequest({
      id: "req-4",
      reviewedByUserId: "requester-1",
      status: "cancelled",
      reason: "No longer needed",
    });
  });
});
