import type { ReactNode } from "react";

import type { PermissionKey } from "@backspace/api/permissions/constants";

type PermissionInput = PermissionKey | PermissionKey[];

export function hasPermission(permissions: PermissionKey[], required: PermissionInput): boolean {
  const requiredPermissions = Array.isArray(required) ? required : [required];

  return requiredPermissions.every((permission) => permissions.includes(permission));
}

export function PermissionGate({
  children,
  fallback = null,
  permissions,
  required,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  permissions: PermissionKey[];
  required: PermissionInput;
}) {
  if (!hasPermission(permissions, required)) {
    return fallback;
  }

  return children;
}
