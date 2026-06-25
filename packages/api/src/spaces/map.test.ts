import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "../permissions/constants";

import {
  SPACE_STATE_LEGEND,
  deriveSpaceAvailabilityState,
  getSpaceDetail,
  getSpaceMap,
} from "./map";

const allPermissions = Object.values(PERMISSIONS);
const workspaceOnly = [PERMISSIONS.WORKSPACE_READ];

describe("space map read model", () => {
  it("returns a branch-scoped map grouped by floor with deterministic state priority", () => {
    const map = getSpaceMap({ branchId: "seed-branch-main", permissions: allPermissions });
    const spaces = map.groups.flatMap((group) => group.spaces);

    expect(map.branch).toEqual({ id: "seed-branch-main", name: "Downtown Hub" });
    expect(map.legend.map((item) => item.state)).toEqual(
      SPACE_STATE_LEGEND.map((item) => item.state),
    );
    expect(map.groups.map((group) => group.label)).toEqual(["Ground Floor", "First Floor"]);
    expect(spaces).toHaveLength(9);
    expect(spaces.some((space) => space.id === "seed-space-maintenance-room")).toBe(false);
    expect(spaces.find((space) => space.id === "seed-space-desk-3")?.state).toBe("occupied");
    expect(spaces.find((space) => space.id === "seed-space-meeting-room")?.state).toBe("cleaning");
    expect(spaces.find((space) => space.id === "seed-space-desk-5")?.state).toBe("reserved");
    expect(spaces.find((space) => space.id === "seed-space-blocked-desk")?.state).toBe("blocked");
  });

  it("returns secondary branch maintenance spaces without leaking main branch spaces", () => {
    const map = getSpaceMap({ branchId: "seed-branch-secondary", permissions: allPermissions });
    const spaces = map.groups.flatMap((group) => group.spaces);

    expect(map.branch.name).toBe("Maadi Workspace");
    expect(spaces).toHaveLength(1);
    expect(spaces[0]?.id).toBe("seed-space-maintenance-room");
    expect(spaces[0]?.state).toBe("maintenance");
    expect(spaces.some((space) => space.id === "seed-space-desk-1")).toBe(false);
  });

  it("derives inactive, maintenance, blocked, cleaning, occupied, reserved, and available by priority", () => {
    expect(deriveSpaceAvailabilityState({ baseStatus: "inactive" }).state).toBe("inactive");
    expect(
      deriveSpaceAvailabilityState({
        baseStatus: "blocked",
        maintenanceTicket: { id: "ticket", title: "AC outage", severity: "blocking" },
      }).state,
    ).toBe("maintenance");
    expect(
      deriveSpaceAvailabilityState({
        baseStatus: "blocked",
        maintenanceTicket: { id: "ticket", title: "Light", severity: "low" },
      }).state,
    ).toBe("blocked");
    expect(
      deriveSpaceAvailabilityState({
        baseStatus: "occupied",
        cleaningTask: { id: "cleaning", reason: "Reset room" },
        activeSession: { id: "session", entrantName: "Ahmed Farouk" },
      }).state,
    ).toBe("cleaning");
    expect(
      deriveSpaceAvailabilityState({
        baseStatus: "reserved",
        activeSession: { id: "session", entrantName: "Ahmed Farouk" },
        reservation: { id: "booking", personName: "Mohamed Ali" },
      }).state,
    ).toBe("occupied");
    expect(deriveSpaceAvailabilityState({ baseStatus: "reserved" }).state).toBe("reserved");
    expect(deriveSpaceAvailabilityState({ baseStatus: "available" }).state).toBe("available");
  });

  it("returns detail with contextual occupant, reservation, cleaning, maintenance, actions, and redaction", () => {
    const occupied = getSpaceDetail({
      branchId: "seed-branch-main",
      spaceId: "seed-space-desk-3",
      permissions: allPermissions,
    });
    const cleaning = getSpaceDetail({
      branchId: "seed-branch-main",
      spaceId: "seed-space-meeting-room",
      permissions: allPermissions,
    });
    const restricted = getSpaceDetail({
      branchId: "seed-branch-main",
      spaceId: "seed-space-desk-1",
      permissions: workspaceOnly,
    });

    expect(occupied?.currentSession?.entrantName).toBe("Karim Youssef");
    expect(occupied?.actions.map((action) => action.id)).toEqual([
      "refresh",
      "mark_cleaning",
      "mark_maintenance",
      "mark_blocked",
      "clear_blocked",
      "mark_available",
    ]);
    expect(occupied?.actions.find((action) => action.id === "mark_available")?.reason).toContain(
      "active session",
    );
    expect(occupied?.actions.every((action) => action.id === "refresh" || !action.supported)).toBe(
      true,
    );
    expect(cleaning?.cleaningTask?.reason).toBe("Post-meeting cleanup needed");
    expect(restricted?.sections.visits.allowed).toBe(false);
    expect(restricted?.currentSession).toBeNull();
  });

  it("returns null for spaces outside the requested branch", () => {
    expect(
      getSpaceDetail({
        branchId: "seed-branch-secondary",
        spaceId: "seed-space-desk-1",
        permissions: allPermissions,
      }),
    ).toBeNull();
  });
});
