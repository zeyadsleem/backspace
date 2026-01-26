import { Calendar, CreditCard, Loader2, User } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer, PlanType, PlanTypeOption } from "@/types";
import { RTLIcon } from "../ui/RTLIcon";

interface SubscriptionFormProps {
  customers: Customer[];
  planTypes: PlanTypeOption[];
  onSubmit?: (data: { customerId: string; planType: PlanType; startDate: string }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SubscriptionForm({
  customers,
  planTypes,
  onSubmit,
  onCancel,
  isLoading = false,
}: SubscriptionFormProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const [formData, setFormData] = useState({
    customerId: "",
    planType: "weekly" as PlanType,
    startDate: new Date().toISOString().split("T")[0],
  });
  const [searchCustomer, setSearchCustomer] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.humanId.toLowerCase().includes(searchCustomer.toLowerCase())
  );
  const selectedCustomer = customers.find((c) => c.id === formData.customerId);
  const selectedPlan = planTypes.find((p) => p.id === formData.planType);

  const calculateEndDate = (startDate: string, days: number): string => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) {
      newErrors.customerId = t("required");
    }
    if (!formData.startDate) {
      newErrors.startDate = t("startDateRequired");
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit?.(formData);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customer Selection */}
        <div className="space-y-2">
          <label
            className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "flex-row-reverse justify-end" : "justify-start"}`}
          >
            <RTLIcon>
              <User className="h-4 w-4" />
            </RTLIcon>
            <span>{t("customer")}</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            className={`h-9 w-full rounded-md border border-stone-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? "rtl-text-input" : "ltr-text-input"}`}
            dir={isRTL ? "rtl" : "ltr"}
            onChange={(e) => setSearchCustomer(e.target.value)}
            placeholder={t("searchByNameId")}
            type="text"
            value={searchCustomer}
          />
          <div className="max-h-32 overflow-y-auto rounded-md border border-stone-200 dark:border-stone-700">
            {filteredCustomers.length === 0 ? (
              <p
                className={`p-3 text-center text-sm text-stone-500 dark:text-stone-400 ${isRTL ? "text-end" : "text-start"}`}
              >
                {t("noCustomersFound")}
              </p>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  className={`flex w-full items-center justify-between p-3 transition-colors ${isRTL ? "" : "flex-row-reverse"} ${isRTL ? "text-start" : "text-end"} ${formData.customerId === customer.id ? "bg-amber-50 dark:bg-amber-900/20" : "hover:bg-stone-50 dark:hover:bg-stone-800"}`}
                  key={customer.id}
                  onClick={() => setFormData({ ...formData, customerId: customer.id })}
                  type="button"
                >
                  <div className={isRTL ? "text-start" : "text-end"}>
                    <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
                      {customer.name}
                    </p>
                    <p className="text-stone-500 text-xs dark:text-stone-400">{customer.humanId}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          {errors.customerId && (
            <p
              className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : "text-start"}`}
            >
              {errors.customerId}
            </p>
          )}
        </div>

        {/* Plan Type and Dates */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "flex-row-reverse justify-end" : "justify-start"}`}
            >
              <RTLIcon>
                <CreditCard className="h-4 w-4" />
              </RTLIcon>
              <span>{t("planType")}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {planTypes.map((plan) => (
                <button
                  className={`rounded-lg border-2 p-2 text-center transition-colors ${formData.planType === plan.id ? "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20" : "border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600"}`}
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, planType: plan.id })}
                  type="button"
                >
                  <p
                    className={`font-medium text-xs ${formData.planType === plan.id ? "text-amber-700 dark:text-amber-400" : "text-stone-700 dark:text-stone-300"}`}
                  >
                    {isRTL ? plan.labelAr : plan.labelEn}
                  </p>
                  <p className="text-stone-500 text-xs dark:text-stone-400">
                    {plan.days} {t("days")}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "flex-row-reverse justify-end" : "justify-start"}`}
              >
                <RTLIcon>
                  <Calendar className="h-4 w-4" />
                </RTLIcon>
                <span>{t("startDate")}</span>
              </label>
              <input
                className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${errors.startDate ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600"}`}
                dir="ltr"
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                type="date"
                value={formData.startDate}
              />
              {errors.startDate && (
                <p
                  className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : "text-start"}`}
                >
                  {errors.startDate}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "flex-row-reverse justify-end" : "justify-start"}`}
              >
                <RTLIcon>
                  <Calendar className="h-4 w-4" />
                </RTLIcon>
                <span>{t("endDate")}</span>
              </label>
              <input
                className="h-10 w-full rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400"
                dir="ltr"
                disabled
                type="date"
                value={selectedPlan ? calculateEndDate(formData.startDate, selectedPlan.days) : ""}
              />
              <p
                className={`text-stone-500 text-xs dark:text-stone-400 ${isRTL ? "text-end" : "text-start"}`}
              >
                {t("autoCalculated")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary - Full Width */}
      {selectedCustomer && selectedPlan && (
        <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
          <h4
            className={`mb-2 font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "text-end" : "text-start"}`}
          >
            {t("subscriptionSummary")}
          </h4>
          <div className="space-y-1 text-sm">
            <p
              className={`text-stone-600 dark:text-stone-400 ${isRTL ? "text-end" : "text-start"}`}
            >
              {t("customer")}:{" "}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {selectedCustomer.name}
              </span>
            </p>
            <p
              className={`text-stone-600 dark:text-stone-400 ${isRTL ? "text-end" : "text-start"}`}
            >
              {t("plan")}:{" "}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {isRTL ? selectedPlan.labelAr : selectedPlan.labelEn}
              </span>
            </p>
            <p
              className={`text-stone-600 dark:text-stone-400 ${isRTL ? "text-end" : "text-start"}`}
            >
              {t("duration")}:{" "}
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {formData.startDate} → {calculateEndDate(formData.startDate, selectedPlan.days)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className={`flex gap-3 pt-2 ${isRTL ? "" : "flex-row-reverse"}`}>
        <button
          className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 font-medium text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          disabled={isLoading}
          onClick={onCancel}
          type="button"
        >
          {t("cancel")}
        </button>
        <button
          className={`flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 font-medium text-sm text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500 ${isRTL ? "flex-row-reverse" : ""}`}
          disabled={isLoading}
          type="submit"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("createSubscription")}
        </button>
      </div>
    </form>
  );
}
