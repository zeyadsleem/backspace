import { TRPCError } from "@trpc/server";

import {
  BOOKINGS,
  BRANCHES,
  CLEANING_TASKS,
  EVENTS,
  MAINTENANCE_TICKETS,
  MEMBERSHIPS,
  PEOPLE,
  SPACES,
  USAGE_SESSIONS,
  VISITS,
} from "@backspace/db/seed";
import { db, usageSession, visit } from "@backspace/db";

import { writeAuditLog } from "../audit/audit";
import { visitStatusIsActive } from "../domain/domain";

type SeedSpace = {
  id: string;
  branchId: string;
  name: string;
  status: string;
  floorId: string | null;
  kind: string;
  capacity: number;
};

export type CheckInVisitResult = {
  id: string;
  personId: string;
  visitType: string;
  status: string;
  checkedInAt: Date;
  billingResponsibility: string;
};

export type CheckInSessionResult = {
  id: string;
  visitId: string;
  spaceId: string;
  status: string;
  startedAt: Date;
};

export type WalkInInput = {
  branchId: string;
  personId: string;
  spaceId?: string;
  billingResponsibility?: "visitor" | "pay_later" | "complimentary";
};

export type MemberInput = {
  branchId: string;
  personId: string;
  membershipId: string;
  spaceId?: string;
};

export type BookingInput = {
  branchId: string;
  bookingId: string;
};

export type HostedGuestInput = {
  branchId: string;
  personId: string;
  hostAccountId: string;
  spaceId?: string;
};

export type EventAttendeeInput = {
  branchId: string;
  eventId: string;
  personId: string;
};

function validateBranch(branchId: string): void {
  const branch = BRANCHES.find((item) => item.id === branchId);
  if (!branch) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Branch not found: ${branchId}` });
  }
}

function validatePersonExists(personId: string): void {
  const person = PEOPLE.find((item) => item.id === personId);
  if (!person) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Person not found: ${personId}` });
  }
}

function validateNoActiveVisit(branchId: string, personId: string): void {
  const active = VISITS.find(
    (visit) =>
      visit.personId === personId &&
      visit.branchId === branchId &&
      visitStatusIsActive(visit.status),
  );
  if (active) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Person ${personId} already has an active visit (${active.id}). Check-out first before creating a new one.`,
    });
  }
}

function validateSpaceAvailable(branchId: string, spaceId: string): void {
  const space = SPACES.find((item) => item.id === spaceId && item.branchId === branchId);
  if (!space) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Space not found: ${spaceId}` });
  }
  const state = deriveSpaceState(space);
  if (state !== "available") {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Space ${space.name} is not available: ${state}`,
    });
  }
}

export function deriveSpaceState(space: SeedSpace): string {
  const activeSession = USAGE_SESSIONS.find(
    (session) =>
      session.spaceId === space.id &&
      session.status === "active" &&
      VISITS.find(
        (visit) =>
          visit.id === session.visitId &&
          visit.branchId === space.branchId &&
          visitStatusIsActive(visit.status),
      ),
  );
  const reservation = BOOKINGS.find(
    (booking) =>
      booking.spaceId === space.id &&
      (booking.status === "confirmed" || booking.status === "checked_in") &&
      booking.endsAt >= new Date(),
  );
  const cleaningTask = CLEANING_TASKS.find(
    (task) =>
      task.spaceId === space.id && (task.status === "open" || task.status === "in_progress"),
  );
  const maintenanceTicket = MAINTENANCE_TICKETS.find(
    (ticket) =>
      ticket.spaceId === space.id && (ticket.status === "open" || ticket.status === "in_progress"),
  );

  if (space.status === "inactive") return "inactive";
  if (maintenanceTicket?.severity === "blocking") return "maintenance";
  if (space.status === "maintenance") return "maintenance";
  if (space.status === "blocked") return "blocked";
  if (cleaningTask) return "cleaning";
  if (activeSession) return "occupied";
  if (reservation) return "reserved";
  if (space.status === "reserved") return "reserved";
  if (space.status === "available") return "available";
  return space.status;
}

export async function checkInWalkIn(
  input: WalkInInput,
  staffUserId: string,
): Promise<{
  visit: CheckInVisitResult;
  usageSession: CheckInSessionResult | null;
}> {
  validateBranch(input.branchId);
  validatePersonExists(input.personId);
  validateNoActiveVisit(input.branchId, input.personId);

  if (input.spaceId) {
    validateSpaceAvailable(input.branchId, input.spaceId);
  }

  const billingResponsibility = input.billingResponsibility ?? "visitor";
  const visitId = crypto.randomUUID();

  await db.insert(visit).values({
    id: visitId,
    branchId: input.branchId,
    personId: input.personId,
    visitType: "walk_in",
    billingResponsibility,
    status: "active",
    checkedInAt: new Date(),
  });

  let usageSessionResult: CheckInSessionResult | null = null;
  if (input.spaceId) {
    const sessionId = crypto.randomUUID();
    await db.insert(usageSession).values({
      id: sessionId,
      visitId,
      spaceId: input.spaceId,
      status: "active",
      startedAt: new Date(),
    });
    usageSessionResult = {
      id: sessionId,
      visitId,
      spaceId: input.spaceId,
      status: "active",
      startedAt: new Date(),
    };
  }

  await writeAuditLog({
    id: crypto.randomUUID(),
    branchId: input.branchId,
    actorUserId: staffUserId,
    action: "visit.create",
    entityType: "visit",
    entityId: visitId,
    metadata: JSON.stringify({ visitType: "walk_in", personId: input.personId }),
  });

  return {
    visit: {
      id: visitId,
      personId: input.personId,
      visitType: "walk_in",
      status: "active",
      checkedInAt: new Date(),
      billingResponsibility,
    },
    usageSession: usageSessionResult,
  };
}

export async function checkInMember(
  input: MemberInput,
  staffUserId: string,
): Promise<{
  visit: CheckInVisitResult;
  usageSession: CheckInSessionResult | null;
}> {
  validateBranch(input.branchId);
  validatePersonExists(input.personId);
  validateNoActiveVisit(input.branchId, input.personId);

  const membership = MEMBERSHIPS.find((item) => item.id === input.membershipId);
  if (!membership) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Membership not found: ${input.membershipId}`,
    });
  }
  if (membership.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Membership ${input.membershipId} is not active (status: ${membership.status}).`,
    });
  }

  if (input.spaceId) {
    validateSpaceAvailable(input.branchId, input.spaceId);
  }

  const visitId = crypto.randomUUID();

  await db.insert(visit).values({
    id: visitId,
    branchId: input.branchId,
    personId: input.personId,
    visitType: "member",
    billingResponsibility: "subscription",
    status: "active",
    membershipId: input.membershipId,
    checkedInAt: new Date(),
  });

  let usageSessionResult: CheckInSessionResult | null = null;
  if (input.spaceId) {
    const sessionId = crypto.randomUUID();
    await db.insert(usageSession).values({
      id: sessionId,
      visitId,
      spaceId: input.spaceId,
      status: "active",
      startedAt: new Date(),
    });
    usageSessionResult = {
      id: sessionId,
      visitId,
      spaceId: input.spaceId,
      status: "active",
      startedAt: new Date(),
    };
  }

  await writeAuditLog({
    id: crypto.randomUUID(),
    branchId: input.branchId,
    actorUserId: staffUserId,
    action: "visit.create",
    entityType: "visit",
    entityId: visitId,
    metadata: JSON.stringify({
      visitType: "member",
      personId: input.personId,
      membershipId: input.membershipId,
    }),
  });

  return {
    visit: {
      id: visitId,
      personId: input.personId,
      visitType: "member",
      status: "active",
      checkedInAt: new Date(),
      billingResponsibility: "subscription",
    },
    usageSession: usageSessionResult,
  };
}

export async function checkInBooking(
  input: BookingInput,
  staffUserId: string,
): Promise<{
  visit: CheckInVisitResult;
  usageSession: CheckInSessionResult;
}> {
  validateBranch(input.branchId);

  const booking = BOOKINGS.find((item) => item.id === input.bookingId);
  if (!booking) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking not found: ${input.bookingId}`,
    });
  }
  if (booking.status !== "confirmed") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking ${input.bookingId} cannot be checked in (status: ${booking.status}). Only confirmed bookings can be checked in.`,
    });
  }

  validateNoActiveVisit(input.branchId, booking.personId);

  const spaceId = booking.spaceId;
  if (spaceId) {
    validateSpaceAvailable(input.branchId, spaceId);
  } else {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking ${input.bookingId} has no assigned space.`,
    });
  }

  const visitId = crypto.randomUUID();

  await db.insert(visit).values({
    id: visitId,
    branchId: input.branchId,
    personId: booking.personId,
    visitType: "booking_customer",
    billingResponsibility: "visitor",
    status: "active",
    bookingId: input.bookingId,
    checkedInAt: new Date(),
  });

  const sessionId = crypto.randomUUID();
  await db.insert(usageSession).values({
    id: sessionId,
    visitId,
    spaceId,
    status: "active",
    startedAt: new Date(),
  });

  await writeAuditLog({
    id: crypto.randomUUID(),
    branchId: input.branchId,
    actorUserId: staffUserId,
    action: "visit.create",
    entityType: "visit",
    entityId: visitId,
    metadata: JSON.stringify({
      visitType: "booking_customer",
      bookingId: input.bookingId,
      personId: booking.personId,
    }),
  });

  return {
    visit: {
      id: visitId,
      personId: booking.personId,
      visitType: "booking_customer",
      status: "active",
      checkedInAt: new Date(),
      billingResponsibility: "visitor",
    },
    usageSession: {
      id: sessionId,
      visitId,
      spaceId,
      status: "active",
      startedAt: new Date(),
    },
  };
}

export async function checkInHostedGuest(
  input: HostedGuestInput,
  staffUserId: string,
): Promise<{
  visit: CheckInVisitResult;
  usageSession: CheckInSessionResult | null;
}> {
  validateBranch(input.branchId);
  validatePersonExists(input.personId);
  validateNoActiveVisit(input.branchId, input.personId);

  if (input.spaceId) {
    validateSpaceAvailable(input.branchId, input.spaceId);
  }

  const visitId = crypto.randomUUID();

  await db.insert(visit).values({
    id: visitId,
    branchId: input.branchId,
    personId: input.personId,
    visitType: "hosted_guest",
    billingResponsibility: "host",
    status: "active",
    hostAccountId: input.hostAccountId,
    checkedInAt: new Date(),
  });

  let usageSessionResult: CheckInSessionResult | null = null;
  if (input.spaceId) {
    const sessionId = crypto.randomUUID();
    await db.insert(usageSession).values({
      id: sessionId,
      visitId,
      spaceId: input.spaceId,
      status: "active",
      startedAt: new Date(),
    });
    usageSessionResult = {
      id: sessionId,
      visitId,
      spaceId: input.spaceId,
      status: "active",
      startedAt: new Date(),
    };
  }

  await writeAuditLog({
    id: crypto.randomUUID(),
    branchId: input.branchId,
    actorUserId: staffUserId,
    action: "visit.create",
    entityType: "visit",
    entityId: visitId,
    metadata: JSON.stringify({
      visitType: "hosted_guest",
      personId: input.personId,
      hostAccountId: input.hostAccountId,
    }),
  });

  return {
    visit: {
      id: visitId,
      personId: input.personId,
      visitType: "hosted_guest",
      status: "active",
      checkedInAt: new Date(),
      billingResponsibility: "host",
    },
    usageSession: usageSessionResult,
  };
}

export async function checkInEventAttendee(
  input: EventAttendeeInput,
  staffUserId: string,
): Promise<{
  visit: CheckInVisitResult;
  usageSession: CheckInSessionResult | null;
}> {
  validateBranch(input.branchId);
  validatePersonExists(input.personId);
  validateNoActiveVisit(input.branchId, input.personId);

  const event = EVENTS.find((item) => item.id === input.eventId);
  if (!event) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Event not found: ${input.eventId}`,
    });
  }
  if (event.status !== "in_progress") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Event ${input.eventId} cannot accept check-ins (status: ${event.status}). Only in-progress events can accept check-ins.`,
    });
  }

  const visitId = crypto.randomUUID();

  await db.insert(visit).values({
    id: visitId,
    branchId: input.branchId,
    personId: input.personId,
    visitType: "event_attendee",
    billingResponsibility: "event",
    status: "active",
    checkedInAt: new Date(),
  });

  let usageSessionResult: CheckInSessionResult | null = null;
  if (event.spaceId) {
    validateSpaceAvailable(input.branchId, event.spaceId);
    const sessionId = crypto.randomUUID();
    await db.insert(usageSession).values({
      id: sessionId,
      visitId,
      spaceId: event.spaceId,
      status: "active",
      startedAt: new Date(),
    });
    usageSessionResult = {
      id: sessionId,
      visitId,
      spaceId: event.spaceId,
      status: "active",
      startedAt: new Date(),
    };
  }

  await writeAuditLog({
    id: crypto.randomUUID(),
    branchId: input.branchId,
    actorUserId: staffUserId,
    action: "visit.create",
    entityType: "visit",
    entityId: visitId,
    metadata: JSON.stringify({
      visitType: "event_attendee",
      personId: input.personId,
      eventId: input.eventId,
    }),
  });

  return {
    visit: {
      id: visitId,
      personId: input.personId,
      visitType: "event_attendee",
      status: "active",
      checkedInAt: new Date(),
      billingResponsibility: "event",
    },
    usageSession: usageSessionResult,
  };
}
