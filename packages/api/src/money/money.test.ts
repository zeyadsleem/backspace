import { describe, expect, it } from "vitest";

import {
  add,
  compare,
  createMoney,
  format,
  isNegative,
  isPositive,
  isZero,
  multiply,
  negate,
  subtract,
  sum,
} from "./money";

describe("createMoney", () => {
  it("creates money with integer amount and default currency", () => {
    const m = createMoney(100);
    expect(m.amountMinor).toBe(100);
    expect(m.currency).toBe("EGP");
  });

  it("creates money with custom currency", () => {
    const m = createMoney(500, "USD");
    expect(m.amountMinor).toBe(500);
    expect(m.currency).toBe("USD");
  });

  it("creates money with zero", () => {
    const m = createMoney(0);
    expect(m.amountMinor).toBe(0);
  });

  it("creates money with negative amount", () => {
    const m = createMoney(-100);
    expect(m.amountMinor).toBe(-100);
  });

  it("throws for non-integer amount", () => {
    expect(() => createMoney(10.5)).toThrow("Money amount must be an integer");
  });
});

describe("add", () => {
  it("adds two same-currency money amounts", () => {
    const result = add(createMoney(100), createMoney(200));
    expect(result).toEqual({ amountMinor: 300, currency: "EGP" });
  });

  it("adds resulting in negative", () => {
    const result = add(createMoney(-50), createMoney(20));
    expect(result).toEqual({ amountMinor: -30, currency: "EGP" });
  });

  it("throws when currencies differ", () => {
    expect(() => add(createMoney(100, "EGP"), createMoney(100, "USD"))).toThrow(
      "Currency mismatch",
    );
  });
});

describe("subtract", () => {
  it("subtracts two same-currency money amounts", () => {
    const result = subtract(createMoney(300), createMoney(100));
    expect(result).toEqual({ amountMinor: 200, currency: "EGP" });
  });

  it("subtracts resulting in zero", () => {
    const result = subtract(createMoney(100), createMoney(100));
    expect(result).toEqual({ amountMinor: 0, currency: "EGP" });
  });

  it("throws when currencies differ", () => {
    expect(() => subtract(createMoney(100, "EGP"), createMoney(50, "USD"))).toThrow(
      "Currency mismatch",
    );
  });
});

describe("multiply", () => {
  it("multiplies money by an integer", () => {
    const result = multiply(createMoney(150), 3);
    expect(result).toEqual({ amountMinor: 450, currency: "EGP" });
  });

  it("multiplies money by zero", () => {
    const result = multiply(createMoney(100), 0);
    expect(result).toEqual({ amountMinor: 0, currency: "EGP" });
  });

  it("multiplies money by a decimal and rounds", () => {
    const result = multiply(createMoney(100), 0.5);
    expect(result).toEqual({ amountMinor: 50, currency: "EGP" });
  });

  it("multiplies money by a fractional multiplier and rounds", () => {
    const result = multiply(createMoney(10), 0.33);
    expect(result).toEqual({ amountMinor: 3, currency: "EGP" });
  });

  it("multiplies by negative multiplier", () => {
    const result = multiply(createMoney(100), -1);
    expect(result).toEqual({ amountMinor: -100, currency: "EGP" });
  });
});

describe("negate", () => {
  it("negates positive money", () => {
    expect(negate(createMoney(100))).toEqual({ amountMinor: -100, currency: "EGP" });
  });

  it("negates negative money", () => {
    expect(negate(createMoney(-100))).toEqual({ amountMinor: 100, currency: "EGP" });
  });

  it("negates zero money", () => {
    expect(negate(createMoney(0))).toEqual({ amountMinor: 0, currency: "EGP" });
  });
});

describe("isZero", () => {
  it("returns true for zero amount", () => {
    expect(isZero(createMoney(0))).toBe(true);
  });

  it("returns false for non-zero amount", () => {
    expect(isZero(createMoney(1))).toBe(false);
  });

  it("returns false for negative amount", () => {
    expect(isZero(createMoney(-1))).toBe(false);
  });
});

describe("isNegative", () => {
  it("returns true for negative amount", () => {
    expect(isNegative(createMoney(-1))).toBe(true);
  });

  it("returns false for positive amount", () => {
    expect(isNegative(createMoney(1))).toBe(false);
  });

  it("returns false for zero", () => {
    expect(isNegative(createMoney(0))).toBe(false);
  });
});

describe("isPositive", () => {
  it("returns true for positive amount", () => {
    expect(isPositive(createMoney(1))).toBe(true);
  });

  it("returns false for negative amount", () => {
    expect(isPositive(createMoney(-1))).toBe(false);
  });

  it("returns false for zero", () => {
    expect(isPositive(createMoney(0))).toBe(false);
  });
});

describe("compare", () => {
  it("returns 0 for equal amounts", () => {
    expect(compare(createMoney(100), createMoney(100))).toBe(0);
  });

  it("returns -1 when a < b", () => {
    expect(compare(createMoney(50), createMoney(100))).toBe(-1);
  });

  it("returns 1 when a > b", () => {
    expect(compare(createMoney(100), createMoney(50))).toBe(1);
  });

  it("returns -1 when a is negative and b is positive", () => {
    expect(compare(createMoney(-10), createMoney(5))).toBe(-1);
  });

  it("throws when currencies differ", () => {
    expect(() => compare(createMoney(100, "EGP"), createMoney(100, "USD"))).toThrow(
      "Currency mismatch",
    );
  });
});

describe("sum", () => {
  it("sums multiple same-currency amounts", () => {
    const result = sum([createMoney(100), createMoney(200), createMoney(50)]);
    expect(result).toEqual({ amountMinor: 350, currency: "EGP" });
  });

  it("sums a single item", () => {
    const result = sum([createMoney(100)]);
    expect(result).toEqual({ amountMinor: 100, currency: "EGP" });
  });

  it("sums including negative amounts", () => {
    const result = sum([createMoney(100), createMoney(-50), createMoney(25)]);
    expect(result).toEqual({ amountMinor: 75, currency: "EGP" });
  });

  it("throws for empty list", () => {
    expect(() => sum([])).toThrow("Cannot sum an empty list");
  });

  it("throws when currencies differ", () => {
    expect(() => sum([createMoney(100, "EGP"), createMoney(100, "USD")])).toThrow(
      "Currency mismatch",
    );
  });
});

describe("format", () => {
  it("formats a positive amount", () => {
    expect(format(createMoney(10050))).toBe("100.50 EGP");
  });

  it("formats a whole number without cents", () => {
    expect(format(createMoney(10000))).toBe("100.00 EGP");
  });

  it("formats zero", () => {
    expect(format(createMoney(0))).toBe("0.00 EGP");
  });

  it("formats a negative amount", () => {
    expect(format(createMoney(-50))).toBe("-0.50 EGP");
  });

  it("formats with custom currency", () => {
    expect(format(createMoney(2500, "USD"))).toBe("25.00 USD");
  });

  it("formats single digit cents", () => {
    expect(format(createMoney(105))).toBe("1.05 EGP");
  });
});
