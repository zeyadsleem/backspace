import type { PgDatabase } from "drizzle-orm/pg-core";
import { TRPCError } from "@trpc/server";

import { approvalRequest, auditLog, db, eq } from "@backspace/db";

type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export type { ApprovalStatus };

export async function writeAuditLog(
  params: {
    id: string;
    branchId?: string;
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: string;
  },
  tx?: PgDatabase<any, any, any>,
): Promise<void> {
  const conn = tx ?? db;
  await conn.insert(auditLog).values({
    id: params.id,
    branchId: params.branchId ?? null,
    actorUserId: params.actorUserId ?? null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata ?? null,
  });
}

export async function createApprovalRequest(params: {
  id: string;
  branchId?: string;
  requestedByUserId: string;
  action: string;
  targetType: string;
  targetId: string;
}): Promise<void> {
  await db.insert(approvalRequest).values({
    id: params.id,
    branchId: params.branchId ?? null,
    requestedByUserId: params.requestedByUserId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    status: "pending",
  });
}

export async function reviewApprovalRequest(params: {
  id: string;
  reviewedByUserId: string;
  status: ApprovalStatus;
  reason?: string;
}): Promise<void> {
  const [existing] = await db
    .select()
    .from(approvalRequest)
    .where(eq(approvalRequest.id, params.id))
    .limit(1);

  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Approval request not found" });
  }

  if (existing.status !== "pending") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Approval request is not pending" });
  }

  await db
    .update(approvalRequest)
    .set({
      reviewedByUserId: params.reviewedByUserId,
      status: params.status,
      reason: params.reason ?? null,
      reviewedAt: new Date(),
    })
    .where(eq(approvalRequest.id, params.id));
}
