import { z } from "zod";

import { staffProcedure } from "../index";
import { PERMISSIONS } from "../permissions/constants";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import { closeShift, getCurrentShift, openShift } from "../shifts/shifts";

export const shiftsRouter = {
  current: staffProcedure
    .input(z.object({ branchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return getCurrentShift({
        branchId: input.branchId,
        staffActorUserId: ctx.staff.userId,
      });
    }),

  open: staffProcedure
    .input(z.object({ branchId: z.string().min(1), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.SHIFT_OPEN);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return openShift({
        branchId: input.branchId,
        staffActorUserId: ctx.staff.userId,
        notes: input.notes,
      });
    }),

  close: staffProcedure
    .input(
      z.object({
        branchId: z.string().min(1),
        shiftId: z.string().min(1),
        actualCashCents: z.number().int().nonnegative(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.SHIFT_CLOSE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return closeShift({
        branchId: input.branchId,
        staffActorUserId: ctx.staff.userId,
        shiftId: input.shiftId,
        actualCashCents: input.actualCashCents,
        notes: input.notes,
      });
    }),
};
