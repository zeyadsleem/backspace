import { describe, expect, it } from "vitest";

import { ROLE_PERMISSIONS, STAFF_ROLES, type PermissionKey } from "./constants";

describe("STAFF_ROLES", () => {
  it("defines all expected staff roles", () => {
    expect(Object.values(STAFF_ROLES)).toEqual([
      "admin",
      "manager",
      "supervisor",
      "cashier",
      "receptionist",
      "cleaner",
      "maintenance",
    ]);
  });
});

describe("ROLE_PERMISSIONS", () => {
  it("maps every role to a non-empty permission list", () => {
    const roles = Object.values(STAFF_ROLES);
    for (const role of roles) {
      const permissions = ROLE_PERMISSIONS[role];
      expect(permissions, `role ${role} has no permissions`).toBeDefined();
      expect(permissions.length, `role ${role} has empty permissions`).toBeGreaterThan(0);
    }
  });

  it("assigns all permissions to admin", () => {
    const allPermissions = collectAllPermissions();
    const adminPermissions = ROLE_PERMISSIONS["admin"];
    for (const perm of allPermissions) {
      expect(adminPermissions).toContain(perm);
    }
  });

  it("assigns no duplicate permissions per role", () => {
    const roles = Object.values(STAFF_ROLES);
    for (const role of roles) {
      const permissions = ROLE_PERMISSIONS[role];
      expect(new Set(permissions).size).toBe(permissions.length);
    }
  });

  it("receptionist has visit and people permissions but not billing permissions", () => {
    const perms = ROLE_PERMISSIONS["receptionist"];
    expect(perms).toContain("visit:create");
    expect(perms).toContain("people:create");
    expect(perms).not.toContain("checkout:finalize");
    expect(perms).not.toContain("payment:record");
  });

  it("cashier has billing permissions but not staff management", () => {
    const perms = ROLE_PERMISSIONS["cashier"];
    expect(perms).toContain("checkout:finalize");
    expect(perms).toContain("payment:record");
    expect(perms).toContain("charge:add");
    expect(perms).not.toContain("staff:manage");
    expect(perms).not.toContain("settings:manage");
  });

  it("cleaner and maintenance have only workspace read and cleaning/maintenance permissions", () => {
    const cleanerPerms = ROLE_PERMISSIONS["cleaner"];
    expect(cleanerPerms).toContain("workspace:read");
    expect(cleanerPerms).toContain("cleaning:manage");
    expect(cleanerPerms).not.toContain("visit:create");
    expect(cleanerPerms).not.toContain("charge:add");

    const maintenancePerms = ROLE_PERMISSIONS["maintenance"];
    expect(maintenancePerms).toContain("workspace:read");
    expect(maintenancePerms).toContain("maintenance:manage");
    expect(maintenancePerms).not.toContain("visit:create");
    expect(maintenancePerms).not.toContain("charge:add");
  });

  it("manager has operational management permissions", () => {
    const perms = ROLE_PERMISSIONS["manager"];
    expect(perms).toContain("report:read");
    expect(perms).toContain("audit:read");
    expect(perms).toContain("catalog:manage");
    expect(perms).toContain("inventory:manage");
    expect(perms).toContain("membership:manage");
    expect(perms).not.toContain("staff:manage");
    expect(perms).not.toContain("settings:manage");
  });

  it("supervisor has most permissions except admin-specific ones", () => {
    const perms = ROLE_PERMISSIONS["supervisor"];
    expect(perms).toContain("visit:create");
    expect(perms).toContain("visit:close");
    expect(perms).toContain("charge:void");
    expect(perms).toContain("checkout:finalize");
    expect(perms).toContain("invoice:finalize");
    expect(perms).toContain("event:manage");
    expect(perms).not.toContain("staff:manage");
    expect(perms).not.toContain("settings:manage");
  });
});

function collectAllPermissions(): PermissionKey[] {
  const seen = new Set<PermissionKey>();
  for (const perms of Object.values(ROLE_PERMISSIONS)) {
    for (const perm of perms) {
      seen.add(perm);
    }
  }
  return Array.from(seen).sort();
}
