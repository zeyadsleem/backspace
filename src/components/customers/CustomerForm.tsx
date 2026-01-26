import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Mail, Phone, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { type CustomerFormData, customerSchema } from "@/lib/validations";
import { useAppStore } from "@/stores/useAppStore";
import type { CustomerType } from "@/types";
import { RTLIcon } from "../ui/RTLIcon";

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
  const isRTL = useAppStore((state) => state.isRTL);

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

  return (
    <div className="flex h-full flex-col">
      <form className="flex h-full flex-col" onSubmit={handleSubmit(onFormSubmit)}>
        {/* Form Fields - Scrollable */}
        <div className="scrollbar-thin flex-1 overflow-y-auto pe-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "justify-start" : "justify-start"}`}
                htmlFor="name"
              >
                {isRTL ? (
                  <>
                    <RTLIcon>
                      <User className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t("customerName")}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <RTLIcon>
                      <User className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t("customerName")}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <div className={isRTL ? "rtl-input-wrapper" : "ltr-input-wrapper"}>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
                    errors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600"
                  } ${isRTL ? "rtl-text-input" : "ltr-text-input"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                  disabled={isLoading}
                  placeholder={t("enterCustomerName")}
                />
              </div>
              {errors.name && (
                <p
                  className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : "text-start"}`}
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "justify-start" : "justify-start"}`}
                htmlFor="phone"
              >
                {isRTL ? (
                  <>
                    <RTLIcon>
                      <Phone className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t("phoneNumber")}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <RTLIcon>
                      <Phone className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t("phoneNumber")}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
                  errors.phone
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600"
                }`}
                dir="ltr"
                disabled={isLoading}
                placeholder={t("phoneExample")}
              />
              {errors.phone ? (
                <p
                  className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : "text-start"}`}
                >
                  {errors.phone.message}
                </p>
              ) : (
                <p
                  className={`text-sm text-stone-500 dark:text-stone-400 ${isRTL ? "text-end" : "text-start"}`}
                >
                  {t("egyptianFormat")}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "justify-start" : "justify-start"}`}
                htmlFor="email"
              >
                {isRTL ? (
                  <>
                    <RTLIcon>
                      <Mail className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t("email")}</span>
                    <span className="text-stone-400">({t("optional")})</span>
                  </>
                ) : (
                  <>
                    <RTLIcon>
                      <Mail className="h-4 w-4" />
                    </RTLIcon>
                    <span>{t("email")}</span>
                    <span className="text-stone-400">({t("optional")})</span>
                  </>
                )}
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600"
                }`}
                dir="ltr"
                disabled={isLoading}
                placeholder={t("emailExample")}
              />
              {errors.email && (
                <p
                  className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : "text-start"}`}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Customer Type Field */}
            <div className="space-y-1.5">
              <label
                className={`block font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "text-end" : "text-start"}`}
                htmlFor="customerType"
              >
                {t("customerType")}
              </label>
              <div className={isRTL ? "rtl-input-wrapper" : "ltr-input-wrapper"}>
                <select
                  id="customerType"
                  {...register("customerType")}
                  className={`h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? "rtl-text-input" : "ltr-text-input"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                  disabled={isLoading}
                >
                  {customerTypes.map((type) => (
                    <option key={type} value={type}>
                      {customerTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>
              {errors.customerType && (
                <p
                  className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : "text-start"}`}
                >
                  {errors.customerType.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes Field - Full Width */}
          <div className="mt-6 space-y-1.5">
            <label
              className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "justify-start" : "justify-start"}`}
              htmlFor="notes"
            >
              {isRTL ? (
                <>
                  <RTLIcon>
                    <FileText className="h-4 w-4" />
                  </RTLIcon>
                  <span>{t("notes")}</span>
                  <span className="text-stone-400">({t("optional")})</span>
                </>
              ) : (
                <>
                  <RTLIcon>
                    <FileText className="h-4 w-4" />
                  </RTLIcon>
                  <span>{t("notes")}</span>
                  <span className="text-stone-400">({t("optional")})</span>
                </>
              )}
            </label>
            <div className={isRTL ? "rtl-input-wrapper" : "ltr-input-wrapper"}>
              <textarea
                id="notes"
                {...register("notes")}
                className={`w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? "rtl-text-input" : "ltr-text-input"}`}
                dir={isRTL ? "rtl" : "ltr"}
                disabled={isLoading}
                placeholder={t("customerNotes")}
                rows={3}
              />
            </div>
            {errors.notes && (
              <p
                className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : "text-start"}`}
              >
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed */}
        <div
          className={`mt-6 flex flex-shrink-0 gap-3 border-stone-200 border-t pt-6 dark:border-stone-800 ${isRTL ? "" : "flex-row-reverse"}`}
        >
          <button
            className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 font-medium text-sm text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            disabled={isLoading}
            onClick={handleReset}
            type="button"
          >
            {t("cancel")}
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 font-medium text-sm text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
            disabled={isLoading || !isValid}
            type="submit"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? t("updateCustomer") : t("createCustomer")}
          </button>
        </div>
      </form>
    </div>
  );
}
