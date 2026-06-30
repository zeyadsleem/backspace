import { z } from "zod";

import { staffProcedure } from "../index";
import { PERMISSIONS } from "../permissions/constants";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import {
  cancelBooking,
  createBooking,
  getBookingCalendar,
  getBookingQueue,
  markBookingNoShow,
} from "../bookings/bookings";

const dateInput = z.coerce.date();

export const bookingsRouter = {
  calendar: staffProcedure
    .input(
      z.object({
        branchId: z.string().min(1),
        rangeStart: dateInput,
        rangeEnd: dateInput,
        status: z
          .enum(["draft", "confirmed", "checked_in", "cancelled", "no_show", "completed"])
          .optional(),
        spaceId: z.string().min(1).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.BOOKING_READ);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return getBookingCalendar(input);
    }),

  queue: staffProcedure
    .input(z.object({ branchId: z.string().min(1), now: dateInput.optional() }))
    .query(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.BOOKING_READ);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return getBookingQueue(input);
    }),

  create: staffProcedure
    .input(
      z.object({
        branchId: z.string().min(1),
        personId: z.string().min(1),
        spaceId: z.string().min(1),
        startsAt: dateInput,
        endsAt: dateInput,
        depositCents: z.number().int().nonnegative().optional(),
        currency: z.string().min(1).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.BOOKING_CREATE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return createBooking({ ...input, staffActorUserId: ctx.staff.userId });
    }),

  cancel: staffProcedure
    .input(
      z.object({
        branchId: z.string().min(1),
        bookingId: z.string().min(1),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.BOOKING_CREATE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return cancelBooking({ ...input, staffActorUserId: ctx.staff.userId });
    }),

  markNoShow: staffProcedure
    .input(z.object({ branchId: z.string().min(1), bookingId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.BOOKING_CREATE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return markBookingNoShow({ ...input, staffActorUserId: ctx.staff.userId });
    }),
};
