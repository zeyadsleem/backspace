import { describe, expect, it } from "vitest";

import {
  canCancelVisit,
  canCheckOutVisit,
  isBillableResponsibility,
  isNonNegativeAmount,
  isPositiveAmount,
  isValidCurrency,
  sessionStatusIsActive,
  sessionStatusIsCancelled,
  sessionStatusIsEnded,
  visitStatusIsActive,
  visitStatusIsCancelled,
  visitStatusIsCheckedOut,
} from "./domain";

describe("visit status helpers", () => {
  it("visitStatusIsActive returns true for active", () => {
    expect(visitStatusIsActive("active")).toBe(true);
  });

  it("visitStatusIsActive returns false for checked_out", () => {
    expect(visitStatusIsActive("checked_out")).toBe(false);
  });

  it("visitStatusIsCheckedOut returns true for checked_out", () => {
    expect(visitStatusIsCheckedOut("checked_out")).toBe(true);
  });

  it("visitStatusIsCancelled returns true for cancelled", () => {
    expect(visitStatusIsCancelled("cancelled")).toBe(true);
  });

  it("canCheckOutVisit returns true for active visits", () => {
    expect(canCheckOutVisit("active")).toBe(true);
  });

  it("canCheckOutVisit returns false for checked_out visits", () => {
    expect(canCheckOutVisit("checked_out")).toBe(false);
  });

  it("canCancelVisit returns true for active visits", () => {
    expect(canCancelVisit("active")).toBe(true);
  });

  it("canCancelVisit returns false for cancelled visits", () => {
    expect(canCancelVisit("cancelled")).toBe(false);
  });
});

describe("session status helpers", () => {
  it("sessionStatusIsActive returns true for active", () => {
    expect(sessionStatusIsActive("active")).toBe(true);
  });

  it("sessionStatusIsEnded returns true for ended", () => {
    expect(sessionStatusIsEnded("ended")).toBe(true);
  });

  it("sessionStatusIsCancelled returns true for cancelled", () => {
    expect(sessionStatusIsCancelled("cancelled")).toBe(true);
  });
});

describe("billing helpers", () => {
  it("isBillableResponsibility returns true for billable responsibilities", () => {
    expect(isBillableResponsibility("visitor")).toBe(true);
    expect(isBillableResponsibility("host")).toBe(true);
  });

  it("isBillableResponsibility returns false for non-billable", () => {
    expect(isBillableResponsibility("complimentary")).toBe(false);
    expect(isBillableResponsibility("pay_later")).toBe(false);
  });
});

describe("amount validation", () => {
  it("isPositiveAmount returns true for positive integers", () => {
    expect(isPositiveAmount(1)).toBe(true);
    expect(isPositiveAmount(100)).toBe(true);
  });

  it("isPositiveAmount returns false for zero or negative", () => {
    expect(isPositiveAmount(0)).toBe(false);
    expect(isPositiveAmount(-1)).toBe(false);
  });

  it("isNonNegativeAmount returns true for zero or positive", () => {
    expect(isNonNegativeAmount(0)).toBe(true);
    expect(isNonNegativeAmount(100)).toBe(true);
  });

  it("isNonNegativeAmount returns false for negative", () => {
    expect(isNonNegativeAmount(-1)).toBe(false);
  });
});

describe("currency validation", () => {
  it("isValidCurrency returns true for EGP", () => {
    expect(isValidCurrency("EGP")).toBe(true);
  });

  it("isValidCurrency returns true for USD", () => {
    expect(isValidCurrency("USD")).toBe(true);
  });

  it("isValidCurrency returns false for invalid currencies", () => {
    expect(isValidCurrency("EUR")).toBe(false);
    expect(isValidCurrency("")).toBe(false);
  });
});
