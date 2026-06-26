import { Search } from "lucide-react";
import { startTransition, useDeferredValue, useState } from "react";

import type {
  SpaceAvailabilityState,
  SpaceDetail,
  SpaceMapAction,
  SpaceMapGroup,
  SpaceMapOverview,
} from "@backspace/api/spaces/map";
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
import { Skeleton } from "@backspace/ui/components/skeleton";
import { cn } from "@backspace/ui/lib/utils";

const states: SpaceAvailabilityState[] = [
  "available",
  "occupied",
  "reserved",
  "cleaning",
  "maintenance",
  "blocked",
  "inactive",
];

type SpaceMapFilters = {
  query: string;
  state: SpaceAvailabilityState | "all";
  floor: string;
  type: string;
};

const defaultFilters: SpaceMapFilters = { query: "", state: "all", floor: "all", type: "all" };

export function getSpaceStateBadge(state: SpaceAvailabilityState): {
  label: string;
  tone: "default" | "secondary" | "destructive" | "outline";
} {
  const labels: Record<SpaceAvailabilityState, string> = {
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
    cleaning: "Cleaning",
    maintenance: "Maintenance",
    blocked: "Blocked",
    inactive: "Inactive",
  };
  const tones: Record<SpaceAvailabilityState, "default" | "secondary" | "destructive" | "outline"> =
    {
      available: "secondary",
      occupied: "default",
      reserved: "outline",
      cleaning: "secondary",
      maintenance: "destructive",
      blocked: "destructive",
      inactive: "outline",
    };
  return { label: labels[state], tone: tones[state] };
}

export function getSpaceStateLegend() {
  return states.map((state) => ({ ...getSpaceStateBadge(state), state }));
}

export function getSpaceActionCopy(action?: SpaceMapAction): string {
  if (!action) return "Action unavailable.";
  if (action.enabled) return action.label;
  return action.reason ?? `${action.label} is unavailable.`;
}

export function buildSpaceMapFilters(groups: SpaceMapGroup[]) {
  const spaces = groups.flatMap((group) => group.spaces);
  return {
    states: unique(spaces.map((space) => space.state)),
    floors: unique(spaces.map((space) => space.floor?.name).filter(Boolean)),
    types: unique(spaces.map((space) => space.kindLabel)),
  };
}

export function filterSpaceMapGroups(
  groups: SpaceMapGroup[],
  filters: SpaceMapFilters,
): SpaceMapGroup[] {
  const query = filters.query.trim().toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      spaces: group.spaces.filter((space) => {
        const haystack = [
          space.name,
          space.code,
          space.kindLabel,
          space.currentSession?.entrantName,
          space.reservation?.personName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          (!query || haystack.includes(query)) &&
          (filters.state === "all" || space.state === filters.state) &&
          (filters.floor === "all" || space.floor?.name === filters.floor) &&
          (filters.type === "all" || space.kindLabel.toLowerCase() === filters.type)
        );
      }),
    }))
    .filter((group) => group.spaces.length > 0);
}

export function SpaceMap({
  overview,
  selectedSpaceId,
  selectedSpaceDetail,
  initialFilters,
  onSelectSpace,
}: {
  overview: SpaceMapOverview;
  selectedSpaceId?: string | null;
  selectedSpaceDetail?: SpaceDetail | null;
  initialFilters?: Partial<SpaceMapFilters>;
  onSelectSpace?: (spaceId: string) => void;
}) {
  const selected = selectedSpaceDetail ?? null;
  const [filters, setFilters] = useState<SpaceMapFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const deferredQuery = useDeferredValue(filters.query);
  const filterOptions = buildSpaceMapFilters(overview.groups);
  const visibleGroups = filterSpaceMapGroups(overview.groups, {
    ...filters,
    query: deferredQuery,
  });

  function updateFilter<Key extends keyof SpaceMapFilters>(key: Key, value: SpaceMapFilters[Key]) {
    startTransition(() => {
      setFilters((current) => ({ ...current, [key]: value }));
    });
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight">{`Space map at ${overview.branch.name}`}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Operational availability by floor, with server-derived states and disabled actions
          explained before staff can make unsafe changes.
        </p>
      </div>
      <StateLegend overview={overview} />
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search by space, type, occupant, or reservation. State/floor/type filters stay
            client-side for this read model.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
            <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            <Input
              aria-label="Search spaces"
              className="border-0 p-0 shadow-none focus-visible:ring-0"
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="Search spaces"
              value={filters.query}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground">
              State
              <select
                aria-label="Filter by state"
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"
                onChange={(event) =>
                  updateFilter("state", event.target.value as SpaceMapFilters["state"])
                }
                value={filters.state}
              >
                <option value="all">All states</option>
                {filterOptions.states.map((state) => (
                  <option key={state} value={state}>
                    {getSpaceStateBadge(state).label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              Floor
              <select
                aria-label="Filter by floor"
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"
                onChange={(event) => updateFilter("floor", event.target.value)}
                value={filters.floor}
              >
                <option value="all">All floors</option>
                {filterOptions.floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              Type
              <select
                aria-label="Filter by type"
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"
                onChange={(event) => updateFilter("type", event.target.value)}
                value={filters.type}
              >
                <option value="all">All types</option>
                {filterOptions.types.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-4">
          {visibleGroups.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No spaces match these filters</CardTitle>
                <CardDescription>Clear the search or choose broader filter values.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          {visibleGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
                <CardDescription>
                  {group.spaces.length} spaces grouped by {group.type}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.spaces.map((space) => {
                  const badge = getSpaceStateBadge(space.state);
                  return (
                    <button
                      className={cn(
                        "rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent",
                        selectedSpaceId === space.id && "ring-2 ring-primary",
                      )}
                      key={space.id}
                      onClick={() => onSelectSpace?.(space.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{space.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {space.kindLabel} · Capacity {space.capacity}
                          </p>
                        </div>
                        <Badge variant={badge.tone}>{badge.label}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{space.stateReason}</p>
                      {space.currentSession ? (
                        <p className="mt-2 text-sm">Occupant: {space.currentSession.entrantName}</p>
                      ) : null}
                      {space.reservation ? (
                        <p className="mt-2 text-sm">Reserved for: {space.reservation.personName}</p>
                      ) : null}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
        <SpaceDetailDrawer detail={selected} />
      </div>
    </div>
  );
}

function StateLegend({ overview }: { overview: SpaceMapOverview }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>State legend</CardTitle>
        <CardDescription>
          Every state includes text labels and descriptions; color is only a secondary cue.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {overview.legend.map((item) => {
          const badge = getSpaceStateBadge(item.state);
          return (
            <div className="rounded-md border p-3" key={item.state}>
              <Badge variant={badge.tone}>{item.label}</Badge>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SpaceDetailDrawer({ detail }: { detail: SpaceDetail | null }) {
  if (!detail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Space detail drawer</CardTitle>
          <CardDescription>Select a space to inspect state and actions.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const badge = getSpaceStateBadge(detail.state);
  return (
    <Card className="xl:sticky xl:top-24 xl:self-start">
      <CardHeader>
        <CardTitle>Space detail drawer</CardTitle>
        <CardDescription>{detail.name}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div>
          <Badge variant={badge.tone}>{badge.label}</Badge>
          <p className="mt-2 text-muted-foreground">{detail.stateReason}</p>
        </div>
        {detail.currentSession ? (
          <p>Active visit/session: {detail.currentSession.entrantName}</p>
        ) : null}
        {detail.reservation ? <p>Upcoming reservation: {detail.reservation.personName}</p> : null}
        {detail.cleaningTask ? <p>Cleaning: {detail.cleaningTask.reason}</p> : null}
        {detail.maintenanceTicket ? <p>Maintenance: {detail.maintenanceTicket.title}</p> : null}
        {detail.blockedReason ? <p>Blocked reason: {detail.blockedReason}</p> : null}
        <div className="flex flex-col gap-2">
          <p className="font-medium">State-based actions</p>
          {detail.actions.map((action) => (
            <Button
              disabled={!action.enabled}
              key={action.id}
              title={getSpaceActionCopy(action)}
              type="button"
              variant="outline"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SpaceMapLoading() {
  return (
    <div className="space-y-3">
      <p>Loading space map</p>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function SpaceMapEmpty({ branchName }: { branchName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No spaces found</CardTitle>
        <CardDescription>{branchName} has no spaces in the current read model.</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function SpaceMapError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Could not load space map</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function SpaceMapRestricted() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requires workspace access</CardTitle>
        <CardDescription>Your role does not include workspace read permission.</CardDescription>
      </CardHeader>
    </Card>
  );
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
