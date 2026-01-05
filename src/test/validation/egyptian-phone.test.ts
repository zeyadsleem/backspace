/**
 * Egyptian Phone Validation Tests
 */

import { describe, it, expect } from "vitest";
import {
  validateEgyptianPhone,
  isValidEgyptianPhone,
  normalizePhone,
  formatEgyptianPhone,
  getCarrier,
} from "@/lib/validation/validators/egyptian-phone";
import { VALID_PHONES, INVALID_PHONES } from "../mocks/customers";

describe("Egyptian Phone Validation", () => {
  describe("validateEgyptianPhone", () => {
    describe("valid numbers", () => {
      it("should validate Vodafone number (010)", () => {
        const result = validateEgyptianPhone(VALID_PHONES.vodafone);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe("Vodafone");
        expect(result.type).toBe("mobile");
        expect(result.normalized).toBe("+201012345678");
      });

      it("should validate Etisalat number (011)", () => {
        const result = validateEgyptianPhone(VALID_PHONES.etisalat);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe("Etisalat");
      });

      it("should validate Orange number (012)", () => {
        const result = validateEgyptianPhone(VALID_PHONES.orange);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe("Orange");
      });

      it("should validate WE number (015)", () => {
        const result = validateEgyptianPhone(VALID_PHONES.we);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe("WE");
      });

      it("should validate number with country code", () => {
        const result = validateEgyptianPhone(VALID_PHONES.withCountryCode);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe("+201012345678");
      });

      it("should validate number with spaces", () => {
        const result = validateEgyptianPhone(VALID_PHONES.withSpaces);
        expect(result.isValid).toBe(true);
      });
    });

    describe("invalid numbers", () => {
      it("should reject number that is too short", () => {
        const result = validateEgyptianPhone(INVALID_PHONES.tooShort);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it("should reject number that is too long", () => {
        const result = validateEgyptianPhone(INVALID_PHONES.tooLong);
        expect(result.isValid).toBe(false);
      });

      it("should reject number with wrong prefix (013)", () => {
        const result = validateEgyptianPhone(INVALID_PHONES.wrongPrefix);
        expect(result.isValid).toBe(false);
      });

      it("should reject non-Egyptian number", () => {
        const result = validateEgyptianPhone(INVALID_PHONES.nonEgyptian);
        expect(result.isValid).toBe(false);
      });

      it("should reject number with letters", () => {
        const result = validateEgyptianPhone(INVALID_PHONES.letters);
        expect(result.isValid).toBe(false);
      });

      it("should reject empty string", () => {
        const result = validateEgyptianPhone(INVALID_PHONES.empty);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("required");
      });
    });
  });

  describe("isValidEgyptianPhone", () => {
    it("should return true for valid number", () => {
      expect(isValidEgyptianPhone("01012345678")).toBe(true);
    });

    it("should return false for invalid number", () => {
      expect(isValidEgyptianPhone("01312345678")).toBe(false);
    });
  });

  describe("normalizePhone", () => {
    it("should remove spaces", () => {
      expect(normalizePhone("010 1234 5678")).toBe("01012345678");
    });

    it("should remove dashes", () => {
      expect(normalizePhone("010-1234-5678")).toBe("01012345678");
    });

    it("should remove parentheses", () => {
      expect(normalizePhone("(010) 12345678")).toBe("01012345678");
    });
  });

  describe("formatEgyptianPhone", () => {
    it("should format valid number", () => {
      const formatted = formatEgyptianPhone("01012345678");
      expect(formatted).toBe("+20 10 1234 5678");
    });

    it("should return original for invalid number", () => {
      const formatted = formatEgyptianPhone("invalid");
      expect(formatted).toBe("invalid");
    });
  });

  describe("getCarrier", () => {
    it("should identify Vodafone", () => {
      expect(getCarrier("01012345678")).toBe("Vodafone");
    });

    it("should identify Etisalat", () => {
      expect(getCarrier("01112345678")).toBe("Etisalat");
    });

    it("should identify Orange", () => {
      expect(getCarrier("01212345678")).toBe("Orange");
    });

    it("should identify WE", () => {
      expect(getCarrier("01512345678")).toBe("WE");
    });

    it("should return null for invalid prefix", () => {
      expect(getCarrier("01312345678")).toBeNull();
    });
  });
});
