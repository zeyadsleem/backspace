//! Application Error Types
//!
//! Centralized error handling for the Backspace application.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Application error types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    /// Validation error with field-specific messages
    Validation(ValidationError),
    /// Database operation error
    Database(String),
    /// Resource not found
    NotFound(String),
    /// Conflict (e.g., duplicate entry)
    Conflict(String),
    /// Internal server error
    Internal(String),
}

/// Validation error with field-specific messages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub field: String,
    pub message: String,
    pub message_ar: String,
}

impl ValidationError {
    pub fn new(field: &str, message: &str, message_ar: &str) -> Self {
        Self {
            field: field.to_string(),
            message: message.to_string(),
            message_ar: message_ar.to_string(),
        }
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Validation(e) => write!(f, "Validation error: {} - {}", e.field, e.message),
            AppError::Database(msg) => write!(f, "Database error: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::Conflict(msg) => write!(f, "Conflict: {}", msg),
            AppError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        match err {
            rusqlite::Error::QueryReturnedNoRows => {
                AppError::NotFound("Record not found".to_string())
            }
            _ => AppError::Database(err.to_string()),
        }
    }
}

/// Convert AppError to a string for Tauri command results
impl From<AppError> for String {
    fn from(err: AppError) -> Self {
        match err {
            AppError::Validation(e) => format!("{} | {}", e.message, e.message_ar),
            AppError::Database(msg) => msg,
            AppError::NotFound(msg) => msg,
            AppError::Conflict(msg) => msg,
            AppError::Internal(msg) => msg,
        }
    }
}

/// Result type alias for application operations
pub type AppResult<T> = Result<T, AppError>;
