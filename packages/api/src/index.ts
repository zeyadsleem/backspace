import { TRPCError } from "@trpc/server";

import { t } from "./lib/init";
import { requireStaff } from "./permissions/middleware";

export { t };

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const staffProcedure = protectedProcedure.use(requireStaff);

export {
  checkPermission,
  checkRole,
  requireBranchAccess,
  requirePermission,
  requireRole,
  resolveStaffProfile,
} from "./permissions/middleware";
