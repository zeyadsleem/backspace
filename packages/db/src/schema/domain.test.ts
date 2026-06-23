import { getTableColumns, getTableName, type Table } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

const tableNames = [
  ["branch", "branch"],
  ["floor", "floor"],
  ["space", "space"],
  ["spaceStatusHistory", "space_status_history"],
  ["person", "person"],
  ["customerAccount", "customer_account"],
  ["tenant", "tenant"],
  ["membershipPlan", "membership_plan"],
  ["membership", "membership"],
  ["booking", "booking"],
  ["visit", "visit"],
  ["usageSession", "usage_session"],
  ["hostedGuestLink", "hosted_guest_link"],
  ["workspaceEvent", "event"],
  ["eventAttendee", "event_attendee"],
  ["charge", "charge"],
  ["invoice", "invoice"],
  ["invoiceItem", "invoice_item"],
  ["payment", "payment"],
  ["refundOrAdjustment", "refund_or_adjustment"],
  ["shift", "shift"],
  ["cleaningTask", "cleaning_task"],
  ["maintenanceTicket", "maintenance_ticket"],
  ["role", "role"],
  ["permission", "permission"],
  ["rolePermission", "role_permission"],
  ["staffProfile", "staff_profile"],
  ["staffBranchAccess", "staff_branch_access"],
  ["approvalRequest", "approval_request"],
  ["auditLog", "audit_log"],
] as const;

describe("workspace operations schema", () => {
  it("exports the foundation tables across each domain module", async () => {
    const schema = (await import("./index")) as Record<string, unknown>;

    for (const [exportName, dbName] of tableNames) {
      expect(schema, `missing ${exportName}`).toHaveProperty(exportName);
      expect(getTableName(schema[exportName] as Table)).toBe(dbName);
    }
  });

  it("captures the required Visit-first billing enum values", async () => {
    const schema = (await import("./index")) as Record<string, unknown>;

    expect(enumValues(schema.visitTypeEnum)).toEqual([
      "walk_in",
      "member",
      "booking_customer",
      "hosted_guest",
      "event_attendee",
      "non_billable",
    ]);
    expect(enumValues(schema.billingResponsibilityEnum)).toEqual([
      "visitor",
      "host",
      "company",
      "event",
      "subscription",
      "complimentary",
      "pay_later",
    ]);
    expect(enumValues(schema.paymentMethodEnum)).toEqual([
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
  });

  it("models visits, charges, invoices, and payments with operational links", async () => {
    const schema = (await import("./index")) as Record<string, unknown>;

    expect(columnNames(schema.visit)).toEqual(
      expect.arrayContaining([
        "personId",
        "visitType",
        "billingResponsibility",
        "status",
        "checkedInAt",
        "checkedOutAt",
      ]),
    );
    expect(columnNames(schema.usageSession)).toEqual(
      expect.arrayContaining(["visitId", "spaceId", "startedAt", "endedAt", "status"]),
    );
    expect(columnNames(schema.charge)).toEqual(
      expect.arrayContaining([
        "visitId",
        "usageSessionId",
        "eventId",
        "hostAccountId",
        "invoiceId",
        "amountCents",
        "currency",
        "billingResponsibility",
      ]),
    );
    expect(columnNames(schema.invoice)).toEqual(
      expect.arrayContaining(["billToPersonId", "billToAccountId", "totalCents", "status"]),
    );
    expect(columnNames(schema.payment)).toEqual(
      expect.arrayContaining(["invoiceId", "shiftId", "method", "amountCents", "reference"]),
    );
  });

  it("uses integer database types for money and quantity fields", async () => {
    const schema = (await import("./index")) as Record<string, unknown>;

    expectColumnSqlTypes(schema.floor, { sortOrder: "integer" });
    expectColumnSqlTypes(schema.space, { capacity: "integer" });
    expectColumnSqlTypes(schema.membershipPlan, {
      includedMinutes: "integer",
      priceCents: "integer",
    });
    expectColumnSqlTypes(schema.booking, { depositCents: "integer" });
    expectColumnSqlTypes(schema.invoice, {
      subtotalCents: "integer",
      discountCents: "integer",
      taxCents: "integer",
      totalCents: "integer",
    });
    expectColumnSqlTypes(schema.charge, {
      quantity: "integer",
      amountCents: "integer",
    });
    expectColumnSqlTypes(schema.invoiceItem, { amountCents: "integer" });
    expectColumnSqlTypes(schema.payment, { amountCents: "integer" });
    expectColumnSqlTypes(schema.refundOrAdjustment, { amountCents: "integer" });
    expectColumnSqlTypes(schema.shift, {
      expectedCashCents: "integer",
      actualCashCents: "integer",
    });
  });

  it("declares database checks for positive and non-negative numeric fields", async () => {
    const schema = (await import("./index")) as Record<string, unknown>;

    expect(checkNames(schema.floor)).toEqual(
      expect.arrayContaining(["floor_non_negative_sort_order_check"]),
    );
    expect(checkNames(schema.space)).toEqual(
      expect.arrayContaining(["space_positive_capacity_check"]),
    );
    expect(checkNames(schema.membershipPlan)).toEqual(
      expect.arrayContaining([
        "membership_plan_non_negative_included_minutes_check",
        "membership_plan_non_negative_price_check",
      ]),
    );
    expect(checkNames(schema.booking)).toEqual(
      expect.arrayContaining(["booking_non_negative_deposit_check"]),
    );
    expect(checkNames(schema.invoice)).toEqual(
      expect.arrayContaining(["invoice_non_negative_totals_check"]),
    );
    expect(checkNames(schema.charge)).toEqual(
      expect.arrayContaining([
        "charge_exactly_one_target_check",
        "charge_positive_quantity_check",
        "charge_non_negative_amount_check",
      ]),
    );
    expect(checkNames(schema.invoiceItem)).toEqual(
      expect.arrayContaining(["invoice_item_non_negative_amount_check"]),
    );
    expect(checkNames(schema.payment)).toEqual(
      expect.arrayContaining(["payment_non_negative_amount_check"]),
    );
    expect(checkNames(schema.refundOrAdjustment)).toEqual(
      expect.arrayContaining(["refund_or_adjustment_positive_amount_check"]),
    );
    expect(checkNames(schema.shift)).toEqual(
      expect.arrayContaining(["shift_non_negative_cash_check"]),
    );
  });
});

function columnNames(value: unknown) {
  return Object.keys(getTableColumns(value as Table));
}

function enumValues(value: unknown) {
  return (value as { enumValues: string[] }).enumValues;
}

function expectColumnSqlTypes(value: unknown, expected: Record<string, string>) {
  const columns = getTableColumns(value as Table);

  for (const [columnName, sqlType] of Object.entries(expected)) {
    const column = columns[columnName] as { getSQLType: () => string } | undefined;

    expect(column, `missing ${columnName}`).toBeDefined();
    expect(column?.getSQLType(), `${columnName} should use ${sqlType}`).toBe(sqlType);
  }
}

function checkNames(value: unknown) {
  const config = getTableConfig(value as Parameters<typeof getTableConfig>[0]);

  return config.checks.map((constraint) => constraint.name);
}
