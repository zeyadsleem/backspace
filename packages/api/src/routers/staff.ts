import { z } from "zod";

import { and, db, eq, role, staffBranchAccess, staffProfile } from "@backspace/db";

import { requirePermission } from "../permissions/middleware";
import { staffProcedure } from "../index";

export const staffRouter = {
  list: staffProcedure.use(requirePermission("staff:manage")).query(async () => {
    return db
      .select({
        id: staffProfile.id,
        userId: staffProfile.userId,
        roleId: staffProfile.roleId,
        displayName: staffProfile.displayName,
        status: staffProfile.status,
        roleName: role.name,
      })
      .from(staffProfile)
      .innerJoin(role, eq(role.id, staffProfile.roleId));
  }),

  getById: staffProcedure
    .use(requirePermission("staff:manage"))
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [profile] = await db
        .select({
          id: staffProfile.id,
          userId: staffProfile.userId,
          roleId: staffProfile.roleId,
          displayName: staffProfile.displayName,
          status: staffProfile.status,
          roleName: role.name,
        })
        .from(staffProfile)
        .innerJoin(role, eq(role.id, staffProfile.roleId))
        .where(eq(staffProfile.id, input.id))
        .limit(1);

      if (!profile) {
        throw new Error("NOT_FOUND:Staff profile not found");
      }

      return profile;
    }),

  create: staffProcedure
    .use(requirePermission("staff:manage"))
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
        roleId: z.string(),
        displayName: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const [profile] = await db
        .insert(staffProfile)
        .values({
          id: input.id,
          userId: input.userId,
          roleId: input.roleId,
          displayName: input.displayName,
        })
        .returning();

      return profile;
    }),

  update: staffProcedure
    .use(requirePermission("staff:manage"))
    .input(
      z.object({
        id: z.string(),
        displayName: z.string().min(1).optional(),
        roleId: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updates: Record<string, string> = {};
      if (input.displayName) updates.displayName = input.displayName;
      if (input.roleId) updates.roleId = input.roleId;
      if (input.status) updates.status = input.status;

      const [profile] = await db
        .update(staffProfile)
        .set(updates)
        .where(eq(staffProfile.id, input.id))
        .returning();

      return profile;
    }),

  assignBranch: staffProcedure
    .use(requirePermission("staff:manage"))
    .input(
      z.object({
        staffProfileId: z.string(),
        branchId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [access] = await db
        .insert(staffBranchAccess)
        .values({
          staffProfileId: input.staffProfileId,
          branchId: input.branchId,
        })
        .onConflictDoNothing()
        .returning();

      return access;
    }),

  removeBranch: staffProcedure
    .use(requirePermission("staff:manage"))
    .input(
      z.object({
        staffProfileId: z.string(),
        branchId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(staffBranchAccess)
        .where(
          and(
            eq(staffBranchAccess.staffProfileId, input.staffProfileId),
            eq(staffBranchAccess.branchId, input.branchId),
          ),
        );

      return { removed: true };
    }),
};
