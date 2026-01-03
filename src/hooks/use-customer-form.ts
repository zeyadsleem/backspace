import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { api, type Customer, type CreateCustomer } from "@/lib/tauri-api";
import { useI18n } from "@/lib/i18n";

const customerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional().or(z.literal("")),
  customerType: z.enum(["visitor", "member"]),
  notes: z.string().max(1000).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

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
      notes: customer?.notes ?? "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const createData: CreateCustomer = {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        customerType: data.customerType,
        notes: data.notes || undefined,
      };

      if (mode === "create") {
        return api.customers.create(createData);
      } else {
        return api.customers.update(customer!.id, {
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          customerType: data.customerType,
          notes: data.notes || undefined,
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
    onError: () => {
      toast.error(language === "ar" ? "حدث خطأ" : "An error occurred");
    },
  });

  return { form, mutation };
}
