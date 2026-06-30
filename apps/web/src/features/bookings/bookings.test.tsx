import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@backspace/env/web", () => ({
  env: { VITE_SERVER_URL: "http://localhost:3001" },
}));

import { BookingsPage, BookingsPageError, BookingsPageLoading } from "./bookings";
import type { BookingCalendarItem, BookingQueueData } from "./bookings";

const baseBooking: BookingCalendarItem = {
  id: "booking-1",
  branchId: "seed-branch-main",
  person: { id: "person-1", displayName: "Mona Ali", phone: "0100", email: null },
  space: { id: "space-1", name: "Meeting Room A", kind: "meeting_room", status: "available" },
  startsAt: "2026-06-30T09:00:00.000Z",
  endsAt: "2026-06-30T11:00:00.000Z",
  bufferStartsAt: "2026-06-30T09:00:00.000Z",
  bufferEndsAt: "2026-06-30T11:00:00.000Z",
  status: "confirmed",
  deposit: { amountCents: 5000, currency: "EGP", state: "recorded" },
  notes: "Team planning",
  warnings: [],
  actions: {
    canCheckIn: true,
    canCancel: true,
    canMarkNoShow: true,
    disabledReason: null,
  },
};

const queue: BookingQueueData = {
  branchId: "seed-branch-main",
  generatedAt: "2026-06-30T08:00:00.000Z",
  overdue: [baseBooking],
  upcoming: [
    {
      ...baseBooking,
      id: "booking-conflict",
      startsAt: "2026-06-30T13:00:00.000Z",
      status: "confirmed",
      warnings: [
        { code: "booking_overlap", message: "1 active booking overlaps this time window" },
      ],
      actions: {
        canCheckIn: false,
        canCancel: true,
        canMarkNoShow: true,
        disabledReason: "Resolve conflicts before check-in",
      },
    },
  ],
  checkedIn: [{ ...baseBooking, id: "booking-checked", status: "checked_in" }],
  cancelled: [{ ...baseBooking, id: "booking-cancelled", status: "cancelled" }],
  noShow: [],
  completed: [],
};

describe("BookingsPage", () => {
  it("renders today queue, upcoming bookings, statuses, and deposits", () => {
    const markup = renderToString(<BookingsPage queue={queue} />).replaceAll("<!-- -->", "");

    expect(markup).toContain("Calendar bookings");
    expect(markup).toContain("Today queue");
    expect(markup).toContain("Upcoming");
    expect(markup).toContain("Mona Ali");
    expect(markup).toContain("Meeting Room A");
    expect(markup).toContain("50.00 EGP deposit");
    expect(markup).toContain("Checked in");
    expect(markup).toContain("Cancelled");
  });

  it("shows conflict warnings, disabled check-in reasons, and safe action labels", () => {
    const markup = renderToString(<BookingsPage queue={queue} />).replaceAll("<!-- -->", "");

    expect(markup).toContain("Conflict warning");
    expect(markup).toContain("1 active booking overlaps this time window");
    expect(markup).toContain("Resolve conflicts before check-in");
    expect(markup).toContain("Check in");
    expect(markup).toContain("Cancel booking");
    expect(markup).toContain("Confirm cancel booking");
    expect(markup).toContain("Mark no-show");
    expect(markup).toContain("Confirm no-show");
  });

  it("renders loading and error states", () => {
    expect(renderToString(<BookingsPageLoading />)).toContain("Loading bookings");
    expect(renderToString(<BookingsPageError message="Branch access denied" />)).toContain(
      "Branch access denied",
    );
  });
});
