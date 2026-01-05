//! Email Validation
//!
//! RFC 5322 compliant email validation with additional checks.

use regex::Regex;
use once_cell::sync::Lazy;

/// RFC 5322 compliant email regex (simplified but robust)
static EMAIL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$").unwrap()
});

/// Common disposable email domains
const DISPOSABLE_DOMAINS: &[&str] = &[
    "tempmail.com",
    "throwaway.email",
    "guerrillamail.com",
    "10minutemail.com",
    "mailinator.com",
    "yopmail.com",
    "temp-mail.org",
    "fakeinbox.com",
];

/// Email validation result
#[derive(Debug, Clone)]
pub struct EmailValidationResult {
    pub is_valid: bool,
    pub normalized: Option<String>,
    pub domain: Option<String>,
    pub is_disposable: bool,
    pub error: Option<String>,
    pub error_ar: Option<String>,
}

/// Normalize email address
pub fn normalize_email(email: &str) -> String {
    email.trim().to_lowercase()
}

/// Extract domain from email
pub fn get_email_domain(email: &str) -> Option<String> {
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() == 2 {
        Some(parts[1].to_lowercase())
    } else {
        None
    }
}

/// Check if email domain is disposable
pub fn is_disposable_email(email: &str) -> bool {
    if let Some(domain) = get_email_domain(email) {
        DISPOSABLE_DOMAINS.contains(&domain.as_str())
    } else {
        false
    }
}

/// Validate email address
pub fn validate_email(email: &str) -> EmailValidationResult {
    // Empty is valid (email is optional in most cases)
    if email.trim().is_empty() {
        return EmailValidationResult {
            is_valid: true,
            normalized: None,
            domain: None,
            is_disposable: false,
            error: None,
            error_ar: None,
        };
    }

    let normalized = normalize_email(email);

    // Check length
    if normalized.len() > 254 {
        return EmailValidationResult {
            is_valid: false,
            normalized: None,
            domain: None,
            is_disposable: false,
            error: Some("Email is too long".to_string()),
            error_ar: Some("البريد الإلكتروني طويل جداً".to_string()),
        };
    }

    // Check basic format
    if !EMAIL_REGEX.is_match(&normalized) {
        return EmailValidationResult {
            is_valid: false,
            normalized: None,
            domain: None,
            is_disposable: false,
            error: Some("Invalid email format".to_string()),
            error_ar: Some("صيغة البريد الإلكتروني غير صالحة".to_string()),
        };
    }

    // Check for consecutive dots
    if normalized.contains("..") {
        return EmailValidationResult {
            is_valid: false,
            normalized: None,
            domain: None,
            is_disposable: false,
            error: Some("Email contains consecutive dots".to_string()),
            error_ar: Some("البريد الإلكتروني يحتوي على نقاط متتالية".to_string()),
        };
    }

    let domain = get_email_domain(&normalized);

    // Check domain has at least one dot (TLD)
    if let Some(ref d) = domain {
        if !d.contains('.') {
            return EmailValidationResult {
                is_valid: false,
                normalized: None,
                domain: None,
                is_disposable: false,
                error: Some("Invalid email domain".to_string()),
                error_ar: Some("نطاق البريد الإلكتروني غير صالح".to_string()),
            };
        }

        // Check TLD length
        if let Some(tld) = d.split('.').last() {
            if tld.len() < 2 {
                return EmailValidationResult {
                    is_valid: false,
                    normalized: None,
                    domain: None,
                    is_disposable: false,
                    error: Some("Invalid domain extension".to_string()),
                    error_ar: Some("امتداد النطاق غير صالح".to_string()),
                };
            }
        }
    }

    EmailValidationResult {
        is_valid: true,
        normalized: Some(normalized.clone()),
        domain,
        is_disposable: is_disposable_email(&normalized),
        error: None,
        error_ar: None,
    }
}

/// Check if email is valid (simple boolean check)
pub fn is_valid_email(email: &str) -> bool {
    validate_email(email).is_valid
}

/// Validate email and require it (not optional)
pub fn validate_required_email(email: &str) -> EmailValidationResult {
    if email.trim().is_empty() {
        return EmailValidationResult {
            is_valid: false,
            normalized: None,
            domain: None,
            is_disposable: false,
            error: Some("Email is required".to_string()),
            error_ar: Some("البريد الإلكتروني مطلوب".to_string()),
        };
    }
    validate_email(email)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_email() {
        let result = validate_email("test@example.com");
        assert!(result.is_valid);
        assert_eq!(result.normalized, Some("test@example.com".to_string()));
    }

    #[test]
    fn test_valid_email_with_subdomain() {
        let result = validate_email("test@mail.example.com");
        assert!(result.is_valid);
    }

    #[test]
    fn test_empty_email() {
        let result = validate_email("");
        assert!(result.is_valid); // Empty is valid (optional)
    }

    #[test]
    fn test_invalid_no_at() {
        let result = validate_email("testexample.com");
        assert!(!result.is_valid);
    }

    #[test]
    fn test_invalid_no_domain() {
        let result = validate_email("test@");
        assert!(!result.is_valid);
    }

    #[test]
    fn test_disposable_email() {
        let result = validate_email("test@mailinator.com");
        assert!(result.is_valid);
        assert!(result.is_disposable);
    }
}
