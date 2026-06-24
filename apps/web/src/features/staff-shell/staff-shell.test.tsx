import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "@backspace/api/permissions/constants";

import { PermissionGate, hasPermission } from "./permissions";
import { getActiveShiftLabel, staffShellBranches, staffShellContext } from "./shell-context";
import { staffNavigationGroups } from "./staff-navigation";
import { staffQuickActions } from "./staff-quick-actions";

describe("staff operations shell registries", () => {
  it("includes the required staff sidebar areas", () => {
    const labels = staffNavigationGroups.flatMap((group) => [
      group.label,
      ...group.items.map((item) => item.label),
    ]);

    expect(labels).toContain("Operations");
    expect(labels).toContain("Today");
    expect(labels).toContain("Live visits");
    expect(labels).toContain("Space map");
    expect(labels).toContain("Calendar");
    expect(labels).toContain("Check-in queue");
    expect(labels).toContain("People");
    expect(labels).toContain("Billing");
    expect(labels).toContain("Add-ons & inventory");
    expect(labels).toContain("Workspace");
    expect(labels).toContain("Reports");
    expect(labels).toContain("Admin");
  });

  it("keeps future workflows visible but disabled in quick actions", () => {
    expect(staffQuickActions.map((action) => action.label)).toEqual([
      "New walk-in",
      "Check in booking",
      "Check in guest",
      "Add charge",
      "Open shift",
      "Close shift",
    ]);

    expect(staffQuickActions.every((action) => action.disabled)).toBe(true);
    expect(staffQuickActions.map((action) => action.requiredPermission)).toEqual([
      PERMISSIONS.VISIT_CREATE,
      PERMISSIONS.BOOKING_CHECK_IN,
      PERMISSIONS.VISIT_CREATE,
      PERMISSIONS.CHARGE_ADD,
      PERMISSIONS.SHIFT_OPEN,
      PERMISSIONS.SHIFT_CLOSE,
    ]);
  });

  it("uses realistic branch and active-shift context for the topbar", () => {
    expect(staffShellBranches.map((branch) => branch.name)).toEqual([
      "Downtown Hub",
      "Maadi Workspace",
    ]);
    expect(staffShellContext.currentBranchId).toBe("seed-branch-downtown");
    expect(getActiveShiftLabel(staffShellContext.activeShift)).toBe("Open shift - Front desk");
  });
});

describe("PermissionGate", () => {
  it("allows content when all required permissions are present", () => {
    expect(
      hasPermission([PERMISSIONS.VISIT_CREATE, PERMISSIONS.CHARGE_ADD], [PERMISSIONS.VISIT_CREATE]),
    ).toBe(true);
  });

  it("renders fallback instead of gated content when permission is missing", () => {
    const markup = renderToString(
      <PermissionGate
        permissions={[PERMISSIONS.VISIT_CREATE]}
        required={PERMISSIONS.CHARGE_ADD}
        fallback={<span>Hidden until billing permission is granted</span>}
      >
        <button type="button">Add charge</button>
      </PermissionGate>,
    );

    expect(markup).toContain("Hidden until billing permission is granted");
    expect(markup).not.toContain("Add charge");
  });
});
