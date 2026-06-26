import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  Grid3X3,
  Home,
  Layers,
  Package,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PERMISSIONS } from "@backspace/api/permissions/constants";
import type { PermissionKey } from "@backspace/api/permissions/constants";

import { hasPermission } from "./permissions";

export type StaffNavigationItem = {
  disabled?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
  requiredPermission?: PermissionKey;
};

export type StaffNavigationGroup = {
  items: StaffNavigationItem[];
  label: string;
};

export const staffNavigationGroups: StaffNavigationGroup[] = [
  {
    label: "Operations",
    items: [
      {
        href: "/dashboard",
        icon: Home,
        label: "Today",
        requiredPermission: PERMISSIONS.VISIT_READ,
      },
      {
        href: "/live",
        icon: Layers,
        label: "Live visits",
        requiredPermission: PERMISSIONS.VISIT_READ,
      },
      {
        href: "/space-map",
        icon: Grid3X3,
        label: "Space map",
        requiredPermission: PERMISSIONS.WORKSPACE_READ,
      },
      {
        disabled: true,
        href: "/calendar",
        icon: CalendarDays,
        label: "Calendar",
        requiredPermission: PERMISSIONS.BOOKING_READ,
      },
      {
        href: "/check-in",
        icon: ClipboardList,
        label: "Check-in",
        requiredPermission: PERMISSIONS.BOOKING_CHECK_IN,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        disabled: true,
        href: "/people",
        icon: Users,
        label: "People",
        requiredPermission: PERMISSIONS.PEOPLE_READ,
      },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        disabled: true,
        href: "/billing",
        icon: CreditCard,
        label: "Billing",
        requiredPermission: PERMISSIONS.INVOICE_READ,
      },
      {
        disabled: true,
        href: "/catalog",
        icon: Package,
        label: "Add-ons & inventory",
        requiredPermission: PERMISSIONS.CATALOG_MANAGE,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        disabled: true,
        href: "/workspace",
        icon: Grid3X3,
        label: "Workspace",
        requiredPermission: PERMISSIONS.WORKSPACE_READ,
      },
      {
        disabled: true,
        href: "/reports",
        icon: ClipboardList,
        label: "Reports",
        requiredPermission: PERMISSIONS.REPORT_READ,
      },
      {
        disabled: true,
        href: "/admin",
        icon: Settings,
        label: "Admin",
        requiredPermission: PERMISSIONS.SETTINGS_MANAGE,
      },
    ],
  },
];

export function getVisibleNavigationGroups(permissions: PermissionKey[]): StaffNavigationGroup[] {
  return staffNavigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredPermission || hasPermission(permissions, item.requiredPermission),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
