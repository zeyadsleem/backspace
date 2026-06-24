import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { TodayOverview } from "@backspace/api/today/overview";

import {
  TodayDashboard,
  TodayDashboardEmpty,
  TodayDashboardError,
  TodayDashboardLoading,
  todayDashboardCards,
  todayDashboardQueues,
} from "./today-dashboard";

const overview: TodayOverview = {
  branch: { id: "seed-branch-main", name: "Downtown Hub" },
  generatedAt: "2026-06-25T08:00:00.000Z",
  shiftStatus: { label: "Open shift", detail: "Front desk shift is active" },
  summary: {
    activeVisits: { label: "Active visits", value: 5, detail: "5 guests currently checked in" },
    occupancy: { label: "Occupancy", value: "4/9", detail: "44% occupied" },
    upcomingBookings: { label: "Upcoming bookings", value: 2, detail: "2 due today or tomorrow" },
    openBills: {
      label: "Open bills",
      value: "310.00 EGP",
      amountMinor: 31_000,
      detail: "2 draft invoices need follow-up",
    },
    cleaning: { label: "Cleaning", value: 3, detail: "3 spaces need attention" },
    maintenance: { label: "Maintenance", value: 1, detail: "1 open ticket on this branch" },
    pendingApprovals: { label: "Approvals", value: 1, detail: "1 approval waiting" },
    expiringMemberships: { label: "Memberships", value: 1, detail: "1 expires within 30 days" },
  },
  queues: {
    visits: {
      label: "Active visits",
      items: [{ id: "visit-1", title: "Ahmed Farouk", meta: "Desk A1" }],
    },
    bookings: {
      label: "Bookings",
      items: [{ id: "booking-1", title: "Team meeting", meta: "Meeting Room Alpha" }],
    },
    cleaning: {
      label: "Cleaning",
      items: [{ id: "cleaning-1", title: "Private Office 1", meta: "Scheduled daily cleaning" }],
    },
    maintenance: {
      label: "Maintenance",
      items: [{ id: "maintenance-1", title: "Replace flickering light", meta: "low" }],
    },
    approvals: {
      label: "Approvals",
      items: [{ id: "approval-1", title: "discount.override", meta: "Discount exceeds threshold" }],
    },
  },
  sections: {
    openBills: {
      allowed: true,
      items: [{ id: "invoice-1", title: "Walk-in bill", meta: "10.00 EGP" }],
    },
    cleaning: { allowed: true, items: [] },
    maintenance: { allowed: true, items: [] },
    pendingApprovals: { allowed: true, items: [] },
  },
};

describe("Today dashboard", () => {
  it("defines the required summary cards and queues", () => {
    expect(todayDashboardCards.map((card) => card.key)).toEqual([
      "activeVisits",
      "occupancy",
      "upcomingBookings",
      "openBills",
      "cleaning",
      "maintenance",
      "pendingApprovals",
      "expiringMemberships",
    ]);
    expect(todayDashboardQueues.map((queue) => queue.key)).toEqual([
      "visits",
      "bookings",
      "cleaning",
      "maintenance",
      "approvals",
    ]);
  });

  it("renders branch context, shift status, summary cards, queues, and restricted states", () => {
    const restrictedOverview: TodayOverview = {
      ...overview,
      sections: {
        ...overview.sections,
        openBills: { allowed: false, reason: "Requires invoice:read permission", items: [] },
      },
    };

    const markup = renderToString(<TodayDashboard overview={restrictedOverview} />);

    expect(markup).toContain("Today at Downtown Hub");
    expect(markup).toContain("Open shift");
    expect(markup).toContain("Active visits");
    expect(markup).toContain("310.00 EGP");
    expect(markup).toContain("Team meeting");
    expect(markup).toContain("Requires invoice:read permission");
  });

  it("renders loading, error, and empty states without data", () => {
    expect(renderToString(<TodayDashboardLoading />)).toContain("Loading today dashboard");
    expect(renderToString(<TodayDashboardError message="Could not load Today" />)).toContain(
      "Could not load Today",
    );
    expect(renderToString(<TodayDashboardEmpty branchName="Downtown Hub" />)).toContain(
      "No operational activity for Downtown Hub",
    );
  });
});
