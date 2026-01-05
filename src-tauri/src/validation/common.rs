//! Common Validation Functions

use crate::error::{AppError, ValidationError};

#[allow(dead_code)]
/// Validate string length
pub fn validate_string_length(
    value: &str,
    field: &str,
    min: usize,
    max: usize,
) -> Result<(), AppError> {
    let trimmed = value.trim();
    
    if trimmed.len() < min {
        return Err(AppError::Validation(ValidationError::new(
            field,
            &format!("{} must be at least {} characters", field, min),
            &format!("{} يجب أن يكون {} أحرف على الأقل", field, min),
        )));
    }
    
    if trimmed.len() > max {
        return Err(AppError::Validation(ValidationError::new(
            field,
            &format!("{} is too long (max {} characters)", field, max),
            &format!("{} طويل جداً (الحد الأقصى {} حرف)", field, max),
        )));
    }
    
    Ok(())
}

#[allow(dead_code)]
/// Validate required string
pub fn validate_required(value: &str, field: &str) -> Result<(), AppError> {
    if value.trim().is_empty() {
        return Err(AppError::Validation(ValidationError::new(
            field,
            &format!("{} is required", field),
            &format!("{} مطلوب", field),
        )));
    }
    Ok(())
}

#[allow(dead_code)]
/// Validate positive number
pub fn validate_positive<T: PartialOrd + Default + std::fmt::Display>(
    value: T,
    field: &str,
) -> Result<(), AppError> {
    if value <= T::default() {
        return Err(AppError::Validation(ValidationError::new(
            field,
            &format!("{} must be positive", field),
            &format!("{} يجب أن يكون موجباً", field),
        )));
    }
    Ok(())
}

#[allow(dead_code)]
/// Validate non-negative number
pub fn validate_non_negative<T: PartialOrd + Default + std::fmt::Display>(
    value: T,
    field: &str,
) -> Result<(), AppError> {
    if value < T::default() {
        return Err(AppError::Validation(ValidationError::new(
            field,
            &format!("{} cannot be negative", field),
            &format!("{} لا يمكن أن يكون سالباً", field),
        )));
    }
    Ok(())
}

#[allow(dead_code)]
/// Validate enum value
pub fn validate_enum<'a>(
    value: &str,
    field: &str,
    valid_values: &[&'a str],
) -> Result<(), AppError> {
    if !valid_values.contains(&value) {
        return Err(AppError::Validation(ValidationError::new(
            field,
            &format!("{} must be one of: {}", field, valid_values.join(", ")),
            &format!("{} يجب أن يكون أحد: {}", field, valid_values.join(", ")),
        )));
    }
    Ok(())
}

#[allow(dead_code)]
/// Validate UUID format
pub fn validate_uuid(value: &str, field: &str) -> Result<(), AppError> {
    if uuid::Uuid::parse_str(value).is_err() {
        return Err(AppError::Validation(ValidationError::new(
            field,
            &format!("Invalid {} format", field),
            &format!("صيغة {} غير صالحة", field),
        )));
    }
    Ok(())
}
