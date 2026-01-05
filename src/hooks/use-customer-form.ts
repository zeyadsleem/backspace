import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type Customer, type CreateCustomer } from "@/lib/tauri-api";
import { useI18n } from "@/lib/i18n";
import {
  createCustomerSchema,
  updateCustomerSchema,
  getValidationErrors,
} from "@/lib/validation/schemas/customer";
import { validateEgyptianPhone, normalizePhone } from "@/lib/validation/validators/egyptian-phone";

type CustomerFormData = {
  name: string;
  phone: string;
  email: string;
  customerType: "visitor" | "member";
  planType?: "weekly" | "half-monthly" | "monthly";
  notes: string;
};

export function useCustomerForm(
  customer?: Customer,
  mode: "create" | "edit" = "create",
  onSuccess?: (customer: Customer) => void,
) {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  const form = useForm({
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      customerType: (customer?.customerType ?? "visitor") as "visitor" | "member",
      planType: undefined as "weekly" | "half-monthly" | "monthly" | undefined,
      notes: customer?.notes ?? "",
    } as CustomerFormData,
    onSubmit: async ({ value }) => {
      const schema = mode === "create" ? createCustomerSchema : updateCustomerSchema;
      const result = schema.safeParse(value);
      if (!result.success) {
        const errors = getValidationErrors(result);
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }
      mutation.mutate(value);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      // Normalize phone number
      const phoneResult = validateEgyptianPhone(data.phone);
      const normalizedPhone = phoneResult.normalized || normalizePhone(data.phone);

      const createData: CreateCustomer = {
        name: data.name.trim(),
        phone: normalizedPhone,
        email: data.email?.trim() || undefined,
        customerType: data.customerType,
        planType: data.planType,
        notes: data.notes?.trim() || undefined,
      };

      if (mode === "create") {
        return api.customers.create(createData);
      } else {
        return api.customers.update(customer!.id, {
          name: data.name.trim(),
          phone: normalizedPhone,
          email: data.email?.trim() || undefined,
          customerType: data.customerType,
          planType: data.planType,
          notes: data.notes?.trim() || undefined,
        });
      }
    },
    onSuccess: async (result) => {
      toast.success(
        language === "ar"
          ? mode === "create"
            ? "تم إنشاء العميل بنجاح"
            : "تم تحديث العميل بنجاح"
          : mode === "create"
            ? "Customer created successfully"
            : "Customer updated successfully",
      );

      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        exact: false,
      });

      onSuccess?.(result);
      form.reset();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(language === "ar" ? `حدث خطأ: ${message}` : message);
    },
  });

  return { form, mutation, createCustomerSchema, validateEgyptianPhone };
}
