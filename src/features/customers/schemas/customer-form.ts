import * as z from "zod";
import { validateEgyptianPhone } from "@/lib/validation/validators/egyptian-phone";
import { validateEmail } from "@/lib/validation/validators/email";

export const customerFormSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters")
    .max(100, "الاسم طويل جداً (الحد الأقصى 100 حرف) | Name is too long (max 100 characters)")
    .refine((val) => val.trim().length >= 2, {
      message: "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters",
    }),
  phone: z.string().refine(
    (val) => {
      if (!val || val.trim() === "") return false;
      return validateEgyptianPhone(val).isValid;
    },
    {
      message:
        "رقم هاتف مصري غير صالح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 | Invalid Egyptian phone. Must start with 010, 011, 012, or 015",
    },
  ),
  email: z
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
    ),
  customerType: z.enum(["visitor", "member"]),
  planType: z.enum(["weekly", "half-monthly", "monthly"]).optional(),
  notes: z
    .string()
    .max(
      1000,
      "الملاحظات طويلة جداً (الحد الأقصى 1000 حرف) | Notes are too long (max 1000 characters)",
    )
    .optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
