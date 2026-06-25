import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { SpaceDetail, SpaceMapOverview } from "@backspace/api/spaces/map";

import {
  SpaceMap,
  SpaceMapEmpty,
  SpaceMapError,
  SpaceMapLoading,
  SpaceMapRestricted,
  buildSpaceMapFilters,
  filterSpaceMapGroups,
  getSpaceActionCopy,
  getSpaceStateBadge,
  getSpaceStateLegend,
} from "./space-map";

const overview: SpaceMapOverview = {
  branch: { id: "seed-branch-main", name: "Downtown Hub" },
  generatedAt: "2026-06-25T08:00:00.000Z",
  sections: {
    visits: { allowed: true },
    bookings: { allowed: true },
    facilities: { allowed: true },
  },
  legend: [
    { state: "available", label: "Available", description: "Ready for assignment" },
    { state: "occupied", label: "Occupied", description: "Active usage session" },
    { state: "reserved", label: "Reserved", description: "Upcoming reservation" },
    { state: "cleaning", label: "Cleaning", description: "Cleaning task open" },
    { state: "maintenance", label: "Maintenance", description: "Blocking maintenance" },
    { state: "blocked", label: "Blocked", description: "Manually blocked" },
    { state: "inactive", label: "Inactive", description: "Not in service" },
  ],
  groups: [
    {
      id: "seed-floor-ground",
      label: "Ground Floor",
      type: "floor",
      spaces: [
        {
          id: "seed-space-desk-3",
          name: "Desk A3",
          code: "Desk A3",
          kind: "desk",
          kindLabel: "Desk",
          capacity: 1,
          state: "occupied",
          stateLabel: "Occupied",
          stateReason: "Active session for Karim Youssef",
          floor: { id: "seed-floor-ground", name: "Ground Floor" },
          currentSession: {
            id: "seed-session-guest",
            visitId: "seed-visit-guest",
            entrantName: "Karim Youssef",
            startedAt: "2026-06-25T06:00:00.000Z",
          },
          reservation: null,
          cleaningTask: null,
          maintenanceTicket: null,
          blockedReason: null,
          actions: [
            { id: "refresh", label: "Refresh", supported: true, enabled: true },
            {
              id: "mark_available",
              label: "Mark available",
              supported: false,
              enabled: false,
              reason: "Cannot mark available while an active session is using this space.",
            },
          ],
        },
        {
          id: "seed-space-blocked-desk",
          name: "Desk C1 (Blocked)",
          code: "Desk C1 (Blocked)",
          kind: "desk",
          kindLabel: "Desk",
          capacity: 1,
          state: "blocked",
          stateLabel: "Blocked",
          stateReason: "Space is blocked",
          floor: { id: "seed-floor-ground", name: "Ground Floor" },
          currentSession: null,
          reservation: null,
          cleaningTask: null,
          maintenanceTicket: {
            id: "seed-maintenance-light",
            title: "Replace flickering light",
            severity: "low",
            status: "in_progress",
          },
          blockedReason: "Space is blocked",
          actions: [],
        },
      ],
    },
  ],
};

const detail: SpaceDetail = {
  ...overview.groups[0].spaces[0],
  sections: overview.sections,
};

describe("Space map UI", () => {
  it("maps state badges, legend labels, and disabled action copy without relying on color alone", () => {
    expect(getSpaceStateBadge("available")).toEqual({ label: "Available", tone: "secondary" });
    expect(getSpaceStateBadge("maintenance").label).toBe("Maintenance");
    expect(getSpaceStateLegend().map((item) => item.label)).toEqual([
      "Available",
      "Occupied",
      "Reserved",
      "Cleaning",
      "Maintenance",
      "Blocked",
      "Inactive",
    ]);
    expect(getSpaceActionCopy(detail.actions[1])).toContain("active session");
  });

  it("builds state/floor/type filters and filters spaces by search", () => {
    expect(buildSpaceMapFilters(overview.groups).states).toEqual(["occupied", "blocked"]);
    expect(buildSpaceMapFilters(overview.groups).floors).toEqual(["Ground Floor"]);
    expect(
      filterSpaceMapGroups(overview.groups, {
        query: "karim",
        state: "all",
        floor: "all",
        type: "all",
      })[0]?.spaces.map((space) => space.id),
    ).toEqual(["seed-space-desk-3"]);
    expect(
      filterSpaceMapGroups(overview.groups, {
        query: "",
        state: "blocked",
        floor: "all",
        type: "desk",
      })[0]?.spaces.map((space) => space.id),
    ).toEqual(["seed-space-blocked-desk"]);
  });

  it("renders map labels and selected space detail drawer content", () => {
    const markup = renderToString(
      <SpaceMap
        overview={overview}
        selectedSpaceId="seed-space-desk-3"
        selectedSpaceDetail={detail}
      />,
    );

    expect(markup).toContain("Space map at Downtown Hub");
    expect(markup).toContain("State legend");
    expect(markup).toContain("Desk A3");
    expect(markup).toContain("Occupied");
    expect(markup).toContain("Karim Youssef");
    expect(markup).toContain("Space detail drawer");
    expect(markup).toContain("State-based actions");
    expect(markup).toContain("Cannot mark available while an active session");
  });

  it("renders loading, empty, error, and restricted states", () => {
    expect(renderToString(<SpaceMapLoading />)).toContain("Loading space map");
    expect(renderToString(<SpaceMapEmpty branchName="Downtown Hub" />)).toContain(
      "No spaces found",
    );
    expect(renderToString(<SpaceMapError message="Could not load spaces" />)).toContain(
      "Could not load spaces",
    );
    expect(renderToString(<SpaceMapRestricted />)).toContain("Requires workspace access");
  });
});
