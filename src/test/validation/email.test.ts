/**
 * Email Validation Tests
 */

import { describe, it, expect } from "vitest";
import {
  validateEmail,
  isValidEmail,
  normalizeEmail,
  getEmailDomain,
  isDisposableEmail,
} from "@/lib/validation/validators/email";
import { VALID_EMAILS, INVALID_EMAILS } from "../mocks/customers";

describe("Email Validation", () => {
  describe("validateEmail", () => {
    describe("valid emails", () => {
      it("should validate simple email", () => {
        const result = validateEmail(VALID_EMAILS.simple);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBe("test@example.com");
        expect(result.domain).toBe("example.com");
      });

      it("should validate email with subdomain", () => {
        const result = validateEmail(VALID_EMAILS.withSubdomain);
        expect(result.isValid).toBe(true);
        expect(result.domain).toBe("mail.example.com");
      });

      it("should validate email with plus sign", () => {
        const result = validateEmail(VALID_EMAILS.withPlus);
        expect(result.isValid).toBe(true);
      });

      it("should accept empty email (optional field)", () => {
        const result = validateEmail("");
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBeNull();
      });

      it("should normalize to lowercase", () => {
        const result = validateEmail("TEST@EXAMPLE.COM");
        expect(result.normalized).toBe("test@example.com");
      });
    });

    describe("invalid emails", () => {
      it("should reject email without @", () => {
        const result = validateEmail(INVALID_EMAILS.noAt);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("format");
      });

      it("should reject email without domain", () => {
        const result = validateEmail(INVALID_EMAILS.noDomain);
        expect(result.isValid).toBe(false);
      });

      it("should reject email without TLD", () => {
        const result = validateEmail(INVALID_EMAILS.noTld);
        expect(result.isValid).toBe(false);
      });

      it("should reject email with consecutive dots", () => {
        const result = validateEmail(INVALID_EMAILS.consecutiveDots);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("dots");
      });

      it("should reject email that is too long", () => {
        const result = validateEmail(INVALID_EMAILS.tooLong);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("long");
      });
    });

    describe("disposable emails", () => {
      it("should detect disposable email", () => {
        const result = validateEmail("test@mailinator.com");
        expect(result.isValid).toBe(true);
        expect(result.isDisposable).toBe(true);
      });

      it("should not flag regular email as disposable", () => {
        const result = validateEmail("test@gmail.com");
        expect(result.isDisposable).toBe(false);
      });
    });
  });

  describe("isValidEmail", () => {
    it("should return true for valid email", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("should return false for invalid email", () => {
      expect(isValidEmail("invalid")).toBe(false);
    });

    it("should return true for empty (optional)", () => {
      expect(isValidEmail("")).toBe(true);
    });
  });

  describe("normalizeEmail", () => {
    it("should trim whitespace", () => {
      expect(normalizeEmail("  test@example.com  ")).toBe("test@example.com");
    });

    it("should convert to lowercase", () => {
      expect(normalizeEmail("TEST@EXAMPLE.COM")).toBe("test@example.com");
    });
  });

  describe("getEmailDomain", () => {
    it("should extract domain", () => {
      expect(getEmailDomain("test@example.com")).toBe("example.com");
    });

    it("should return null for invalid email", () => {
      expect(getEmailDomain("invalid")).toBeNull();
    });
  });

  describe("isDisposableEmail", () => {
    it("should detect known disposable domains", () => {
      expect(isDisposableEmail("test@mailinator.com")).toBe(true);
      expect(isDisposableEmail("test@tempmail.com")).toBe(true);
      expect(isDisposableEmail("test@yopmail.com")).toBe(true);
    });

    it("should not flag regular domains", () => {
      expect(isDisposableEmail("test@gmail.com")).toBe(false);
      expect(isDisposableEmail("test@outlook.com")).toBe(false);
    });
  });
});
