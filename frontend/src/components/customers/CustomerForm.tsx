import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, FileText, Mail, Phone, User, ExternalLink, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormActions, TextareaField, TextField } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type CustomerFormData, customerSchema } from "@/lib/validations";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer, CustomerType } from "@/types";

interface CustomerFormProps {
  initialData?: {
    name: string;
    phone: string;
    email: string | null;
    notes: string;
  };
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
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const t = useAppStore((state) => state.t);
  const checkDuplicate = useAppStore((state) => state.checkCustomerDuplicate);
  const [duplicateCustomer, setDuplicateCustomer] = useState<Customer | null>(null);
  const [isChecking, setIsChecking] = useState(false);

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
      customerType: "visitor",
      notes: initialData?.notes ?? "",
    },
    mode: "onChange",
  });

  const onFormSubmit = async (data: CustomerFormData) => {
    // Only check duplicates if we are NOT editing
    if (!initialData) {
      setIsChecking(true);
      const duplicate = await checkDuplicate(data.name.trim(), data.phone.trim());
      setIsChecking(false);

      if (duplicate) {
        setDuplicateCustomer(duplicate);
        return; // Stop submission
      }
    }

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
    setDuplicateCustomer(null);
    onCancel?.();
  };

  const isEditing = !!initialData;

  return (
    <div className="flex h-full flex-col">
      <form className="flex h-full flex-col" onSubmit={handleSubmit(onFormSubmit)}>
        {/* Duplicate Warning Alert */}
        {duplicateCustomer && (
          <div className="mb-6">
            <Alert variant="danger">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-start font-bold">{t("customerAlreadyExists")}</AlertTitle>
              <AlertDescription className="mt-2 text-start">
                <p>
                  {t("doYouMean")}: <span className="font-bold">{duplicateCustomer.name}</span> ({duplicateCustomer.phone})?
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    to={`/customers/${duplicateCustomer.id}`}
                    className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 font-medium text-red-600 shadow-sm transition-colors hover:bg-stone-50 dark:bg-stone-900 dark:text-red-400"
                    onClick={onCancel}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("viewProfile")}
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-700 hover:bg-red-100 dark:text-red-200 dark:hover:bg-red-900/30"
                    onClick={() => setDuplicateCustomer(null)}
                  >
                    {t("ignoreAndContinue")}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Form Fields - Scrollable */}
        <div className="scrollbar-thin flex-1 overflow-y-auto pe-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Name Field */}
            <TextField
              disabled={isLoading || isChecking}
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
              disabled={isLoading || isChecking}
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
              disabled={isLoading || isChecking}
              error={errors.email?.message}
              icon={<Mail className="h-4 w-4" />}
              id="email"
              label={t("email")}
              optional
              placeholder={t("emailExample")}
              type="email"
              {...register("email")}
            />

            {/* Read-only Customer Type Field */}
            <TextField
              disabled
              icon={<ShieldCheck className="h-4 w-4" />}
              id="customerTypeDisplay"
              label={t("customerType")}
              value={t("visitorType")}
              className="opacity-80"
            />
          </div>

          {/* Notes Field - Full Width */}
          <div className="mt-6">
            <TextareaField
              disabled={isLoading || isChecking}
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
          <Button disabled={isLoading || isChecking} onClick={handleReset} type="button" variant="outline">
            {t("cancel")}
          </Button>
          <Button
            className="flex-1"
            disabled={isLoading || isChecking || !isValid}
            isLoading={isLoading || isChecking}
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
