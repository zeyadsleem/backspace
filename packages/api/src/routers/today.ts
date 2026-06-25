import { z } from "zod";

import { PERMISSIONS, ROLE_PERMISSIONS, type StaffRole } from "../permissions/constants";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import { staffProcedure } from "../index";
import { getTodayOverview } from "../today/overview";

export const todayRouter = {
  getOverview: staffProcedure
    .input(z.object({ branchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.VISIT_READ);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return getTodayOverview({
        branchId: input.branchId,
        permissions: ROLE_PERMISSIONS[ctx.staff.roleName as StaffRole] ?? [],
      });
    }),
};
