import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { validateEgyptianPhone, normalizePhone } from "@/lib/validation/validators/egyptian-phone";
import { customerFormSchema, type CustomerFormData } from "../schemas/customer-form";
import { api, type Customer, type CreateCustomer } from "@/lib/tauri-api";

export function useCustomerForm(
  customer?: Customer,
  mode: "create" | "edit" = "create",
  defaultType: "visitor" | "member" = "visitor",
  onSuccess?: (customer: Customer) => void,
) {
  const { language } = useI18n();
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      customerType: (customer?.customerType as "visitor" | "member") ?? defaultType,
      planType: undefined,
      notes: customer?.notes ?? "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
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
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(language === "ar" ? `حدث خطأ: ${message}` : message);
    },
  });

  return { form, mutation };
}
