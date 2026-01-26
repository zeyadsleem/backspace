import { Clock, Loader2, Monitor, User } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/shared";
import { useTranslation } from "@/stores/hooks";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer, Resource, Subscription } from "@/types";

interface StartSessionDialogProps {
  isOpen: boolean;
  customers: Customer[];
  resources: Resource[];
  subscriptions: Subscription[];
  onSubmit?: (data: { customerId: string; resourceId: string }) => void;
  onCancel?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export function StartSessionDialog({
  isOpen,
  customers,
  resources,
  subscriptions,
  onSubmit,
  onCancel,
  onClose,
  isLoading = false,
}: StartSessionDialogProps) {
  const t = useTranslation();
  const isRTL = useAppStore((state) => state.isRTL);
  const activeSessions = useAppStore((state) => state.activeSessions);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [searchCustomer, setSearchCustomer] = useState("");

  if (!isOpen) {
    return null;
  }

  const availableResources = resources.filter((r) => r.isAvailable);
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.humanId.toLowerCase().includes(searchCustomer.toLowerCase())
  );
  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
  const selectedResourceData = resources.find((r) => r.id === selectedResource);
  const isSubscribed = selectedCustomer
    ? subscriptions.some((s) => s.customerId === selectedCustomer && s.isActive)
    : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && selectedResource) {
      onSubmit?.({
        customerId: selectedCustomer,
        resourceId: selectedResource,
      });
    }
  };

  const handleClose = () => {
    setSelectedCustomer("");
    setSelectedResource("");
    setSearchCustomer("");
    onClose?.();
    onCancel?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      maxWidth="max-w-3xl"
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <h2>{t("startNewSession")}</h2>
        </div>
      }
    >
      {/* Content */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 font-medium text-stone-500 text-xs uppercase tracking-wider dark:text-stone-400">
                <User className="h-4 w-4" />
                <span>{t("selectCustomer")}</span>
              </label>

              <input
                className={`h-11 w-full rounded-lg border border-stone-200 px-4 text-base focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? "text-right" : "text-left"}`}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder={t("searchByNameOrId")}
                type="text"
                value={searchCustomer}
              />

              <div className="scrollbar-thin h-64 overflow-y-auto rounded-lg border border-stone-100 bg-stone-50/30 dark:border-stone-800 dark:bg-stone-900/30">
                {filteredCustomers.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-4 text-center text-stone-400 opacity-70">
                    <p className="text-sm">{t("noCustomersFound")}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredCustomers.map((customer) => {
                      const customerIsSubscribed = subscriptions.some(
                        (s) => s.customerId === customer.id && s.isActive
                      );
                      const customerHasActiveSession = activeSessions.some(
                        (s) => s.customerId === customer.id
                      );
                      const isSelected = selectedCustomer === customer.id;

                      return (
                        <button
                          className={`flex w-full items-center justify-between p-3.5 transition-all ${isSelected ? "bg-amber-50 dark:bg-amber-900/20" : customerHasActiveSession ? "cursor-not-allowed bg-stone-50 opacity-50 dark:bg-stone-800/20" : "hover:bg-stone-50 dark:hover:bg-stone-800/50"}`}
                          disabled={customerHasActiveSession}
                          key={customer.id}
                          onClick={() =>
                            !customerHasActiveSession && setSelectedCustomer(customer.id)
                          }
                          type="button"
                        >
                          <div className={`flex flex-col ${isRTL ? "text-right" : "text-left"}`}>
                            <span
                              className={`text-sm ${isSelected ? "font-semibold text-amber-700 dark:text-amber-400" : "font-medium text-stone-700 dark:text-stone-300"}`}
                            >
                              {customer.name}
                            </span>
                            <span className="font-mono font-normal text-stone-400 text-xs uppercase">
                              {customer.humanId}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {customerIsSubscribed && (
                              <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 text-xs dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                                {t("subscribed")}
                              </span>
                            )}
                            {customerHasActiveSession && (
                              <span className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 font-bold text-stone-500 text-xs dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                                {isRTL ? "مشغول حالياً" : "Busy Now"}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Resource Selection */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 font-medium text-stone-500 text-xs uppercase tracking-wider dark:text-stone-400">
                <Monitor className="h-4 w-4" />
                <span>{t("selectResource")}</span>
              </label>
              <div className="h-11" /> {/* Align with search box */}
              <div className="scrollbar-thin h-64 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {availableResources.map((resource) => {
                    const isSelected = selectedResource === resource.id;
                    return (
                      <button
                        className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg border transition-all ${isSelected ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500 dark:bg-amber-900/20" : "border-stone-200 bg-white hover:border-amber-200 dark:border-stone-800 dark:bg-stone-800 dark:hover:border-stone-700"}`}
                        key={resource.id}
                        onClick={() => setSelectedResource(resource.id)}
                        type="button"
                      >
                        <span
                          className={`text-sm ${isSelected ? "font-semibold text-amber-700 dark:text-amber-400" : "font-medium text-stone-700 dark:text-stone-200"} line-clamp-1 text-center`}
                        >
                          {resource.name}
                        </span>
                        <span className="font-bold text-stone-400 text-xs uppercase">
                          {resource.ratePerHour} {t("egp")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedCustomerData && selectedResourceData && (
            <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-4 px-6 dark:border-stone-800 dark:bg-stone-800/50">
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="font-bold text-stone-400 text-xs uppercase tracking-tight">
                    {t("customer")}
                  </span>
                  <span className="font-bold text-sm text-stone-800 dark:text-stone-100">
                    {selectedCustomerData.name}
                  </span>
                </div>
                <div className="h-8 w-px bg-stone-200 dark:bg-stone-700" />
                <div className="flex flex-col">
                  <span className="font-bold text-stone-400 text-xs uppercase tracking-tight">
                    {t("resource")}
                  </span>
                  <span className="font-bold text-sm text-stone-800 dark:text-stone-100">
                    {selectedResourceData.name}
                  </span>
                </div>
              </div>
              <div className="text-end">
                <span className="block font-bold text-stone-400 text-xs uppercase tracking-tight">
                  {t("rate")}
                </span>
                <span
                  className={`font-black text-base ${isSubscribed ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {isSubscribed
                    ? t("freeSubscription")
                    : `${selectedResourceData.ratePerHour} ${t("egpHr")}`}
                </span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 gap-4 rounded-b-xl border-stone-200 border-t bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900/50">
        <button
          className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 font-bold text-sm text-stone-600 uppercase tracking-wide transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          disabled={isLoading}
          onClick={handleClose}
          type="button"
        >
          {t("cancel")}
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-bold text-sm text-white uppercase tracking-wide shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
          disabled={isLoading || !selectedCustomer || !selectedResource}
          onClick={handleSubmit}
          type="button"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("startSession")}
        </button>
      </div>
    </Modal>
  );
}
