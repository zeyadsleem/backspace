import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "../permissions/constants";
import { getLiveVisits, getVisitDetail } from "./live";

const allPermissions = Object.values(PERMISSIONS);

describe("live visits read models", () => {
  it("lists only active visits for the requested branch", () => {
    const main = getLiveVisits({ branchId: "seed-branch-main", permissions: allPermissions });
    const secondary = getLiveVisits({
      branchId: "seed-branch-secondary",
      permissions: allPermissions,
    });

    expect(main.branch.name).toBe("Downtown Hub");
    expect(main.visits).toHaveLength(5);
    expect(main.visits.map((visit) => visit.entrant.displayName)).toEqual([
      "Sara Mahmoud",
      "Karim Youssef",
      "Ahmed Farouk",
      "Mohamed Ali",
      "Laila Ibrahim",
    ]);
    expect(main.visits.every((visit) => visit.status === "active")).toBe(true);
    expect(main.visits.some((visit) => visit.id === "seed-visit-paylater")).toBe(false);
    expect(secondary.branch.name).toBe("Maadi Workspace");
    expect(secondary.visits).toEqual([]);
  });

  it("derives scan columns from sessions, billing, charges, readiness, and exceptions", () => {
    const live = getLiveVisits({ branchId: "seed-branch-main", permissions: allPermissions });
    const booking = live.visits.find((visit) => visit.id === "seed-visit-booking");
    const guest = live.visits.find((visit) => visit.id === "seed-visit-guest");
    const member = live.visits.find((visit) => visit.id === "seed-visit-member");

    expect(booking).toMatchObject({
      entrant: { displayName: "Mohamed Ali", type: "booking_customer" },
      currentSpace: { name: "Meeting Room Alpha" },
      billingResponsibility: { value: "visitor", label: "Visitor" },
      charges: { count: 2, totalMinor: 35_000, currency: "EGP" },
      checkoutReadiness: { state: "blocked" },
    });
    expect(booking?.exceptions.map((exception) => exception.kind)).toContain("approval_required");
    expect(guest?.exceptions.map((exception) => exception.kind)).toContain("hosted_guest");
    expect(member?.exceptions.map((exception) => exception.kind)).toContain("complimentary");
  });

  it("returns complete visit detail without leaking another branch or broad person history", () => {
    const detail = getVisitDetail({
      branchId: "seed-branch-main",
      visitId: "seed-visit-booking",
      permissions: allPermissions,
    });

    expect(detail?.visit.id).toBe("seed-visit-booking");
    expect(detail?.identity.person.displayName).toBe("Mohamed Ali");
    expect(detail?.sessions).toEqual([
      expect.objectContaining({
        status: "active",
        space: expect.objectContaining({ name: "Meeting Room Alpha" }),
      }),
    ]);
    expect(detail?.charges.map((charge) => charge.amountMinor)).toEqual([40_000, -5_000]);
    expect(detail?.billing.openBill?.amountMinor).toBe(35_000);
    expect(detail?.billing.paymentState).toBe("open_bill");
    expect(detail?.actions.map((action) => action.id)).toEqual([
      "refresh",
      "mark_blocked",
      "unblock",
      "checkout",
      "add_charge",
      "record_payment",
      "check_in",
    ]);
    expect(detail?.actions.filter((action) => action.supported === false)).not.toHaveLength(0);
    expect(detail?.timeline.every((entry) => entry.branchId === "seed-branch-main")).toBe(true);

    expect(
      getVisitDetail({
        branchId: "seed-branch-secondary",
        visitId: "seed-visit-booking",
        permissions: allPermissions,
      }),
    ).toBeNull();
  });

  it("marks restricted billing and audit sections unavailable without leaking protected data", () => {
    const live = getLiveVisits({
      branchId: "seed-branch-main",
      permissions: [PERMISSIONS.VISIT_READ, PERMISSIONS.WORKSPACE_READ],
    });
    const detail = getVisitDetail({
      branchId: "seed-branch-main",
      visitId: "seed-visit-walkin",
      permissions: [PERMISSIONS.VISIT_READ, PERMISSIONS.WORKSPACE_READ],
    });

    expect(live.sections.charges.allowed).toBe(false);
    expect(live.sections.charges.reason).toContain("invoice:read");
    expect(live.visits.find((visit) => visit.id === "seed-visit-walkin")?.charges.count).toBe(0);
    expect(detail?.sections.billing.allowed).toBe(false);
    expect(detail?.billing.chargesTotalMinor).toBe(0);
    expect(detail?.charges).toEqual([]);
    expect(detail?.sections.audit.allowed).toBe(false);
    expect(detail?.timeline).toEqual([]);
  });
});
