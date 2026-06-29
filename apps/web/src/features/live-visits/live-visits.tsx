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
import { Label } from "@backspace/ui/components/label";
import { Skeleton } from "@backspace/ui/components/skeleton";

import type { CheckoutState } from "./checkout-panel";
import type { CashControlState } from "./checkout-panel";
import { CheckoutPanel } from "./checkout-panel";

const CHARGE_TYPES = [
  "product",
  "service",
  "fee",
  "discount",
  "complimentary",
  "adjustment",
] as const;
const BILLING_RESPONSIBILITIES = [
  "visitor",
  "host",
  "company",
  "event",
  "subscription",
  "complimentary",
  "pay_later",
] as const;

export type AddChargeInput = {
  branchId: string;
  targetType: "visit";
  targetId: string;
  type: (typeof CHARGE_TYPES)[number];
  label: string;
  quantity: number;
  amountCents: number;
  currency: "EGP" | "USD";
  billingResponsibility: (typeof BILLING_RESPONSIBILITIES)[number];
  reason?: string;
};

export type AddChargeState = {
  isPending: boolean;
  data?: { chargeId: string } | null;
  error: { message: string } | null;
  reset: () => void;
};

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
  addChargeState,
  onAddCharge,
  showCheckoutView,
  checkoutState,
  checkoutMethod,
  onSelectCheckoutMethod,
  onOpenCheckout,
  onCloseCheckout,
  onFinalizeCheckout,
  cashControl,
}: {
  overview: LiveVisitsOverview;
  selectedVisitId: string | null;
  selectedVisitDetail: VisitDetail | null;
  onSelectVisit?: (visitId: string | null) => void;
  addChargeState?: AddChargeState;
  onAddCharge?: (input: AddChargeInput) => void;
  showCheckoutView?: boolean;
  checkoutState?: CheckoutState;
  checkoutMethod?: string;
  onSelectCheckoutMethod?: (method: string) => void;
  onOpenCheckout?: () => void;
  onCloseCheckout?: () => void;
  onFinalizeCheckout?: () => void;
  cashControl?: CashControlState | null;
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

      {showCheckoutView && checkoutState ? (
        <CheckoutPanel
          personName={selectedVisitDetail?.identity.person.displayName ?? "Unknown"}
          checkoutState={checkoutState}
          cashControl={cashControl}
          selectedMethod={checkoutMethod ?? ""}
          onSelectMethod={onSelectCheckoutMethod ?? (() => {})}
          onFinalize={onFinalizeCheckout ?? (() => {})}
          onClose={onCloseCheckout ?? (() => {})}
        />
      ) : null}

      {selectedVisitDetail && !showCheckoutView && (
        <VisitDetailDrawer
          branchId={overview.branch.id}
          detail={selectedVisitDetail}
          onClose={() => onSelectVisit?.(null)}
          onAddCharge={onAddCharge}
          addChargeState={addChargeState}
          onOpenCheckout={onOpenCheckout}
        />
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

function VisitDetailDrawer({
  branchId,
  detail,
  onClose,
  addChargeState,
  onAddCharge,
  onOpenCheckout,
}: {
  branchId: string;
  detail: VisitDetail;
  onClose: () => void;
  addChargeState?: AddChargeState;
  onAddCharge?: (input: AddChargeInput) => void;
  onOpenCheckout?: () => void;
}) {
  const addChargeAction = detail.actions.find((a) => a.id === "add_charge");
  const checkoutAction = detail.actions.find((a) => a.id === "checkout");
  const [showAddCharge, setShowAddCharge] = useState(false);

  if (showAddCharge) {
    return (
      <AddChargeFormView
        branchId={branchId}
        detail={detail}
        onClose={onClose}
        onBack={() => {
          addChargeState?.reset();
          setShowAddCharge(false);
        }}
        addChargeState={addChargeState}
        onAddCharge={onAddCharge}
      />
    );
  }

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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Actions</h3>
          <div className="flex gap-2">
            {addChargeAction?.supported && addChargeAction.enabled && (
              <Button type="button" size="sm" onClick={() => setShowAddCharge(true)}>
                Add charge
              </Button>
            )}
            {checkoutAction?.supported && checkoutAction.enabled && (
              <Button type="button" size="sm" onClick={onOpenCheckout}>
                Checkout
              </Button>
            )}
          </div>
        </div>
        <ul className="flex flex-col gap-1 text-sm">
          {detail.actions.map((action) => (
            <li key={action.id}>
              {action.label}: {getActionCopy(action)}
            </li>
          ))}
        </ul>
      </div>
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

function AddChargeFormView({
  branchId,
  detail,
  onClose,
  onBack,
  addChargeState,
  onAddCharge,
}: {
  branchId: string;
  detail: VisitDetail;
  onClose: () => void;
  onBack: () => void;
  addChargeState?: AddChargeState;
  onAddCharge?: (input: AddChargeInput) => void;
}) {
  const [chargeType, setChargeType] = useState<string>("product");
  const [label, setLabel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [amountCents, setAmountCents] = useState(0);
  const [billingResp, setBillingResp] = useState(detail.billing.responsibility.value);
  const [reason, setReason] = useState("");

  const requiresReason = ["discount", "complimentary", "adjustment"].includes(chargeType);
  const isSuccess = addChargeState?.data?.chargeId;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!onAddCharge) return;
    onAddCharge({
      branchId,
      targetType: "visit",
      targetId: detail.visit.id,
      type: chargeType as AddChargeInput["type"],
      label,
      quantity,
      amountCents,
      currency: "EGP",
      billingResponsibility: billingResp as AddChargeInput["billingResponsibility"],
      reason: requiresReason ? reason : undefined,
    });
  }

  if (isSuccess) {
    return (
      <aside
        className="fixed inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
        aria-label="Add charge drawer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Add charge</p>
            <h2 className="text-xl font-semibold">{detail.identity.person.displayName}</h2>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Charge added</CardTitle>
            <CardDescription>
              {label} — {formatMoney(amountCents * quantity)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm">The charge has been added successfully.</p>
            <Button type="button" onClick={onBack}>
              Add another
            </Button>
          </CardContent>
        </Card>
      </aside>
    );
  }

  return (
    <aside
      className="fixed inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
      aria-label="Add charge drawer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Add charge</p>
          <h2 className="text-xl font-semibold">{detail.identity.person.displayName}</h2>
          <p className="text-sm text-muted-foreground">
            Target: Visit · {detail.billing.responsibility.label}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {addChargeState?.error && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{addChargeState.error.message}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="charge-type">Type</Label>
          <select
            id="charge-type"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={chargeType}
            onChange={(e) => setChargeType(e.target.value)}
          >
            {CHARGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="charge-label">Label</Label>
          <Input
            id="charge-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Bottled Water"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="charge-quantity">Qty</Label>
            <Input
              id="charge-quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="charge-amount">Amount (cents)</Label>
            <Input
              id="charge-amount"
              type="number"
              min={0}
              value={amountCents}
              onChange={(e) => setAmountCents(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            Total: {formatMoney(amountCents * quantity)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="charge-billing">Billing responsibility</Label>
          <select
            id="charge-billing"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={billingResp}
            onChange={(e) => setBillingResp(e.target.value)}
          >
            {BILLING_RESPONSIBILITIES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {requiresReason && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="charge-reason">Reason</Label>
            <Input
              id="charge-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Required for discounts, comps, adjustments"
              required
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={addChargeState?.isPending}>
            {addChargeState?.isPending ? "Adding..." : "Add charge"}
          </Button>
        </div>
      </form>
    </aside>
  );
}

function formatMoney(cents: number): string {
  return `${(cents / 100).toFixed(2)} EGP`;
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
