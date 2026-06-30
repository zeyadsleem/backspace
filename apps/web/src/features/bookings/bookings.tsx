import { AlertTriangle, CalendarClock, CheckCircle2, Clock, XCircle } from "lucide-react";

import { Badge } from "@backspace/ui/components/badge";
import { Button } from "@backspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@backspace/ui/components/card";
import { Skeleton } from "@backspace/ui/components/skeleton";

export type BookingCalendarItem = {
  id: string;
  branchId: string;
  person: { id: string; displayName: string; phone: string | null; email: string | null };
  space: { id: string; name: string; kind: string; status: string };
  startsAt: string;
  endsAt: string;
  bufferStartsAt: string;
  bufferEndsAt: string;
  status: "draft" | "confirmed" | "checked_in" | "cancelled" | "no_show" | "completed";
  deposit: { amountCents: number; currency: string; state: "none" | "recorded" | "unsupported" };
  notes: string | null;
  warnings: Array<{ code: "booking_overlap" | "active_session"; message: string }>;
  actions: {
    canCheckIn: boolean;
    canCancel: boolean;
    canMarkNoShow: boolean;
    disabledReason: string | null;
  };
};

export type BookingQueueData = {
  branchId: string;
  generatedAt: string;
  overdue: BookingCalendarItem[];
  upcoming: BookingCalendarItem[];
  checkedIn: BookingCalendarItem[];
  cancelled: BookingCalendarItem[];
  noShow: BookingCalendarItem[];
  completed: BookingCalendarItem[];
};

export type BookingActionState = {
  pendingId?: string | null;
  errorMessage?: string | null;
};

export function BookingsPage({
  queue,
  actionState,
  onCancel,
  onCheckIn,
  onMarkNoShow,
}: {
  queue: BookingQueueData;
  actionState?: BookingActionState;
  onCancel?: (bookingId: string) => void;
  onCheckIn?: (bookingId: string) => void;
  onMarkNoShow?: (bookingId: string) => void;
}) {
  const activeCount = queue.overdue.length + queue.upcoming.length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 rounded-3xl bg-card px-5 py-4 ring-1 ring-foreground/5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Operations calendar</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Calendar bookings</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track reservations before they become visits. Use the queue to check in arrivals, cancel
            confirmed bookings, or mark no-shows without re-entering booking context.
          </p>
        </div>
        <div className="rounded-2xl bg-muted px-3 py-2 text-sm">
          <span className="font-medium">{activeCount} waiting</span>
          <span className="ml-2 text-muted-foreground">today</span>
        </div>
      </header>

      {actionState?.errorMessage ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionState.errorMessage}
        </p>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]" aria-label="Booking worklist">
        <div className="flex flex-col gap-4">
          <BookingSection
            actionState={actionState}
            items={queue.overdue}
            onCancel={onCancel}
            onCheckIn={onCheckIn}
            onMarkNoShow={onMarkNoShow}
            tone="urgent"
            title="Today queue"
          />
          <BookingSection
            actionState={actionState}
            items={queue.upcoming}
            onCancel={onCancel}
            onCheckIn={onCheckIn}
            onMarkNoShow={onMarkNoShow}
            title="Upcoming"
          />
        </div>
        <div className="flex flex-col gap-4">
          <BookingSection compact items={queue.checkedIn} title="Checked in" />
          <BookingSection compact items={queue.cancelled} title="Cancelled" />
          <BookingSection compact items={queue.noShow} title="No-show" />
          <BookingSection compact items={queue.completed} title="Completed" />
        </div>
      </section>
    </div>
  );
}

function BookingSection({
  actionState,
  compact = false,
  items,
  onCancel,
  onCheckIn,
  onMarkNoShow,
  title,
  tone = "neutral",
}: {
  actionState?: BookingActionState;
  compact?: boolean;
  items: BookingCalendarItem[];
  onCancel?: (bookingId: string) => void;
  onCheckIn?: (bookingId: string) => void;
  onMarkNoShow?: (bookingId: string) => void;
  title: string;
  tone?: "neutral" | "urgent";
}) {
  const Icon = tone === "urgent" ? Clock : CalendarClock;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
        <CardDescription>
          {compact ? "Status archive for today" : "Reception actions with booking context"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
            No bookings in this section.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <BookingRow
                key={item.id}
                actionState={actionState}
                compact={compact}
                item={item}
                onCancel={onCancel}
                onCheckIn={onCheckIn}
                onMarkNoShow={onMarkNoShow}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function BookingRow({
  actionState,
  compact,
  item,
  onCancel,
  onCheckIn,
  onMarkNoShow,
}: {
  actionState?: BookingActionState;
  compact: boolean;
  item: BookingCalendarItem;
  onCancel?: (bookingId: string) => void;
  onCheckIn?: (bookingId: string) => void;
  onMarkNoShow?: (bookingId: string) => void;
}) {
  const pending = actionState?.pendingId === item.id;

  return (
    <li className="rounded-2xl border border-border px-3 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{item.person.displayName}</p>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatTimeRange(item.startsAt, item.endsAt)} · {item.space.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatMoney(item.deposit.amountCents, item.deposit.currency)} deposit · {item.id}
            </p>
          </div>
          {!compact ? (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!item.actions.canCheckIn || pending}
                onClick={() => onCheckIn?.(item.id)}
                size="sm"
                type="button"
              >
                Check in
              </Button>
              {item.actions.canCancel && !pending ? (
                <details className="basis-full rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm">
                  <summary className="cursor-pointer font-medium">Cancel booking</summary>
                  <div className="mt-2 flex flex-col gap-2 text-muted-foreground">
                    <p>Cancel only after confirming the customer no longer needs this slot.</p>
                    <Button
                      onClick={() => onCancel?.(item.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Confirm cancel booking
                    </Button>
                  </div>
                </details>
              ) : (
                <Button disabled size="sm" type="button" variant="outline">
                  Cancel booking
                </Button>
              )}
              {item.actions.canMarkNoShow && !pending ? (
                <details className="basis-full rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm">
                  <summary className="cursor-pointer font-medium">Mark no-show</summary>
                  <div className="mt-2 flex flex-col gap-2 text-muted-foreground">
                    <p>Mark no-show only when the arrival window has passed at reception.</p>
                    <Button
                      onClick={() => onMarkNoShow?.(item.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Confirm no-show
                    </Button>
                  </div>
                </details>
              ) : (
                <Button disabled size="sm" type="button" variant="outline">
                  Mark no-show
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {item.warnings.length > 0 ? (
          <div className="flex flex-col gap-1 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle aria-hidden="true" className="size-4" />
              Conflict warning
            </div>
            {item.warnings.map((warning) => (
              <p key={`${item.id}-${warning.code}`}>{warning.message}</p>
            ))}
          </div>
        ) : null}

        {item.actions.disabledReason ? (
          <p className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
            {item.actions.disabledReason}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: BookingCalendarItem["status"] }) {
  const isDone = status === "checked_in" || status === "completed";
  const isStopped = status === "cancelled" || status === "no_show";
  const Icon = isDone ? CheckCircle2 : isStopped ? XCircle : CalendarClock;

  return (
    <Badge variant={isDone ? "default" : isStopped ? "outline" : "secondary"}>
      <Icon aria-hidden="true" className="mr-1 size-3" />
      {labelText(status)}
    </Badge>
  );
}

function formatTimeRange(startsAt: string, endsAt: string): string {
  const formatter = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" });
  return `${formatter.format(new Date(startsAt))} to ${formatter.format(new Date(endsAt))}`;
}

function formatMoney(amountCents: number, currency: string): string {
  return `${(amountCents / 100).toFixed(2)} ${currency}`;
}

function labelText(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function BookingsPageLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading bookings">
      <p className="sr-only">Loading bookings</p>
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

export function BookingsPageError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar unavailable</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Refresh the page or confirm booking permissions for this branch.
        </p>
      </CardContent>
    </Card>
  );
}
