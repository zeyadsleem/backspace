/**
 * Subscription Validation Schemas
 */

import { z } from "zod";

/**
 * Subscription plan types
 */
export const PLAN_TYPES = ["weekly", "half-monthly", "monthly"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

/**
 * Plan type labels
 */
export const PLAN_TYPE_LABELS: Record<PlanType, { ar: string; en: string; days: number }> = {
  weekly: { ar: "أسبوعي", en: "Weekly", days: 7 },
  "half-monthly": { ar: "نصف شهري", en: "Half Monthly", days: 15 },
  monthly: { ar: "شهري", en: "Monthly", days: 30 },
};

/**
 * Date string validation (ISO format)
 */
const dateStringSchema = z.string().refine(
  (val) => {
    if (!val) return false;
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: "تاريخ غير صالح | Invalid date format" },
);

/**
 * Hours allowance validation
 */
const hoursAllowanceSchema = z
  .number()
  .int("الساعات يجب أن تكون عدد صحيح | Hours must be an integer")
  .min(0, "الساعات لا يمكن أن تكون سالبة | Hours cannot be negative")
  .max(744, "الساعات لا يمكن أن تتجاوز 744 ساعة (31 يوم) | Hours cannot exceed 744 (31 days)")
  .optional()
  .nullable();

/**
 * Create Subscription Schema
 */
export const createSubscriptionSchema = z
  .object({
    customerId: z.string().uuid("معرف العميل غير صالح | Invalid customer ID"),
    planType: z.enum(PLAN_TYPES, {
      message:
        "نوع الخطة غير صالح. يجب أن يكون: أسبوعي، نصف شهري، شهري، ربع سنوي، أو سنوي | Invalid plan type",
    }),
    startDate: dateStringSchema,
    endDate: dateStringSchema.optional().nullable(),
    hoursAllowance: hoursAllowanceSchema,
  })
  .refine(
    (data) => {
      if (data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      }
      return true;
    },
    {
      message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء | End date must be after start date",
      path: ["endDate"],
    },
  );

/**
 * Update Subscription Schema
 */
export const updateSubscriptionSchema = z.object({
  planType: z
    .enum(PLAN_TYPES, {
      message: "نوع الخطة غير صالح | Invalid plan type",
    })
    .optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional().nullable(),
  hoursAllowance: hoursAllowanceSchema,
  isActive: z.boolean().optional(),
});

// Type exports
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

/**
 * Validate create subscription data
 */
export function validateCreateSubscription(data: unknown) {
  return createSubscriptionSchema.safeParse(data);
}

/**
 * Validate update subscription data
 */
export function validateUpdateSubscription(data: unknown) {
  return updateSubscriptionSchema.safeParse(data);
}

/**
 * Get plan type label
 */
export function getPlanTypeLabel(type: PlanType, language: "ar" | "en"): string {
  return PLAN_TYPE_LABELS[type]?.[language] || type;
}

/**
 * Calculate end date based on plan type
 */
export function calculateEndDate(startDate: Date, planType: PlanType): Date {
  const days = PLAN_TYPE_LABELS[planType].days;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  return endDate;
}
