/**
 * Inventory Validation Schemas
 */

import { z } from "zod";

/**
 * Inventory name validation
 */
const inventoryNameSchema = z
  .string()
  .min(2, "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters")
  .max(100, "الاسم طويل جداً (الحد الأقصى 100 حرف) | Name is too long (max 100 characters)");

/**
 * Quantity validation
 */
const quantitySchema = z
  .number()
  .int("الكمية يجب أن تكون عدد صحيح | Quantity must be an integer")
  .min(0, "الكمية لا يمكن أن تكون سالبة | Quantity cannot be negative");

/**
 * Min stock validation
 */
const minStockSchema = z
  .number()
  .int("الحد الأدنى يجب أن يكون عدد صحيح | Min stock must be an integer")
  .min(0, "الحد الأدنى لا يمكن أن يكون سالباً | Min stock cannot be negative");

/**
 * Price validation (in EGP)
 */
const priceSchema = z
  .number()
  .min(0, "السعر لا يمكن أن يكون سالباً | Price cannot be negative")
  .max(100000, "السعر مرتفع جداً | Price is too high");

/**
 * Create Inventory Schema
 */
export const createInventorySchema = z.object({
  name: inventoryNameSchema,
  quantity: quantitySchema,
  minStock: minStockSchema,
  price: priceSchema,
});

/**
 * Update Inventory Schema
 */
export const updateInventorySchema = z.object({
  name: inventoryNameSchema.optional(),
  quantity: quantitySchema.optional(),
  minStock: minStockSchema.optional(),
  price: priceSchema.optional(),
});

/**
 * Inventory Movement Schema
 */
export const inventoryMovementSchema = z.object({
  inventoryId: z.string().uuid("معرف غير صالح | Invalid ID"),
  movementType: z.enum(["add", "remove", "adjust"], {
    message:
      "نوع الحركة يجب أن يكون إضافة أو سحب أو تعديل | Movement type must be add, remove, or adjust",
  }),
  quantity: z.number().int().positive("الكمية يجب أن تكون موجبة | Quantity must be positive"),
  notes: z.string().max(500, "الملاحظات طويلة جداً | Notes are too long").optional(),
});

// Type exports
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type InventoryMovementInput = z.infer<typeof inventoryMovementSchema>;

/**
 * Validate create inventory data
 */
export function validateCreateInventory(data: unknown) {
  return createInventorySchema.safeParse(data);
}

/**
 * Validate update inventory data
 */
export function validateUpdateInventory(data: unknown) {
  return updateInventorySchema.safeParse(data);
}

/**
 * Validate inventory movement data
 */
export function validateInventoryMovement(data: unknown) {
  return inventoryMovementSchema.safeParse(data);
}
