import { TRPCError } from "@trpc/server";

import { and, booking, db, eq, gte, lte, or, person, space, usageSession } from "@backspace/db";

import { writeAuditLog } from "../audit/audit";

const ACTIVE_BOOKING_STATUSES = new Set(["confirmed", "checked_in"]);
const CHECK_IN_ELIGIBLE_STATUSES = new Set(["confirmed"]);

type BookingStatus = "draft" | "confirmed" | "checked_in" | "cancelled" | "no_show" | "completed";

type BookingRow = {
  id: string;
  personId: string;
  spaceId: string | null;
  status: BookingStatus;
  startsAt: Date;
  endsAt: Date;
  depositCents: number;
  currency: string;
  notes: string | null;
};

type SpaceRow = {
  id: string;
  branchId: string;
  name: string;
  kind: string;
  status: string;
};

type PersonRow = {
  id: string;
  displayName: string;
  phone: string | null;
  email: string | null;
};

export type BookingCalendarItem = {
  id: string;
  branchId: string;
  person: { id: string; displayName: string; phone: string | null; email: string | null };
  space: { id: string; name: string; kind: string; status: string };
  startsAt: string;
  endsAt: string;
  bufferStartsAt: string;
  bufferEndsAt: string;
  status: BookingStatus;
  deposit: { amountCents: number; currency: string; state: "none" | "recorded" | "unsupported" };
  notes: string | null;
  warnings: Array<{ code: "booking_overlap" | "active_session"; message: string }>;
  actions: {
    canCheckIn: boolean;
    canCancel: boolean;
    canMarkNoShow: boolean;
    disabledReason: string | null;
  };
};

export type BookingCalendarInput = {
  branchId: string;
  now?: Date;
  rangeStart: Date;
  rangeEnd: Date;
  status?: BookingStatus;
  spaceId?: string;
};

export type BookingQueueInput = {
  branchId: string;
  now?: Date;
};

export type CreateBookingInput = {
  branchId: string;
  personId: string;
  spaceId: string;
  startsAt: Date;
  endsAt: Date;
  depositCents?: number;
  currency?: string;
  notes?: string;
  staffActorUserId: string;
};

export type BookingMutationInput = {
  branchId: string;
  bookingId: string;
  staffActorUserId: string;
  reason?: string;
  now?: Date;
};

function assertValidRange(startsAt: Date, endsAt: Date): void {
  if (startsAt >= endsAt) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Booking end time must be after start time",
    });
  }
}

function assertNonNegativeDeposit(depositCents: number): void {
  if (depositCents < 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Deposit cannot be negative" });
  }
}

function overlaps(leftStart: Date, leftEnd: Date, rightStart: Date, rightEnd: Date): boolean {
  return leftStart < rightEnd && leftEnd > rightStart;
}

async function fetchSpace(spaceId: string): Promise<SpaceRow | null> {
  const [spaceRow] = await db.select().from(space).where(eq(space.id, spaceId)).limit(1);
  return (spaceRow as SpaceRow | undefined) ?? null;
}

async function fetchPerson(personId: string): Promise<PersonRow> {
  const [personRow] = await db.select().from(person).where(eq(person.id, personId)).limit(1);
  return (
    (personRow as PersonRow | undefined) ?? {
      id: personId,
      displayName: "Unknown customer",
      phone: null,
      email: null,
    }
  );
}

async function fetchActiveSessionConflict(spaceId: string) {
  return db
    .select({ id: usageSession.id, spaceId: usageSession.spaceId, status: usageSession.status })
    .from(usageSession)
    .where(and(eq(usageSession.spaceId, spaceId), eq(usageSession.status, "active")))
    .limit(1);
}

async function fetchOverlappingBookings(input: {
  spaceId: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<BookingRow[]> {
  const rows = await db
    .select()
    .from(booking)
    .where(
      and(
        eq(booking.spaceId, input.spaceId),
        or(eq(booking.status, "confirmed"), eq(booking.status, "checked_in")),
      ),
    );
  return (rows as BookingRow[]).filter((row) =>
    overlaps(input.startsAt, input.endsAt, row.startsAt, row.endsAt),
  );
}

async function buildCalendarItem(input: {
  bookingRow: BookingRow;
  branchId: string;
  now: Date;
}): Promise<BookingCalendarItem | null> {
  const { bookingRow } = input;
  if (!bookingRow.spaceId) return null;

  const spaceRow = await fetchSpace(bookingRow.spaceId);
  if (!spaceRow || spaceRow.branchId !== input.branchId) return null;

  const personRow = await fetchPerson(bookingRow.personId);
  const overlappingBookings = await fetchOverlappingBookings({
    spaceId: bookingRow.spaceId,
    startsAt: bookingRow.startsAt,
    endsAt: bookingRow.endsAt,
  });
  const activeSessions = await fetchActiveSessionConflict(bookingRow.spaceId);
  const overlapCount = overlappingBookings.filter((row) => row.id !== bookingRow.id).length;
  const warnings: BookingCalendarItem["warnings"] = [];

  if (overlapCount > 0) {
    warnings.push({
      code: "booking_overlap",
      message: `${overlapCount} active booking overlaps this time window`,
    });
  }
  if (activeSessions.length > 0) {
    warnings.push({ code: "active_session", message: "Space has an active usage session" });
  }

  const canCheckIn =
    CHECK_IN_ELIGIBLE_STATUSES.has(bookingRow.status) &&
    warnings.length === 0 &&
    bookingRow.endsAt >= input.now;
  const disabledReason = !CHECK_IN_ELIGIBLE_STATUSES.has(bookingRow.status)
    ? `Booking status ${bookingRow.status.replaceAll("_", " ")} cannot be checked in`
    : warnings.length > 0
      ? "Resolve conflicts before check-in"
      : bookingRow.endsAt < input.now
        ? "Booking window has ended"
        : null;

  return {
    id: bookingRow.id,
    branchId: input.branchId,
    person: {
      id: personRow.id,
      displayName: personRow.displayName,
      phone: personRow.phone,
      email: personRow.email,
    },
    space: { id: spaceRow.id, name: spaceRow.name, kind: spaceRow.kind, status: spaceRow.status },
    startsAt: bookingRow.startsAt.toISOString(),
    endsAt: bookingRow.endsAt.toISOString(),
    bufferStartsAt: bookingRow.startsAt.toISOString(),
    bufferEndsAt: bookingRow.endsAt.toISOString(),
    status: bookingRow.status,
    deposit: {
      amountCents: bookingRow.depositCents,
      currency: bookingRow.currency,
      state: bookingRow.depositCents > 0 ? "recorded" : "none",
    },
    notes: bookingRow.notes,
    warnings,
    actions: {
      canCheckIn,
      canCancel: bookingRow.status === "confirmed" || bookingRow.status === "draft",
      canMarkNoShow: bookingRow.status === "confirmed" && bookingRow.startsAt <= input.now,
      disabledReason,
    },
  };
}

export async function getBookingCalendar(input: BookingCalendarInput) {
  assertValidRange(input.rangeStart, input.rangeEnd);
  const now = input.now ?? new Date();
  const rows = await db
    .select()
    .from(booking)
    .where(
      and(
        gte(booking.endsAt, input.rangeStart),
        lte(booking.startsAt, input.rangeEnd),
        input.status ? eq(booking.status, input.status) : undefined,
        input.spaceId ? eq(booking.spaceId, input.spaceId) : undefined,
      ),
    )
    .orderBy(booking.startsAt);

  const items: BookingCalendarItem[] = [];
  for (const bookingRow of rows as BookingRow[]) {
    const item = await buildCalendarItem({ bookingRow, branchId: input.branchId, now });
    if (item) items.push(item);
  }

  return { branchId: input.branchId, items };
}

export async function getBookingQueue(input: BookingQueueInput) {
  const now = input.now ?? new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86_400_000 - 1);
  const calendar = await getBookingCalendar({
    branchId: input.branchId,
    now,
    rangeStart: startOfDay,
    rangeEnd: endOfDay,
  });

  return {
    branchId: input.branchId,
    generatedAt: now.toISOString(),
    overdue: calendar.items.filter(
      (item) => item.status === "confirmed" && new Date(item.startsAt) < now,
    ),
    upcoming: calendar.items.filter(
      (item) => item.status === "confirmed" && new Date(item.startsAt) >= now,
    ),
    checkedIn: calendar.items.filter((item) => item.status === "checked_in"),
    cancelled: calendar.items.filter((item) => item.status === "cancelled"),
    noShow: calendar.items.filter((item) => item.status === "no_show"),
    completed: calendar.items.filter((item) => item.status === "completed"),
  };
}

async function assertSpaceBelongsToBranch(spaceId: string, branchId: string): Promise<void> {
  const spaceRow = await fetchSpace(spaceId);
  if (!spaceRow || spaceRow.branchId !== branchId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking space does not belong to branch ${branchId}`,
    });
  }
}

async function assertNoCreateConflict(input: {
  spaceId: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<void> {
  const overlappingBookings = await fetchOverlappingBookings(input);
  if (overlappingBookings.length > 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Booking overlaps another active booking for this space",
    });
  }
  const activeSessions = await fetchActiveSessionConflict(input.spaceId);
  if (activeSessions.length > 0) {
    throw new TRPCError({ code: "CONFLICT", message: "Space has an active usage session" });
  }
}

export async function createBooking(input: CreateBookingInput) {
  assertValidRange(input.startsAt, input.endsAt);
  const depositCents = input.depositCents ?? 0;
  assertNonNegativeDeposit(depositCents);
  await assertSpaceBelongsToBranch(input.spaceId, input.branchId);
  await assertNoCreateConflict({
    spaceId: input.spaceId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  });

  const bookingId = crypto.randomUUID();
  let created: BookingRow | null = null;

  await db.transaction(async (tx) => {
    const [row] = (await tx
      .insert(booking)
      .values({
        id: bookingId,
        personId: input.personId,
        spaceId: input.spaceId,
        status: "confirmed",
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        depositCents,
        currency: input.currency ?? "EGP",
        notes: input.notes,
      })
      .returning()) as BookingRow[];
    if (!row) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Booking was not created" });
    }
    created = row;

    await writeAuditLog(
      {
        id: crypto.randomUUID(),
        branchId: input.branchId,
        actorUserId: input.staffActorUserId,
        action: "booking.create",
        entityType: "booking",
        entityId: bookingId,
        metadata: JSON.stringify({
          bookingId,
          branchId: input.branchId,
          personId: input.personId,
          spaceId: input.spaceId,
          startsAt: input.startsAt.toISOString(),
          endsAt: input.endsAt.toISOString(),
          depositCents,
        }),
      },
      tx,
    );
  });

  return created!;
}

async function fetchBookingForMutation(input: BookingMutationInput): Promise<BookingRow> {
  const [bookingRow] = await db
    .select()
    .from(booking)
    .where(eq(booking.id, input.bookingId))
    .limit(1);
  if (!bookingRow) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Booking not found: ${input.bookingId}` });
  }
  const typedBooking = bookingRow as BookingRow;
  if (!typedBooking.spaceId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Booking has no assigned space" });
  }
  await assertSpaceBelongsToBranch(typedBooking.spaceId, input.branchId);
  return typedBooking;
}

async function updateBookingStatus(
  input: BookingMutationInput,
  nextStatus: "cancelled" | "no_show",
  preloadedBooking?: BookingRow,
) {
  const bookingRow = preloadedBooking ?? (await fetchBookingForMutation(input));
  if (!ACTIVE_BOOKING_STATUSES.has(bookingRow.status) || bookingRow.status === "checked_in") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Booking ${input.bookingId} cannot transition from ${bookingRow.status}`,
    });
  }

  let updated: BookingRow | null = null;
  await db.transaction(async (tx) => {
    const [row] = (await tx
      .update(booking)
      .set({ status: nextStatus, notes: input.reason ?? bookingRow.notes })
      .where(and(eq(booking.id, input.bookingId), eq(booking.status, bookingRow.status)))
      .returning()) as BookingRow[];
    if (!row) {
      throw new TRPCError({ code: "CONFLICT", message: "Booking status changed, retry action" });
    }
    updated = row;

    await writeAuditLog(
      {
        id: crypto.randomUUID(),
        branchId: input.branchId,
        actorUserId: input.staffActorUserId,
        action: nextStatus === "cancelled" ? "booking.cancel" : "booking.no_show",
        entityType: "booking",
        entityId: input.bookingId,
        metadata: JSON.stringify({
          bookingId: input.bookingId,
          previousStatus: bookingRow.status,
          nextStatus,
          reason: input.reason ?? null,
        }),
      },
      tx,
    );
  });

  return updated!;
}

export async function cancelBooking(input: BookingMutationInput) {
  return updateBookingStatus(input, "cancelled");
}

export async function markBookingNoShow(input: BookingMutationInput) {
  const bookingRow = await fetchBookingForMutation(input);
  const now = input.now ?? new Date();
  if (bookingRow.startsAt > now) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot mark a future booking no-show" });
  }
  return updateBookingStatus(input, "no_show", bookingRow);
}
