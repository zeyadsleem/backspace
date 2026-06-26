import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@backspace/env/web", () => ({
  env: { VITE_SERVER_URL: "http://localhost:3001" },
}));

import type { PermissionKey } from "@backspace/api/permissions/constants";

import { CheckInLoading, CheckInPage, CheckInRestricted } from "./check-in";
import type { CheckInPageMutations } from "./check-in";

const mockMutations: CheckInPageMutations = {
  walkIn: {
    mutate: vi.fn(),
    state: { isPending: false, data: undefined, error: null, reset: vi.fn() },
  },
  member: {
    mutate: vi.fn(),
    state: { isPending: false, data: undefined, error: null, reset: vi.fn() },
  },
  booking: {
    mutate: vi.fn(),
    state: { isPending: false, data: undefined, error: null, reset: vi.fn() },
  },
  hostedGuest: {
    mutate: vi.fn(),
    state: { isPending: false, data: undefined, error: null, reset: vi.fn() },
  },
  eventAttendee: {
    mutate: vi.fn(),
    state: { isPending: false, data: undefined, error: null, reset: vi.fn() },
  },
};

const fullPermissions: PermissionKey[] = [
  "visit:create",
  "booking:check_in",
  "event:manage",
  "membership:manage",
];

const noPermissions: PermissionKey[] = [];

describe("Check-in UI", () => {
  it("renders the check-in page with all 5 option cards for full permissions", () => {
    const markup = renderToString(
      <CheckInPage
        branchId="seed-branch-main"
        permissions={fullPermissions}
        spacesData={null}
        mutations={mockMutations}
      />,
    );

    expect(markup).toContain("Check-in");
    expect(markup).toContain("Walk-in");
    expect(markup).toContain("Member");
    expect(markup).toContain("Booking customer");
    expect(markup).toContain("Hosted guest");
    expect(markup).toContain("Event attendee");
  });

  it("renders a subset of options when permissions are limited", () => {
    const limited: PermissionKey[] = ["visit:create"];
    const markup = renderToString(
      <CheckInPage
        branchId="seed-branch-main"
        permissions={limited}
        spacesData={null}
        mutations={mockMutations}
      />,
    );

    expect(markup).toContain("Walk-in");
    expect(markup).toContain("Hosted guest");
    expect(markup).not.toContain("Booking customer");
    expect(markup).not.toContain("Event attendee");
    expect(markup).not.toContain("Member");
  });

  it("renders restricted state when no check-in permissions exist", () => {
    const markup = renderToString(
      <CheckInPage
        branchId="seed-branch-main"
        permissions={noPermissions}
        spacesData={null}
        mutations={mockMutations}
      />,
    );

    expect(markup).toContain("No check-in options available");
  });

  it("renders loading state", () => {
    const markup = renderToString(<CheckInLoading />);

    expect(markup).toContain("Loading check-in options");
  });

  it("renders the CheckInRestricted standalone component", () => {
    const markup = renderToString(<CheckInRestricted />);

    expect(markup).toContain("No check-in options available");
    expect(markup).toContain("Contact a manager");
  });

  it("includes the check-in type descriptions in the cards", () => {
    const markup = renderToString(
      <CheckInPage
        branchId="seed-branch-main"
        permissions={fullPermissions}
        spacesData={null}
        mutations={mockMutations}
      />,
    );

    expect(markup).toContain("visitor browses in");
    expect(markup).toContain("subscription covers");
    expect(markup).toContain("reserved space is assigned");
    expect(markup).toContain("host is billed");
    expect(markup).toContain("event covers billing");
  });
});
