const DEFAULT_CURRENCY = "EGP";

export interface Money {
  amountMinor: number;
  currency: string;
}

export function createMoney(amountMinor: number, currency = DEFAULT_CURRENCY): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("Money amount must be an integer (minor units)");
  }
  return { amountMinor, currency };
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return createMoney(a.amountMinor + b.amountMinor, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return createMoney(a.amountMinor - b.amountMinor, a.currency);
}

export function multiply(a: Money, amount: number): Money {
  return createMoney(Math.round(a.amountMinor * amount), a.currency);
}

export function negate(a: Money): Money {
  const result = -a.amountMinor;
  return createMoney(result === 0 ? 0 : result, a.currency);
}

export function isZero(a: Money): boolean {
  return a.amountMinor === 0;
}

export function isNegative(a: Money): boolean {
  return a.amountMinor < 0;
}

export function isPositive(a: Money): boolean {
  return a.amountMinor > 0;
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  assertSameCurrency(a, b);
  if (a.amountMinor < b.amountMinor) return -1;
  if (a.amountMinor > b.amountMinor) return 1;
  return 0;
}

export function sum(items: Money[]): Money {
  if (items.length === 0) {
    throw new Error("Cannot sum an empty list");
  }
  const currency = items[0].currency;
  const total = items.reduce((acc, m) => {
    if (m.currency !== currency) {
      throw new Error(`Currency mismatch: ${m.currency} !== ${currency}`);
    }
    return acc + m.amountMinor;
  }, 0);
  return createMoney(total, currency);
}

export function format(a: Money): string {
  const abs = Math.abs(a.amountMinor);
  const whole = Math.floor(abs / 100);
  const fraction = abs % 100;
  const sign = a.amountMinor < 0 ? "-" : "";
  return `${sign}${whole}.${fraction.toString().padStart(2, "0")} ${a.currency}`;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} !== ${b.currency}`);
  }
}
