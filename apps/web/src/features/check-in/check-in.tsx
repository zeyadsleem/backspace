import { useEffect, useState } from "react";

import type { PermissionKey } from "@backspace/api/permissions/constants";
import { PERMISSIONS } from "@backspace/api/permissions/constants";
import { Badge } from "@backspace/ui/components/badge";
import { Button } from "@backspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@backspace/ui/components/card";
import { Input } from "@backspace/ui/components/input";
import { Label } from "@backspace/ui/components/label";
import { Skeleton } from "@backspace/ui/components/skeleton";

import { hasPermission } from "../staff-shell/permissions";

import { ArrowRight, CalendarCheck, DoorOpen, Ticket, UserCheck, Users, X } from "lucide-react";

type CheckInType = "walk-in" | "member" | "booking" | "hosted-guest" | "event-attendee";

type DrawerMode = { state: "form" } | { state: "success" };

type CheckInOption = {
  type: CheckInType;
  icon: typeof DoorOpen;
  title: string;
  description: string;
  requiredPermission: PermissionKey;
};

const CHECK_IN_OPTIONS: CheckInOption[] = [
  {
    type: "walk-in",
    icon: DoorOpen,
    title: "Walk-in",
    description:
      "Check in a new walk-in visitor. The visitor browses in and needs a desk or day pass.",
    requiredPermission: PERMISSIONS.VISIT_CREATE,
  },
  {
    type: "member",
    icon: UserCheck,
    title: "Member",
    description:
      "Check in a member on their active plan. The member's subscription covers the visit.",
    requiredPermission: PERMISSIONS.MEMBERSHIP_MANAGE,
  },
  {
    type: "booking",
    icon: CalendarCheck,
    title: "Booking customer",
    description:
      "Check in a confirmed booking. A reserved space is assigned for the booking window.",
    requiredPermission: PERMISSIONS.BOOKING_CHECK_IN,
  },
  {
    type: "hosted-guest",
    icon: Users,
    title: "Hosted guest",
    description:
      "Register a guest against a host account. The host is billed for the visit charges.",
    requiredPermission: PERMISSIONS.VISIT_CREATE,
  },
  {
    type: "event-attendee",
    icon: Ticket,
    title: "Event attendee",
    description: "Check in an attendee for an in-progress event. The event covers billing.",
    requiredPermission: PERMISSIONS.EVENT_MANAGE,
  },
];

export type CheckInMutationState<TResult> = {
  isPending: boolean;
  data: TResult | undefined;
  error: Error | null;
  reset: () => void;
};

export type CheckInPageMutations = {
  walkIn: {
    mutate: (input: {
      branchId: string;
      personId: string;
      spaceId?: string;
      billingResponsibility?: "visitor" | "pay_later" | "complimentary";
    }) => void;
    state: CheckInMutationState<{
      visit: {
        id: string;
        personId: string;
        visitType: string;
        status: string;
        checkedInAt: Date;
        billingResponsibility: string;
      };
      usageSession: {
        id: string;
        visitId: string;
        spaceId: string;
        status: string;
        startedAt: Date;
      } | null;
    }>;
  };
  member: {
    mutate: (input: {
      branchId: string;
      personId: string;
      membershipId: string;
      spaceId?: string;
    }) => void;
    state: CheckInMutationState<{
      visit: {
        id: string;
        personId: string;
        visitType: string;
        status: string;
        checkedInAt: Date;
        billingResponsibility: string;
      };
      usageSession: {
        id: string;
        visitId: string;
        spaceId: string;
        status: string;
        startedAt: Date;
      } | null;
    }>;
  };
  booking: {
    mutate: (input: { branchId: string; bookingId: string }) => void;
    state: CheckInMutationState<{
      visit: {
        id: string;
        personId: string;
        visitType: string;
        status: string;
        checkedInAt: Date;
        billingResponsibility: string;
      };
      usageSession: {
        id: string;
        visitId: string;
        spaceId: string;
        status: string;
        startedAt: Date;
      } | null;
    }>;
  };
  hostedGuest: {
    mutate: (input: {
      branchId: string;
      personId: string;
      hostAccountId: string;
      spaceId?: string;
    }) => void;
    state: CheckInMutationState<{
      visit: {
        id: string;
        personId: string;
        visitType: string;
        status: string;
        checkedInAt: Date;
        billingResponsibility: string;
      };
      usageSession: {
        id: string;
        visitId: string;
        spaceId: string;
        status: string;
        startedAt: Date;
      } | null;
    }>;
  };
  eventAttendee: {
    mutate: (input: { branchId: string; eventId: string; personId: string }) => void;
    state: CheckInMutationState<{
      visit: {
        id: string;
        personId: string;
        visitType: string;
        status: string;
        checkedInAt: Date;
        billingResponsibility: string;
      };
      usageSession: {
        id: string;
        visitId: string;
        spaceId: string;
        status: string;
        startedAt: Date;
      } | null;
    }>;
  };
};

export function CheckInPage({
  branchId,
  permissions,
  spacesData,
  mutations,
}: {
  branchId: string;
  permissions: PermissionKey[];
  spacesData: {
    branch: { id: string; name: string };
    groups: Array<{
      floor: { name: string };
      spaces: Array<{ id: string; name: string; status: string }>;
    }>;
  } | null;
  mutations: CheckInPageMutations;
}) {
  const [activeDrawer, setActiveDrawer] = useState<CheckInType | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>({ state: "form" });

  const visibleOptions = CHECK_IN_OPTIONS.filter(
    (option) => !option.requiredPermission || hasPermission(permissions, option.requiredPermission),
  );

  function openDrawer(type: CheckInType) {
    setActiveDrawer(type);
    setDrawerMode({ state: "form" });
  }

  function closeDrawer() {
    setActiveDrawer(null);
    setDrawerMode({ state: "form" });
  }

  function handleSuccess() {
    setDrawerMode({ state: "success" });
  }

  if (visibleOptions.length === 0) {
    return <CheckInRestricted />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Operations</p>
        <h1 className="text-2xl font-semibold tracking-tight">Check-in</h1>
        <p className="text-sm text-muted-foreground">
          Create visits and assign spaces. Select a check-in type to begin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              className="group rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
              onClick={() => openDrawer(option.type)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                    />
                    <h2 className="font-medium">{option.title}</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary"
                />
              </div>
            </button>
          );
        })}
      </div>

      {activeDrawer === "walk-in" && (
        <WalkInDrawer
          branchId={branchId}
          spaces={spacesData}
          onClose={closeDrawer}
          onSuccess={handleSuccess}
          mode={drawerMode}
          mutation={mutations.walkIn}
        />
      )}
      {activeDrawer === "member" && (
        <MemberDrawer
          branchId={branchId}
          spaces={spacesData}
          onClose={closeDrawer}
          onSuccess={handleSuccess}
          mode={drawerMode}
          mutation={mutations.member}
        />
      )}
      {activeDrawer === "booking" && (
        <BookingDrawer
          branchId={branchId}
          onClose={closeDrawer}
          onSuccess={handleSuccess}
          mode={drawerMode}
          mutation={mutations.booking}
        />
      )}
      {activeDrawer === "hosted-guest" && (
        <HostedGuestDrawer
          branchId={branchId}
          spaces={spacesData}
          onClose={closeDrawer}
          onSuccess={handleSuccess}
          mode={drawerMode}
          mutation={mutations.hostedGuest}
        />
      )}
      {activeDrawer === "event-attendee" && (
        <EventAttendeeDrawer
          branchId={branchId}
          onClose={closeDrawer}
          onSuccess={handleSuccess}
          mode={drawerMode}
          mutation={mutations.eventAttendee}
        />
      )}
    </div>
  );
}

function WalkInDrawer({
  branchId,
  spaces,
  onClose,
  onSuccess,
  mode,
  mutation,
}: {
  branchId: string;
  spaces: {
    branch: { id: string; name: string };
    groups: Array<{
      floor: { name: string };
      spaces: Array<{ id: string; name: string; status: string }>;
    }>;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  mode: DrawerMode;
  mutation: CheckInPageMutations["walkIn"];
}) {
  const [personId, setPersonId] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [billingResponsibility, setBillingResponsibility] = useState("visitor");

  useEffect(() => {
    if (mutation.state.data) onSuccess();
  }, [mutation.state.data, onSuccess]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate({
      branchId,
      personId,
      spaceId: spaceId || undefined,
      billingResponsibility: billingResponsibility as "visitor" | "pay_later" | "complimentary",
    });
  }

  return (
    <CheckInDrawerShell
      title="Walk-in check-in"
      description="Create a new walk-in visit and assign an optional space."
      result={mutation.data ?? null}
      error={mutation.error?.message ?? null}
      _isPending={mutation.isPending}
      mode={mode}
      onClose={onClose}
      onRetry={() => mutation.reset()}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-3" disabled={mutation.isPending}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="walkin-person-id">Person ID</Label>
            <Input
              id="walkin-person-id"
              placeholder="e.g. seed-person-host"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Available people: seed-person-host (Nadia Hassan), seed-person-cashier (Omar
              El-Sayed), seed-person-manager (Heba Ahmed)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="walkin-billing">Billing responsibility</Label>
            <select
              id="walkin-billing"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={billingResponsibility}
              onChange={(e) => setBillingResponsibility(e.target.value)}
            >
              <option value="visitor">Visitor pays</option>
              <option value="pay_later">Pay later</option>
              <option value="complimentary">Complimentary</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="walkin-space">Space (optional)</Label>
            <Input
              id="walkin-space"
              placeholder="e.g. seed-space-desk-4"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
            />
            {spaces ? (
              <div className="flex flex-wrap gap-1">
                {spaces.groups.flatMap((group) =>
                  group.spaces
                    .filter((s) => s.status === "available")
                    .map((s) => (
                      <button
                        key={s.id}
                        className="rounded-sm border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground hover:bg-accent"
                        onClick={() => setSpaceId(s.id)}
                        type="button"
                      >
                        {s.name}
                      </button>
                    )),
                )}
              </div>
            ) : null}
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <Button disabled={mutation.isPending || !personId.trim()} type="submit">
            {mutation.isPending ? "Checking in..." : "Check in"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </CheckInDrawerShell>
  );
}

function MemberDrawer({
  branchId,
  spaces,
  onClose,
  onSuccess,
  mode,
  mutation,
}: {
  branchId: string;
  spaces: {
    branch: { id: string; name: string };
    groups: Array<{
      floor: { name: string };
      spaces: Array<{ id: string; name: string; status: string }>;
    }>;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  mode: DrawerMode;
  mutation: CheckInPageMutations["member"];
}) {
  const [personId, setPersonId] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [spaceId, setSpaceId] = useState("");

  useEffect(() => {
    if (mutation.state.data) onSuccess();
  }, [mutation.state.data, onSuccess]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate({ branchId, personId, membershipId, spaceId: spaceId || undefined });
  }

  return (
    <CheckInDrawerShell
      title="Member check-in"
      description="Check in a member with an active membership plan."
      result={mutation.data ?? null}
      error={mutation.error?.message ?? null}
      _isPending={mutation.isPending}
      mode={mode}
      onClose={onClose}
      onRetry={() => mutation.reset()}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-3" disabled={mutation.isPending}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="member-person-id">Person ID</Label>
            <Input
              id="member-person-id"
              placeholder="e.g. seed-person-member"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Member person: seed-person-member (Sara Mahmoud)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="member-membership-id">Membership ID</Label>
            <Input
              id="member-membership-id"
              placeholder="e.g. seed-membership-active"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Active membership: seed-membership-active (Basic Hot Desk)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="member-space">Space (optional)</Label>
            <Input
              id="member-space"
              placeholder="e.g. seed-space-desk-4"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
            />
            {spaces ? (
              <div className="flex flex-wrap gap-1">
                {spaces.groups.flatMap((group) =>
                  group.spaces
                    .filter((s) => s.status === "available")
                    .map((s) => (
                      <button
                        key={s.id}
                        className="rounded-sm border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground hover:bg-accent"
                        onClick={() => setSpaceId(s.id)}
                        type="button"
                      >
                        {s.name}
                      </button>
                    )),
                )}
              </div>
            ) : null}
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <Button
            disabled={mutation.isPending || !personId.trim() || !membershipId.trim()}
            type="submit"
          >
            {mutation.isPending ? "Checking in..." : "Check in"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </CheckInDrawerShell>
  );
}

function BookingDrawer({
  branchId,
  onClose,
  onSuccess,
  mode,
  mutation,
}: {
  branchId: string;
  onClose: () => void;
  onSuccess: () => void;
  mode: DrawerMode;
  mutation: CheckInPageMutations["booking"];
}) {
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    if (mutation.state.data) onSuccess();
  }, [mutation.state.data, onSuccess]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate({ branchId, bookingId });
  }

  return (
    <CheckInDrawerShell
      title="Booking check-in"
      description="Check in a confirmed booking by providing the booking ID."
      result={mutation.data ?? null}
      error={mutation.error?.message ?? null}
      _isPending={mutation.isPending}
      mode={mode}
      onClose={onClose}
      onRetry={() => mutation.reset()}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-3" disabled={mutation.isPending}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-id">Booking ID</Label>
            <Input
              id="booking-id"
              placeholder="e.g. seed-booking-confirmed"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Confirmed booking: seed-booking-confirmed (Mohamed Ali, Desk B1, tomorrow). Already
              checked-in: seed-booking-checkedin. Cancelled: seed-booking-cancelled.
            </p>
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <Button disabled={mutation.isPending || !bookingId.trim()} type="submit">
            {mutation.isPending ? "Checking in..." : "Check in"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </CheckInDrawerShell>
  );
}

function HostedGuestDrawer({
  branchId,
  spaces,
  onClose,
  onSuccess,
  mode,
  mutation,
}: {
  branchId: string;
  spaces: {
    branch: { id: string; name: string };
    groups: Array<{
      floor: { name: string };
      spaces: Array<{ id: string; name: string; status: string }>;
    }>;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  mode: DrawerMode;
  mutation: CheckInPageMutations["hostedGuest"];
}) {
  const [personId, setPersonId] = useState("");
  const [hostAccountId, setHostAccountId] = useState("");
  const [spaceId, setSpaceId] = useState("");

  useEffect(() => {
    if (mutation.state.data) onSuccess();
  }, [mutation.state.data, onSuccess]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate({ branchId, personId, hostAccountId, spaceId: spaceId || undefined });
  }

  return (
    <CheckInDrawerShell
      title="Hosted guest check-in"
      description="Register a guest under a host account. The host is billed for charges."
      result={mutation.data ?? null}
      error={mutation.error?.message ?? null}
      _isPending={mutation.isPending}
      mode={mode}
      onClose={onClose}
      onRetry={() => mutation.reset()}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-3" disabled={mutation.isPending}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-person-id">Guest person ID</Label>
            <Input
              id="guest-person-id"
              placeholder="e.g. seed-person-guest"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Guest person: seed-person-guest (Karim Youssef). Also available: seed-person-host
              (Nadia Hassan).
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-host-account">Host account ID</Label>
            <Input
              id="guest-host-account"
              placeholder="e.g. seed-account-host"
              value={hostAccountId}
              onChange={(e) => setHostAccountId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Host account: seed-account-host (Nadia Hassan Consulting)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-space">Space (optional)</Label>
            <Input
              id="guest-space"
              placeholder="e.g. seed-space-desk-4"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
            />
            {spaces ? (
              <div className="flex flex-wrap gap-1">
                {spaces.groups.flatMap((group) =>
                  group.spaces
                    .filter((s) => s.status === "available")
                    .map((s) => (
                      <button
                        key={s.id}
                        className="rounded-sm border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground hover:bg-accent"
                        onClick={() => setSpaceId(s.id)}
                        type="button"
                      >
                        {s.name}
                      </button>
                    )),
                )}
              </div>
            ) : null}
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <Button
            disabled={mutation.isPending || !personId.trim() || !hostAccountId.trim()}
            type="submit"
          >
            {mutation.isPending ? "Checking in..." : "Check in"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </CheckInDrawerShell>
  );
}

function EventAttendeeDrawer({
  branchId,
  onClose,
  onSuccess,
  mode,
  mutation,
}: {
  branchId: string;
  onClose: () => void;
  onSuccess: () => void;
  mode: DrawerMode;
  mutation: CheckInPageMutations["eventAttendee"];
}) {
  const [eventId, setEventId] = useState("");
  const [personId, setPersonId] = useState("");

  useEffect(() => {
    if (mutation.state.data) onSuccess();
  }, [mutation.state.data, onSuccess]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate({ branchId, eventId, personId });
  }

  return (
    <CheckInDrawerShell
      title="Event attendee check-in"
      description="Check in an attendee for an in-progress event."
      result={mutation.data ?? null}
      error={mutation.error?.message ?? null}
      _isPending={mutation.isPending}
      mode={mode}
      onClose={onClose}
      onRetry={() => mutation.reset()}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-3" disabled={mutation.isPending}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-id">Event ID</Label>
            <Input
              id="event-id"
              placeholder="e.g. seed-event-workshop"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              In-progress event: seed-event-workshop (Tech Meetup March)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-person-id">Attendee person ID</Label>
            <Input
              id="event-person-id"
              placeholder="e.g. seed-person-attendee"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Available: seed-person-attendee (Laila Ibrahim), seed-person-host (Nadia Hassan),
              seed-person-walkin (Ahmed Farouk)
            </p>
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <Button
            disabled={mutation.isPending || !eventId.trim() || !personId.trim()}
            type="submit"
          >
            {mutation.isPending ? "Checking in..." : "Check in"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </CheckInDrawerShell>
  );
}

function CheckInDrawerShell({
  title,
  description,
  result,
  error,
  _isPending,
  mode,
  onClose,
  onRetry,
  children,
}: {
  title: string;
  description: string;
  result: {
    visit: {
      id: string;
      personId: string;
      visitType: string;
      status: string;
      checkedInAt: Date;
      billingResponsibility: string;
    };
    usageSession: {
      id: string;
      visitId: string;
      spaceId: string;
      status: string;
      startedAt: Date;
    } | null;
  } | null;
  error: string | null;
  _isPending: boolean;
  mode: DrawerMode;
  onClose: () => void;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
      aria-label={`${title} drawer`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          aria-label="Close drawer"
          size="icon"
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>

      {mode.state === "success" && result ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-in successful</CardTitle>
              <CardDescription>Visit has been created and is active.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Visit ID</span>
                <span className="font-mono text-xs">{result.visit.id}</span>
                <span className="text-muted-foreground">Person ID</span>
                <span className="font-mono text-xs">{result.visit.personId}</span>
                <span className="text-muted-foreground">Type</span>
                <span>
                  <Badge variant="outline">{result.visit.visitType}</Badge>
                </span>
                <span className="text-muted-foreground">Status</span>
                <span>
                  <Badge variant="default">Active</Badge>
                </span>
                <span className="text-muted-foreground">Billing</span>
                <span className="capitalize">
                  {result.visit.billingResponsibility.replaceAll("_", " ")}
                </span>
              </div>
              {result.usageSession ? (
                <div className="border-t pt-3">
                  <p className="mb-2 text-sm font-medium">Usage session</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Session ID</span>
                    <span className="font-mono text-xs">{result.usageSession.id}</span>
                    <span className="text-muted-foreground">Space ID</span>
                    <span className="font-mono text-xs">{result.usageSession.spaceId}</span>
                    <span className="text-muted-foreground">Status</span>
                    <span>
                      <Badge variant="default">Active</Badge>
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <Button onClick={onClose}>Done</Button>
        </div>
      ) : error ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-in failed</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
          <div className="flex items-center gap-2">
            <Button onClick={onRetry} variant="secondary">
              Try again
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        children
      )}
    </aside>
  );
}

export function CheckInRestricted() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No check-in options available</CardTitle>
        <CardDescription>
          Your role does not have permission to check in any visitor types. Contact a manager to
          adjust your permissions.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function CheckInLoading() {
  return (
    <div className="flex flex-col gap-4" aria-label="Loading check-in options">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}
