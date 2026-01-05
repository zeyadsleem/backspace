/**
 * Resource Validation Schemas
 */

import { z } from "zod";

/**
 * Resource types
 */
export const RESOURCE_TYPES = ["seat", "desk", "room"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

/**
 * Resource type labels
 */
export const RESOURCE_TYPE_LABELS: Record<ResourceType, { ar: string; en: string }> = {
  seat: { ar: "مقعد", en: "Seat" },
  desk: { ar: "مكتب", en: "Desk" },
  room: { ar: "غرفة", en: "Room" },
};

/**
 * Resource name validation
 */
const resourceNameSchema = z
  .string()
  .min(2, "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters")
  .max(100, "الاسم طويل جداً (الحد الأقصى 100 حرف) | Name is too long (max 100 characters)")
  .refine((val) => val.trim().length >= 2, {
    message: "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters",
  });

/**
 * Resource type validation
 */
const resourceTypeSchema = z.enum(RESOURCE_TYPES, {
  message:
    "نوع المورد يجب أن يكون مقعد أو مكتب أو غرفة | Resource type must be seat, desk, or room",
});

/**
 * Rate per hour validation
 */
const ratePerHourSchema = z
  .number()
  .min(0, "السعر لا يمكن أن يكون سالباً | Rate cannot be negative")
  .max(10000, "السعر مرتفع جداً | Rate is too high");

/**
 * Create Resource Schema
 */
export const createResourceSchema = z.object({
  name: resourceNameSchema,
  resourceType: resourceTypeSchema,
  ratePerHour: ratePerHourSchema.optional().default(50),
});

/**
 * Update Resource Schema
 */
export const updateResourceSchema = z.object({
  name: resourceNameSchema.optional(),
  resourceType: resourceTypeSchema.optional(),
  isAvailable: z.boolean().optional(),
  ratePerHour: ratePerHourSchema.optional(),
});

// Type exports
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

/**
 * Validate create resource data
 */
export function validateCreateResource(data: unknown) {
  return createResourceSchema.safeParse(data);
}

/**
 * Validate update resource data
 */
export function validateUpdateResource(data: unknown) {
  return updateResourceSchema.safeParse(data);
}

/**
 * Get resource type label
 */
export function getResourceTypeLabel(type: ResourceType, language: "ar" | "en"): string {
  return RESOURCE_TYPE_LABELS[type]?.[language] || type;
}
