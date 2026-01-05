/**
 * Session Validation Schemas
 */

import { z } from "zod";

/**
 * UUID validation
 */
const uuidSchema = z.string().uuid("معرف غير صالح | Invalid ID format");

/**
 * Create Session Schema
 */
export const createSessionSchema = z.object({
  customerId: uuidSchema.refine((val) => val.trim().length > 0, {
    message: "معرف العميل مطلوب | Customer ID is required",
  }),
  resourceId: uuidSchema.refine((val) => val.trim().length > 0, {
    message: "معرف المورد مطلوب | Resource ID is required",
  }),
});

/**
 * End Session Schema
 */
export const endSessionSchema = z.object({
  sessionId: uuidSchema,
  consumptions: z
    .array(
      z.object({
        inventoryId: uuidSchema,
        quantity: z.number().int().positive("الكمية يجب أن تكون موجبة | Quantity must be positive"),
      }),
    )
    .optional(),
});

// Type exports
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;

/**
 * Validate create session data
 */
export function validateCreateSession(data: unknown) {
  return createSessionSchema.safeParse(data);
}

/**
 * Validate end session data
 */
export function validateEndSession(data: unknown) {
  return endSessionSchema.safeParse(data);
}
