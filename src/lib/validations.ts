import type { FieldErrors } from "react-hook-form";
import { z } from "zod";

const EGYPTIAN_PHONE_REGEX = /^(0|20)?1[0125]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Customer validation schema
export const customerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(EGYPTIAN_PHONE_REGEX, "Invalid Egyptian phone number format"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  customerType: z.enum(["visitor", "weekly", "half-monthly", "monthly"] as const),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional().or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Resource validation schema
export const resourceSchema = z.object({
  name: z
    .string()
    .min(2, "Resource name must be at least 2 characters")
    .max(50, "Resource name must be less than 50 characters")
    .trim(),
  resourceType: z.enum(["seat", "room", "desk"] as const),
  ratePerHour: z.number().min(0, "Rate must be positive").max(10_000, "Rate seems too high"),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

// Inventory validation schema
export const inventorySchema = z.object({
  name: z
    .string()
    .min(2, "Item name must be at least 2 characters")
    .max(50, "Item name must be less than 50 characters")
    .trim(),
  category: z.enum(["beverage", "snack", "other"] as const),
  price: z.number().min(0, "Price must be positive").max(1000, "Price seems too high"),
  quantity: z.number().int("Quantity must be a whole number").min(0, "Quantity cannot be negative"),
  minStock: z
    .number()
    .int("Minimum stock must be a whole number")
    .min(0, "Minimum stock cannot be negative"),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;

// Subscription validation schema
export const subscriptionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  planType: z.enum(["weekly", "half-monthly", "monthly"] as const),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Start date cannot be in the past"),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

// Payment validation schema
export const paymentSchema = z.object({
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(100_000, "Amount seems too high"),
  method: z.enum(["cash", "card", "transfer"] as const),
  date: z.string().min(1, "Payment date is required"),
  notes: z.string().max(200, "Notes must be less than 200 characters").optional().or(z.literal("")),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Settings validation schema
export const settingsSchema = z.object({
  company: z.object({
    name: z.string().min(1, "Company name is required"),
    address: z.string().min(1, "Company address is required"),
    phone: z.string().min(1, "Company phone is required"),
    email: z.string().email("Invalid email format"),
  }),
  regional: z.object({
    currency: z.string().min(1, "Currency is required"),
    currencySymbol: z.string().min(1, "Currency symbol is required"),
    timezone: z.string().min(1, "Timezone is required"),
    dateFormat: z.string().min(1, "Date format is required"),
  }),
  tax: z.object({
    enabled: z.boolean(),
    rate: z.number().min(0).max(100),
  }),
  appearance: z.object({
    theme: z.enum(["light", "dark", "system"] as const),
    language: z.enum(["en", "ar"] as const),
  }),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Helper functions for validation
export const validatePhoneNumber = (phone: string): boolean => {
  const normalized = phone.replace(/[\s\-+]/g, "");
  return EGYPTIAN_PHONE_REGEX.test(normalized);
};

export const validateEmail = (email: string): boolean => {
  if (!email) {
    return true;
  }
  return EMAIL_REGEX.test(email);
};

// Form validation helpers
export const getFieldError = (errors: FieldErrors, fieldName: string): string | undefined => {
  return errors[fieldName]?.message as string | undefined;
};

export const hasFieldError = (errors: FieldErrors, fieldName: string): boolean => {
  return !!errors[fieldName];
};
