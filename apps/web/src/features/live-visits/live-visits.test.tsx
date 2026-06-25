import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { LiveVisitsOverview, VisitDetail } from "@backspace/api/visits/live";

import {
  LiveVisits,
  LiveVisitsEmpty,
  LiveVisitsError,
  LiveVisitsLoading,
  buildLiveVisitFilters,
  filterLiveVisits,
  formatElapsedMinutes,
  getActionCopy,
  getExceptionIndicator,
  getStatusBadge,
} from "./live-visits";

const overview: LiveVisitsOverview = {
  branch: { id: "seed-branch-main", name: "Downtown Hub" },
  generatedAt: "2026-06-25T08:00:00.000Z",
  sections: {
    charges: { allowed: true },
    exceptions: { allowed: true },
  },
  visits: [
    {
      id: "seed-visit-booking",
      entrant: { displayName: "Mohamed Ali", type: "booking_customer", label: "Booking customer" },
      status: "active",
      statusLabel: "Active",
      billingResponsibility: { value: "visitor", label: "Visitor" },
      checkedInAt: "2026-06-25T07:00:00.000Z",
      elapsedMinutes: 60,
      currentSpace: {
        id: "seed-space-meeting-room",
        name: "Meeting Room Alpha",
        label: "Meeting Room Alpha",
      },
      charges: { count: 2, totalMinor: 35_000, currency: "EGP", label: "350.00 EGP" },
      checkoutReadiness: { state: "blocked", label: "Blocked", reason: "Approval pending" },
      exceptions: [{ kind: "approval_required", label: "Approval required", severity: "warning" }],
    },
    {
      id: "seed-visit-member",
      entrant: { displayName: "Sara Mahmoud", type: "member", label: "Member" },
      status: "active",
      statusLabel: "Active",
      billingResponsibility: { value: "subscription", label: "Subscription" },
      checkedInAt: "2026-06-25T05:00:00.000Z",
      elapsedMinutes: 180,
      currentSpace: { id: "seed-space-desk-2", name: "Desk A2", label: "Desk A2" },
      charges: { count: 1, totalMinor: 0, currency: "EGP", label: "0.00 EGP" },
      checkoutReadiness: { state: "ready", label: "Ready" },
      exceptions: [{ kind: "complimentary", label: "Complimentary", severity: "info" }],
    },
  ],
};

const detail: VisitDetail = {
  visit: overview.visits[0],
  identity: {
    person: { id: "seed-person-booking", displayName: "Mohamed Ali" },
    context: [{ label: "Booking", value: "Team meeting" }],
  },
  sessions: [
    {
      id: "seed-session-booking-room",
      status: "active",
      startedAt: "2026-06-25T07:00:00.000Z",
      endedAt: null,
      elapsedMinutes: 60,
      space: { id: "seed-space-meeting-room", name: "Meeting Room Alpha" },
    },
  ],
  charges: [
    {
      id: "seed-charge-booking-room",
      label: "Meeting room fee",
      amountMinor: 40_000,
      currency: "EGP",
      formattedAmount: "400.00 EGP",
    },
    {
      id: "seed-charge-booking-discount",
      label: "Discount",
      amountMinor: -5_000,
      currency: "EGP",
      formattedAmount: "-50.00 EGP",
    },
  ],
  billing: {
    responsibility: { value: "visitor", label: "Visitor" },
    chargesTotalMinor: 35_000,
    chargesTotalLabel: "350.00 EGP",
    paymentState: "open_bill",
    paymentStateLabel: "Open bill",
    openBill: {
      id: "seed-invoice-booking",
      status: "draft",
      amountMinor: 35_000,
      label: "350.00 EGP",
    },
  },
  sections: {
    billing: { allowed: true },
    audit: { allowed: true },
  },
  actions: [
    { id: "refresh", label: "Refresh", supported: true, enabled: true },
    {
      id: "checkout",
      label: "Checkout",
      supported: false,
      enabled: false,
      reason: "Checkout finalization is out of scope for #10",
    },
  ],
  timeline: [
    {
      id: "seed-audit-booking",
      branchId: "seed-branch-main",
      label: "Booking checked in",
      occurredAt: "2026-06-25T07:00:00.000Z",
    },
  ],
};

describe("Live visits UI", () => {
  it("formats elapsed timers, status badges, exception indicators, and action copy", () => {
    expect(formatElapsedMinutes(185)).toBe("3h 5m");
    expect(getStatusBadge("active")).toEqual({ label: "Active", tone: "default" });
    expect(getExceptionIndicator("approval_required")?.label).toBe("Approval required");
    expect(getActionCopy(detail.actions[1])).toContain("out of scope");
  });

  it("builds status/type/space/exception filters and filters visits by query", () => {
    expect(buildLiveVisitFilters(overview.visits).statuses).toEqual(["active"]);
    expect(
      filterLiveVisits(overview.visits, {
        query: "meeting",
        status: "all",
        type: "all",
        exception: "all",
      }),
    ).toEqual([overview.visits[0]]);
    expect(
      filterLiveVisits(overview.visits, {
        query: "",
        status: "all",
        type: "member",
        exception: "complimentary",
      }),
    ).toEqual([overview.visits[1]]);
  });

  it("renders list labels and the selected visit detail drawer content", () => {
    const markup = renderToString(
      <LiveVisits
        overview={overview}
        selectedVisitId="seed-visit-booking"
        selectedVisitDetail={detail}
      />,
    );

    expect(markup).toContain("Live visits at Downtown Hub");
    expect(markup).toContain("Mohamed Ali");
    expect(markup).toContain("Meeting Room Alpha");
    expect(markup).toContain("Checkout readiness");
    expect(markup).toContain("Approval required");
    expect(markup).toContain("Usage sessions");
    expect(markup).toContain("Audit timeline");
    expect(markup).toContain("Checkout finalization is out of scope for #10");
  });

  it("renders loading, empty, error, and restricted states", () => {
    expect(renderToString(<LiveVisitsLoading />)).toContain("Loading live visits");
    expect(renderToString(<LiveVisitsEmpty branchName="Downtown Hub" />)).toContain(
      "No active visits",
    );
    expect(renderToString(<LiveVisitsError message="Could not load visits" />)).toContain(
      "Could not load visits",
    );
    expect(
      renderToString(
        <LiveVisits
          overview={{
            ...overview,
            sections: {
              charges: { allowed: false, reason: "Requires invoice:read permission" },
              exceptions: { allowed: true },
            },
          }}
          selectedVisitId={null}
          selectedVisitDetail={null}
        />,
      ),
    ).toContain("Requires invoice:read permission");
  });
});
