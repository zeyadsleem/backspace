import {
  APPROVAL_REQUESTS,
  BOOKINGS,
  BRANCHES,
  CHARGES,
  CLEANING_TASKS,
  CUSTOMER_ACCOUNTS,
  EVENTS,
  INVOICE_ITEMS,
  INVOICES,
  MAINTENANCE_TICKETS,
  MEMBERSHIPS,
  PEOPLE,
  PLANS,
  SHIFTS,
  SPACES,
  USAGE_SESSIONS,
  VISITS,
} from "@backspace/db/seed";

import { PERMISSIONS, type PermissionKey } from "../permissions/constants";

type SummaryValue = string | number;

export type TodaySummaryItem = {
  label: string;
  value: SummaryValue;
  detail: string;
  amountMinor?: number;
};

export type TodayQueueItem = {
  id: string;
  title: string;
  meta: string;
};

export type TodayRestrictedSection = {
  allowed: boolean;
  items: TodayQueueItem[];
  label?: string;
  reason?: string;
};

export type TodayOverview = {
  branch: { id: string; name: string };
  generatedAt: string;
  shiftStatus: { label: string; detail: string };
  summary: {
    activeVisits: TodaySummaryItem;
    occupancy: TodaySummaryItem;
    upcomingBookings: TodaySummaryItem;
    openBills: TodaySummaryItem;
    cleaning: TodaySummaryItem;
    maintenance: TodaySummaryItem;
    pendingApprovals: TodaySummaryItem;
    expiringMemberships: TodaySummaryItem;
  };
  queues: {
    visits: TodayRestrictedSection;
    bookings: TodayRestrictedSection;
    cleaning: TodayRestrictedSection;
    maintenance: TodayRestrictedSection;
    approvals: TodayRestrictedSection;
  };
  sections: {
    openBills: TodayRestrictedSection;
    cleaning: TodayRestrictedSection;
    maintenance: TodayRestrictedSection;
    pendingApprovals: TodayRestrictedSection;
  };
};

type GetTodayOverviewInput = {
  branchId: string;
  permissions: PermissionKey[];
  now?: Date;
};

function hasPermission(permissions: PermissionKey[], permission: PermissionKey): boolean {
  return permissions.includes(permission);
}

function restrictedSection(
  allowed: boolean,
  permission: PermissionKey,
  items: TodayQueueItem[],
): TodayRestrictedSection {
  if (allowed) {
    return { allowed, items };
  }

  return {
    allowed,
    items: [],
    reason: `Requires ${permission} permission`,
  };
}

function personName(personId: string | null): string {
  return PEOPLE.find((person) => person.id === personId)?.displayName ?? "Unknown visitor";
}

function spaceName(spaceId: string | null | undefined): string {
  return SPACES.find((space) => space.id === spaceId)?.name ?? "Unassigned space";
}

function formatMoney(amountMinor: number, currency: string): string {
  return `${(amountMinor / 100).toFixed(2)} ${currency}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfTomorrow(date: Date): Date {
  const start = startOfDay(date);
  return new Date(start.getTime() + 2 * 86_400_000 - 1);
}

function chargeBelongsToBranch(chargeId: string | null, branchId: string): boolean {
  if (!chargeId) {
    return false;
  }

  const charge = CHARGES.find((item) => item.id === chargeId);
  if (!charge) {
    return false;
  }

  if (charge.visitId) {
    return VISITS.some((visit) => visit.id === charge.visitId && visit.branchId === branchId);
  }

  if (charge.usageSessionId) {
    const session = USAGE_SESSIONS.find((item) => item.id === charge.usageSessionId);
    return VISITS.some((visit) => visit.id === session?.visitId && visit.branchId === branchId);
  }

  if (charge.eventId) {
    return EVENTS.some((event) => event.id === charge.eventId && event.branchId === branchId);
  }

  if (charge.hostAccountId) {
    return CUSTOMER_ACCOUNTS.some(
      (account) => account.id === charge.hostAccountId && account.branchId === branchId,
    );
  }

  return false;
}

function invoiceBelongsToBranch(invoiceId: string, branchId: string): boolean {
  return INVOICE_ITEMS.some(
    (item) => item.invoiceId === invoiceId && chargeBelongsToBranch(item.chargeId, branchId),
  );
}

function membershipBelongsToBranch(planId: string, branchId: string): boolean {
  return PLANS.some((plan) => plan.id === planId && plan.branchId === branchId);
}

export function getTodayOverview({
  branchId,
  permissions,
  now = new Date(),
}: GetTodayOverviewInput) {
  const [fallbackBranch] = BRANCHES;
  const branch = BRANCHES.find((item) => item.id === branchId) ?? fallbackBranch;

  if (!branch) {
    throw new Error("No seed branch is configured for the Today dashboard");
  }

  const branchSpaces = SPACES.filter((space) => space.branchId === branch.id);
  const activeVisits = VISITS.filter(
    (visit) => visit.branchId === branch.id && visit.status === "active",
  );
  const activeVisitIds = new Set(activeVisits.map((visit) => visit.id));
  const activeSessions = USAGE_SESSIONS.filter((session) => activeVisitIds.has(session.visitId));
  const occupiedSpaces = branchSpaces.filter((space) => space.status === "occupied");
  const visibleBookings = BOOKINGS.filter((booking) => {
    const space = booking.spaceId ? SPACES.find((item) => item.id === booking.spaceId) : null;
    const todayStart = startOfDay(now);
    return (
      booking.status !== "cancelled" &&
      booking.status !== "no_show" &&
      space?.branchId === branch.id &&
      booking.startsAt >= todayStart &&
      booking.startsAt <= endOfTomorrow(now)
    );
  });
  const openInvoices = INVOICES.filter(
    (invoice) => invoice.status !== "paid" && invoiceBelongsToBranch(invoice.id, branch.id),
  );
  const openBillCurrency = openInvoices[0]?.currency ?? branch.currency;
  const openBillTotalMinor = openInvoices.reduce((total, invoice) => total + invoice.totalCents, 0);
  const branchCleaningTasks = CLEANING_TASKS.filter((task) => {
    const space = SPACES.find((item) => item.id === task.spaceId);
    return space?.branchId === branch.id;
  });
  const branchMaintenanceTickets = MAINTENANCE_TICKETS.filter((ticket) => {
    const space = SPACES.find((item) => item.id === ticket.spaceId);
    return space?.branchId === branch.id;
  });
  const pendingApprovals = APPROVAL_REQUESTS.filter(
    (request) => request.branchId === branch.id && request.status === "pending",
  );
  const expiringMemberships = MEMBERSHIPS.filter(
    (membership) =>
      membership.status === "active" &&
      membershipBelongsToBranch(membership.planId, branch.id) &&
      membership.endsAt <= new Date(now.getTime() + 30 * 86_400_000),
  );
  const shift = SHIFTS.find((item) => item.branchId === branch.id && item.status === "open");
  const occupancyPercent = branchSpaces.length
    ? Math.round((occupiedSpaces.length / branchSpaces.length) * 100)
    : 0;

  const invoiceAllowed = hasPermission(permissions, PERMISSIONS.INVOICE_READ);
  const cleaningAllowed = hasPermission(permissions, PERMISSIONS.CLEANING_MANAGE);
  const maintenanceAllowed = hasPermission(permissions, PERMISSIONS.MAINTENANCE_MANAGE);
  const approvalsAllowed = hasPermission(permissions, PERMISSIONS.AUDIT_READ);

  const visits = activeVisits.map((visit) => {
    const session = activeSessions.find((item) => item.visitId === visit.id);
    return {
      id: visit.id,
      title: personName(visit.personId),
      meta: `${spaceName(session?.spaceId)} · ${visit.visitType.replaceAll("_", " ")}`,
    };
  });
  const bookings = visibleBookings.map((booking) => ({
    id: booking.id,
    title: booking.notes ?? personName(booking.personId),
    meta: `${spaceName(booking.spaceId)} · ${booking.status.replaceAll("_", " ")}`,
  }));
  const openBillItems = openInvoices.map((invoice) => ({
    id: invoice.id,
    title: personName(invoice.billToPersonId),
    meta: formatMoney(invoice.totalCents, invoice.currency),
  }));
  const cleaningItems = branchCleaningTasks.map((task) => ({
    id: task.id,
    title: spaceName(task.spaceId),
    meta: `${task.status.replaceAll("_", " ")} · ${task.reason}`,
  }));
  const maintenanceItems = branchMaintenanceTickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    meta: `${ticket.severity} · ${spaceName(ticket.spaceId)}`,
  }));
  const approvalItems = pendingApprovals.map((request) => ({
    id: request.id,
    title: request.action,
    meta: request.reason,
  }));

  return {
    branch: { id: branch.id, name: branch.name },
    generatedAt: now.toISOString(),
    shiftStatus: shift
      ? { label: "Open shift", detail: shift.notes }
      : { label: "No open shift", detail: "Start a shift before recording cash operations." },
    summary: {
      activeVisits: {
        label: "Active visits",
        value: activeVisits.length,
        detail: `${activeVisits.length} guests currently checked in`,
      },
      occupancy: {
        label: "Occupancy",
        value: `${occupiedSpaces.length}/${branchSpaces.length}`,
        detail: `${occupancyPercent}% occupied`,
      },
      upcomingBookings: {
        label: "Upcoming bookings",
        value: visibleBookings.length,
        detail: `${visibleBookings.length} due today or tomorrow`,
      },
      openBills: {
        label: "Open bills",
        value: invoiceAllowed ? formatMoney(openBillTotalMinor, openBillCurrency) : "Restricted",
        amountMinor: invoiceAllowed ? openBillTotalMinor : 0,
        detail: invoiceAllowed
          ? `${openInvoices.length} draft invoices need follow-up`
          : `Requires ${PERMISSIONS.INVOICE_READ} permission`,
      },
      cleaning: {
        label: "Cleaning",
        value: cleaningAllowed ? branchCleaningTasks.length : "Restricted",
        detail: cleaningAllowed
          ? `${branchCleaningTasks.length} spaces need attention`
          : `Requires ${PERMISSIONS.CLEANING_MANAGE} permission`,
      },
      maintenance: {
        label: "Maintenance",
        value: maintenanceAllowed ? branchMaintenanceTickets.length : "Restricted",
        detail: maintenanceAllowed
          ? `${branchMaintenanceTickets.length} open ticket on this branch`
          : `Requires ${PERMISSIONS.MAINTENANCE_MANAGE} permission`,
      },
      pendingApprovals: {
        label: "Approvals",
        value: approvalsAllowed ? pendingApprovals.length : "Restricted",
        detail: approvalsAllowed
          ? `${pendingApprovals.length} approval waiting`
          : `Requires ${PERMISSIONS.AUDIT_READ} permission`,
      },
      expiringMemberships: {
        label: "Memberships",
        value: expiringMemberships.length,
        detail: `${expiringMemberships.length} expires within 30 days`,
      },
    },
    queues: {
      visits: { allowed: true, items: visits, label: "Active visits" },
      bookings: { allowed: true, items: bookings, label: "Bookings" },
      cleaning: restrictedSection(cleaningAllowed, PERMISSIONS.CLEANING_MANAGE, cleaningItems),
      maintenance: restrictedSection(
        maintenanceAllowed,
        PERMISSIONS.MAINTENANCE_MANAGE,
        maintenanceItems,
      ),
      approvals: restrictedSection(approvalsAllowed, PERMISSIONS.AUDIT_READ, approvalItems),
    },
    sections: {
      openBills: restrictedSection(invoiceAllowed, PERMISSIONS.INVOICE_READ, openBillItems),
      cleaning: restrictedSection(cleaningAllowed, PERMISSIONS.CLEANING_MANAGE, cleaningItems),
      maintenance: restrictedSection(
        maintenanceAllowed,
        PERMISSIONS.MAINTENANCE_MANAGE,
        maintenanceItems,
      ),
      pendingApprovals: restrictedSection(approvalsAllowed, PERMISSIONS.AUDIT_READ, approvalItems),
    },
  } satisfies TodayOverview;
}
