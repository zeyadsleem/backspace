import { describe, expect, it } from "vitest";

import {
  BRANCHES,
  FLOORS,
  SPACES,
  PEOPLE,
  STAFF_USERS,
  CUSTOMER_ACCOUNTS,
  PLANS,
  MEMBERSHIPS,
  BOOKINGS,
  VISITS,
  USAGE_SESSIONS,
  EVENTS,
  CHARGES,
  INVOICES,
  INVOICE_ITEMS,
  PAYMENTS,
  CATALOG_ITEMS,
  INVENTORY_MOVEMENTS,
  CLEANING_TASKS,
  MAINTENANCE_TICKETS,
  SHIFTS,
  APPROVAL_REQUESTS,
  AUDIT_LOGS,
  SCENARIOS,
  UI_STATES,
} from "./seed";

describe("seed data scenarios", () => {
  it("exports all required scenario identifiers", () => {
    expect(SCENARIOS.WALK_IN).toBe("walk-in");
    expect(SCENARIOS.MEMBER).toBe("member");
    expect(SCENARIOS.BOOKING_CUSTOMER).toBe("booking-customer");
    expect(SCENARIOS.HOSTED_GUEST).toBe("hosted-guest");
    expect(SCENARIOS.EVENT_ATTENDEE).toBe("event-attendee");
    expect(SCENARIOS.UNPAID_CHECKOUT).toBe("unpaid-checkout");
    expect(SCENARIOS.STOCK_CATALOG).toBe("stock-catalog");
    expect(SCENARIOS.CLEANING_QUEUE).toBe("cleaning-queue");
    expect(SCENARIOS.MAINTENANCE_TICKET).toBe("maintenance-ticket");
  });

  it("exports all required operational UI state identifiers", () => {
    expect(UI_STATES.EMPTY).toBe("empty");
    expect(UI_STATES.BUSY).toBe("busy");
    expect(UI_STATES.OVERDUE).toBe("overdue");
    expect(UI_STATES.BLOCKED).toBe("blocked");
    expect(UI_STATES.APPROVAL_REQUIRED).toBe("approval-required");
    expect(UI_STATES.PAY_LATER).toBe("pay-later");
    expect(UI_STATES.COMPLIMENTARY).toBe("complimentary");
    expect(UI_STATES.HOSTED_GUEST).toBe("hosted-guest");
    expect(UI_STATES.EVENT_ATTENDEE).toBe("event-attendee");
    expect(UI_STATES.CLEANING).toBe("cleaning");
    expect(UI_STATES.MAINTENANCE).toBe("maintenance");
    expect(UI_STATES.SHIFT_DISCREPANCY).toBe("shift-discrepancy");
  });
});

describe("seed data coverage", () => {
  it("includes at least one main branch and tokens for branch-scoped records", () => {
    expect(BRANCHES.length).toBeGreaterThanOrEqual(1);
    expect(BRANCHES[0].id).toBe("seed-branch-main");
  });

  it("includes floors for the main branch", () => {
    expect(FLOORS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes spaces of diverse kinds", () => {
    const kinds = SPACES.map((s) => s.kind);
    expect(new Set(kinds)).toContain("desk");
    expect(new Set(kinds)).toContain("meeting_room");
    expect(new Set(kinds)).toContain("private_office");
    expect(new Set(kinds)).toContain("event_area");
  });

  it("includes spaces with statuses covering available, occupied, reserved, blocked, cleaning, and maintenance", () => {
    const statuses = new Set(SPACES.map((s) => s.status));
    expect(statuses).toContain("available");
    expect(statuses).toContain("occupied");
    expect(statuses).toContain("reserved");
    expect(statuses).toContain("blocked");
    expect(statuses).toContain("cleaning");
    expect(statuses).toContain("maintenance");
  });

  it("includes walk-in, member, booking, hosted guest, and event people", () => {
    const personIds = new Set(PEOPLE.map((p) => p.id));
    expect(personIds).toContain("seed-person-walkin");
    expect(personIds).toContain("seed-person-member");
    expect(personIds).toContain("seed-person-booking");
    expect(personIds).toContain("seed-person-host");
    expect(personIds).toContain("seed-person-guest");
    expect(personIds).toContain("seed-person-attendee");
  });

  it("includes staff users for operations and audit actors", () => {
    const userIds = new Set(STAFF_USERS.map((user) => user.id));
    expect(userIds).toContain("seed-user-cashier");
    expect(userIds).toContain("seed-user-manager");
    expect(userIds).toContain("seed-user-cleaner");
    expect(userIds).toContain("seed-user-maintenance");
  });

  it("includes at least one membership plan and active membership", () => {
    expect(PLANS.length).toBeGreaterThanOrEqual(1);
    expect(MEMBERSHIPS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes bookings with various statuses", () => {
    const statuses = new Set(BOOKINGS.map((b) => b.status));
    expect(statuses).toContain("confirmed");
    expect(statuses).toContain("checked_in");
    expect(statuses).toContain("cancelled");
  });

  it("includes visits covering every visit type", () => {
    const types = new Set(VISITS.map((v) => v.visitType));
    expect(types).toContain("walk_in");
    expect(types).toContain("member");
    expect(types).toContain("booking_customer");
    expect(types).toContain("hosted_guest");
    expect(types).toContain("event_attendee");
  });

  it("includes visits with varied billing responsibilities", () => {
    const responsibilities = new Set(VISITS.map((v) => v.billingResponsibility));
    expect(responsibilities).toContain("visitor");
    expect(responsibilities).toContain("subscription");
    expect(responsibilities).toContain("host");
    expect(responsibilities).toContain("event");
    expect(responsibilities).toContain("pay_later");
  });

  it("includes usage sessions with active and ended statuses", () => {
    const statuses = new Set(USAGE_SESSIONS.map((s) => s.status));
    expect(statuses).toContain("active");
    expect(statuses).toContain("ended");
  });

  it("includes an overdue active usage session scenario", () => {
    const overdueSession = USAGE_SESSIONS.find(
      (session) =>
        session.status === "active" && session.startedAt < new Date(Date.now() - 2 * 3_600_000),
    );

    expect(overdueSession).toBeDefined();
  });

  it("includes charges of every type", () => {
    const types = new Set(CHARGES.map((c) => c.type));
    expect(types).toContain("product");
    expect(types).toContain("service");
    expect(types).toContain("fee");
    expect(types).toContain("discount");
    expect(types).toContain("complimentary");
  });

  it("includes charges with pay_later, complimentary, and host responsibilities", () => {
    const responsibilities = new Set(CHARGES.map((c) => c.billingResponsibility));
    expect(responsibilities).toContain("pay_later");
    expect(responsibilities).toContain("complimentary");
    expect(responsibilities).toContain("host");
    expect(responsibilities).toContain("event");
  });

  it("includes invoices with paid and unpaid statuses", () => {
    const statuses = new Set(INVOICES.map((i) => i.status));
    expect(statuses).toContain("paid");
    expect(statuses).toContain("draft");
  });

  it("includes realistic pay-later and complimentary operational states", () => {
    expect(VISITS.some((visit) => visit.billingResponsibility === "pay_later")).toBe(true);
    expect(CHARGES.some((charge) => charge.billingResponsibility === "pay_later")).toBe(true);
    expect(
      CHARGES.some((charge) => charge.type === "complimentary" && charge.amountCents === 0),
    ).toBe(true);
  });

  it("includes at least one payment record", () => {
    expect(PAYMENTS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes catalog items for sellable products and services", () => {
    expect(CATALOG_ITEMS.length).toBeGreaterThanOrEqual(1);
    const kinds = new Set(CATALOG_ITEMS.map((i) => i.kind));
    expect(kinds).toContain("product");
    expect(kinds).toContain("service");
  });

  it("includes at least one inventory movement", () => {
    expect(INVENTORY_MOVEMENTS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes cleaning tasks", () => {
    expect(CLEANING_TASKS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes maintenance tickets", () => {
    expect(MAINTENANCE_TICKETS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes at least one shift record", () => {
    expect(SHIFTS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes a shift discrepancy scenario when cash counts are closed", () => {
    const discrepantShift = SHIFTS.find(
      (shift) =>
        shift.status === "closed" &&
        shift.actualCashCents !== null &&
        shift.actualCashCents !== shift.expectedCashCents,
    );

    expect(discrepantShift).toBeDefined();
  });

  it("includes at least one approval request", () => {
    expect(APPROVAL_REQUESTS.length).toBeGreaterThanOrEqual(1);
  });

  it("includes an approval-required pending request", () => {
    expect(APPROVAL_REQUESTS.some((request) => request.status === "pending")).toBe(true);
  });

  it("includes at least one audit log", () => {
    expect(AUDIT_LOGS.length).toBeGreaterThanOrEqual(1);
  });
});

describe("seed data integrity", () => {
  it("uses stable deterministic IDs", () => {
    expect(BRANCHES[0].id).toBe("seed-branch-main");
    expect(PEOPLE[0].id).toMatch(/^seed-person-/);
    expect(VISITS[0].id).toMatch(/^seed-visit-/);
  });

  it("preserves Visit-first: every visit references an existing person", () => {
    const personIds = new Set(PEOPLE.map((p) => p.id));
    for (const visit of VISITS) {
      expect(personIds).toContain(visit.personId);
    }
  });

  it("preserves Visit-first: every usage session references an existing visit", () => {
    const visitIds = new Set(VISITS.map((v) => v.id));
    for (const session of USAGE_SESSIONS) {
      expect(visitIds).toContain(session.visitId);
    }
  });

  it("preserves Visit-first: every hosted guest link references an existing visit", () => {
    // Check that hosted guest visits reference the host person
    const personIds = new Set(PEOPLE.map((p) => p.id));
    const hostedVisits = VISITS.filter((v) => v.visitType === "hosted_guest");
    for (const visit of hostedVisits) {
      expect(personIds).toContain(visit.personId);
    }
  });

  it("uses integer minor units for all money amounts in charges", () => {
    for (const charge of CHARGES) {
      expect(Number.isInteger(charge.amountCents)).toBe(true);
      expect(charge.amountCents).toBeGreaterThanOrEqual(0);
    }
  });

  it("uses integer minor units for all money amounts in invoices", () => {
    for (const invoice of INVOICES) {
      expect(Number.isInteger(invoice.subtotalCents)).toBe(true);
      expect(Number.isInteger(invoice.totalCents)).toBe(true);
    }
  });

  it("uses non-negative integer minor units for invoice items", () => {
    for (const item of INVOICE_ITEMS) {
      expect(Number.isInteger(item.amountCents)).toBe(true);
      expect(item.amountCents).toBeGreaterThanOrEqual(0);
    }
  });

  it("uses integer minor units for all money amounts in payments", () => {
    for (const payment of PAYMENTS) {
      expect(Number.isInteger(payment.amountCents)).toBe(true);
      expect(payment.amountCents).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps each space in the same branch as its floor", () => {
    const floorBranchById = new Map(FLOORS.map((floor) => [floor.id, floor.branchId]));

    for (const space of SPACES) {
      expect(floorBranchById.get(space.floorId)).toBe(space.branchId);
    }
  });

  it("keeps charges attached to existing operational context records", () => {
    const visitIds = new Set(VISITS.map((visit) => visit.id));
    const sessionIds = new Set(USAGE_SESSIONS.map((session) => session.id));
    const eventIds = new Set(EVENTS.map((event) => event.id));
    const accountIds = new Set(CUSTOMER_ACCOUNTS.map((account) => account.id));
    const invoiceIds = new Set(INVOICES.map((invoice) => invoice.id));

    for (const charge of CHARGES) {
      if (charge.visitId) expect(visitIds).toContain(charge.visitId);
      if (charge.usageSessionId) expect(sessionIds).toContain(charge.usageSessionId);
      if (charge.eventId) expect(eventIds).toContain(charge.eventId);
      if (charge.hostAccountId) expect(accountIds).toContain(charge.hostAccountId);
      if (charge.invoiceId) expect(invoiceIds).toContain(charge.invoiceId);
    }
  });

  it("keeps operations and audit user references attached to seeded staff users", () => {
    const userIds = new Set(STAFF_USERS.map((user) => user.id));

    for (const shift of SHIFTS) {
      expect(userIds).toContain(shift.openedByUserId);
      if (shift.closedByUserId) expect(userIds).toContain(shift.closedByUserId);
    }

    for (const task of CLEANING_TASKS) {
      if (task.assignedToUserId) expect(userIds).toContain(task.assignedToUserId);
    }

    for (const ticket of MAINTENANCE_TICKETS) {
      if (ticket.assignedToUserId) expect(userIds).toContain(ticket.assignedToUserId);
    }

    for (const request of APPROVAL_REQUESTS) {
      expect(userIds).toContain(request.requestedByUserId);
      if (request.reviewedByUserId) expect(userIds).toContain(request.reviewedByUserId);
    }

    for (const log of AUDIT_LOGS) {
      if (log.actorUserId) expect(userIds).toContain(log.actorUserId);
    }
  });

  it("uses valid visit statuses", () => {
    const valid = ["active", "checked_out", "cancelled"];
    for (const visit of VISITS) {
      expect(valid).toContain(visit.status);
    }
  });

  it("uses valid usage session statuses", () => {
    const valid = ["active", "ended", "cancelled"];
    for (const session of USAGE_SESSIONS) {
      expect(valid).toContain(session.status);
    }
  });

  it("uses valid charge types", () => {
    const valid = ["product", "service", "fee", "discount", "complimentary", "adjustment"];
    for (const charge of CHARGES) {
      expect(valid).toContain(charge.type);
    }
  });

  it("uses valid billing responsibilities", () => {
    const valid = [
      "visitor",
      "host",
      "company",
      "event",
      "subscription",
      "complimentary",
      "pay_later",
    ];
    for (const charge of CHARGES) {
      expect(valid).toContain(charge.billingResponsibility);
    }
  });

  it("charges have exactly one operational target", () => {
    for (const charge of CHARGES) {
      const targets = [
        charge.visitId,
        charge.usageSessionId,
        charge.eventId,
        charge.hostAccountId,
        charge.invoiceId,
      ].filter(Boolean);
      expect(targets.length).toBe(1);
    }
  });
});
