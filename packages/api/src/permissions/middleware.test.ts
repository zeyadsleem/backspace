import { describe, expect, it, vi } from "vitest";

/* eslint-disable unicorn/no-thenable */

type ResolveFn = (value: unknown) => void;

vi.mock("@backspace/db", () => {
  const chainableThen = vi.fn((resolve: ResolveFn) => {
    resolve([]);
  });
  const chainable = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: chainableThen,
  };
  const db = {
    select: vi.fn().mockReturnValue(chainable),
  };
  return {
    db,
    and: vi.fn((...args: unknown[]) => ({ and: true, args })),
    eq: vi.fn((a: unknown, b: unknown) => ({ eq: true, a, b })),
    role: { id: "role-id", name: "role-name" },
    permission: { id: "perm-id", key: "perm-key" },
    rolePermission: { roleId: "rp-role-id", permissionId: "rp-perm-id" },
    staffProfile: {
      id: "sp-id",
      userId: "sp-user-id",
      roleId: "sp-role-id",
      displayName: "sp-name",
      status: "active",
    },
    staffBranchAccess: { staffProfileId: "spa-sp-id", branchId: "spa-branch-id" },
    branch: { id: "branch-id", name: "branch-name" },
    __chainable: chainable,
    __chainableThen: chainableThen,
  };
});

import { db } from "@backspace/db";

import type { Context } from "../context";
import {
  checkBranchAccess,
  checkPermission,
  checkRole,
  requireStaffInContext,
  resolveStaffProfile,
} from "./middleware";
import type { StaffContextData } from "./middleware";

type MockChainable = ReturnType<typeof db.select> & { then: ReturnType<typeof vi.fn> };
const getChainable = () => db.select() as MockChainable;

function createMockContext(): Context {
  return {
    auth: {} as any,
    session: null as any,
  };
}

function createMockSessionContext(): Context {
  return {
    auth: {} as any,
    session: {
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true as const,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-1",
        expiresAt: new Date(Date.now() + 86400000),
        token: "token-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        userId: "user-1",
      },
    },
  };
}

const mockStaffProfileRow = [
  {
    id: "staff-1",
    userId: "user-1",
    roleId: "role-1",
    displayName: "Test Staff",
    status: "active",
    roleName: "admin",
  },
];

const adminStaff: StaffContextData = {
  id: "staff-1",
  userId: "user-1",
  roleId: "role-1",
  displayName: "Test Staff",
  roleName: "admin",
};

const cashierStaff: StaffContextData = {
  id: "staff-2",
  userId: "user-2",
  roleId: "role-cashier",
  displayName: "Cashier",
  roleName: "cashier",
};

describe("resolveStaffProfile", () => {
  it("throws UNAUTHORIZED when there is no userId", async () => {
    await expect(resolveStaffProfile(undefined)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws UNAUTHORIZED when userId is empty", async () => {
    await expect(resolveStaffProfile("")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN when staff profile is not found", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) => resolve([]));

    await expect(resolveStaffProfile("user-nonexistent")).rejects.toThrow("NO_STAFF_PROFILE");
  });

  it("returns staff data when profile is found", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) => resolve(mockStaffProfileRow));

    const result = await resolveStaffProfile("user-1");

    expect(result).toMatchObject({
      id: "staff-1",
      roleName: "admin",
      displayName: "Test Staff",
    });
  });
});

describe("requireStaffInContext", () => {
  it("throws FORBIDDEN when staff is missing from context", () => {
    expect(() => requireStaffInContext(createMockContext())).toThrow("NO_STAFF_PROFILE");
  });

  it("returns staff data when staff is on context", () => {
    const staff = requireStaffInContext({
      ...createMockSessionContext(),
      staff: adminStaff,
    });

    expect(staff).toMatchObject({ id: "staff-1", roleName: "admin" });
  });
});

describe("checkPermission", () => {
  it("throws FORBIDDEN when staff role lacks the permission", () => {
    expect(() => checkPermission(cashierStaff, "staff:manage")).toThrow("staff:manage");
  });

  it("passes when staff role has the permission", () => {
    expect(() => checkPermission(cashierStaff, "charge:add")).not.toThrow();
  });
});

describe("checkRole", () => {
  it("throws FORBIDDEN when staff role is not in the allowed list", () => {
    expect(() => checkRole(cashierStaff, ["admin", "manager"])).toThrow("REQUIRED_ROLE");
  });

  it("passes when staff role is in the allowed list", () => {
    expect(() => checkRole(cashierStaff, ["cashier", "supervisor"])).not.toThrow();
  });
});

describe("checkBranchAccess", () => {
  it("throws FORBIDDEN when staff has no access to the branch", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) => resolve([]));

    await expect(checkBranchAccess("staff-1", "branch-999")).rejects.toThrow("BRANCH_ACCESS");
  });

  it("passes when staff has access to the branch", async () => {
    getChainable().then = vi.fn((resolve: ResolveFn) => resolve([{ branchId: "branch-1" }]));

    await expect(checkBranchAccess("staff-1", "branch-1")).resolves.toBeUndefined();
  });
});
