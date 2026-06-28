import {
  APPROVAL_REQUESTS,
  AUDIT_LOGS,
  BRANCHES,
  CHARGES,
  CUSTOMER_ACCOUNTS,
  EVENT_ATTENDEES,
  EVENTS,
  INVOICE_ITEMS,
  INVOICES,
  PEOPLE,
  SPACES,
  USAGE_SESSIONS,
  VISITS,
} from "@backspace/db/seed";

import { VISIT_STATUS, visitStatusIsActive } from "../domain/domain";
import { format, createMoney } from "../money/money";
import { PERMISSIONS, type PermissionKey } from "../permissions/constants";

type SeedVisit = (typeof VISITS)[number];
type SeedCharge = (typeof CHARGES)[number];

export type LiveVisitExceptionKind =
  | "approval_required"
  | "complimentary"
  | "hosted_guest"
  | "event_attendee"
  | "open_bill";

export type LiveVisitException = {
  kind: LiveVisitExceptionKind;
  label: string;
  severity: "info" | "warning" | "critical";
};

export type LiveVisitListItem = {
  id: string;
  entrant: { displayName: string; type: string; label: string };
  status: string;
  statusLabel: string;
  billingResponsibility: { value: string; label: string };
  checkedInAt: string;
  elapsedMinutes: number;
  currentSpace: { id: string; name: string; label: string } | null;
  charges: { count: number; totalMinor: number; currency: string; label: string };
  checkoutReadiness: { state: "ready" | "blocked"; label: string; reason?: string };
  exceptions: LiveVisitException[];
};

export type LiveVisitsOverview = {
  branch: { id: string; name: string };
  generatedAt: string;
  sections: {
    charges: { allowed: boolean; reason?: string };
    exceptions: { allowed: boolean; reason?: string };
  };
  visits: LiveVisitListItem[];
};

export type VisitDetailAction = {
  id:
    | "refresh"
    | "mark_blocked"
    | "unblock"
    | "checkout"
    | "add_charge"
    | "record_payment"
    | "check_in";
  label: string;
  supported: boolean;
  enabled: boolean;
  reason?: string;
};

export type VisitDetail = {
  visit: LiveVisitListItem;
  identity: {
    person: { id: string; displayName: string };
    context: { label: string; value: string }[];
  };
  sessions: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    elapsedMinutes: number;
    space: { id: string; name: string } | null;
  }[];
  charges: {
    id: string;
    label: string;
    amountMinor: number;
    currency: string;
    formattedAmount: string;
  }[];
  billing: {
    responsibility: { value: string; label: string };
    chargesTotalMinor: number;
    chargesTotalLabel: string;
    paymentState: "paid" | "open_bill" | "no_charges" | "complimentary";
    paymentStateLabel: string;
    openBill: { id: string; status: string; amountMinor: number; label: string } | null;
  };
  sections: {
    billing: { allowed: boolean; reason?: string };
    audit: { allowed: boolean; reason?: string };
  };
  actions: VisitDetailAction[];
  timeline: { id: string; branchId: string; label: string; occurredAt: string }[];
};

export function getLiveVisits({
  branchId,
  permissions,
  now = new Date(),
}: {
  branchId: string;
  permissions: string[];
  now?: Date;
}): LiveVisitsOverview {
  const branch = BRANCHES.find((item) => item.id === branchId) ?? fallbackBranch();
  const canReadCharges = hasPermission(permissions, PERMISSIONS.INVOICE_READ);
  const visits = VISITS.filter(
    (visit) => visit.branchId === branch.id && visitStatusIsActive(visit.status),
  )
    .map((visit) => buildLiveVisitItem(visit, permissions, now))
    .sort((a, b) => b.elapsedMinutes - a.elapsedMinutes);

  return {
    branch: { id: branch.id, name: branch.name },
    generatedAt: now.toISOString(),
    sections: {
      charges: canReadCharges ? { allowed: true } : restricted(PERMISSIONS.INVOICE_READ),
      exceptions: { allowed: true },
    },
    visits,
  };
}

export function getVisitDetail({
  branchId,
  visitId,
  permissions,
  now = new Date(),
}: {
  branchId: string;
  visitId: string;
  permissions: string[];
  now?: Date;
}): VisitDetail | null {
  const visit = VISITS.find((item) => item.id === visitId && item.branchId === branchId);
  if (!visit) return null;

  const canReadBilling = hasPermission(permissions, PERMISSIONS.INVOICE_READ);
  const canReadAudit = hasPermission(permissions, PERMISSIONS.AUDIT_READ);
  const listItem = buildLiveVisitItem(visit, permissions, now);
  const person = PEOPLE.find((item) => item.id === visit.personId);
  const charges = canReadBilling ? chargesForVisit(visit).map(toDetailCharge) : [];
  const totalMinor = charges.reduce((total, charge) => total + charge.amountMinor, 0);
  const currency = charges[0]?.currency ?? branchCurrency(visit.branchId);
  const openBill = canReadBilling ? openInvoiceForCharges(chargesForVisit(visit)) : null;

  return {
    visit: listItem,
    identity: {
      person: { id: visit.personId, displayName: person?.displayName ?? "Unknown entrant" },
      context: buildIdentityContext(visit),
    },
    sessions: sessionsForVisit(visit).map((session) => {
      const space = SPACES.find((item) => item.id === session.spaceId) ?? null;
      return {
        id: session.id,
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        endedAt: session.endedAt?.toISOString() ?? null,
        elapsedMinutes: elapsedMinutes(session.startedAt, session.endedAt ?? now),
        space: space ? { id: space.id, name: space.name } : null,
      };
    }),
    charges,
    billing: {
      responsibility: labelValue(visit.billingResponsibility),
      chargesTotalMinor: canReadBilling ? totalMinor : 0,
      chargesTotalLabel: canReadBilling ? format(createMoney(totalMinor, currency)) : "Restricted",
      paymentState: getPaymentState(visit, totalMinor, openBill),
      paymentStateLabel: labelText(getPaymentState(visit, totalMinor, openBill)),
      openBill: openBill
        ? {
            id: openBill.id,
            status: openBill.status,
            amountMinor: totalMinor,
            label: format(createMoney(totalMinor, openBill.currency)),
          }
        : null,
    },
    sections: {
      billing: canReadBilling ? { allowed: true } : restricted(PERMISSIONS.INVOICE_READ),
      audit: canReadAudit ? { allowed: true } : restricted(PERMISSIONS.AUDIT_READ),
    },
    actions: buildActions(permissions),
    timeline: canReadAudit ? timelineForVisit(visit) : [],
  };
}

function buildLiveVisitItem(visit: SeedVisit, permissions: string[], now: Date): LiveVisitListItem {
  const canReadCharges = hasPermission(permissions, PERMISSIONS.INVOICE_READ);
  const person = PEOPLE.find((item) => item.id === visit.personId);
  const session =
    sessionsForVisit(visit).find((item) => item.status === "active") ?? sessionsForVisit(visit)[0];
  const space = session ? SPACES.find((item) => item.id === session.spaceId) : null;
  const charges = canReadCharges ? chargesForVisit(visit) : [];
  const totalMinor = charges.reduce((total, charge) => total + signedAmount(charge), 0);
  const currency = charges[0]?.currency ?? branchCurrency(visit.branchId);
  const exceptions = buildExceptions(visit, charges);

  return {
    id: visit.id,
    entrant: {
      displayName: person?.displayName ?? "Unknown entrant",
      type: visit.visitType,
      label: labelText(visit.visitType),
    },
    status: visit.status,
    statusLabel: labelText(visit.status),
    billingResponsibility: labelValue(visit.billingResponsibility),
    checkedInAt: visit.checkedInAt.toISOString(),
    elapsedMinutes: elapsedMinutes(visit.checkedInAt, now),
    currentSpace: space ? { id: space.id, name: space.name, label: space.name } : null,
    charges: {
      count: charges.length,
      totalMinor,
      currency,
      label: canReadCharges ? format(createMoney(totalMinor, currency)) : "Restricted",
    },
    checkoutReadiness: exceptions.some((exception) => exception.kind === "approval_required")
      ? { state: "blocked", label: "Blocked", reason: "Approval pending" }
      : { state: "ready", label: "Ready" },
    exceptions,
  };
}

function chargesForVisit(visit: SeedVisit): SeedCharge[] {
  const eventAttendee = EVENT_ATTENDEES.find((item) => item.visitId === visit.id);
  return CHARGES.filter(
    (charge) =>
      charge.visitId === visit.id ||
      (eventAttendee && charge.eventId === eventAttendee.eventId) ||
      (visit.hostAccountId && charge.hostAccountId === visit.hostAccountId),
  );
}

function sessionsForVisit(visit: SeedVisit) {
  return USAGE_SESSIONS.filter((session) => session.visitId === visit.id);
}

function toDetailCharge(charge: SeedCharge) {
  const amountMinor = signedAmount(charge);
  return {
    id: charge.id,
    label: charge.label,
    amountMinor,
    currency: charge.currency,
    formattedAmount: format(createMoney(amountMinor, charge.currency)),
  };
}

function signedAmount(charge: SeedCharge): number {
  return charge.type === "discount" ? -charge.amountCents : charge.amountCents;
}

function openInvoiceForCharges(charges: SeedCharge[]) {
  const chargeIds = new Set(charges.map((charge) => charge.id));
  const invoiceItem = INVOICE_ITEMS.find((item) => chargeIds.has(item.chargeId));
  if (!invoiceItem) return null;
  const invoice = INVOICES.find((item) => item.id === invoiceItem.invoiceId);
  return invoice && invoice.status !== "paid" ? invoice : null;
}

function buildExceptions(visit: SeedVisit, charges: SeedCharge[]): LiveVisitException[] {
  const exceptions: LiveVisitException[] = [];
  const chargeIds = new Set(charges.map((charge) => charge.id));
  if (
    APPROVAL_REQUESTS.some(
      (request) => request.status === "pending" && chargeIds.has(request.targetId),
    )
  ) {
    exceptions.push({ kind: "approval_required", label: "Approval required", severity: "warning" });
  }
  if (charges.some((charge) => charge.type === "complimentary")) {
    exceptions.push({ kind: "complimentary", label: "Complimentary", severity: "info" });
  }
  if (visit.hostAccountId) {
    exceptions.push({ kind: "hosted_guest", label: "Hosted guest", severity: "info" });
  }
  if (EVENT_ATTENDEES.some((attendee) => attendee.visitId === visit.id)) {
    exceptions.push({ kind: "event_attendee", label: "Event attendee", severity: "info" });
  }
  if (openInvoiceForCharges(charges)) {
    exceptions.push({ kind: "open_bill", label: "Open bill", severity: "warning" });
  }
  return exceptions;
}

function buildIdentityContext(visit: SeedVisit): { label: string; value: string }[] {
  const context: { label: string; value: string }[] = [
    { label: "Visit type", value: labelText(visit.visitType) },
  ];
  const account = CUSTOMER_ACCOUNTS.find((item) => item.id === visit.hostAccountId);
  const eventAttendee = EVENT_ATTENDEES.find((item) => item.visitId === visit.id);
  const event = eventAttendee ? EVENTS.find((item) => item.id === eventAttendee.eventId) : null;
  if (visit.bookingId) context.push({ label: "Booking", value: visit.bookingId });
  if (visit.membershipId) context.push({ label: "Membership", value: visit.membershipId });
  if (account) context.push({ label: "Host account", value: account.name });
  if (event) context.push({ label: "Event", value: event.name });
  return context;
}

function buildActions(permissions: string[]): VisitDetailAction[] {
  const canRead = hasPermission(permissions, PERMISSIONS.VISIT_READ);
  return [
    { id: "refresh", label: "Refresh", supported: true, enabled: canRead },
    unsupported(
      "mark_blocked",
      "Mark blocked",
      "Visit blocking is out of scope until persistent status updates ship.",
    ),
    unsupported(
      "unblock",
      "Unblock",
      "Visit unblocking is out of scope until persistent status updates ship.",
    ),
    unsupported("checkout", "Checkout", "Checkout finalization is out of scope for #10."),
    enabled("add_charge", "Add charge", hasPermission(permissions, PERMISSIONS.CHARGE_ADD)),
    unsupported("record_payment", "Record payment", "Payment recording is out of scope for #10."),
    unsupported("check_in", "Check in", "Check-in creation is out of scope for #10."),
  ];
}

function unsupported(
  id: VisitDetailAction["id"],
  label: string,
  reason: string,
): VisitDetailAction {
  return { id, label, supported: false, enabled: false, reason };
}

function enabled(
  id: VisitDetailAction["id"],
  label: string,
  isEnabled: boolean,
): VisitDetailAction {
  return { id, label, supported: true, enabled: isEnabled };
}

function timelineForVisit(visit: SeedVisit) {
  const chargeIds = new Set(chargesForVisit(visit).map((charge) => charge.id));
  const sessions = sessionsForVisit(visit);
  const firstSession = sessions[0];
  const occurredAt = (firstSession?.startedAt ?? visit.checkedInAt).toISOString();
  return AUDIT_LOGS.filter(
    (entry) =>
      entry.branchId === visit.branchId &&
      ((entry.entityType === "visit" && entry.entityId === visit.id) ||
        (entry.entityType === "charge" && chargeIds.has(entry.entityId))),
  ).map((entry) => ({
    id: entry.id,
    branchId: entry.branchId,
    label: labelText(entry.action),
    occurredAt,
  }));
}

function getPaymentState(
  visit: SeedVisit,
  totalMinor: number,
  openBill: ReturnType<typeof openInvoiceForCharges>,
) {
  if (totalMinor === 0) return "complimentary";
  if (openBill) return "open_bill";
  if (visit.status === VISIT_STATUS.CHECKED_OUT) return "paid";
  return "no_charges";
}

function elapsedMinutes(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

function branchCurrency(branchId: string): string {
  return BRANCHES.find((branch) => branch.id === branchId)?.currency ?? "EGP";
}

function fallbackBranch(): (typeof BRANCHES)[number] {
  const [branch] = BRANCHES;
  if (!branch) {
    throw new Error("Seed branches are required for live visits");
  }
  return branch;
}

function labelValue(value: string): { value: string; label: string } {
  return { value, label: labelText(value) };
}

function labelText(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function hasPermission(permissions: string[], permission: PermissionKey): boolean {
  return permissions.includes(permission);
}

function restricted(permission: PermissionKey): { allowed: false; reason: string } {
  return { allowed: false, reason: `Requires ${permission} permission` };
}
