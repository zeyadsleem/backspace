import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { api, type Customer, type CreateCustomer } from "@/lib/tauri-api";
import { useI18n } from "@/lib/i18n";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20, "Phone is too long"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  customerType: z.enum(["visitor", "member"]),
  notes: z.string().max(1000, "Notes are too long").optional(),
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
    validators: {
      onChange: ({ value }) => {
        const result = customerSchema.safeParse(value);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of result.error.issues) {
            const path = issue.path.join(".");
            fieldErrors[path] = issue.message;
          }
          return fieldErrors;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const result = customerSchema.safeParse(value);
      if (!result.success) {
        toast.error(language === "ar" ? "يرجى تصحيح الأخطاء" : "Please fix the errors");
        return;
      }
      mutation.mutate(result.data);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const createData: CreateCustomer = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
        customerType: data.customerType,
        notes: data.notes?.trim() || undefined,
      };

      if (mode === "create") {
        return api.customers.create(createData);
      } else {
        return api.customers.update(customer!.id, {
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || undefined,
          customerType: data.customerType,
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

  return { form, mutation, customerSchema };
}
