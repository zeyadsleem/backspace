/**
 * Email Validation
 *
 * RFC 5322 compliant email validation with additional checks:
 * - Valid format
 * - No consecutive dots
 * - Valid TLD
 * - Reasonable length limits
 */

// RFC 5322 compliant email regex (simplified but robust)
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Common disposable email domains to warn about
const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "10minutemail.com",
  "mailinator.com",
  "yopmail.com",
  "temp-mail.org",
  "fakeinbox.com",
];

export interface EmailValidationResult {
  isValid: boolean;
  normalized: string | null;
  domain: string | null;
  isDisposable: boolean;
  error: string | null;
}

/**
 * Normalize email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string | null {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

/**
 * Check if email domain is disposable
 */
export function isDisposableEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  return domain ? DISPOSABLE_DOMAINS.includes(domain) : false;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): EmailValidationResult {
  // Empty is valid (email is optional in most cases)
  if (!email || email.trim() === "") {
    return {
      isValid: true,
      normalized: null,
      domain: null,
      isDisposable: false,
      error: null,
    };
  }

  const normalized = normalizeEmail(email);

  // Check length
  if (normalized.length > 254) {
    return {
      isValid: false,
      normalized: null,
      domain: null,
      isDisposable: false,
      error: "البريد الإلكتروني طويل جداً | Email is too long",
    };
  }

  // Check basic format
  if (!EMAIL_REGEX.test(normalized)) {
    return {
      isValid: false,
      normalized: null,
      domain: null,
      isDisposable: false,
      error: "صيغة البريد الإلكتروني غير صالحة | Invalid email format",
    };
  }

  // Check for consecutive dots
  if (normalized.includes("..")) {
    return {
      isValid: false,
      normalized: null,
      domain: null,
      isDisposable: false,
      error: "البريد الإلكتروني يحتوي على نقاط متتالية | Email contains consecutive dots",
    };
  }

  const domain = getEmailDomain(normalized);

  // Check domain has at least one dot (TLD)
  if (!domain || !domain.includes(".")) {
    return {
      isValid: false,
      normalized: null,
      domain: null,
      isDisposable: false,
      error: "نطاق البريد الإلكتروني غير صالح | Invalid email domain",
    };
  }

  // Check TLD length (must be at least 2 characters)
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      normalized: null,
      domain: null,
      isDisposable: false,
      error: "امتداد النطاق غير صالح | Invalid domain extension",
    };
  }

  return {
    isValid: true,
    normalized,
    domain,
    isDisposable: isDisposableEmail(normalized),
    error: null,
  };
}

/**
 * Check if email is valid (simple boolean check)
 */
export function isValidEmail(email: string): boolean {
  return validateEmail(email).isValid;
}

/**
 * Validate email and require it (not optional)
 */
export function validateRequiredEmail(email: string): EmailValidationResult {
  if (!email || email.trim() === "") {
    return {
      isValid: false,
      normalized: null,
      domain: null,
      isDisposable: false,
      error: "البريد الإلكتروني مطلوب | Email is required",
    };
  }
  return validateEmail(email);
}
