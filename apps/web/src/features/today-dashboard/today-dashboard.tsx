import type { TodayOverview, TodayQueueItem } from "@backspace/api/today/overview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@backspace/ui/components/card";
import { Skeleton } from "@backspace/ui/components/skeleton";

type SummaryKey = keyof TodayOverview["summary"];
type QueueKey = keyof TodayOverview["queues"];

export const todayDashboardCards: { key: SummaryKey }[] = [
  { key: "activeVisits" },
  { key: "occupancy" },
  { key: "upcomingBookings" },
  { key: "openBills" },
  { key: "cleaning" },
  { key: "maintenance" },
  { key: "pendingApprovals" },
  { key: "expiringMemberships" },
];

export const todayDashboardQueues: { key: QueueKey; title: string }[] = [
  { key: "visits", title: "Now in the building" },
  { key: "bookings", title: "Booking queue" },
  { key: "cleaning", title: "Cleaning queue" },
  { key: "maintenance", title: "Maintenance queue" },
  { key: "approvals", title: "Approvals" },
];

export function TodayDashboard({ overview }: { overview: TodayOverview }) {
  const hasActivity =
    overview.summary.activeVisits.value !== 0 || overview.summary.upcomingBookings.value !== 0;
  const title = `Today at ${overview.branch.name}`;

  if (!hasActivity) {
    return <TodayDashboardEmpty branchName={overview.branch.name} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 rounded-3xl bg-card px-5 py-4 ring-1 ring-foreground/5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Operations dashboard</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="rounded-2xl bg-muted px-3 py-2 text-sm">
          <span className="font-medium">{overview.shiftStatus.label}</span>
          <span className="ml-2 text-muted-foreground">{overview.shiftStatus.detail}</span>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Today summary">
        {todayDashboardCards.map((card) => {
          const item = overview.summary[card.key];
          return (
            <Card key={card.key} size="sm">
              <CardHeader>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle>{item.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]" aria-label="Today queues">
        <div className="flex flex-col gap-4">
          {todayDashboardQueues.slice(0, 2).map((queue) => (
            <QueueCard key={queue.key} title={queue.title} section={overview.queues[queue.key]} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {todayDashboardQueues.slice(2).map((queue) => (
            <QueueCard key={queue.key} title={queue.title} section={overview.queues[queue.key]} />
          ))}
          <QueueCard title="Open bills" section={overview.sections.openBills} />
        </div>
      </section>
    </div>
  );
}

function QueueCard({
  title,
  section,
}: {
  title: string;
  section: { allowed: boolean; items: TodayQueueItem[]; reason?: string };
}) {
  const isAllowed = section.allowed !== false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {isAllowed ? `${section.items.length} visible item(s)` : section.reason}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAllowed ? (
          <p className="rounded-2xl bg-muted px-3 py-2 text-muted-foreground">{section.reason}</p>
        ) : section.items.length === 0 ? (
          <p className="rounded-2xl bg-muted px-3 py-2 text-muted-foreground">No items waiting.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {section.items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border px-3 py-2">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.meta}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function TodayDashboardLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading today dashboard">
      <p className="sr-only">Loading today dashboard</p>
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {todayDashboardCards.map((card) => (
          <Skeleton key={card.key} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TodayDashboardError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today dashboard unavailable</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Refresh the page or check staff branch access.</p>
      </CardContent>
    </Card>
  );
}

export function TodayDashboardEmpty({ branchName }: { branchName: string }) {
  const title = `No operational activity for ${branchName}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Visits, bookings, bills, and facilities queues will appear here when activity starts.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
