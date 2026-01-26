import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Mail, Phone, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormActions, SelectField, TextareaField, TextField } from "@/components/ui/form";
import { type CustomerFormData, customerSchema } from "@/lib/validations";
import { useAppStore } from "@/stores/useAppStore";
import type { CustomerType } from "@/types";

interface CustomerFormProps {
  initialData?: {
    name: string;
    phone: string;
    email: string | null;
    customerType: CustomerType;
    notes: string;
  };
  customerTypes: CustomerType[];
  onSubmit?: (data: {
    name: string;
    phone: string;
    email?: string;
    customerType: CustomerType;
    notes?: string;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function CustomerForm({
  initialData,
  customerTypes,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const t = useAppStore((state) => state.t);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      customerType: initialData?.customerType ?? "visitor",
      notes: initialData?.notes ?? "",
    },
    mode: "onChange",
  });

  const customerTypeLabels: Record<CustomerType, string> = {
    visitor: t("visitorType"),
    weekly: t("weeklyMember"),
    "half-monthly": t("halfMonthlyMember"),
    monthly: t("monthlyMember"),
  };

  const onFormSubmit = (data: CustomerFormData) => {
    onSubmit?.({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      customerType: data.customerType,
      notes: data.notes?.trim() || undefined,
    });
  };

  const handleReset = () => {
    reset();
    onCancel?.();
  };

  const isEditing = !!initialData;

  const customerTypeOptions = customerTypes.map((type) => ({
    value: type,
    label: customerTypeLabels[type],
  }));

  return (
    <div className="flex h-full flex-col">
      <form className="flex h-full flex-col" onSubmit={handleSubmit(onFormSubmit)}>
        {/* Form Fields - Scrollable */}
        <div className="scrollbar-thin flex-1 overflow-y-auto pe-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Name Field */}
            <TextField
              disabled={isLoading}
              error={errors.name?.message}
              icon={<User className="h-4 w-4" />}
              id="name"
              label={t("customerName")}
              placeholder={t("enterCustomerName")}
              required
              {...register("name")}
            />

            {/* Phone Field */}
            <TextField
              disabled={isLoading}
              error={errors.phone?.message}
              helperText={errors.phone ? undefined : t("egyptianFormat")}
              icon={<Phone className="h-4 w-4" />}
              id="phone"
              label={t("phoneNumber")}
              placeholder={t("phoneExample")}
              required
              type="tel"
              {...register("phone")}
            />

            {/* Email Field */}
            <TextField
              disabled={isLoading}
              error={errors.email?.message}
              icon={<Mail className="h-4 w-4" />}
              id="email"
              label={t("email")}
              optional
              placeholder={t("emailExample")}
              type="email"
              {...register("email")}
            />

            {/* Customer Type Field */}
            <SelectField
              disabled={isLoading}
              error={errors.customerType?.message}
              id="customerType"
              label={t("customerType")}
              options={customerTypeOptions}
              {...register("customerType")}
            />
          </div>

          {/* Notes Field - Full Width */}
          <div className="mt-6">
            <TextareaField
              disabled={isLoading}
              error={errors.notes?.message}
              icon={<FileText className="h-4 w-4" />}
              id="notes"
              label={t("notes")}
              optional
              placeholder={t("customerNotes")}
              rows={3}
              {...register("notes")}
            />
          </div>
        </div>

        {/* Action Buttons - Fixed */}
        <FormActions className="mt-6 pt-6">
          <Button disabled={isLoading} onClick={handleReset} type="button" variant="outline">
            {t("cancel")}
          </Button>
          <Button
            className="flex-1"
            disabled={isLoading || !isValid}
            isLoading={isLoading}
            type="submit"
            variant="primary"
          >
            {isEditing ? t("updateCustomer") : t("createCustomer")}
          </Button>
        </FormActions>
      </form>
    </div>
  );
}
