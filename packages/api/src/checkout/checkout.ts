import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";

import {
  and,
  branch,
  charge,
  db,
  eq,
  inArray,
  invoice,
  invoiceItem,
  isNull,
  or,
  payment,
  usageSession,
  visit,
} from "@backspace/db";

import { writeAuditLog } from "../audit/audit";

export interface CheckoutPreviewInput {
  branchId: string;
  visitId: string;
}

export interface CheckoutLineItem {
  chargeId: string;
  label: string;
  type: string;
  quantity: number;
  amountCents: number;
  signedAmountCents: number;
  billingResponsibility: string;
  currency: string;
}

export interface CheckoutResponsibilityGroup {
  responsibility: string;
  label: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  outcome: "payable" | "included" | "complimentary" | "pay_later" | "host_account";
  billToPersonId: string | null;
  billToAccountId: string | null;
}

export interface CheckoutPreviewTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  amountDueNowCents: number;
  payLaterCents: number;
  includedCents: number;
  complimentaryCents: number;
}

export interface CheckoutPreviewResult {
  visitId: string;
  branchId: string;
  personId: string;
  visitType: string;
  billingResponsibility: string;
  activeSessions: { id: string; spaceId: string; startedAt: Date }[];
  lineItems: CheckoutLineItem[];
  responsibilityGroups: CheckoutResponsibilityGroup[];
  totals: CheckoutPreviewTotals;
  warnings: string[];
  blockers: string[];
}

export interface CheckoutPaymentInput {
  responsibility: string;
  method: string;
  amountCents: number;
  reference?: string;
}

export interface CheckoutFinalizeInput {
  branchId: string;
  visitId: string;
  staffActorUserId: string;
  payments?: CheckoutPaymentInput[];
}

export interface CheckoutFinalizeResult {
  visitId: string;
  invoiceIds: string[];
  paymentIds: string[];
  endedSessionIds: string[];
  spaceIds: string[];
}

interface VisitRow {
  id: string;
  branchId: string;
  personId: string;
  visitType: string;
  billingResponsibility: string;
  status: string;
  bookingId: string | null;
  membershipId: string | null;
  hostAccountId: string | null;
  checkedInAt: Date;
  checkedOutAt: Date | null;
}

interface BranchRow {
  id: string;
  name: string;
  timezone: string;
  currency: string;
}

interface ChargeRow {
  id: string;
  visitId: string | null;
  usageSessionId: string | null;
  eventId: string | null;
  hostAccountId: string | null;
  invoiceId: string | null;
  type: string;
  label: string;
  quantity: number;
  amountCents: number;
  currency: string;
  billingResponsibility: string;
  reason: string | null;
}

interface SessionRow {
  id: string;
  visitId: string;
  spaceId: string;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
}

const OUTCOME_PAYABLE = "payable" as const;
const OUTCOME_INCLUDED = "included" as const;
const OUTCOME_COMPLIMENTARY = "complimentary" as const;
const OUTCOME_PAY_LATER = "pay_later" as const;
const OUTCOME_HOST_ACCOUNT = "host_account" as const;

function id(): string {
  return crypto.randomUUID();
}

function signedAmount(chargeRow: ChargeRow): number {
  return chargeRow.type === "discount" ? -chargeRow.amountCents : chargeRow.amountCents;
}

function responsibilityOutcome(responsibility: string): CheckoutResponsibilityGroup["outcome"] {
  switch (responsibility) {
    case "subscription":
      return OUTCOME_INCLUDED;
    case "complimentary":
      return OUTCOME_COMPLIMENTARY;
    case "pay_later":
      return OUTCOME_PAY_LATER;
    case "host":
      return OUTCOME_HOST_ACCOUNT;
    default:
      return OUTCOME_PAYABLE;
  }
}

function branchCurrency(branch: BranchRow): string {
  return branch.currency ?? "EGP";
}

async function fetchVisit(branchId: string, visitId: string): Promise<VisitRow> {
  const [row] = await db
    .select()
    .from(visit)
    .where(and(eq(visit.id, visitId), eq(visit.branchId, branchId)))
    .limit(1);
  if (!row) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Visit not found: ${visitId}`,
    });
  }
  return row;
}

function assertVisitEligible(visitRow: VisitRow): void {
  if (visitRow.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Visit is ${visitRow.status} — checkout requires an active visit`,
    });
  }
}

async function fetchBranch(branchId: string): Promise<BranchRow> {
  const [row] = await db.select().from(branch).where(eq(branch.id, branchId)).limit(1);
  if (!row) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Branch not found: ${branchId}` });
  }
  return row;
}

async function fetchUninvoicedCharges(visitId: string): Promise<ChargeRow[]> {
  const activeSessionIds = db
    .select({ id: usageSession.id })
    .from(usageSession)
    .where(and(eq(usageSession.visitId, visitId), eq(usageSession.status, "active")));

  return db
    .select()
    .from(charge)
    .where(
      and(
        or(eq(charge.visitId, visitId), inArray(charge.usageSessionId, activeSessionIds)),
        isNull(charge.invoiceId),
      ),
    );
}

async function fetchActiveSessions(visitId: string): Promise<SessionRow[]> {
  return db
    .select()
    .from(usageSession)
    .where(and(eq(usageSession.visitId, visitId), eq(usageSession.status, "active")));
}

function buildResponsibilityGroups(
  charges: ChargeRow[],
  visitRow: VisitRow,
): CheckoutResponsibilityGroup[] {
  const groups = new Map<
    string,
    {
      subtotal: number;
      discount: number;
      tax: number;
      items: ChargeRow[];
    }
  >();

  for (const c of charges) {
    const key = c.billingResponsibility;
    const existing = groups.get(key) ?? { subtotal: 0, discount: 0, tax: 0, items: [] };
    existing.items.push(c);
    if (c.type === "discount") {
      existing.discount += c.amountCents;
    } else if (c.type === "complimentary") {
      existing.subtotal += 0;
    } else {
      existing.subtotal += c.amountCents * c.quantity;
    }
    groups.set(key, existing);
  }

  const result: CheckoutResponsibilityGroup[] = [];

  for (const [responsibility, data] of groups) {
    const subtotalCents = data.subtotal;
    const discountCents = data.discount;
    const taxCents = 0;
    const totalCents = Math.max(0, subtotalCents - discountCents);

    let billToPersonId: string | null = null;
    let billToAccountId: string | null = null;
    if (responsibility === "visitor" || responsibility === "pay_later") {
      billToPersonId = visitRow.personId;
    } else if (responsibility === "host" && visitRow.hostAccountId) {
      billToAccountId = visitRow.hostAccountId;
    }

    result.push({
      responsibility,
      label: responsibility.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      subtotalCents,
      discountCents,
      taxCents,
      totalCents,
      outcome: responsibilityOutcome(responsibility),
      billToPersonId,
      billToAccountId,
    });
  }

  return result;
}

function computeTotals(
  groups: CheckoutResponsibilityGroup[],
  defaultCurrency: string,
): CheckoutPreviewTotals {
  let subtotalCents = 0;
  let discountCents = 0;
  let taxCents = 0;
  let totalCents = 0;
  let amountDueNowCents = 0;
  let payLaterCents = 0;
  let includedCents = 0;
  let complimentaryCents = 0;

  for (const g of groups) {
    subtotalCents += g.subtotalCents;
    discountCents += g.discountCents;
    taxCents += g.taxCents;
    totalCents += g.totalCents;

    switch (g.outcome) {
      case "payable":
      case "host_account":
        amountDueNowCents += g.totalCents;
        break;
      case "pay_later":
        payLaterCents += g.totalCents;
        break;
      case "included":
        includedCents += g.totalCents;
        break;
      case "complimentary":
        complimentaryCents += g.totalCents;
        break;
    }
  }

  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
    currency: defaultCurrency,
    amountDueNowCents,
    payLaterCents,
    includedCents,
    complimentaryCents,
  };
}

function invoiceStatusForGroup(
  group: CheckoutResponsibilityGroup,
  paymentInput: CheckoutPaymentInput | undefined,
): "finalized" | "paid" {
  if (paymentInput && paymentInput.amountCents >= group.totalCents) {
    return "paid";
  }
  return "finalized";
}

export async function previewCheckout(input: CheckoutPreviewInput): Promise<CheckoutPreviewResult> {
  const visitRow = await fetchVisit(input.branchId, input.visitId);
  assertVisitEligible(visitRow);
  const branchRow = await fetchBranch(input.branchId);
  const currency = branchCurrency(branchRow);

  const charges = await fetchUninvoicedCharges(input.visitId);
  const sessions = await fetchActiveSessions(input.visitId);

  const lineItems: CheckoutLineItem[] = charges.map((c) => ({
    chargeId: c.id,
    label: c.label,
    type: c.type,
    quantity: c.quantity,
    amountCents: c.amountCents,
    signedAmountCents: signedAmount(c) * c.quantity,
    billingResponsibility: c.billingResponsibility,
    currency: c.currency,
  }));

  const responsibilityGroups = buildResponsibilityGroups(charges, visitRow);
  const totals = computeTotals(responsibilityGroups, currency);

  const warnings: string[] = [];
  const blockers: string[] = [];

  if (charges.length === 0) {
    warnings.push("No charges found for this visit — checkout will be zero-due.");
  }

  return {
    visitId: visitRow.id,
    branchId: input.branchId,
    personId: visitRow.personId,
    visitType: visitRow.visitType,
    billingResponsibility: visitRow.billingResponsibility,
    activeSessions: sessions.map((s) => ({ id: s.id, spaceId: s.spaceId, startedAt: s.startedAt })),
    lineItems,
    responsibilityGroups,
    totals,
    warnings,
    blockers,
  };
}

export async function finalizeCheckout(
  input: CheckoutFinalizeInput,
): Promise<CheckoutFinalizeResult> {
  const visitRow = await fetchVisit(input.branchId, input.visitId);
  assertVisitEligible(visitRow);
  const branchRow = await fetchBranch(input.branchId);
  const currency = branchCurrency(branchRow);

  const paymentsByResponsibility = new Map<string, CheckoutPaymentInput>();
  for (const p of input.payments ?? []) {
    paymentsByResponsibility.set(p.responsibility, p);
  }

  const invoiceIds: string[] = [];
  const paymentIds: string[] = [];
  const endedSessionIds: string[] = [];
  const spaceIds: string[] = [];

  await db.transaction(async (tx) => {
    const checkedOutAt = new Date();
    const claimedVisits = await tx
      .update(visit)
      .set({ status: "checked_out", checkedOutAt })
      .where(
        and(
          eq(visit.id, input.visitId),
          eq(visit.branchId, input.branchId),
          eq(visit.status, "active"),
        ),
      )
      .returning({ id: visit.id });

    if (claimedVisits.length === 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Visit is no longer active — checkout may already be finalized",
      });
    }

    const activeSessionIds = tx
      .select({ id: usageSession.id })
      .from(usageSession)
      .where(and(eq(usageSession.visitId, input.visitId), eq(usageSession.status, "active")));

    const charges = await tx
      .select()
      .from(charge)
      .where(
        and(
          or(eq(charge.visitId, input.visitId), inArray(charge.usageSessionId, activeSessionIds)),
          isNull(charge.invoiceId),
        ),
      );

    const sessions = await tx
      .select()
      .from(usageSession)
      .where(and(eq(usageSession.visitId, input.visitId), eq(usageSession.status, "active")));

    const responsibilityGroups = buildResponsibilityGroups(charges, visitRow);
    const totals = computeTotals(responsibilityGroups, currency);

    for (const group of responsibilityGroups) {
      if (group.outcome === "payable" || group.outcome === "host_account") {
        const payment = paymentsByResponsibility.get(group.responsibility);
        if (!payment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Payment required for ${group.responsibility} group (${group.label})`,
          });
        }
        if (payment.amountCents !== group.totalCents) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Payment amount mismatch for ${group.responsibility}: expected ${group.totalCents}, got ${payment.amountCents}`,
          });
        }
      }
    }

    for (const group of responsibilityGroups) {
      const groupCharges = charges.filter((c) => c.billingResponsibility === group.responsibility);
      if (groupCharges.length === 0) continue;

      const invoiceId = id();
      invoiceIds.push(invoiceId);
      const payInput = paymentsByResponsibility.get(group.responsibility);

      await tx.insert(invoice).values({
        id: invoiceId,
        billToPersonId: group.billToPersonId,
        billToAccountId: group.billToAccountId,
        status: invoiceStatusForGroup(group, payInput),
        subtotalCents: group.subtotalCents,
        discountCents: group.discountCents,
        taxCents: group.taxCents,
        totalCents: group.totalCents,
        currency,
        finalizedAt: checkedOutAt,
      });

      for (const c of groupCharges) {
        const itemAmount = signedAmount(c) * c.quantity;

        await tx.insert(invoiceItem).values({
          id: id(),
          invoiceId,
          chargeId: c.id,
          label: c.label,
          amountCents: Math.abs(itemAmount),
          currency: c.currency,
        });

        await tx
          .update(charge)
          .set({
            invoiceId,
            visitId: null,
            usageSessionId: null,
            eventId: null,
            hostAccountId: null,
          })
          .where(eq(charge.id, c.id));
      }

      if (payInput && payInput.amountCents > 0) {
        const paymentId = id();
        paymentIds.push(paymentId);

        await tx.insert(payment).values({
          id: paymentId,
          invoiceId,
          method: payInput.method as
            | "cash"
            | "card_terminal"
            | "wallet"
            | "bank_transfer"
            | "instapay"
            | "mixed"
            | "pay_later"
            | "host_account"
            | "included"
            | "complimentary",
          status: "recorded",
          amountCents: payInput.amountCents,
          currency,
          reference: payInput.reference ?? null,
          recordedAt: new Date(),
        });
      }
    }

    for (const session of sessions) {
      endedSessionIds.push(session.id);
      spaceIds.push(session.spaceId);
      await tx
        .update(usageSession)
        .set({ status: "ended", endedAt: new Date() })
        .where(eq(usageSession.id, session.id));
    }

    const auditMetadata: Record<string, unknown> = {
      invoiceIds,
      totalCents: totals.totalCents,
      currency,
      responsibilityGroups: responsibilityGroups.map((g) => ({
        responsibility: g.responsibility,
        totalCents: g.totalCents,
        outcome: g.outcome,
      })),
      endedSessionIds,
      spaceIds,
    };
    if (paymentIds.length > 0) {
      auditMetadata.paymentIds = paymentIds;
    }

    await writeAuditLog(
      {
        id: id(),
        branchId: input.branchId,
        actorUserId: input.staffActorUserId,
        action: "checkout.finalize",
        entityType: "visit",
        entityId: input.visitId,
        metadata: JSON.stringify(auditMetadata),
      },
      tx,
    );

    return {
      visitId: input.visitId,
      invoiceIds,
      paymentIds,
      endedSessionIds,
      spaceIds,
    };
  });

  return {
    visitId: visitRow.id,
    invoiceIds,
    paymentIds,
    endedSessionIds,
    spaceIds,
  };
}
