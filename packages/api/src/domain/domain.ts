export type VisitStatus = "active" | "checked_out" | "cancelled";
export type SessionStatus = "active" | "ended" | "cancelled";
export type BillingResponsibility =
  | "visitor"
  | "host"
  | "company"
  | "event"
  | "subscription"
  | "complimentary"
  | "pay_later";
export type ChargeType =
  | "product"
  | "service"
  | "fee"
  | "discount"
  | "complimentary"
  | "adjustment";
export type InvoiceStatus = "draft" | "finalized" | "paid" | "void" | "partially_paid";
export type PaymentMethod =
  | "cash"
  | "card_terminal"
  | "wallet"
  | "bank_transfer"
  | "instapay"
  | "mixed"
  | "pay_later"
  | "host_account"
  | "included"
  | "complimentary";
export type Currency = "EGP" | "USD";

const ACCEPTED_CURRENCIES: Currency[] = ["EGP", "USD"];

const BILLABLE_RESPONSIBILITIES: BillingResponsibility[] = [
  "visitor",
  "host",
  "company",
  "event",
  "subscription",
];

const ACTIVE_STATUS: VisitStatus = "active";
const CHECKED_OUT_STATUS: VisitStatus = "checked_out";
const CANCELLED_STATUS: VisitStatus = "cancelled";

export const VISIT_STATUS = {
  ACTIVE: ACTIVE_STATUS,
  CHECKED_OUT: CHECKED_OUT_STATUS,
  CANCELLED: CANCELLED_STATUS,
} as const;

export const SESSION_STATUS = {
  ACTIVE: "active" as SessionStatus,
  ENDED: "ended" as SessionStatus,
  CANCELLED: "cancelled" as SessionStatus,
} as const;

export const BILLING_RESPONSIBILITY = {
  VISITOR: "visitor" as BillingResponsibility,
  HOST: "host" as BillingResponsibility,
  COMPANY: "company" as BillingResponsibility,
  EVENT: "event" as BillingResponsibility,
  SUBSCRIPTION: "subscription" as BillingResponsibility,
  COMPLIMENTARY: "complimentary" as BillingResponsibility,
  PAY_LATER: "pay_later" as BillingResponsibility,
} as const;

export function visitStatusIsActive(status: string): status is VisitStatus {
  return status === VISIT_STATUS.ACTIVE;
}

export function visitStatusIsCheckedOut(status: string): status is VisitStatus {
  return status === VISIT_STATUS.CHECKED_OUT;
}

export function visitStatusIsCancelled(status: string): status is VisitStatus {
  return status === VISIT_STATUS.CANCELLED;
}

export function canCheckOutVisit(status: string): boolean {
  return status === VISIT_STATUS.ACTIVE;
}

export function canCancelVisit(status: string): boolean {
  return status === VISIT_STATUS.ACTIVE;
}

export function sessionStatusIsActive(status: string): status is SessionStatus {
  return status === SESSION_STATUS.ACTIVE;
}

export function sessionStatusIsEnded(status: string): status is SessionStatus {
  return status === SESSION_STATUS.ENDED;
}

export function sessionStatusIsCancelled(status: string): status is SessionStatus {
  return status === SESSION_STATUS.CANCELLED;
}

export function isBillableResponsibility(responsibility: string): boolean {
  return (BILLABLE_RESPONSIBILITIES as readonly string[]).includes(responsibility);
}

export function isPositiveAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0;
}

export function isNonNegativeAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 0;
}

export function isValidCurrency(currency: string): currency is Currency {
  return (ACCEPTED_CURRENCIES as readonly string[]).includes(currency);
}
