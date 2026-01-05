/**
 * Customer Validation Schemas
 */

import { z } from "zod";
import { validateEgyptianPhone } from "../validators/egyptian-phone";
import { validateEmail } from "../validators/email";

/**
 * Egyptian phone number Zod refinement
 */
const egyptianPhoneSchema = z.string().refine(
  (val) => {
    if (!val || val.trim() === "") return false;
    return validateEgyptianPhone(val).isValid;
  },
  {
    message:
      "رقم هاتف مصري غير صالح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 | Invalid Egyptian phone. Must start with 010, 011, 012, or 015",
  },
);

/**
 * Optional email Zod refinement
 */
const optionalEmailSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      return validateEmail(val).isValid;
    },
    {
      message: "صيغة البريد الإلكتروني غير صالحة | Invalid email format",
    },
  );

/**
 * Customer name validation
 */
const customerNameSchema = z
  .string()
  .min(2, "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters")
  .max(100, "الاسم طويل جداً (الحد الأقصى 100 حرف) | Name is too long (max 100 characters)")
  .refine((val) => val.trim().length >= 2, {
    message: "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters",
  });

/**
 * Customer type validation
 */
const customerTypeSchema = z.enum(["visitor", "member"], {
  message: "نوع العميل يجب أن يكون زائر أو مشترك | Customer type must be visitor or member",
});

/**
 * Plan type validation (optional, only for members)
 */
const planTypeSchema = z
  .enum(["weekly", "half-monthly", "monthly"], {
    message:
      "نوع الخطة يجب أن يكون أسبوعي، نصف شهري، أو شهري | Plan type must be weekly, half-monthly, or monthly",
  })
  .optional();

/**
 * Notes validation
 */
const notesSchema = z
  .string()
  .max(
    1000,
    "الملاحظات طويلة جداً (الحد الأقصى 1000 حرف) | Notes are too long (max 1000 characters)",
  )
  .optional();

/**
 * Create Customer Schema
 */
export const createCustomerSchema = z.object({
  name: customerNameSchema,
  phone: egyptianPhoneSchema,
  email: optionalEmailSchema,
  customerType: customerTypeSchema,
  planType: planTypeSchema,
  notes: notesSchema,
});

/**
 * Update Customer Schema (all fields optional)
 */
export const updateCustomerSchema = z.object({
  name: customerNameSchema.optional(),
  phone: egyptianPhoneSchema.optional(),
  email: optionalEmailSchema,
  customerType: customerTypeSchema.optional(),
  planType: planTypeSchema.optional(),
  notes: notesSchema,
});

/**
 * Customer search/filter schema
 */
export const customerFilterSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["all", "visitor", "member"]).optional(),
  sortBy: z.enum(["name", "createdAt", "humanId"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Type exports
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;

/**
 * Validate create customer data
 */
export function validateCreateCustomer(data: unknown) {
  return createCustomerSchema.safeParse(data);
}

/**
 * Validate update customer data
 */
export function validateUpdateCustomer(data: unknown) {
  return updateCustomerSchema.safeParse(data);
}

/**
 * Get validation errors as a record
 */
export function getValidationErrors(result: {
  success: boolean;
  error?: { issues: Array<{ path: PropertyKey[]; message: string }> };
}): Record<string, string> {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  if (result.error) {
    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join(".");
      errors[path] = issue.message;
    }
  }
  return errors;
}
