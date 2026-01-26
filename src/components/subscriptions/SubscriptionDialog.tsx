import { CreditCard, X } from "lucide-react";
import type { Customer, PlanTypeOption } from "@/types";
import { SubscriptionForm } from "./SubscriptionForm";

interface SubscriptionDialogProps {
  isOpen: boolean;
  title: string;
  customers: Customer[];
  planTypes: PlanTypeOption[];
  onSubmit?: (data: { customerId: string; planType: string; startDate: string }) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export function SubscriptionDialog({
  isOpen,
  title,
  customers,
  planTypes,
  onSubmit,
  onClose,
  isLoading,
}: SubscriptionDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white p-6 shadow-xl dark:bg-stone-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">{title}</h2>
          </div>
          <button
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SubscriptionForm
          customers={customers}
          isLoading={isLoading}
          onCancel={onClose}
          onSubmit={onSubmit}
          planTypes={planTypes}
        />
      </div>
    </div>
  );
}
