import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { staffProcedure, router } from "../index";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import { PERMISSIONS, ROLE_PERMISSIONS, type StaffRole } from "../permissions/constants";
import { getSpaceDetail, getSpaceMap, validateSpaceStateAction } from "../spaces/map";

const branchInput = z.object({ branchId: z.string().min(1) });
const stateActionInput = branchInput.extend({
  spaceId: z.string().min(1),
  action: z.enum([
    "mark_cleaning",
    "mark_maintenance",
    "mark_blocked",
    "clear_blocked",
    "mark_available",
  ]),
});

export const spacesRouter = router({
  getMap: staffProcedure.input(branchInput).query(async ({ ctx, input }) => {
    checkPermission(ctx.staff, PERMISSIONS.WORKSPACE_READ);
    await checkBranchAccess(ctx.staff.id, input.branchId);

    return getSpaceMap({
      branchId: input.branchId,
      permissions: ROLE_PERMISSIONS[ctx.staff.roleName as StaffRole] ?? [],
    });
  }),
  getDetail: staffProcedure
    .input(branchInput.extend({ spaceId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.WORKSPACE_READ);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      const detail = getSpaceDetail({
        branchId: input.branchId,
        spaceId: input.spaceId,
        permissions: ROLE_PERMISSIONS[ctx.staff.roleName as StaffRole] ?? [],
      });

      if (!detail) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Space not found for this branch" });
      }

      return detail;
    }),
  updateState: staffProcedure.input(stateActionInput).mutation(async ({ ctx, input }) => {
    checkPermission(ctx.staff, PERMISSIONS.WORKSPACE_UPDATE);
    await checkBranchAccess(ctx.staff.id, input.branchId);

    const detail = getSpaceDetail({
      branchId: input.branchId,
      spaceId: input.spaceId,
      permissions: ROLE_PERMISSIONS[ctx.staff.roleName as StaffRole] ?? [],
    });

    if (!detail) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Space not found for this branch" });
    }

    const result = validateSpaceStateAction({ action: input.action, space: detail });
    if (!result.ok) {
      throw new TRPCError({ code: "BAD_REQUEST", message: result.reason });
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Space state writes require persistent status-history support and are disabled in #11.",
    });
  }),
});
