import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";

import { and, db, eq, payment, shift } from "@backspace/db";

import { writeAuditLog } from "../audit/audit";

export interface ShiftContextInput {
  branchId: string;
  staffActorUserId: string;
}

export interface OpenShiftInput extends ShiftContextInput {
  notes?: string;
}

export interface CloseShiftInput extends ShiftContextInput {
  shiftId: string;
  actualCashCents: number;
  notes?: string;
}

export interface ShiftSummary {
  status: "open" | "closed" | "none";
  shift: {
    id: string;
    branchId: string;
    openedByUserId: string;
    closedByUserId: string | null;
    status: string;
    openedAt: Date;
    closedAt: Date | null;
    expectedCashCents: number;
    actualCashCents: number | null;
    differenceCents: number | null;
    currency: string;
    notes: string | null;
  } | null;
  expectedCashCents: number;
  cashPaymentCount: number;
  actualCashCents: number | null;
  differenceCents: number | null;
  warnings: string[];
  blockers: string[];
}

interface ShiftRow {
  id: string;
  branchId: string;
  openedByUserId: string;
  closedByUserId: string | null;
  status: string;
  openedAt: Date;
  closedAt: Date | null;
  expectedCashCents: number;
  actualCashCents: number | null;
  currency: string;
  notes: string | null;
}

interface CashPaymentRow {
  amountCents: number;
}

type CashPaymentConnection = Pick<typeof db, "select">;

function id(): string {
  return crypto.randomUUID();
}

function cashTotal(rows: CashPaymentRow[]): number {
  return rows.reduce((total, row) => total + row.amountCents, 0);
}

async function fetchCashPayments(
  conn: CashPaymentConnection,
  shiftId: string,
): Promise<CashPaymentRow[]> {
  return conn
    .select({ amountCents: payment.amountCents })
    .from(payment)
    .where(
      and(eq(payment.shiftId, shiftId), eq(payment.method, "cash"), eq(payment.status, "recorded")),
    );
}

function summarizeShift(row: ShiftRow | null, cashPayments: CashPaymentRow[]): ShiftSummary {
  if (!row) {
    return {
      status: "none",
      shift: null,
      expectedCashCents: 0,
      cashPaymentCount: 0,
      actualCashCents: null,
      differenceCents: null,
      warnings: ["No open shift for this branch."],
      blockers: ["Open a shift before recording cash payments."],
    };
  }

  const expectedCashCents = cashTotal(cashPayments);
  const actualCashCents = row.actualCashCents;
  const differenceCents = actualCashCents === null ? null : actualCashCents - expectedCashCents;

  return {
    status: row.status === "open" ? "open" : "closed",
    shift: {
      id: row.id,
      branchId: row.branchId,
      openedByUserId: row.openedByUserId,
      closedByUserId: row.closedByUserId,
      status: row.status,
      openedAt: row.openedAt,
      closedAt: row.closedAt,
      expectedCashCents,
      actualCashCents,
      differenceCents,
      currency: row.currency,
      notes: row.notes,
    },
    expectedCashCents,
    cashPaymentCount: cashPayments.length,
    actualCashCents,
    differenceCents,
    warnings: differenceCents && differenceCents !== 0 ? ["Cash drawer has a discrepancy."] : [],
    blockers: [],
  };
}

export async function getCurrentShift(input: ShiftContextInput): Promise<ShiftSummary> {
  const [row] = await db
    .select()
    .from(shift)
    .where(
      and(
        eq(shift.branchId, input.branchId),
        eq(shift.openedByUserId, input.staffActorUserId),
        eq(shift.status, "open"),
      ),
    )
    .limit(1);

  if (!row) {
    return summarizeShift(null, []);
  }

  const cashPayments = await fetchCashPayments(db, row.id);
  return summarizeShift(row, cashPayments);
}

export async function openShift(input: OpenShiftInput): Promise<ShiftSummary> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(shift)
      .where(
        and(
          eq(shift.branchId, input.branchId),
          eq(shift.openedByUserId, input.staffActorUserId),
          eq(shift.status, "open"),
        ),
      )
      .limit(1);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Staff user already has an open shift for this branch",
      });
    }

    const [row] = await tx
      .insert(shift)
      .values({
        id: id(),
        branchId: input.branchId,
        openedByUserId: input.staffActorUserId,
        status: "open",
        expectedCashCents: 0,
        actualCashCents: null,
        notes: input.notes ?? null,
      })
      .returning();

    if (!row) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Shift was not created" });
    }

    await writeAuditLog(
      {
        id: id(),
        branchId: input.branchId,
        actorUserId: input.staffActorUserId,
        action: "shift.open",
        entityType: "shift",
        entityId: row.id,
        metadata: JSON.stringify({ shiftId: row.id, expectedCashCents: 0 }),
      },
      tx,
    );

    return summarizeShift(row, []);
  });
}

export async function closeShift(input: CloseShiftInput): Promise<ShiftSummary> {
  if (input.actualCashCents < 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Actual cash cannot be negative" });
  }

  return db.transaction(async (tx) => {
    const closedAt = new Date();
    const [claimed] = await tx
      .update(shift)
      .set({
        status: "closed",
        closedByUserId: input.staffActorUserId,
        actualCashCents: input.actualCashCents,
        closedAt,
        notes: input.notes ?? null,
      })
      .where(
        and(
          eq(shift.id, input.shiftId),
          eq(shift.branchId, input.branchId),
          eq(shift.openedByUserId, input.staffActorUserId),
          eq(shift.status, "open"),
        ),
      )
      .returning();

    if (!claimed) {
      throw new TRPCError({ code: "CONFLICT", message: "Shift is no longer open" });
    }

    const cashPayments = await fetchCashPayments(tx, input.shiftId);
    const expectedCashCents = cashTotal(cashPayments);
    const [row] = await tx
      .update(shift)
      .set({ expectedCashCents })
      .where(eq(shift.id, input.shiftId))
      .returning();
    const closedShift = row ?? { ...claimed, expectedCashCents };
    const summary = summarizeShift(closedShift, cashPayments);

    await writeAuditLog(
      {
        id: id(),
        branchId: input.branchId,
        actorUserId: input.staffActorUserId,
        action: "shift.close",
        entityType: "shift",
        entityId: input.shiftId,
        metadata: JSON.stringify({
          shiftId: input.shiftId,
          expectedCashCents: summary.expectedCashCents,
          actualCashCents: summary.actualCashCents,
          differenceCents: summary.differenceCents,
          cashPaymentCount: summary.cashPaymentCount,
          discrepancyRequiresApproval: summary.differenceCents !== 0,
        }),
      },
      tx,
    );

    return summary;
  });
}
