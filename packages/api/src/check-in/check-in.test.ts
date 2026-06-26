import { describe, expect, it, vi } from "vitest";

vi.mock("@backspace/db", () => {
  const chainableThen = vi.fn((resolve: (value: unknown) => void) => resolve([]));
  const chainable = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    // oxlint-disable-next-line unicorn/no-thenable -- Drizzle query builders are awaitable.
    then: chainableThen,
  };
  const mockDb = {
    select: vi.fn().mockReturnValue(chainable),
    insert: vi.fn().mockReturnValue(chainable),
    update: vi.fn().mockReturnValue(chainable),
  };
  return {
    db: mockDb,
    and: vi.fn((...args: unknown[]) => ({ and: true, args })),
    eq: vi.fn((a: unknown, b: unknown) => ({ eq: true, a, b })),
    visit: { id: "visit" },
    usageSession: { id: "usage-session" },
    visitTypeEnum: {},
    billingResponsibilityEnum: {},
    visitStatusEnum: {},
    usageSessionStatusEnum: {},
  };
});

vi.mock("../audit/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.stubGlobal("crypto", {
  randomUUID: () => "test-uuid-0000-0000",
});

import {
  checkInWalkIn,
  checkInMember,
  checkInBooking,
  checkInHostedGuest,
  checkInEventAttendee,
} from "./check-in";

describe("checkInWalkIn", () => {
  it("rejects unknown branch", async () => {
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-unknown", personId: "seed-person-walkin" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unknown person", async () => {
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-main", personId: "seed-person-unknown" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects duplicate active visit", async () => {
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-main", personId: "seed-person-walkin" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects unavailable space", async () => {
    await expect(
      checkInWalkIn(
        {
          branchId: "seed-branch-main",
          personId: "seed-person-host",
          spaceId: "seed-space-desk-1",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects blocked space", async () => {
    await expect(
      checkInWalkIn(
        {
          branchId: "seed-branch-main",
          personId: "seed-person-host",
          spaceId: "seed-space-blocked-desk",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("checkInMember", () => {
  it("rejects unknown branch", async () => {
    await expect(
      checkInMember(
        {
          branchId: "seed-branch-unknown",
          personId: "seed-person-member",
          membershipId: "seed-membership-active",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unknown membership", async () => {
    await expect(
      checkInMember(
        {
          branchId: "seed-branch-main",
          personId: "seed-person-host",
          membershipId: "seed-membership-unknown",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("checkInBooking", () => {
  it("rejects unknown booking", async () => {
    await expect(
      checkInBooking(
        { branchId: "seed-branch-main", bookingId: "seed-booking-unknown" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects booking with wrong status", async () => {
    await expect(
      checkInBooking(
        { branchId: "seed-branch-main", bookingId: "seed-booking-cancelled" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects booking without a space", async () => {
    await expect(
      checkInBooking(
        { branchId: "seed-branch-main", bookingId: "seed-booking-noshow" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("checkInHostedGuest", () => {
  it("rejects unknown branch", async () => {
    await expect(
      checkInHostedGuest(
        {
          branchId: "seed-branch-unknown",
          personId: "seed-person-guest",
          hostAccountId: "seed-account-host",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects duplicate active visit", async () => {
    await expect(
      checkInHostedGuest(
        {
          branchId: "seed-branch-main",
          personId: "seed-person-guest",
          hostAccountId: "seed-account-host",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("checkInEventAttendee", () => {
  it("rejects unknown branch", async () => {
    await expect(
      checkInEventAttendee(
        {
          branchId: "seed-branch-unknown",
          eventId: "seed-event-workshop",
          personId: "seed-person-attendee",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unknown event", async () => {
    await expect(
      checkInEventAttendee(
        {
          branchId: "seed-branch-main",
          eventId: "seed-event-unknown",
          personId: "seed-person-host",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects duplicate active visit", async () => {
    await expect(
      checkInEventAttendee(
        {
          branchId: "seed-branch-main",
          eventId: "seed-event-workshop",
          personId: "seed-person-attendee",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

it("deriveSpaceState returns available for desk A4 (available status)", async () => {
  const { deriveSpaceState } = await import("./check-in");
  const space = (await import("@backspace/db/seed")).SPACES.find(
    (s: { id: string }) => s.id === "seed-space-desk-4",
  );
  expect(deriveSpaceState(space!)).toBe("available");
});

it("deriveSpaceState returns occupied for desk A1", async () => {
  const { deriveSpaceState } = await import("./check-in");
  const space = (await import("@backspace/db/seed")).SPACES.find(
    (s: { id: string }) => s.id === "seed-space-desk-1",
  );
  expect(deriveSpaceState(space!)).toBe("occupied");
});

it("deriveSpaceState returns blocked for blocked desk", async () => {
  const { deriveSpaceState } = await import("./check-in");
  const space = (await import("@backspace/db/seed")).SPACES.find(
    (s: { id: string }) => s.id === "seed-space-blocked-desk",
  );
  expect(deriveSpaceState(space!)).toBe("blocked");
});
