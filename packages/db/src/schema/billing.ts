import { sql } from "drizzle-orm";
import { check, index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { workspaceEvent } from "./events";
import { shift } from "./operations";
import { customerAccount, person } from "./people";
import { billingResponsibilityEnum, usageSession, visit } from "./visits";

export const chargeTypeEnum = pgEnum("charge_type", [
  "product",
  "service",
  "fee",
  "discount",
  "complimentary",
  "adjustment",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "finalized",
  "paid",
  "void",
  "partially_paid",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card_terminal",
  "wallet",
  "bank_transfer",
  "instapay",
  "mixed",
  "pay_later",
  "host_account",
  "included",
  "complimentary",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "recorded",
  "void",
  "refunded",
]);

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    billToPersonId: text("bill_to_person_id").references(() => person.id, { onDelete: "set null" }),
    billToAccountId: text("bill_to_account_id").references(() => customerAccount.id, {
      onDelete: "set null",
    }),
    status: invoiceStatusEnum("status").default("draft").notNull(),
    subtotalCents: text("subtotal_cents").default("0").notNull(),
    discountCents: text("discount_cents").default("0").notNull(),
    taxCents: text("tax_cents").default("0").notNull(),
    totalCents: text("total_cents").default("0").notNull(),
    currency: text("currency").default("EGP").notNull(),
    finalizedAt: timestamp("finalized_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("invoice_status_idx").on(table.status),
    index("invoice_bill_to_account_idx").on(table.billToAccountId),
  ],
);

export const charge = pgTable(
  "charge",
  {
    id: text("id").primaryKey(),
    visitId: text("visit_id").references(() => visit.id, { onDelete: "cascade" }),
    usageSessionId: text("usage_session_id").references(() => usageSession.id, {
      onDelete: "cascade",
    }),
    eventId: text("event_id").references(() => workspaceEvent.id, { onDelete: "cascade" }),
    hostAccountId: text("host_account_id").references(() => customerAccount.id, {
      onDelete: "cascade",
    }),
    invoiceId: text("invoice_id").references(() => invoice.id, { onDelete: "set null" }),
    type: chargeTypeEnum("type").notNull(),
    label: text("label").notNull(),
    quantity: text("quantity").default("1").notNull(),
    amountCents: text("amount_cents").notNull(),
    currency: text("currency").default("EGP").notNull(),
    billingResponsibility: billingResponsibilityEnum("billing_responsibility").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("charge_visit_id_idx").on(table.visitId),
    index("charge_invoice_id_idx").on(table.invoiceId),
    check(
      "charge_exactly_one_target_check",
      sql`(
        case when ${table.visitId} is not null then 1 else 0 end +
        case when ${table.usageSessionId} is not null then 1 else 0 end +
        case when ${table.eventId} is not null then 1 else 0 end +
        case when ${table.hostAccountId} is not null then 1 else 0 end +
        case when ${table.invoiceId} is not null then 1 else 0 end
      ) = 1`,
    ),
  ],
);

export const invoiceItem = pgTable(
  "invoice_item",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "cascade" }),
    chargeId: text("charge_id").references(() => charge.id, { onDelete: "set null" }),
    label: text("label").notNull(),
    amountCents: text("amount_cents").notNull(),
    currency: text("currency").default("EGP").notNull(),
  },
  (table) => [index("invoice_item_invoice_id_idx").on(table.invoiceId)],
);

export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "restrict" }),
    shiftId: text("shift_id").references(() => shift.id, { onDelete: "set null" }),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").default("recorded").notNull(),
    amountCents: text("amount_cents").notNull(),
    currency: text("currency").default("EGP").notNull(),
    reference: text("reference"),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => [
    index("payment_invoice_id_idx").on(table.invoiceId),
    index("payment_shift_id_idx").on(table.shiftId),
  ],
);

export const refundOrAdjustment = pgTable(
  "refund_or_adjustment",
  {
    id: text("id").primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id, { onDelete: "restrict" }),
    paymentId: text("payment_id").references(() => payment.id, { onDelete: "set null" }),
    amountCents: text("amount_cents").notNull(),
    currency: text("currency").default("EGP").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("refund_or_adjustment_invoice_id_idx").on(table.invoiceId)],
);
