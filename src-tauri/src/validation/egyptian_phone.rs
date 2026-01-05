//! Egyptian Phone Number Validation
//!
//! Egyptian mobile numbers follow this format:
//! - Country code: +20 (optional)
//! - Leading zero: 0 (optional if +20 is present)
//! - Carrier prefix: 10, 11, 12, or 15
//!   - 010: Vodafone
//!   - 011: Etisalat
//!   - 012: Orange
//!   - 015: WE (Telecom Egypt)
//! - Subscriber number: 8 digits

use regex::Regex;
use once_cell::sync::Lazy;

/// Regex for Egyptian mobile numbers
static EGYPTIAN_MOBILE_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^(\+20|0)?1[0125]\d{8}$").unwrap()
});

/// Regex for Egyptian landline numbers
static EGYPTIAN_LANDLINE_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^(\+20|0)?[2-9]\d{8,9}$").unwrap()
});

/// Phone validation result
#[derive(Debug, Clone)]
pub struct PhoneValidationResult {
    pub is_valid: bool,
    pub normalized: Option<String>,
    pub carrier: Option<String>,
    pub phone_type: Option<PhoneType>,
    pub error: Option<String>,
    pub error_ar: Option<String>,
}

/// Phone type
#[derive(Debug, Clone, PartialEq)]
pub enum PhoneType {
    Mobile,
    Landline,
}

/// Get carrier name from phone prefix
fn get_carrier(phone: &str) -> Option<String> {
    let normalized = normalize_phone(phone);
    
    // Extract the carrier digit (position after country code)
    let carrier_digit = if normalized.starts_with("+20") {
        normalized.chars().nth(4)
    } else if normalized.starts_with("0") {
        normalized.chars().nth(2)
    } else {
        normalized.chars().nth(1)
    };
    
    match carrier_digit {
        Some('0') => Some("Vodafone".to_string()),
        Some('1') => Some("Etisalat".to_string()),
        Some('2') => Some("Orange".to_string()),
        Some('5') => Some("WE".to_string()),
        _ => None,
    }
}

/// Normalize phone number by removing spaces, dashes, and parentheses
pub fn normalize_phone(phone: &str) -> String {
    phone.chars()
        .filter(|c| !c.is_whitespace() && *c != '-' && *c != '(' && *c != ')')
        .collect()
}

/// Validate Egyptian phone number
pub fn validate_egyptian_phone(phone: &str) -> PhoneValidationResult {
    if phone.trim().is_empty() {
        return PhoneValidationResult {
            is_valid: false,
            normalized: None,
            carrier: None,
            phone_type: None,
            error: Some("Phone number is required".to_string()),
            error_ar: Some("رقم الهاتف مطلوب".to_string()),
        };
    }

    let normalized = normalize_phone(phone);

    // Check if it's a valid mobile number
    if EGYPTIAN_MOBILE_REGEX.is_match(&normalized) {
        // Normalize to +20 format
        let full_number = if normalized.starts_with("0") {
            format!("+20{}", &normalized[1..])
        } else if !normalized.starts_with("+20") {
            format!("+20{}", normalized)
        } else {
            normalized.clone()
        };

        return PhoneValidationResult {
            is_valid: true,
            normalized: Some(full_number),
            carrier: get_carrier(&normalized),
            phone_type: Some(PhoneType::Mobile),
            error: None,
            error_ar: None,
        };
    }

    // Check if it's a valid landline
    if EGYPTIAN_LANDLINE_REGEX.is_match(&normalized) {
        let full_number = if normalized.starts_with("0") {
            format!("+20{}", &normalized[1..])
        } else if !normalized.starts_with("+20") {
            format!("+20{}", normalized)
        } else {
            normalized.clone()
        };

        return PhoneValidationResult {
            is_valid: true,
            normalized: Some(full_number),
            carrier: None,
            phone_type: Some(PhoneType::Landline),
            error: None,
            error_ar: None,
        };
    }

    // Invalid format
    PhoneValidationResult {
        is_valid: false,
        normalized: None,
        carrier: None,
        phone_type: None,
        error: Some("Invalid Egyptian phone number. Must start with 010, 011, 012, or 015".to_string()),
        error_ar: Some("رقم هاتف مصري غير صالح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015".to_string()),
    }
}

/// Check if phone is valid Egyptian number (simple boolean check)
pub fn is_valid_egyptian_phone(phone: &str) -> bool {
    validate_egyptian_phone(phone).is_valid
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_vodafone() {
        let result = validate_egyptian_phone("01012345678");
        assert!(result.is_valid);
        assert_eq!(result.carrier, Some("Vodafone".to_string()));
        assert_eq!(result.normalized, Some("+201012345678".to_string()));
    }

    #[test]
    fn test_valid_etisalat() {
        let result = validate_egyptian_phone("01112345678");
        assert!(result.is_valid);
        assert_eq!(result.carrier, Some("Etisalat".to_string()));
    }

    #[test]
    fn test_valid_orange() {
        let result = validate_egyptian_phone("01212345678");
        assert!(result.is_valid);
        assert_eq!(result.carrier, Some("Orange".to_string()));
    }

    #[test]
    fn test_valid_we() {
        let result = validate_egyptian_phone("01512345678");
        assert!(result.is_valid);
        assert_eq!(result.carrier, Some("WE".to_string()));
    }

    #[test]
    fn test_valid_with_country_code() {
        let result = validate_egyptian_phone("+201012345678");
        assert!(result.is_valid);
        assert_eq!(result.normalized, Some("+201012345678".to_string()));
    }

    #[test]
    fn test_invalid_prefix() {
        let result = validate_egyptian_phone("01312345678");
        assert!(!result.is_valid);
    }

    #[test]
    fn test_invalid_length() {
        let result = validate_egyptian_phone("0101234567");
        assert!(!result.is_valid);
    }

    #[test]
    fn test_empty() {
        let result = validate_egyptian_phone("");
        assert!(!result.is_valid);
    }
}
