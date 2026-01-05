/**
 * Invoice Validation Schemas
 */

import { z } from "zod";

/**
 * Invoice statuses
 */
export const INVOICE_STATUSES = ["pending", "paid", "overdue", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Invoice status labels
 */
export const INVOICE_STATUS_LABELS: Record<
  InvoiceStatus,
  { ar: string; en: string; color: string }
> = {
  pending: { ar: "معلقة", en: "Pending", color: "orange" },
  paid: { ar: "مدفوعة", en: "Paid", color: "emerald" },
  overdue: { ar: "متأخرة", en: "Overdue", color: "destructive" },
  cancelled: { ar: "ملغاة", en: "Cancelled", color: "muted" },
};

/**
 * Invoice item schema
 */
const invoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, "الوصف مطلوب | Description is required")
    .max(
      500,
      "الوصف طويل جداً (الحد الأقصى 500 حرف) | Description is too long (max 500 characters)",
    ),
  quantity: z
    .number()
    .int("الكمية يجب أن تكون عدد صحيح | Quantity must be an integer")
    .positive("الكمية يجب أن تكون موجبة | Quantity must be positive"),
  unitPrice: z.number().min(0, "سعر الوحدة لا يمكن أن يكون سالباً | Unit price cannot be negative"),
});

/**
 * Date string validation
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
 * Create Invoice Schema
 */
export const createInvoiceSchema = z.object({
  customerId: z.string().uuid("معرف العميل غير صالح | Invalid customer ID"),
  amount: z.number().min(0, "المبلغ لا يمكن أن يكون سالباً | Amount cannot be negative"),
  status: z.enum(INVOICE_STATUSES, {
    message: "حالة الفاتورة غير صالحة | Invalid invoice status",
  }),
  dueDate: dateStringSchema,
  items: z
    .array(invoiceItemSchema)
    .min(1, "الفاتورة يجب أن تحتوي على عنصر واحد على الأقل | Invoice must have at least one item"),
});

/**
 * Update Invoice Schema
 */
export const updateInvoiceSchema = z.object({
  status: z
    .enum(INVOICE_STATUSES, {
      message: "حالة الفاتورة غير صالحة | Invalid invoice status",
    })
    .optional(),
  paidDate: dateStringSchema.optional().nullable(),
});

// Type exports
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

/**
 * Validate create invoice data
 */
export function validateCreateInvoice(data: unknown) {
  return createInvoiceSchema.safeParse(data);
}

/**
 * Validate update invoice data
 */
export function validateUpdateInvoice(data: unknown) {
  return updateInvoiceSchema.safeParse(data);
}

/**
 * Get invoice status label
 */
export function getInvoiceStatusLabel(status: InvoiceStatus, language: "ar" | "en"): string {
  return INVOICE_STATUS_LABELS[status]?.[language] || status;
}

/**
 * Get invoice status color
 */
export function getInvoiceStatusColor(status: InvoiceStatus): string {
  return INVOICE_STATUS_LABELS[status]?.color || "muted";
}

/**
 * Calculate invoice total from items
 */
export function calculateInvoiceTotal(items: InvoiceItemInput[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}
