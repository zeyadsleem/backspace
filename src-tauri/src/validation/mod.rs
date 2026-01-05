//! Validation Module
//!
//! Egyptian-specific validation for phone numbers and other fields.

pub mod egyptian_phone;
pub mod email;
pub mod common;

pub use egyptian_phone::*;
pub use email::*;
