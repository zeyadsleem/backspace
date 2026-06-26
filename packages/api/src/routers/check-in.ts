import { z } from "zod";

import { staffProcedure, router } from "../index";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import { PERMISSIONS } from "../permissions/constants";
import {
  checkInWalkIn,
  checkInMember,
  checkInBooking,
  checkInHostedGuest,
  checkInEventAttendee,
} from "../check-in/check-in";

const branchInput = z.object({ branchId: z.string().min(1) });

export const checkInRouter = router({
  walkIn: staffProcedure
    .input(
      branchInput.extend({
        personId: z.string().min(1),
        spaceId: z.string().min(1).optional(),
        billingResponsibility: z.enum(["visitor", "pay_later", "complimentary"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.VISIT_CREATE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return checkInWalkIn(
        {
          branchId: input.branchId,
          personId: input.personId,
          spaceId: input.spaceId,
          billingResponsibility: input.billingResponsibility,
        },
        ctx.staff.id,
      );
    }),

  member: staffProcedure
    .input(
      branchInput.extend({
        personId: z.string().min(1),
        membershipId: z.string().min(1),
        spaceId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.MEMBERSHIP_MANAGE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return checkInMember(
        {
          branchId: input.branchId,
          personId: input.personId,
          membershipId: input.membershipId,
          spaceId: input.spaceId,
        },
        ctx.staff.id,
      );
    }),

  booking: staffProcedure
    .input(
      branchInput.extend({
        bookingId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.BOOKING_CHECK_IN);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return checkInBooking(
        {
          branchId: input.branchId,
          bookingId: input.bookingId,
        },
        ctx.staff.id,
      );
    }),

  hostedGuest: staffProcedure
    .input(
      branchInput.extend({
        personId: z.string().min(1),
        hostAccountId: z.string().min(1),
        spaceId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.VISIT_CREATE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return checkInHostedGuest(
        {
          branchId: input.branchId,
          personId: input.personId,
          hostAccountId: input.hostAccountId,
          spaceId: input.spaceId,
        },
        ctx.staff.id,
      );
    }),

  eventAttendee: staffProcedure
    .input(
      branchInput.extend({
        eventId: z.string().min(1),
        personId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.EVENT_MANAGE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return checkInEventAttendee(
        {
          branchId: input.branchId,
          eventId: input.eventId,
          personId: input.personId,
        },
        ctx.staff.id,
      );
    }),
});
