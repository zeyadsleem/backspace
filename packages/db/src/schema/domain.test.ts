import { getTableColumns, getTableName, type Table } from "drizzle-orm";
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
});

function columnNames(value: unknown) {
  return Object.keys(getTableColumns(value as Table));
}

function enumValues(value: unknown) {
  return (value as { enumValues: string[] }).enumValues;
}
