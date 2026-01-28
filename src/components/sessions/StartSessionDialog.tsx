import { Clock, Monitor, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput, FormLabel } from "@/components/ui/form";
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
  const activeSessions = useAppStore((state) => state.activeSessions);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [searchCustomer, setSearchCustomer] = useState("");

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const getCustomerButtonStyle = (isSelected: boolean, customerHasActiveSession: boolean) => {
    if (isSelected) {
      return "bg-amber-50 dark:bg-amber-900/20";
    }
    if (customerHasActiveSession) {
      return "cursor-not-allowed bg-stone-50 opacity-50 dark:bg-stone-800/20";
    }
    return "hover:bg-stone-50 dark:hover:bg-stone-800/50";
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent maxWidth="3xl">
        <DialogHeader icon={<Clock className="h-5 w-5" />}>
          <DialogTitle>{t("startNewSession")}</DialogTitle>
        </DialogHeader>

        <DialogBody className="p-4 sm:p-5">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Customer Selection */}
              <div className="flex flex-col gap-3">
                <FormLabel icon={<User className="h-4 w-4" />}>{t("selectCustomer")}</FormLabel>

                <FormInput
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  placeholder={t("searchByNameOrId")}
                  type="text"
                  value={searchCustomer}
                />

                <div className="scrollbar-thin h-64 overflow-y-auto rounded-xl border border-stone-100 bg-stone-50/30 dark:border-stone-800 dark:bg-stone-900/30">
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
                            className={`flex w-full items-center justify-between p-3.5 text-start transition-all ${getCustomerButtonStyle(isSelected, customerHasActiveSession)}`}
                            disabled={customerHasActiveSession}
                            key={customer.id}
                            onClick={() =>
                              !customerHasActiveSession && setSelectedCustomer(customer.id)
                            }
                            type="button"
                          >
                            <div className="flex flex-col">
                              <span
                                className={`font-medium text-sm ${
                                  isSelected
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "text-stone-700 dark:text-stone-300"
                                }`}
                              >
                                {customer.name}
                              </span>
                              <span className="font-mono text-stone-400 text-xs uppercase">
                                {customer.humanId}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {customerIsSubscribed && (
                                <Badge size="sm" variant="success">
                                  {t("subscribed")}
                                </Badge>
                              )}
                              {customerHasActiveSession && (
                                <Badge size="sm" variant="default">
                                  {t("busyNow")}
                                </Badge>
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
                <FormLabel icon={<Monitor className="h-4 w-4" />}>{t("selectResource")}</FormLabel>
                <div className="hidden h-11 lg:block" /> {/* Align with search box on desktop */}
                <div className="scrollbar-thin h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                    {availableResources.map((resource) => {
                      const isSelected = selectedResource === resource.id;
                      return (
                        <button
                          className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl border transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500 dark:bg-amber-900/20"
                              : "border-stone-200 bg-white hover:border-amber-200 dark:border-stone-800 dark:bg-stone-800 dark:hover:border-stone-700"
                          }`}
                          key={resource.id}
                          onClick={() => setSelectedResource(resource.id)}
                          type="button"
                        >
                          <span
                            className={`line-clamp-1 text-center font-medium text-sm ${
                              isSelected
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-stone-700 dark:text-stone-200"
                            }`}
                          >
                            {resource.name}
                          </span>
                          <span className="font-semibold text-stone-400 text-xs uppercase">
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
              <div className="flex flex-col gap-4 rounded-xl border border-stone-100 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-stone-800 dark:bg-stone-800/50">
                <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[10px] text-stone-400 uppercase tracking-tight">
                      {t("customer")}
                    </span>
                    <span className="font-medium text-sm text-stone-800 dark:text-stone-100">
                      {selectedCustomerData.name}
                    </span>
                  </div>
                  <div className="hidden h-8 w-px bg-stone-200 sm:block dark:bg-stone-700" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[10px] text-stone-400 uppercase tracking-tight">
                      {t("resource")}
                    </span>
                    <span className="font-medium text-sm text-stone-800 dark:text-stone-100">
                      {selectedResourceData.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col border-stone-200 border-t pt-3 sm:border-0 sm:pt-0 sm:text-end dark:border-stone-700">
                  <span className="block font-semibold text-[10px] text-stone-400 uppercase tracking-tight">
                    {t("rate")}
                  </span>
                  <span
                    className={`font-bold text-base ${
                      isSubscribed ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {isSubscribed
                      ? t("freeSubscription")
                      : `${selectedResourceData.ratePerHour} ${t("egpHr")}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="flex-col-reverse sm:flex-row">
          <Button
            className="w-full sm:flex-1"
            disabled={isLoading}
            onClick={handleClose}
            size="md"
            variant="ghost"
          >
            {t("cancel")}
          </Button>
          <Button
            className="w-full sm:flex-1"
            disabled={isLoading || !selectedCustomer || !selectedResource}
            isLoading={isLoading}
            onClick={handleSubmit}
            size="md"
            variant="primary"
          >
            {!isLoading && <Clock className="h-4 w-4" />}
            {t("startSession")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
