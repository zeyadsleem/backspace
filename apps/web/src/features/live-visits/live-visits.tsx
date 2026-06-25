import { useState } from "react";

import type {
  LiveVisitExceptionKind,
  LiveVisitListItem,
  LiveVisitsOverview,
  VisitDetail,
  VisitDetailAction,
} from "@backspace/api/visits/live";
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

export type LiveVisitFilterState = {
  query: string;
  status: string;
  type: string;
  exception: string;
};

export function formatElapsedMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

export function getStatusBadge(status: string): {
  label: string;
  tone: "default" | "secondary" | "outline" | "destructive";
} {
  if (status === "active") return { label: "Active", tone: "default" };
  if (status === "cancelled") return { label: "Cancelled", tone: "destructive" };
  if (status === "checked_out") return { label: "Checked out", tone: "secondary" };
  return { label: status, tone: "outline" };
}

export function getExceptionIndicator(kind: LiveVisitExceptionKind) {
  const indicators: Record<
    LiveVisitExceptionKind,
    { label: string; tone: "secondary" | "outline" | "destructive" }
  > = {
    approval_required: { label: "Approval required", tone: "destructive" },
    complimentary: { label: "Complimentary", tone: "secondary" },
    hosted_guest: { label: "Hosted guest", tone: "outline" },
    event_attendee: { label: "Event attendee", tone: "outline" },
    open_bill: { label: "Open bill", tone: "destructive" },
  };
  return indicators[kind];
}

export function getActionCopy(action: VisitDetailAction): string {
  if (!action.supported) return action.reason ?? `${action.label} is not available yet.`;
  if (!action.enabled) return action.reason ?? `${action.label} is disabled.`;
  return `${action.label} is available.`;
}

export function buildLiveVisitFilters(visits: LiveVisitListItem[]) {
  return {
    statuses: unique(visits.map((visit) => visit.status)),
    types: unique(visits.map((visit) => visit.entrant.type)),
    exceptions: unique(
      visits.flatMap((visit) => visit.exceptions.map((exception) => exception.kind)),
    ),
  };
}

export function filterLiveVisits(
  visits: LiveVisitListItem[],
  filters: LiveVisitFilterState,
): LiveVisitListItem[] {
  const query = filters.query.trim().toLowerCase();
  return visits.filter((visit) => {
    const matchesQuery =
      !query ||
      visit.entrant.displayName.toLowerCase().includes(query) ||
      visit.currentSpace?.name.toLowerCase().includes(query) ||
      visit.billingResponsibility.label.toLowerCase().includes(query);
    const matchesStatus = filters.status === "all" || visit.status === filters.status;
    const matchesType = filters.type === "all" || visit.entrant.type === filters.type;
    const matchesException =
      filters.exception === "all" ||
      visit.exceptions.some((exception) => exception.kind === filters.exception);
    return matchesQuery && matchesStatus && matchesType && matchesException;
  });
}

export function LiveVisits({
  overview,
  selectedVisitId,
  selectedVisitDetail,
  onSelectVisit,
}: {
  overview: LiveVisitsOverview;
  selectedVisitId: string | null;
  selectedVisitDetail: VisitDetail | null;
  onSelectVisit?: (visitId: string | null) => void;
}) {
  const [filters, setFilters] = useState<LiveVisitFilterState>({
    query: "",
    status: "all",
    type: "all",
    exception: "all",
  });
  const availableFilters = buildLiveVisitFilters(overview.visits);
  const visibleVisits = filterLiveVisits(overview.visits, filters);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Live operations</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {"Live visits at " + overview.branch.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Active entrants, spaces, billing state, exceptions, and checkout readiness.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search by entrant, space, or billing responsibility.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:flex-row">
          <Input
            aria-label="Search live visits"
            placeholder="Search visits"
            value={filters.query}
            onChange={(event) =>
              setFilters((current) => ({ ...current, query: event.target.value }))
            }
          />
          <FilterButtons
            label="Status"
            values={availableFilters.statuses}
            active={filters.status}
            onChange={(status) => setFilters((current) => ({ ...current, status }))}
          />
          <FilterButtons
            label="Type"
            values={availableFilters.types}
            active={filters.type}
            onChange={(type) => setFilters((current) => ({ ...current, type }))}
          />
          <FilterButtons
            label="Exception"
            values={availableFilters.exceptions}
            active={filters.exception}
            onChange={(exception) => setFilters((current) => ({ ...current, exception }))}
          />
        </CardContent>
      </Card>

      {!overview.sections.charges.allowed && (
        <p className="text-sm text-muted-foreground">{overview.sections.charges.reason}</p>
      )}

      {visibleVisits.length === 0 ? (
        <LiveVisitsEmpty branchName={overview.branch.name} />
      ) : (
        <div className="grid gap-3">
          {visibleVisits.map((visit) => (
            <VisitRow
              key={visit.id}
              visit={visit}
              selected={visit.id === selectedVisitId}
              onSelectVisit={onSelectVisit}
            />
          ))}
        </div>
      )}

      {selectedVisitDetail && (
        <VisitDetailDrawer detail={selectedVisitDetail} onClose={() => onSelectVisit?.(null)} />
      )}
    </div>
  );
}

function FilterButtons({
  label,
  values,
  active,
  onChange,
}: {
  label: string;
  values: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1" aria-label={`${label} filters`}>
      <Button
        type="button"
        variant={active === "all" ? "secondary" : "outline"}
        size="sm"
        onClick={() => onChange("all")}
      >
        All
      </Button>
      {values.map((value) => (
        <Button
          key={value}
          type="button"
          variant={active === value ? "secondary" : "outline"}
          size="sm"
          onClick={() => onChange(value)}
        >
          {labelText(value)}
        </Button>
      ))}
    </div>
  );
}

function VisitRow({
  visit,
  selected,
  onSelectVisit,
}: {
  visit: LiveVisitListItem;
  selected: boolean;
  onSelectVisit?: (visitId: string) => void;
}) {
  const status = getStatusBadge(visit.status);
  return (
    <Card className={selected ? "border-primary" : undefined}>
      <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-medium">{visit.entrant.displayName}</h2>
            <Badge variant={status.tone}>{status.label}</Badge>
            <Badge variant="outline">{visit.entrant.label}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{formatElapsedMinutes(visit.elapsedMinutes)}</span>
            <span>{visit.currentSpace?.label ?? "No active space"}</span>
            <span>{visit.billingResponsibility.label}</span>
            <span>
              {visit.charges.count} charges · {visit.charges.label}
            </span>
            <span>Checkout readiness: {visit.checkoutReadiness.label}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {visit.exceptions.map((exception) => {
              const indicator = getExceptionIndicator(exception.kind);
              return (
                <Badge key={exception.kind} variant={indicator?.tone ?? "outline"}>
                  {indicator?.label ?? exception.label}
                </Badge>
              );
            })}
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => onSelectVisit?.(visit.id)}>
          View detail
        </Button>
      </CardContent>
    </Card>
  );
}

function VisitDetailDrawer({ detail, onClose }: { detail: VisitDetail; onClose: () => void }) {
  return (
    <aside
      className="fixed inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
      aria-label="Visit detail drawer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Visit detail drawer</p>
          <h2 className="text-xl font-semibold">{detail.identity.person.displayName}</h2>
          <p className="text-sm text-muted-foreground">
            Checkout readiness: {detail.visit.checkoutReadiness.label}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
      <DetailSection
        title="Identity"
        items={detail.identity.context.map((item) => `${item.label}: ${item.value}`)}
      />
      <DetailSection
        title="Usage sessions"
        items={detail.sessions.map(
          (session) =>
            `${session.space?.name ?? "No space"} · ${session.status} · ${formatElapsedMinutes(session.elapsedMinutes)}`,
        )}
      />
      <DetailSection
        title="Billing"
        items={[
          detail.billing.responsibility.label,
          detail.billing.paymentStateLabel,
          detail.billing.chargesTotalLabel,
          detail.billing.openBill ? `Open bill ${detail.billing.openBill.label}` : "No open bill",
        ]}
      />
      <DetailSection
        title="Charges"
        items={detail.charges.map((charge) => `${charge.label}: ${charge.formattedAmount}`)}
        empty="No visible charges."
      />
      <DetailSection
        title="Actions"
        items={detail.actions.map((action) => `${action.label}: ${getActionCopy(action)}`)}
      />
      {!detail.sections.audit.allowed && (
        <p className="text-sm text-muted-foreground">{detail.sections.audit.reason}</p>
      )}
      <DetailSection
        title="Audit timeline"
        items={detail.timeline.map((entry) => `${entry.label} · ${entry.occurredAt}`)}
        empty="No visible audit events."
      />
    </aside>
  );
}

function DetailSection({
  title,
  items,
  empty = "None",
}: {
  title: string;
  items: string[];
  empty?: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function LiveVisitsLoading() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading live visits">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

export function LiveVisitsError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Could not load live visits</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function LiveVisitsEmpty({ branchName }: { branchName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No active visits</CardTitle>
        <CardDescription>No active visits for {branchName}.</CardDescription>
      </CardHeader>
    </Card>
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function labelText(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
