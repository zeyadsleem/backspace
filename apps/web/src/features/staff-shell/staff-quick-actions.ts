import { PERMISSIONS } from "@backspace/api/permissions/constants";
import type { PermissionKey } from "@backspace/api/permissions/constants";

export type StaffQuickAction = {
  description: string;
  disabled: boolean;
  href?: string;
  label: string;
  requiredPermission: PermissionKey;
};

export const staffQuickActions: StaffQuickAction[] = [
  {
    description: "Create a walk-in visit from the live operations flow.",
    disabled: false,
    href: "/check-in",
    label: "New walk-in",
    requiredPermission: PERMISSIONS.VISIT_CREATE,
  },
  {
    description: "Find an existing booking and start the check-in handoff.",
    disabled: false,
    href: "/check-in",
    label: "Check in booking",
    requiredPermission: PERMISSIONS.BOOKING_CHECK_IN,
  },
  {
    description: "Register a hosted guest against a member or tenant.",
    disabled: false,
    href: "/check-in",
    label: "Check in guest",
    requiredPermission: PERMISSIONS.VISIT_CREATE,
  },
  {
    description: "Queue an add-on charge for a live visit or invoice.",
    disabled: true,
    label: "Add charge",
    requiredPermission: PERMISSIONS.CHARGE_ADD,
  },
  {
    description: "Open a cashier or reception shift for this branch.",
    disabled: true,
    label: "Open shift",
    requiredPermission: PERMISSIONS.SHIFT_OPEN,
  },
  {
    description: "Close the active shift after cash and audit checks.",
    disabled: true,
    label: "Close shift",
    requiredPermission: PERMISSIONS.SHIFT_CLOSE,
  },
];
