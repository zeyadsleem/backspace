import { ROLE_PERMISSIONS, STAFF_ROLES } from "@backspace/api/permissions/constants";
import type { PermissionKey, StaffRole } from "@backspace/api/permissions/constants";

export type StaffShellBranch = {
  id: string;
  name: string;
  shortName: string;
};

export type StaffShellShift = {
  id: string;
  label: string;
  status: "open" | "closed" | "none";
};

export type StaffShellProfile = {
  displayName?: string | null;
  roleName?: string | null;
};

export type StaffShellContext = {
  activeShift: StaffShellShift;
  currentBranchId: string;
  displayName?: string | null;
  permissions: PermissionKey[];
  role: StaffRole | "unknown";
};

export const staffShellBranches: StaffShellBranch[] = [
  {
    id: "seed-branch-downtown",
    name: "Downtown Hub",
    shortName: "Downtown",
  },
  {
    id: "seed-branch-maadi",
    name: "Maadi Workspace",
    shortName: "Maadi",
  },
];

export const staffShellContext: StaffShellContext = {
  activeShift: {
    id: "seed-shift-open",
    label: "Front desk",
    status: "open",
  },
  currentBranchId: "seed-branch-downtown",
  permissions: [],
  role: "unknown",
};

export function resolveStaffShellContext(profile?: StaffShellProfile | null): StaffShellContext {
  const role = profile?.roleName;
  const permissions = role && role in ROLE_PERMISSIONS ? ROLE_PERMISSIONS[role as StaffRole] : [];

  return {
    ...staffShellContext,
    displayName: profile?.displayName,
    permissions,
    role: role && role in STAFF_ROLES_BY_NAME ? (role as StaffRole) : "unknown",
  };
}

export function getActiveShiftLabel(shift: StaffShellShift): string {
  if (shift.status === "open") {
    return `Open shift - ${shift.label}`;
  }

  if (shift.status === "closed") {
    return `Closed shift - ${shift.label}`;
  }

  return "No active shift";
}

export function getCurrentBranch(branchId: string): StaffShellBranch {
  return staffShellBranches.find((branch) => branch.id === branchId) ?? staffShellBranches[0];
}

const STAFF_ROLES_BY_NAME: Record<StaffRole, true> = {
  [STAFF_ROLES.ADMIN]: true,
  [STAFF_ROLES.MANAGER]: true,
  [STAFF_ROLES.SUPERVISOR]: true,
  [STAFF_ROLES.CASHIER]: true,
  [STAFF_ROLES.RECEPTIONIST]: true,
  [STAFF_ROLES.CLEANER]: true,
  [STAFF_ROLES.MAINTENANCE]: true,
};
