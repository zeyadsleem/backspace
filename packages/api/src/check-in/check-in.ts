import { TRPCError } from "@trpc/server";

import {
  BOOKINGS,
  BRANCHES,
  CLEANING_TASKS,
  CUSTOMER_ACCOUNTS,
  MAINTENANCE_TICKETS,
  PEOPLE,
  SPACES,
  USAGE_SESSIONS,
  VISITS,
} from "@backspace/db/seed";
import {
  and,
  booking as bookingTable,
  db,
  eq,
  eventAttendee,
  membership,
  membershipPlan,
  space,
  usageSession,
  visit,
  workspaceEvent,
} from "@backspace/db";

import { writeAuditLog } from "../audit/audit";
import { VISIT_STATUS, visitStatusIsActive } from "../domain/domain";

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

async function validateNoActiveVisitDb(branchId: string, personId: string): Promise<void> {
  const rows = await db
    .select()
    .from(visit)
    .where(
      and(
        eq(visit.branchId, branchId),
        eq(visit.personId, personId),
        eq(visit.status, VISIT_STATUS.ACTIVE),
      ),
    )
    .limit(1);
  if (rows.length > 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Person ${personId} already has an active visit (${rows[0]!.id}). Check-out first before creating a new one.`,
    });
  }
}

async function validateSpaceAvailableDb(branchId: string, spaceId: string): Promise<void> {
  const [spaceRow] = await db
    .select()
    .from(space)
    .where(and(eq(space.id, spaceId), eq(space.branchId, branchId)))
    .limit(1);
  if (!spaceRow) {
    return;
  }
  const activeSession = await db
    .select({ id: usageSession.id })
    .from(usageSession)
    .where(and(eq(usageSession.spaceId, spaceId), eq(usageSession.status, "active")))
    .limit(1);
  if (activeSession.length > 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Space ${spaceRow.name} is occupied by an active usage session.`,
    });
  }
}

async function validateBookingBranchContext(branchId: string, bookingId: string) {
  const [bookingRow] = await db
    .select()
    .from(bookingTable)
    .where(eq(bookingTable.id, bookingId))
    .limit(1);
  if (!bookingRow) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking not found: ${bookingId}`,
    });
  }
  if (bookingRow.status !== "confirmed") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking ${bookingId} cannot be checked in (status: ${bookingRow.status}). Only confirmed bookings can be checked in.`,
    });
  }
  const spaceId = bookingRow.spaceId;
  if (!spaceId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking ${bookingId} has no assigned space.`,
    });
  }
  const [spaceRow] = await db
    .select()
    .from(space)
    .where(eq(space.id, spaceId))
    .limit(1);
  if (!spaceRow || spaceRow.branchId !== branchId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking ${bookingId} space does not belong to branch ${branchId}.`,
    });
  }
  return bookingRow;
}

async function validateMembershipBranch(
  membershipId: string,
  personId: string,
  branchId: string,
): Promise<void> {
  const [membershipRow] = await db
    .select()
    .from(membership)
    .where(eq(membership.id, membershipId))
    .limit(1);
  if (!membershipRow) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Membership not found: ${membershipId}`,
    });
  }
  if (membershipRow.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Membership ${membershipId} is not active (status: ${membershipRow.status}).`,
    });
  }
  if (membershipRow.personId !== personId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Membership ${membershipId} does not belong to person ${personId}.`,
    });
  }
  const [planRow] = await db
    .select()
    .from(membershipPlan)
    .where(eq(membershipPlan.id, membershipRow.planId))
    .limit(1);
  if (!planRow) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Membership plan not found for membership ${membershipId}.`,
    });
  }
  if (planRow.branchId !== null && planRow.branchId !== branchId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Membership plan ${planRow.name} is not valid for branch ${branchId}.`,
    });
  }
}

async function validateEventContext(
  eventId: string,
  branchId: string,
  personId: string,
) {
  const [eventRow] = await db
    .select()
    .from(workspaceEvent)
    .where(eq(workspaceEvent.id, eventId))
    .limit(1);
  if (!eventRow) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Event not found: ${eventId}`,
    });
  }
  if (eventRow.branchId !== branchId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Event ${eventId} does not belong to branch ${branchId}.`,
    });
  }
  if (eventRow.status !== "in_progress") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Event ${eventId} cannot accept check-ins (status: ${eventRow.status}). Only in-progress events can accept check-ins.`,
    });
  }
  const [attendeeRow] = await db
    .select()
    .from(eventAttendee)
    .where(
      and(
        eq(eventAttendee.eventId, eventId),
        eq(eventAttendee.personId, personId),
      ),
    )
    .limit(1);
  if (!attendeeRow) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Person ${personId} is not registered for event ${eventId}.`,
    });
  }
  if (attendeeRow.status !== "invited") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Event attendee ${attendeeRow.id} cannot be checked in (status: ${attendeeRow.status}).`,
    });
  }
  return eventRow;
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
  await validateNoActiveVisitDb(input.branchId, input.personId);
  validateNoActiveVisit(input.branchId, input.personId);

  if (input.spaceId) {
    await validateSpaceAvailableDb(input.branchId, input.spaceId);
    validateSpaceAvailable(input.branchId, input.spaceId);
  }

  const billingResponsibility = input.billingResponsibility ?? "visitor";
  const visitId = crypto.randomUUID();
  let usageSessionResult: CheckInSessionResult | null = null;

  await db.transaction(async (tx) => {
    await tx.insert(visit).values({
      id: visitId,
      branchId: input.branchId,
      personId: input.personId,
      visitType: "walk_in",
      billingResponsibility,
      status: "active",
      checkedInAt: new Date(),
    });

    if (input.spaceId) {
      const sessionId = crypto.randomUUID();
      await tx.insert(usageSession).values({
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

    await writeAuditLog(
      {
        id: crypto.randomUUID(),
        branchId: input.branchId,
        actorUserId: staffUserId,
        action: "visit.create",
        entityType: "visit",
        entityId: visitId,
        metadata: JSON.stringify({
          visitType: "walk_in",
          branchId: input.branchId,
          personId: input.personId,
          spaceId: input.spaceId ?? null,
        }),
      },
      tx,
    );
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
  await validateNoActiveVisitDb(input.branchId, input.personId);
  validateNoActiveVisit(input.branchId, input.personId);
  await validateMembershipBranch(input.membershipId, input.personId, input.branchId);

  if (input.spaceId) {
    await validateSpaceAvailableDb(input.branchId, input.spaceId);
    validateSpaceAvailable(input.branchId, input.spaceId);
  }

  const visitId = crypto.randomUUID();
  let usageSessionResult: CheckInSessionResult | null = null;

  await db.transaction(async (tx) => {
    await tx.insert(visit).values({
      id: visitId,
      branchId: input.branchId,
      personId: input.personId,
      visitType: "member",
      billingResponsibility: "subscription",
      status: "active",
      membershipId: input.membershipId,
      checkedInAt: new Date(),
    });

    if (input.spaceId) {
      const sessionId = crypto.randomUUID();
      await tx.insert(usageSession).values({
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

    await writeAuditLog(
      {
        id: crypto.randomUUID(),
        branchId: input.branchId,
        actorUserId: staffUserId,
        action: "visit.create",
        entityType: "visit",
        entityId: visitId,
        metadata: JSON.stringify({
          visitType: "member",
          branchId: input.branchId,
          personId: input.personId,
          membershipId: input.membershipId,
          spaceId: input.spaceId ?? null,
        }),
      },
      tx,
    );
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

  const bookingRow = await validateBookingBranchContext(input.branchId, input.bookingId);
  const personId = bookingRow.personId;
  const spaceId = bookingRow.spaceId!;

  await validateNoActiveVisitDb(input.branchId, personId);
  validateNoActiveVisit(input.branchId, personId);
  await validateSpaceAvailableDb(input.branchId, spaceId);
  validateSpaceAvailable(input.branchId, spaceId);

  const visitId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(visit).values({
      id: visitId,
      branchId: input.branchId,
      personId,
      visitType: "booking_customer",
      billingResponsibility: "visitor",
      status: "active",
      bookingId: input.bookingId,
      checkedInAt: new Date(),
    });

    await tx.insert(usageSession).values({
      id: sessionId,
      visitId,
      spaceId,
      status: "active",
      startedAt: new Date(),
    });

    await tx
      .update(bookingTable)
      .set({ status: "checked_in" })
      .where(eq(bookingTable.id, input.bookingId));

    await writeAuditLog(
      {
        id: crypto.randomUUID(),
        branchId: input.branchId,
        actorUserId: staffUserId,
        action: "visit.create",
        entityType: "visit",
        entityId: visitId,
        metadata: JSON.stringify({
          visitType: "booking_customer",
          branchId: input.branchId,
          bookingId: input.bookingId,
          personId,
          spaceId,
          usageSessionId: sessionId,
        }),
      },
      tx,
    );
  });

  return {
    visit: {
      id: visitId,
      personId,
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
  await validateNoActiveVisitDb(input.branchId, input.personId);
  validateNoActiveVisit(input.branchId, input.personId);

  const hostAccount = CUSTOMER_ACCOUNTS.find(
    (item) => item.id === input.hostAccountId && item.branchId === input.branchId,
  );
  if (!hostAccount) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Host account not found for branch: ${input.hostAccountId}`,
    });
  }

  if (input.spaceId) {
    await validateSpaceAvailableDb(input.branchId, input.spaceId);
    validateSpaceAvailable(input.branchId, input.spaceId);
  }

  const visitId = crypto.randomUUID();
  let usageSessionResult: CheckInSessionResult | null = null;

  await db.transaction(async (tx) => {
    await tx.insert(visit).values({
      id: visitId,
      branchId: input.branchId,
      personId: input.personId,
      visitType: "hosted_guest",
      billingResponsibility: "host",
      status: "active",
      hostAccountId: input.hostAccountId,
      checkedInAt: new Date(),
    });

    if (input.spaceId) {
      const sessionId = crypto.randomUUID();
      await tx.insert(usageSession).values({
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

    await writeAuditLog(
      {
        id: crypto.randomUUID(),
        branchId: input.branchId,
        actorUserId: staffUserId,
        action: "visit.create",
        entityType: "visit",
        entityId: visitId,
        metadata: JSON.stringify({
          visitType: "hosted_guest",
          branchId: input.branchId,
          personId: input.personId,
          hostAccountId: input.hostAccountId,
          spaceId: input.spaceId ?? null,
        }),
      },
      tx,
    );
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
  await validateNoActiveVisitDb(input.branchId, input.personId);
  validateNoActiveVisit(input.branchId, input.personId);

  const eventRow = await validateEventContext(input.eventId, input.branchId, input.personId);

  const visitId = crypto.randomUUID();
  let usageSessionResult: CheckInSessionResult | null = null;

  await db.transaction(async (tx) => {
    await tx.insert(visit).values({
      id: visitId,
      branchId: input.branchId,
      personId: input.personId,
      visitType: "event_attendee",
      billingResponsibility: "event",
      status: "active",
      checkedInAt: new Date(),
    });

    if (eventRow.spaceId) {
      const sessionId = crypto.randomUUID();
      await tx.insert(usageSession).values({
        id: sessionId,
        visitId,
        spaceId: eventRow.spaceId,
        status: "active",
        startedAt: new Date(),
      });
      usageSessionResult = {
        id: sessionId,
        visitId,
        spaceId: eventRow.spaceId,
        status: "active",
        startedAt: new Date(),
      };
    }

    await tx
      .update(eventAttendee)
      .set({ status: "checked_in", visitId, checkedInAt: new Date() })
      .where(eq(eventAttendee.id, (await tx.select().from(eventAttendee).where(and(eq(eventAttendee.eventId, input.eventId), eq(eventAttendee.personId, input.personId))).limit(1))[0]!.id));

    await writeAuditLog(
      {
        id: crypto.randomUUID(),
        branchId: input.branchId,
        actorUserId: staffUserId,
        action: "visit.create",
        entityType: "visit",
        entityId: visitId,
        metadata: JSON.stringify({
          visitType: "event_attendee",
          branchId: input.branchId,
          personId: input.personId,
          eventId: input.eventId,
          spaceId: eventRow.spaceId ?? null,
          usageSessionId: usageSessionResult?.id ?? null,
        }),
      },
      tx,
    );
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
