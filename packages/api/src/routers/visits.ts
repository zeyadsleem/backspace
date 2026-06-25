import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { staffProcedure, router } from "../index";
import { getLiveVisits, getVisitDetail } from "../visits/live";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import { PERMISSIONS, ROLE_PERMISSIONS, type StaffRole } from "../permissions/constants";

const branchInput = z.object({ branchId: z.string().min(1) });

export const visitsRouter = router({
  listLive: staffProcedure.input(branchInput).query(async ({ ctx, input }) => {
    checkPermission(ctx.staff, PERMISSIONS.VISIT_READ);
    await checkBranchAccess(ctx.staff.id, input.branchId);

    return getLiveVisits({
      branchId: input.branchId,
      permissions: ROLE_PERMISSIONS[ctx.staff.roleName as StaffRole] ?? [],
    });
  }),
  getDetail: staffProcedure
    .input(branchInput.extend({ visitId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.VISIT_READ);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      const detail = getVisitDetail({
        branchId: input.branchId,
        visitId: input.visitId,
        permissions: ROLE_PERMISSIONS[ctx.staff.roleName as StaffRole] ?? [],
      });

      if (!detail) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Visit not found for this branch" });
      }

      return detail;
    }),
});
