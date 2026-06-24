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

export const staffShellContext: {
  activeShift: StaffShellShift;
  currentBranchId: string;
  permissions: PermissionKey[];
  role: StaffRole;
} = {
  activeShift: {
    id: "seed-shift-open",
    label: "Front desk",
    status: "open",
  },
  currentBranchId: "seed-branch-downtown",
  permissions: ROLE_PERMISSIONS[STAFF_ROLES.SUPERVISOR],
  role: STAFF_ROLES.SUPERVISOR,
};

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
