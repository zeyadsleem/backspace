/**
 * Egyptian Phone Number Validation
 *
 * Egyptian mobile numbers follow this format:
 * - Country code: +20 (optional)
 * - Leading zero: 0 (optional if +20 is present)
 * - Carrier prefix: 10, 11, 12, or 15
 *   - 010: Vodafone
 *   - 011: Etisalat
 *   - 012: Orange
 *   - 015: WE (Telecom Egypt)
 * - Subscriber number: 8 digits
 *
 * Valid formats:
 * - +201012345678
 * - +20 10 1234 5678
 * - 01012345678
 * - 010 1234 5678
 */

// Strict regex for Egyptian mobile numbers
const EGYPTIAN_MOBILE_REGEX = /^(\+20|0)?1[0125]\d{8}$/;

// Egyptian landline regex (Cairo: 02, Alexandria: 03, etc.)
const EGYPTIAN_LANDLINE_REGEX = /^(\+20|0)?[2-9]\d{8,9}$/;

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string | null;
  carrier: string | null;
  type: "mobile" | "landline" | null;
  error: string | null;
}

/**
 * Normalize phone number by removing spaces, dashes, and parentheses
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

/**
 * Get carrier name from Egyptian mobile prefix
 */
export function getCarrier(phone: string): string | null {
  const normalized = normalizePhone(phone);

  // Match the carrier prefix (position 2-3 after leading 0 or +20)
  let prefix: string | null = null;

  if (normalized.startsWith("+20")) {
    prefix = normalized.substring(3, 5);
  } else if (normalized.startsWith("0")) {
    prefix = normalized.substring(1, 3);
  } else {
    prefix = normalized.substring(0, 2);
  }

  // Only valid Egyptian mobile prefixes
  switch (prefix) {
    case "10":
      return "Vodafone";
    case "11":
      return "Etisalat";
    case "12":
      return "Orange";
    case "15":
      return "WE";
    default:
      return null;
  }
}

/**
 * Validate Egyptian phone number
 */
export function validateEgyptianPhone(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      normalized: null,
      carrier: null,
      type: null,
      error: "رقم الهاتف مطلوب | Phone number is required",
    };
  }

  const normalized = normalizePhone(phone);

  // Check if it's a valid mobile number
  if (EGYPTIAN_MOBILE_REGEX.test(normalized)) {
    // Normalize to +20 format
    let fullNumber = normalized;
    if (normalized.startsWith("0")) {
      fullNumber = "+20" + normalized.slice(1);
    } else if (!normalized.startsWith("+20")) {
      fullNumber = "+20" + normalized;
    }

    return {
      isValid: true,
      normalized: fullNumber,
      carrier: getCarrier(normalized),
      type: "mobile",
      error: null,
    };
  }

  // Check if it's a valid landline
  if (EGYPTIAN_LANDLINE_REGEX.test(normalized)) {
    let fullNumber = normalized;
    if (normalized.startsWith("0")) {
      fullNumber = "+20" + normalized.slice(1);
    } else if (!normalized.startsWith("+20")) {
      fullNumber = "+20" + normalized;
    }

    return {
      isValid: true,
      normalized: fullNumber,
      carrier: null,
      type: "landline",
      error: null,
    };
  }

  // Invalid format
  return {
    isValid: false,
    normalized: null,
    carrier: null,
    type: null,
    error:
      "رقم هاتف مصري غير صالح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 | Invalid Egyptian phone number. Must start with 010, 011, 012, or 015",
  };
}

/**
 * Check if phone is valid Egyptian number (simple boolean check)
 */
export function isValidEgyptianPhone(phone: string): boolean {
  return validateEgyptianPhone(phone).isValid;
}

/**
 * Format phone number for display
 */
export function formatEgyptianPhone(phone: string): string {
  const result = validateEgyptianPhone(phone);
  if (!result.isValid || !result.normalized) return phone;

  // Format as +20 XX XXXX XXXX
  const num = result.normalized.replace("+20", "");
  if (num.length === 10) {
    return `+20 ${num.slice(0, 2)} ${num.slice(2, 6)} ${num.slice(6)}`;
  }
  return result.normalized;
}
