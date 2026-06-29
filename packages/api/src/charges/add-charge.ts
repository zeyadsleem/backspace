import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";

import {
  db,
  eq,
  charge,
  chargeTypeEnum,
  customerAccount,
  visit,
  usageSession,
  workspaceEvent,
  billingResponsibilityEnum,
} from "@backspace/db";
import { writeAuditLog } from "../audit/audit";
import { BILLING_RESPONSIBILITY } from "../domain/domain";

export type ChargeTargetType = "visit" | "usage_session" | "event" | "host_account";
export type ChargeKind =
  | "product"
  | "service"
  | "fee"
  | "discount"
  | "complimentary"
  | "adjustment";
export type BillingResp =
  | "visitor"
  | "host"
  | "company"
  | "event"
  | "subscription"
  | "complimentary"
  | "pay_later";

export interface AddChargeInput {
  branchId: string;
  targetType: ChargeTargetType;
  targetId: string;
  type: ChargeKind;
  label: string;
  quantity: number;
  amountCents: number;
  currency: string;
  billingResponsibility: BillingResp;
  reason?: string;
  staffActorUserId: string;
}

export interface AddChargeResult {
  chargeId: string;
}

function generateId(): string {
  return crypto.randomUUID();
}

function assertBranchMatch(
  entityBranchId: string | null,
  expectedBranchId: string,
  entityLabel: string,
): void {
  if (entityBranchId !== expectedBranchId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${entityLabel} does not belong to this branch`,
    });
  }
}

function validateInput(input: AddChargeInput): void {
  if (!input.branchId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "branchId is required" });
  }
  if (!input.targetType || !input.targetId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Target is required" });
  }
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Quantity must be a positive integer" });
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents < 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "amountCents must be a non-negative integer",
    });
  }
  if (!input.label || input.label.trim().length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Label is required" });
  }
  const ACCEPTED_CURRENCIES = ["EGP", "USD"];
  if (!input.currency || !ACCEPTED_CURRENCIES.includes(input.currency)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid currency" });
  }

  let validChargeType = false;
  for (const ct of chargeTypeEnum.enumValues) {
    if (ct === input.type) {
      validChargeType = true;
      break;
    }
  }
  if (!validChargeType) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid charge type: ${input.type}` });
  }

  let validBillingResp = false;
  for (const br of billingResponsibilityEnum.enumValues) {
    if (br === input.billingResponsibility) {
      validBillingResp = true;
      break;
    }
  }
  if (!validBillingResp) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid billing responsibility: ${input.billingResponsibility}`,
    });
  }

  if (input.type === "discount" || input.type === "complimentary" || input.type === "adjustment") {
    if (!input.reason) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `${input.type} requires a reason` });
    }
  }

  if (
    input.type === "complimentary" &&
    input.billingResponsibility !== BILLING_RESPONSIBILITY.COMPLIMENTARY
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Complimentary charges must have complimentary billing responsibility",
    });
  }

  const supportedTargets: ChargeTargetType[] = ["visit", "usage_session", "event", "host_account"];
  if (!supportedTargets.includes(input.targetType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Unsupported target type: ${input.targetType}`,
    });
  }
}

export async function addCharge(input: AddChargeInput): Promise<AddChargeResult> {
  validateInput(input);

  let visitIdForCharge: string | null = null;
  let auditVisitId: string | null = null;
  let usageSessionIdForCharge: string | null = null;
  let eventIdForCharge: string | null = null;
  let hostAccountIdForCharge: string | null = null;

  switch (input.targetType) {
    case "visit": {
      const [visitRow] = await db.select().from(visit).where(eq(visit.id, input.targetId)).limit(1);
      if (!visitRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Visit not found" });
      }
      assertBranchMatch(visitRow.branchId, input.branchId, "Visit");
      if (visitRow.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Visit is ${visitRow.status} — charges can only be added to active visits`,
        });
      }
      visitIdForCharge = visitRow.id;
      auditVisitId = visitRow.id;
      break;
    }
    case "usage_session": {
      const [sessionRow] = await db
        .select()
        .from(usageSession)
        .where(eq(usageSession.id, input.targetId))
        .limit(1);
      if (!sessionRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usage session not found" });
      }
      const [parentVisit] = await db
        .select()
        .from(visit)
        .where(eq(visit.id, sessionRow.visitId))
        .limit(1);
      if (!parentVisit) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Visit for usage session not found" });
      }
      assertBranchMatch(parentVisit.branchId, input.branchId, "Usage session visit");
      if (sessionRow.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Usage session is ${sessionRow.status} — charges can only be added to active sessions`,
        });
      }
      auditVisitId = parentVisit.id;
      usageSessionIdForCharge = sessionRow.id;
      break;
    }
    case "event": {
      const [eventRow] = await db
        .select()
        .from(workspaceEvent)
        .where(eq(workspaceEvent.id, input.targetId))
        .limit(1);
      if (!eventRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }
      assertBranchMatch(eventRow.branchId, input.branchId, "Event");
      eventIdForCharge = eventRow.id;
      break;
    }
    case "host_account": {
      const [accountRow] = await db
        .select()
        .from(customerAccount)
        .where(eq(customerAccount.id, input.targetId))
        .limit(1);
      if (!accountRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Host account not found" });
      }
      assertBranchMatch(accountRow.branchId, input.branchId, "Host account");
      hostAccountIdForCharge = accountRow.id;
      break;
    }
  }

  const chargeId = generateId();

  await db.transaction(async (tx) => {
    await tx.insert(charge).values({
      id: chargeId,
      visitId: visitIdForCharge,
      usageSessionId: usageSessionIdForCharge,
      eventId: eventIdForCharge,
      hostAccountId: hostAccountIdForCharge,
      invoiceId: null,
      type: input.type,
      label: input.label,
      quantity: input.quantity,
      amountCents: input.amountCents,
      currency: input.currency,
      billingResponsibility: input.billingResponsibility,
      reason: input.reason ?? null,
    });

    const metadata: Record<string, unknown> = {
      targetType: input.targetType,
      targetId: input.targetId,
      amountCents: input.amountCents,
      currency: input.currency,
      quantity: input.quantity,
      billingResponsibility: input.billingResponsibility,
    };
    if (input.reason) metadata.reason = input.reason;
    if (auditVisitId) metadata.visitId = auditVisitId;
    if (usageSessionIdForCharge) metadata.usageSessionId = usageSessionIdForCharge;
    if (eventIdForCharge) metadata.eventId = eventIdForCharge;
    if (hostAccountIdForCharge) metadata.hostAccountId = hostAccountIdForCharge;

    await writeAuditLog(
      {
        id: generateId(),
        branchId: input.branchId,
        actorUserId: input.staffActorUserId,
        action: "charge.create",
        entityType: "charge",
        entityId: chargeId,
        metadata: JSON.stringify(metadata),
      },
      tx,
    );
  });

  return { chargeId };
}
