import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PERMISSIONS } from "@backspace/api/permissions/constants";

vi.mock("@/components/user-menu", () => ({
  default: () => <div>User menu</div>,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useNavigate: () => () => {},
}));

import { StaffShell } from "./staff-shell";
import { PermissionGate, hasPermission } from "./permissions";
import {
  getActiveShiftLabel,
  resolveStaffShellContext,
  staffShellBranches,
  staffShellContext,
} from "./shell-context";
import { getVisibleNavigationGroups, staffNavigationGroups } from "./staff-navigation";
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
    expect(labels).toContain("Check-in");
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

    expect(
      staffQuickActions
        .filter((action) => action.label.startsWith("Add"))
        .every((action) => action.disabled),
    ).toBe(true);
    expect(
      staffQuickActions
        .filter(
          (action) =>
            action.label.startsWith("New") ||
            action.label.startsWith("Check") ||
            action.label.startsWith("Open") ||
            action.label.startsWith("Close"),
        )
        .every((action) => !action.disabled),
    ).toBe(true);
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
    expect(staffShellContext.currentBranchId).toBe("seed-branch-main");
    expect(getActiveShiftLabel(staffShellContext.activeShift)).toBe("Open shift - Front desk");
  });

  it("filters sidebar items by granted permissions", () => {
    const visibleLabels = getVisibleNavigationGroups([PERMISSIONS.WORKSPACE_READ]).flatMap(
      (group) => group.items.map((item) => item.label),
    );

    expect(visibleLabels).toContain("Space map");
    expect(visibleLabels).toContain("Workspace");
    expect(visibleLabels).not.toContain("Billing");
    expect(visibleLabels).not.toContain("Admin");
  });

  it("derives shell permissions from a staff role instead of a fixed role", () => {
    const cashierContext = resolveStaffShellContext({
      displayName: "Cashier A",
      roleName: "cashier",
    });

    expect(cashierContext.role).toBe("cashier");
    expect(cashierContext.permissions).toContain(PERMISSIONS.CHARGE_ADD);
    expect(cashierContext.permissions).not.toContain(PERMISSIONS.STAFF_MANAGE);
  });

  it("renders a cash-control panel for open shifts", () => {
    const markup = renderToString(
      <StaffShell
        staffProfile={{ displayName: "Cashier A", roleName: "cashier" }}
        shiftSummary={{
          status: "open",
          shift: {
            id: "shift-open",
            branchId: "seed-branch-main",
            openedByUserId: "staff-user-1",
            closedByUserId: null,
            status: "open",
            openedAt: new Date("2026-06-30T08:00:00Z"),
            closedAt: null,
            expectedCashCents: 3250,
            actualCashCents: null,
            differenceCents: null,
            currency: "EGP",
            notes: null,
          },
          expectedCashCents: 3250,
          cashPaymentCount: 3,
          actualCashCents: null,
          differenceCents: null,
          warnings: [],
          blockers: [],
        }}
      >
        <main>Child</main>
      </StaffShell>,
    );
    const normalizedMarkup = markup.replaceAll("<!-- -->", "");

    expect(normalizedMarkup).toContain("Cash control");
    expect(normalizedMarkup).toContain("Expected cash");
    expect(normalizedMarkup).toContain("32.50 EGP");
    expect(normalizedMarkup).toContain("3 cash payments");
    expect(normalizedMarkup).toContain("Actual drawer cash");
    expect(normalizedMarkup).toContain("Review close");
  });

  it("renders a no-shift blocker and open-shift action", () => {
    const markup = renderToString(
      <StaffShell
        staffProfile={{ displayName: "Cashier A", roleName: "cashier" }}
        shiftSummary={{
          status: "none",
          shift: null,
          expectedCashCents: 0,
          cashPaymentCount: 0,
          actualCashCents: null,
          differenceCents: null,
          warnings: ["No open shift for this branch."],
          blockers: ["Open a shift before recording cash payments."],
        }}
      >
        <main>Child</main>
      </StaffShell>,
    );

    expect(markup).toContain("No active shift");
    expect(markup).toContain("Open a shift before recording cash payments.");
    expect(markup).toContain("Open shift");
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
