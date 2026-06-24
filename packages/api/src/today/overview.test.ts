import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "../permissions/constants";
import { getTodayOverview } from "./overview";

const allPermissions = Object.values(PERMISSIONS);

describe("getTodayOverview", () => {
  it("derives the main branch operations summary from seed scenarios", () => {
    const overview = getTodayOverview({
      branchId: "seed-branch-main",
      permissions: allPermissions,
    });

    expect(overview.branch.id).toBe("seed-branch-main");
    expect(overview.branch.name).toBe("Downtown Hub");
    expect(overview.summary.activeVisits.value).toBe(5);
    expect(overview.summary.occupancy.value).toBe("4/9");
    expect(overview.summary.occupancy.detail).toContain("44%");
    expect(overview.summary.upcomingBookings.value).toBe(2);
    expect(overview.summary.openBills.value).toBe("310.00 EGP");
    expect(overview.summary.openBills.amountMinor).toBe(31_000);
    expect(overview.summary.cleaning.value).toBe(3);
    expect(overview.summary.maintenance.value).toBe(1);
    expect(overview.summary.pendingApprovals.value).toBe(1);
    expect(overview.summary.expiringMemberships.value).toBe(1);
    expect(overview.shiftStatus.label).toBe("Open shift");
  });

  it("keeps branch-specific queues scoped to the selected branch", () => {
    const main = getTodayOverview({ branchId: "seed-branch-main", permissions: allPermissions });
    const secondary = getTodayOverview({
      branchId: "seed-branch-secondary",
      permissions: allPermissions,
    });

    expect(main.queues.maintenance.items.map((item) => item.title)).toEqual([
      "Replace flickering light",
    ]);
    expect(secondary.queues.maintenance.items.map((item) => item.title)).toEqual([
      "AC unit not cooling",
    ]);
    expect(secondary.summary.activeVisits.value).toBe(0);
    expect(secondary.summary.occupancy.value).toBe("0/1");
    expect(secondary.summary.openBills.amountMinor).toBe(0);
    expect(secondary.summary.expiringMemberships.value).toBe(0);
  });

  it("does not include stale bookings before the requested operations day", () => {
    const overview = getTodayOverview({
      branchId: "seed-branch-main",
      permissions: allPermissions,
      now: new Date(Date.now() + 7 * 86_400_000),
    });

    expect(overview.summary.upcomingBookings.value).toBe(0);
    expect(overview.queues.bookings.items).toEqual([]);
  });

  it("marks restricted sections unavailable without leaking protected data", () => {
    const overview = getTodayOverview({
      branchId: "seed-branch-main",
      permissions: [PERMISSIONS.VISIT_READ, PERMISSIONS.BOOKING_READ, PERMISSIONS.WORKSPACE_READ],
    });

    expect(overview.sections.openBills.allowed).toBe(false);
    expect(overview.sections.openBills.reason).toContain("invoice:read");
    expect(overview.sections.openBills.items).toEqual([]);
    expect(overview.sections.cleaning.allowed).toBe(false);
    expect(overview.sections.maintenance.allowed).toBe(false);
    expect(overview.sections.pendingApprovals.allowed).toBe(false);
  });
});
