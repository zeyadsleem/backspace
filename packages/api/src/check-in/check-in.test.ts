import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDbState } = vi.hoisted(() => {
  const mockDbState: { selectResult: unknown[]; selectCalls: number } = {
    selectResult: [],
    selectCalls: 0,
  };
  return { mockDbState };
});

vi.mock("@backspace/db", () => {
  const chainableThen = vi.fn((resolve: (value: unknown) => void) =>
    resolve(mockDbState.selectResult),
  );
  const chainable = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    // oxlint-disable-next-line unicorn/no-thenable -- Drizzle query builders are awaitable.
    then: chainableThen,
  };
  const mockDb: Record<string, unknown> = {
    select: vi.fn().mockReturnValue(chainable),
    insert: vi.fn().mockReturnValue(chainable),
    update: vi.fn().mockReturnValue(chainable),
  };
  mockDb.transaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(mockDb));
  return {
    db: mockDb,
    and: vi.fn((...args: unknown[]) => ({ and: true, args })),
    eq: vi.fn((a: unknown, b: unknown) => ({ eq: true, a, b })),
    visit: { id: "visit" },
    usageSession: { id: "usage-session" },
    booking: { id: "booking-id" },
    eventAttendee: { id: "event-attendee-id" },
    space: { id: "space" },
    workspaceEvent: { id: "workspace-event" },
    membership: { id: "membership" },
    membershipPlan: { id: "membership-plan" },
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

import { db } from "@backspace/db";

import {
  checkInWalkIn,
  checkInMember,
  checkInBooking,
  checkInHostedGuest,
  checkInEventAttendee,
} from "./check-in";

function resetMockDb() {
  vi.mocked(db.select).mockClear();
  vi.mocked(db.insert).mockClear();
  vi.mocked(db.update).mockClear();
  vi.mocked(db.transaction as never).mockClear();
  mockDbState.selectResult = [];
  mockDbState.selectCalls = 0;
}

function mockDbSelect(rows: unknown[]) {
  mockDbState.selectResult = rows;
}

describe("checkInWalkIn", () => {
  beforeEach(() => resetMockDb());

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

  it("rejects duplicate active visit (seed)", async () => {
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-main", personId: "seed-person-walkin" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects duplicate active visit (DB-backed)", async () => {
    mockDbSelect([
      {
        id: "db-visit-1",
        branchId: "seed-branch-main",
        personId: "seed-person-host",
        status: "active",
      },
    ]);
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-main", personId: "seed-person-host" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects unavailable space (seed)", async () => {
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

  it("rejects blocked space (seed)", async () => {
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

  it("rejects occupied space via DB (DB-backed)", async () => {
    mockDbSelect([{ id: "seed-space-desk-4", name: "Desk B1", branchId: "seed-branch-main" }]);
    await expect(
      checkInWalkIn(
        {
          branchId: "seed-branch-main",
          personId: "seed-person-host",
          spaceId: "seed-space-desk-4",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("checkInMember", () => {
  beforeEach(() => resetMockDb());

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
    mockDbSelect([]);
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

  it("rejects membership that belongs to another person", async () => {
    mockDbSelect([]);
    await expect(
      checkInMember(
        {
          branchId: "seed-branch-main",
          personId: "seed-person-host",
          membershipId: "seed-membership-active",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("checkInBooking", () => {
  beforeEach(() => resetMockDb());

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

  it("rejects cross-branch booking (DB-backed)", async () => {
    mockDbSelect([]);
    await expect(
      checkInBooking(
        { branchId: "seed-branch-main", bookingId: "seed-booking-confirmed" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects future booking check-in with server-side time window check", async () => {
    const futureRow = {
      id: "seed-booking-confirmed",
      personId: "seed-person-cashier",
      spaceId: "seed-space-desk-4",
      status: "confirmed",
      branchId: "seed-branch-main",
      startsAt: new Date(Date.now() + 86_400_000),
      endsAt: new Date(Date.now() + 86_400_000 + 7_200_000),
    };
    mockDbSelect([futureRow]);
    await expect(
      checkInBooking(
        { branchId: "seed-branch-main", bookingId: "seed-booking-confirmed" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("not started or has ended"),
    });
  });

  it("rejects past booking check-in with server-side time window check", async () => {
    const pastRow = {
      id: "seed-booking-confirmed",
      personId: "seed-person-cashier",
      spaceId: "seed-space-desk-4",
      status: "confirmed",
      branchId: "seed-branch-main",
      startsAt: new Date(Date.now() - 86_400_000),
      endsAt: new Date(Date.now() - 7_200_000),
    };
    mockDbSelect([pastRow]);
    await expect(
      checkInBooking(
        { branchId: "seed-branch-main", bookingId: "seed-booking-confirmed" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("not started or has ended"),
    });
  });

  it("rejects double check-in when booking is already checked_in", async () => {
    const checkedInRow = {
      id: "seed-booking-confirmed",
      personId: "seed-person-cashier",
      spaceId: "seed-space-desk-4",
      status: "checked_in",
      branchId: "seed-branch-main",
      startsAt: new Date(Date.now() - 3_600_000),
      endsAt: new Date(Date.now() + 3_600_000),
    };
    mockDbSelect([checkedInRow]);
    await expect(
      checkInBooking(
        { branchId: "seed-branch-main", bookingId: "seed-booking-confirmed" },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("checkInHostedGuest", () => {
  beforeEach(() => resetMockDb());

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

  it("rejects unknown host account", async () => {
    await expect(
      checkInHostedGuest(
        {
          branchId: "seed-branch-main",
          personId: "seed-person-host",
          hostAccountId: "seed-account-unknown",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("checkInEventAttendee", () => {
  beforeEach(() => resetMockDb());

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

  it("rejects events from another branch", async () => {
    await expect(
      checkInEventAttendee(
        {
          branchId: "seed-branch-secondary",
          eventId: "seed-event-workshop",
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

  it("rejects people who are not registered attendees", async () => {
    await expect(
      checkInEventAttendee(
        {
          branchId: "seed-branch-main",
          eventId: "seed-event-workshop",
          personId: "seed-person-host",
        },
        "seed-user-cashier",
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("audit metadata", () => {
  beforeEach(() => resetMockDb());

  it("does not write audit on validation failure", async () => {
    const { writeAuditLog: mockedAudit } = await import("../audit/audit");
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-unknown", personId: "seed-person-walkin" },
        "seed-user-cashier",
      ),
    ).rejects.toThrow();
    expect(mockedAudit).not.toHaveBeenCalled();
  });

  it("does not write audit on DB-backed validation failure", async () => {
    const { writeAuditLog: mockedAudit } = await import("../audit/audit");
    mockDbSelect([
      {
        id: "db-visit",
        branchId: "seed-branch-main",
        personId: "seed-person-host",
        status: "active",
      },
    ]);
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-main", personId: "seed-person-host" },
        "seed-user-cashier",
      ),
    ).rejects.toThrow();
    expect(mockedAudit).not.toHaveBeenCalled();
  });
});

describe("no partial writes", () => {
  beforeEach(() => resetMockDb());

  it("does not call insert after DB-backed duplicate visit rejection", async () => {
    mockDbSelect([
      {
        id: "db-active",
        branchId: "seed-branch-main",
        personId: "seed-person-host",
        status: "active",
      },
    ]);
    await expect(
      checkInWalkIn(
        { branchId: "seed-branch-main", personId: "seed-person-host" },
        "seed-user-cashier",
      ),
    ).rejects.toThrow();
    expect(db.insert).not.toHaveBeenCalled();
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
