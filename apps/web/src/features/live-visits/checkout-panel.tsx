import { Badge } from "@backspace/ui/components/badge";
import { Button } from "@backspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@backspace/ui/components/card";

export type CheckoutPreviewResult = {
  visitId: string;
  branchId: string;
  personId: string;
  visitType: string;
  billingResponsibility: string;
  activeSessions: { id: string; spaceId: string; startedAt: string }[];
  lineItems: {
    chargeId: string;
    label: string;
    type: string;
    quantity: number;
    amountCents: number;
    signedAmountCents: number;
    billingResponsibility: string;
    currency: string;
  }[];
  responsibilityGroups: {
    responsibility: string;
    label: string;
    subtotalCents: number;
    discountCents: number;
    taxCents: number;
    totalCents: number;
    outcome: "payable" | "included" | "complimentary" | "pay_later" | "host_account";
    billToPersonId: string | null;
    billToAccountId: string | null;
  }[];
  totals: {
    subtotalCents: number;
    discountCents: number;
    taxCents: number;
    totalCents: number;
    currency: string;
    amountDueNowCents: number;
    payLaterCents: number;
    includedCents: number;
    complimentaryCents: number;
  };
  warnings: string[];
  blockers: string[];
};

export type CheckoutFinalizeResult = {
  visitId: string;
  invoiceIds: string[];
  paymentIds: string[];
  endedSessionIds: string[];
  spaceIds: string[];
};

export type CheckoutState = {
  preview: CheckoutPreviewResult | null;
  isPreviewLoading: boolean;
  previewError: string | null;
  isFinalizing: boolean;
  finalizeError: string | null;
  finalizeResult: CheckoutFinalizeResult | null;
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card_terminal", label: "Card Terminal" },
  { value: "wallet", label: "Wallet" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "instapay", label: "InstaPay" },
  { value: "pay_later", label: "Pay Later" },
  { value: "host_account", label: "Host Account" },
  { value: "included", label: "Included" },
  { value: "complimentary", label: "Complimentary" },
] as const;

function fmt(cents: number): string {
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  const sign = cents < 0 ? "-" : "";
  return `${sign}${whole}.${frac.toString().padStart(2, "0")} EGP`;
}

function outcomeBadge(outcome: string): {
  label: string;
  tone: "default" | "secondary" | "outline" | "destructive";
} {
  switch (outcome) {
    case "payable":
    case "host_account":
      return { label: "Payable", tone: "default" };
    case "included":
      return { label: "Included", tone: "secondary" };
    case "complimentary":
      return { label: "Complimentary", tone: "outline" };
    case "pay_later":
      return { label: "Pay Later", tone: "destructive" };
    default:
      return { label: outcome, tone: "outline" };
  }
}

export function CheckoutPanel({
  personName,
  checkoutState,
  selectedMethod,
  onSelectMethod,
  onFinalize,
  onClose,
}: {
  personName: string;
  checkoutState: CheckoutState;
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  onFinalize: () => void;
  onClose: () => void;
}) {
  const { preview, isPreviewLoading, previewError, isFinalizing, finalizeError, finalizeResult } =
    checkoutState;

  if (finalizeResult) {
    return (
      <aside
        className="fixed inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
        aria-label="Checkout result"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Checkout complete</p>
            <h2 className="text-xl font-semibold">{personName}</h2>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Checkout finalized</CardTitle>
            <CardDescription>Visit checked out successfully.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {finalizeResult.invoiceIds.length > 0 && (
              <p>Invoices created: {finalizeResult.invoiceIds.length}</p>
            )}
            {finalizeResult.paymentIds.length > 0 && (
              <p>Payments recorded: {finalizeResult.paymentIds.length}</p>
            )}
            {finalizeResult.endedSessionIds.length > 0 && (
              <p>Sessions ended: {finalizeResult.endedSessionIds.length}</p>
            )}
          </CardContent>
        </Card>
      </aside>
    );
  }

  if (isPreviewLoading) {
    return (
      <aside
        className="fixed inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
        aria-label="Loading checkout preview"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Checkout</p>
            <h2 className="text-xl font-semibold">{personName}</h2>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Loading checkout preview…</p>
      </aside>
    );
  }

  if (previewError) {
    return (
      <aside
        className="fixed inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
        aria-label="Checkout error"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Checkout</p>
            <h2 className="text-xl font-semibold">{personName}</h2>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Could not load checkout preview</CardTitle>
            <CardDescription>{previewError}</CardDescription>
          </CardHeader>
        </Card>
      </aside>
    );
  }

  if (!preview) {
    return null;
  }

  const needsPayment = preview.totals.amountDueNowCents > 0;
  const isZeroDue = preview.totals.totalCents === 0;
  const hasSessions = preview.activeSessions.length > 0;

  return (
    <aside
      className="fixed inset-y-0 right-0 flex w-full max-w-xl flex-col gap-4 overflow-auto border-l bg-background p-6 shadow-xl"
      aria-label="Checkout preview"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Checkout preview</p>
          <h2 className="text-xl font-semibold">{personName}</h2>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {preview.warnings.map((w) => (
        <Card key={w}>
          <CardContent className="p-4 text-sm text-muted-foreground">{w}</CardContent>
        </Card>
      ))}

      {preview.blockers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blockers</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm text-destructive">
            {preview.blockers.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>
            {hasSessions
              ? `${preview.activeSessions.length} active session(s)`
              : "No active sessions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {preview.lineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No charges for this visit.</p>
          ) : (
            preview.lineItems.map((item) => (
              <div key={item.chargeId} className="flex items-center justify-between text-sm">
                <span>
                  {item.label}
                  {item.quantity > 1 ? ` (x${item.quantity})` : ""}
                </span>
                <span className="font-medium">{fmt(item.signedAmountCents)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsibility split</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {preview.responsibilityGroups.map((group) => (
            <div key={group.responsibility} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{group.label}</span>
                <Badge variant={outcomeBadge(group.outcome).tone}>
                  {outcomeBadge(group.outcome).label}
                </Badge>
              </div>
              <span className="font-medium">{fmt(group.totalCents)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{fmt(preview.totals.subtotalCents)}</span>
          </div>
          {preview.totals.discountCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Discount</span>
              <span>-{fmt(preview.totals.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span>Total due</span>
            <span>{fmt(preview.totals.totalCents)}</span>
          </div>
          {preview.totals.amountDueNowCents > 0 && (
            <div className="flex justify-between text-primary">
              <span>Due now</span>
              <span>{fmt(preview.totals.amountDueNowCents)}</span>
            </div>
          )}
          {preview.totals.payLaterCents > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Pay later</span>
              <span>{fmt(preview.totals.payLaterCents)}</span>
            </div>
          )}
          {preview.totals.includedCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Included</span>
              <span>{fmt(preview.totals.includedCents)}</span>
            </div>
          )}
          {preview.totals.complimentaryCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Complimentary</span>
              <span>{fmt(preview.totals.complimentaryCents)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {needsPayment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="payment-method" className="text-sm">
                Payment method
              </label>
              <select
                id="payment-method"
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedMethod}
                onChange={(e) => onSelectMethod(e.target.value)}
              >
                <option value="">Select method</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {finalizeError && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{finalizeError}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onFinalize}
          disabled={
            isFinalizing || preview.blockers.length > 0 || (needsPayment && !selectedMethod)
          }
        >
          {isFinalizing
            ? "Finalizing…"
            : isZeroDue
              ? "Complete checkout"
              : `Finalize — ${fmt(preview.totals.amountDueNowCents)}`}
        </Button>
      </div>
    </aside>
  );
}
