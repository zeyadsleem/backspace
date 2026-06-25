import {
  BOOKINGS,
  BRANCHES,
  CLEANING_TASKS,
  FLOORS,
  MAINTENANCE_TICKETS,
  PEOPLE,
  SPACES,
  USAGE_SESSIONS,
  VISITS,
} from "@backspace/db/seed";

import { visitStatusIsActive } from "../domain/domain";
import { PERMISSIONS } from "../permissions/constants";

export type SpaceAvailabilityState =
  | "available"
  | "occupied"
  | "reserved"
  | "cleaning"
  | "maintenance"
  | "blocked"
  | "inactive";

export type SpaceStateLegendItem = {
  state: SpaceAvailabilityState;
  label: string;
  description: string;
};

export const SPACE_STATE_LEGEND: SpaceStateLegendItem[] = [
  { state: "available", label: "Available", description: "Ready for assignment." },
  { state: "occupied", label: "Occupied", description: "Active usage session is present." },
  { state: "reserved", label: "Reserved", description: "Upcoming reservation is holding it." },
  { state: "cleaning", label: "Cleaning", description: "Cleaning work is open or in progress." },
  {
    state: "maintenance",
    label: "Maintenance",
    description: "Blocking maintenance keeps it out of service.",
  },
  { state: "blocked", label: "Blocked", description: "Manually blocked by operations." },
  { state: "inactive", label: "Inactive", description: "Not currently in service." },
];

type SeedSpace = (typeof SPACES)[number];
type SeedSession = (typeof USAGE_SESSIONS)[number];
type SeedBooking = (typeof BOOKINGS)[number];
type SeedCleaningTask = (typeof CLEANING_TASKS)[number];
type SeedMaintenanceTicket = (typeof MAINTENANCE_TICKETS)[number];

export type SpaceContextSession = {
  id: string;
  visitId: string;
  entrantName: string;
  startedAt: string;
};

export type SpaceContextReservation = {
  id: string;
  personName: string;
  status: string;
  startsAt: string;
  endsAt: string;
};

export type SpaceContextCleaningTask = {
  id: string;
  reason: string;
  status: string;
};

export type SpaceContextMaintenanceTicket = {
  id: string;
  title: string;
  severity: string;
  status: string;
};

export type SpaceMapAction = {
  id:
    | "refresh"
    | "mark_cleaning"
    | "mark_maintenance"
    | "mark_blocked"
    | "clear_blocked"
    | "mark_available";
  label: string;
  supported: boolean;
  enabled: boolean;
  reason?: string;
};

export type SpaceMapItem = {
  id: string;
  name: string;
  code: string;
  kind: string;
  kindLabel: string;
  capacity: number;
  state: SpaceAvailabilityState;
  stateLabel: string;
  stateReason: string;
  floor: { id: string; name: string } | null;
  currentSession: SpaceContextSession | null;
  reservation: SpaceContextReservation | null;
  cleaningTask: SpaceContextCleaningTask | null;
  maintenanceTicket: SpaceContextMaintenanceTicket | null;
  blockedReason: string | null;
  actions: SpaceMapAction[];
};

export type SpaceMapGroup = {
  id: string;
  label: string;
  type: "floor" | "zone" | "type";
  spaces: SpaceMapItem[];
};

export type SpaceMapOverview = {
  branch: { id: string; name: string };
  generatedAt: string;
  sections: {
    visits: { allowed: boolean; reason?: string };
    bookings: { allowed: boolean; reason?: string };
    facilities: { allowed: boolean; reason?: string };
  };
  legend: SpaceStateLegendItem[];
  groups: SpaceMapGroup[];
};

export type SpaceDetail = SpaceMapItem & {
  sections: SpaceMapOverview["sections"];
};

export function getSpaceMap({
  branchId,
  permissions,
  now = new Date(),
}: {
  branchId: string;
  permissions: string[];
  now?: Date;
}): SpaceMapOverview {
  const branch = BRANCHES.find((item) => item.id === branchId) ?? fallbackBranch();
  const branchFloors = FLOORS.filter((floor) => floor.branchId === branch.id).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const sections = buildSections(permissions);
  const spaces = SPACES.filter((space) => space.branchId === branch.id);
  const groups = branchFloors.map((floor) => ({
    id: floor.id,
    label: floor.name,
    type: "floor" as const,
    spaces: spaces
      .filter((space) => space.floorId === floor.id)
      .map((space) => buildSpaceMapItem(space, permissions, now))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return {
    branch: { id: branch.id, name: branch.name },
    generatedAt: now.toISOString(),
    sections,
    legend: SPACE_STATE_LEGEND,
    groups,
  };
}

export function getSpaceDetail({
  branchId,
  spaceId,
  permissions,
  now = new Date(),
}: {
  branchId: string;
  spaceId: string;
  permissions: string[];
  now?: Date;
}): SpaceDetail | null {
  const space = SPACES.find((item) => item.id === spaceId && item.branchId === branchId);
  if (!space) return null;

  return {
    ...buildSpaceMapItem(space, permissions, now),
    sections: buildSections(permissions),
  };
}

export function deriveSpaceAvailabilityState({
  baseStatus,
  activeSession,
  reservation,
  cleaningTask,
  maintenanceTicket,
}: {
  baseStatus: SpaceAvailabilityState;
  activeSession?: { id: string; entrantName: string } | null;
  reservation?: { id: string; personName: string } | null;
  cleaningTask?: { id: string; reason: string } | null;
  maintenanceTicket?: { id: string; title: string; severity: string } | null;
}): { state: SpaceAvailabilityState; reason: string } {
  if (baseStatus === "inactive") return { state: "inactive", reason: "Space is inactive" };
  if (maintenanceTicket?.severity === "blocking") {
    return { state: "maintenance", reason: `Blocking maintenance: ${maintenanceTicket.title}` };
  }
  if (baseStatus === "maintenance")
    return { state: "maintenance", reason: "Space is in maintenance" };
  if (baseStatus === "blocked") return { state: "blocked", reason: "Space is blocked" };
  if (cleaningTask) return { state: "cleaning", reason: `Cleaning: ${cleaningTask.reason}` };
  if (activeSession)
    return { state: "occupied", reason: `Active session for ${activeSession.entrantName}` };
  if (reservation) return { state: "reserved", reason: `Reserved for ${reservation.personName}` };
  if (baseStatus === "reserved") return { state: "reserved", reason: "Space is reserved" };
  return { state: "available", reason: "Ready for assignment" };
}

function buildSpaceMapItem(space: SeedSpace, permissions: string[], now: Date): SpaceMapItem {
  const floor = FLOORS.find((item) => item.id === space.floorId) ?? null;
  const canReadVisits = hasPermission(permissions, PERMISSIONS.VISIT_READ);
  const canReadBookings = hasPermission(permissions, PERMISSIONS.BOOKING_READ);
  const activeSession = activeSessionForSpace(space);
  const reservation = reservationForSpace(space, now);
  const cleaningTask = cleaningTaskForSpace(space);
  const maintenanceTicket = maintenanceTicketForSpace(space);
  const visibleSession = activeSession ? toSessionContext(activeSession) : null;
  const visibleReservation = reservation ? toReservationContext(reservation) : null;
  const visibleCleaningTask = cleaningTask ? toCleaningTaskContext(cleaningTask) : null;
  const visibleMaintenanceTicket = maintenanceTicket
    ? toMaintenanceTicketContext(maintenanceTicket)
    : null;
  const state = deriveSpaceAvailabilityState({
    baseStatus: space.status,
    activeSession: visibleSession,
    reservation: visibleReservation,
    cleaningTask: visibleCleaningTask,
    maintenanceTicket: visibleMaintenanceTicket,
  });

  return {
    id: space.id,
    name: space.name,
    code: space.name,
    kind: space.kind,
    kindLabel: labelText(space.kind),
    capacity: space.capacity,
    state: state.state,
    stateLabel: labelText(state.state),
    stateReason: state.reason,
    floor: floor ? { id: floor.id, name: floor.name } : null,
    currentSession: canReadVisits ? visibleSession : null,
    reservation: canReadBookings ? visibleReservation : null,
    cleaningTask: visibleCleaningTask,
    maintenanceTicket: visibleMaintenanceTicket,
    blockedReason: state.state === "blocked" ? state.reason : null,
    actions: buildActions(permissions, state.state, {
      activeSession: visibleSession,
      reservation: visibleReservation,
      cleaningTask: visibleCleaningTask,
      maintenanceTicket: visibleMaintenanceTicket,
    }),
  };
}

function buildActions(
  permissions: string[],
  state: SpaceAvailabilityState,
  context: {
    activeSession: SpaceContextSession | null;
    reservation: SpaceContextReservation | null;
    cleaningTask: SpaceContextCleaningTask | null;
    maintenanceTicket: SpaceContextMaintenanceTicket | null;
  },
): SpaceMapAction[] {
  const unsupported =
    "State changes are disabled in #11 until persistent state history writes exist.";
  const availableBlocker = availableBlockerReason(context);

  return [
    { id: "refresh", label: "Refresh", supported: true, enabled: true },
    disabledAction(
      "mark_cleaning",
      "Mark cleaning",
      permissions,
      PERMISSIONS.CLEANING_MANAGE,
      unsupported,
    ),
    disabledAction(
      "mark_maintenance",
      "Mark maintenance",
      permissions,
      PERMISSIONS.MAINTENANCE_MANAGE,
      unsupported,
    ),
    disabledAction(
      "mark_blocked",
      "Mark blocked",
      permissions,
      PERMISSIONS.WORKSPACE_UPDATE,
      unsupported,
    ),
    disabledAction(
      "clear_blocked",
      "Clear blocked",
      permissions,
      PERMISSIONS.WORKSPACE_UPDATE,
      unsupported,
    ),
    {
      ...disabledAction(
        "mark_available",
        "Mark available",
        permissions,
        PERMISSIONS.WORKSPACE_UPDATE,
        availableBlocker ?? unsupported,
      ),
      reason: availableBlocker ?? unsupported,
    },
  ];
}

export function validateSpaceStateAction({
  action,
  space,
}: {
  action: Exclude<SpaceMapAction["id"], "refresh">;
  space: SpaceMapItem;
}): { ok: true } | { ok: false; reason: string } {
  const matched = space.actions.find((item) => item.id === action);
  if (!matched) return { ok: false, reason: "Action is not available for this space." };
  if (!matched.supported || !matched.enabled) {
    return { ok: false, reason: matched.reason ?? "Action is not currently supported." };
  }
  return { ok: true };
}

function disabledAction(
  id: Exclude<SpaceMapAction["id"], "refresh">,
  label: string,
  permissions: string[],
  permission: string,
  fallbackReason: string,
): SpaceMapAction {
  if (!hasPermission(permissions, permission)) {
    return {
      id,
      label,
      supported: false,
      enabled: false,
      reason: `Requires ${permission} permission.`,
    };
  }
  return { id, label, supported: false, enabled: false, reason: fallbackReason };
}

function availableBlockerReason({
  activeSession,
  reservation,
  cleaningTask,
  maintenanceTicket,
}: {
  activeSession: SpaceContextSession | null;
  reservation: SpaceContextReservation | null;
  cleaningTask: SpaceContextCleaningTask | null;
  maintenanceTicket: SpaceContextMaintenanceTicket | null;
}): string | null {
  if (activeSession) return "Cannot mark available while an active session is using this space.";
  if (reservation) return "Cannot mark available while a reservation is holding this space.";
  if (maintenanceTicket) return "Cannot mark available while maintenance is open.";
  if (cleaningTask) return "Cannot mark available while cleaning is open.";
  return null;
}

function activeSessionForSpace(space: SeedSpace): SeedSession | null {
  return (
    USAGE_SESSIONS.find((session) => {
      const visit = VISITS.find((item) => item.id === session.visitId);
      return (
        session.spaceId === space.id &&
        session.status === "active" &&
        visit?.branchId === space.branchId &&
        visitStatusIsActive(visit.status)
      );
    }) ?? null
  );
}

function reservationForSpace(space: SeedSpace, now: Date): SeedBooking | null {
  return (
    BOOKINGS.find(
      (booking) =>
        booking.spaceId === space.id &&
        (booking.status === "confirmed" || booking.status === "checked_in") &&
        booking.endsAt >= now,
    ) ?? null
  );
}

function cleaningTaskForSpace(space: SeedSpace): SeedCleaningTask | null {
  return (
    CLEANING_TASKS.find(
      (task) =>
        task.spaceId === space.id && (task.status === "open" || task.status === "in_progress"),
    ) ?? null
  );
}

function maintenanceTicketForSpace(space: SeedSpace): SeedMaintenanceTicket | null {
  return (
    MAINTENANCE_TICKETS.find(
      (ticket) =>
        ticket.spaceId === space.id &&
        (ticket.status === "open" || ticket.status === "in_progress"),
    ) ?? null
  );
}

function toSessionContext(session: SeedSession): SpaceContextSession {
  const visit = VISITS.find((item) => item.id === session.visitId);
  const person = visit ? PEOPLE.find((item) => item.id === visit.personId) : null;
  return {
    id: session.id,
    visitId: session.visitId,
    entrantName: person?.displayName ?? "Unknown entrant",
    startedAt: session.startedAt.toISOString(),
  };
}

function toReservationContext(booking: SeedBooking): SpaceContextReservation {
  const person = PEOPLE.find((item) => item.id === booking.personId);
  return {
    id: booking.id,
    personName: person?.displayName ?? "Unknown customer",
    status: booking.status,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
  };
}

function toCleaningTaskContext(task: SeedCleaningTask): SpaceContextCleaningTask {
  return { id: task.id, reason: task.reason, status: task.status };
}

function toMaintenanceTicketContext(ticket: SeedMaintenanceTicket): SpaceContextMaintenanceTicket {
  return { id: ticket.id, title: ticket.title, severity: ticket.severity, status: ticket.status };
}

function buildSections(permissions: string[]): SpaceMapOverview["sections"] {
  return {
    visits: hasPermission(permissions, PERMISSIONS.VISIT_READ)
      ? { allowed: true }
      : restricted(PERMISSIONS.VISIT_READ),
    bookings: hasPermission(permissions, PERMISSIONS.BOOKING_READ)
      ? { allowed: true }
      : restricted(PERMISSIONS.BOOKING_READ),
    facilities: { allowed: true },
  };
}

function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

function restricted(permission: string) {
  return { allowed: false, reason: `Requires ${permission} permission` };
}

function fallbackBranch() {
  const branch = BRANCHES[0];
  if (!branch) throw new Error("Seed data must include at least one branch");
  return branch;
}

function labelText(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
