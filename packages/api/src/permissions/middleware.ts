import { TRPCError } from "@trpc/server";

import { and, db, eq, role, staffBranchAccess, staffProfile } from "@backspace/db";

import { t } from "../lib/init";
import type { Context } from "../context";
import { checkRolePermission } from "./constants";

export interface StaffContextData {
  id: string;
  userId: string;
  roleId: string;
  displayName: string;
  roleName: string;
}

export type StaffEnrichedContext = Context & { staff: StaffContextData };

export async function resolveStaffProfile(userId: string | undefined): Promise<StaffContextData> {
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

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
    .where(and(eq(staffProfile.userId, userId), eq(staffProfile.status, "active")))
    .limit(1);

  if (!profile) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "FORBIDDEN:NO_STAFF_PROFILE|Staff profile not found or inactive",
    });
  }

  return {
    id: profile.id,
    userId: profile.userId,
    roleId: profile.roleId,
    displayName: profile.displayName,
    roleName: profile.roleName,
  };
}

export function requireStaffInContext(ctx: Context): StaffContextData {
  const staff = (ctx as StaffEnrichedContext).staff;
  if (!staff) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "FORBIDDEN:NO_STAFF_PROFILE|Staff profile required",
    });
  }
  return staff;
}

export function checkPermission(staff: StaffContextData, permissionKey: string): void {
  if (!checkRolePermission(staff.roleName, permissionKey)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `FORBIDDEN:MISSING_PERMISSION:${permissionKey}|Role ${staff.roleName} lacks permission: ${permissionKey}`,
    });
  }
}

export function checkRole(staff: StaffContextData, allowedRoles: string[]): void {
  if (!allowedRoles.includes(staff.roleName)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `FORBIDDEN:REQUIRED_ROLE:${allowedRoles.join(",")}|Role ${staff.roleName} not in allowed roles`,
    });
  }
}

export async function checkBranchAccess(staffId: string, branchId: string): Promise<void> {
  const [access] = await db
    .select({ branchId: staffBranchAccess.branchId })
    .from(staffBranchAccess)
    .where(
      and(eq(staffBranchAccess.staffProfileId, staffId), eq(staffBranchAccess.branchId, branchId)),
    )
    .limit(1);

  if (!access) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `FORBIDDEN:BRANCH_ACCESS:${branchId}|Staff lacks access to branch ${branchId}`,
    });
  }
}

export const requireStaff = t.middleware(async ({ ctx, next }) => {
  const userId = ctx.session?.user?.id;
  const staff = await resolveStaffProfile(userId);
  return next({
    ctx: { ...ctx, staff },
  });
});

export function requirePermission(permissionKey: string) {
  return t.middleware(({ ctx, next }) => {
    const staff = requireStaffInContext(ctx);
    checkPermission(staff, permissionKey);
    return next({ ctx });
  });
}

export function requireRole(...allowedRoles: string[]) {
  return t.middleware(({ ctx, next }) => {
    const staff = requireStaffInContext(ctx);
    checkRole(staff, allowedRoles);
    return next({ ctx });
  });
}

export function requireBranchAccess(branchId: string) {
  return t.middleware(async ({ ctx, next }) => {
    const staff = requireStaffInContext(ctx);
    await checkBranchAccess(staff.id, branchId);
    return next({ ctx });
  });
}
