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
    if (!open) handleClose();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent maxWidth="3xl">
        <DialogHeader icon={<Clock className="h-5 w-5" />}>
          <DialogTitle>{t("startNewSession")}</DialogTitle>
        </DialogHeader>

        <DialogBody className="p-5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
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
                            className={`flex w-full items-center justify-between p-3.5 text-start transition-all ${
                              isSelected
                                ? "bg-amber-50 dark:bg-amber-900/20"
                                : customerHasActiveSession
                                  ? "cursor-not-allowed bg-stone-50 opacity-50 dark:bg-stone-800/20"
                                  : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                            }`}
                            disabled={customerHasActiveSession}
                            key={customer.id}
                            onClick={() =>
                              !customerHasActiveSession && setSelectedCustomer(customer.id)
                            }
                            type="button"
                          >
                            <div className="flex flex-col">
                              <span
                                className={`text-sm ${
                                  isSelected
                                    ? "font-semibold text-amber-700 dark:text-amber-400"
                                    : "font-medium text-stone-700 dark:text-stone-300"
                                }`}
                              >
                                {customer.name}
                              </span>
                              <span className="font-mono font-normal text-stone-400 text-xs uppercase">
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
                <div className="h-11" /> {/* Align with search box */}
                <div className="scrollbar-thin h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
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
                            className={`text-sm ${
                              isSelected
                                ? "font-semibold text-amber-700 dark:text-amber-400"
                                : "font-medium text-stone-700 dark:text-stone-200"
                            } line-clamp-1 text-center`}
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
                    className={`font-black text-base ${
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
          </form>
        </DialogBody>

        <DialogFooter>
          <Button className="flex-1" disabled={isLoading} onClick={handleClose} variant="outline">
            {t("cancel")}
          </Button>
          <Button
            className="flex-1"
            disabled={isLoading || !selectedCustomer || !selectedResource}
            isLoading={isLoading}
            onClick={handleSubmit}
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
