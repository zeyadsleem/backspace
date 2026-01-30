import { Power, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/shared";
import { Button, IconButton } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import type { PlanTypeOption, Subscription } from "@/types";

interface SubscriptionDetailsDialogProps {
  isOpen: boolean;
  subscription: Subscription | null;
  plan?: PlanTypeOption;
  planTypes: PlanTypeOption[];
  onClose: () => void;
  onChangePlan?: (id: string, newPlanType: string) => void;
  onCancelSubscription?: (id: string, refundAmount: number) => void;
}

export function SubscriptionDetailsDialog({
  isOpen,
  subscription,
  plan,
  planTypes,
  onClose,
  onChangePlan,
  onCancelSubscription,
}: SubscriptionDetailsDialogProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const reactivateSubscription = useAppStore((state) => state.reactivateSubscription);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);

  if (!(isOpen && subscription && plan)) {
    return null;
  }

  const handleReactivate = () => {
    reactivateSubscription(subscription.id);
  };

  const handleCancel = () => {
    onCancelSubscription?.(subscription.id, refundAmount);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleChangePlan = (newPlanId: string) => {
    onChangePlan?.(subscription.id, newPlanId);
    setShowChangePlan(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getStatusColor = () => {
    if (subscription.status === "active") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    }
    if (subscription.status === "expired") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
    return "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";
  };

  const otherPlans = planTypes.filter((p) => p.id !== subscription.planType);

  return (
    <Modal
      className="flex max-h-[90vh] flex-col overflow-hidden"
      isOpen={isOpen}
      maxWidth="lg"
      onClose={onClose}
      showCloseButton={false}
    >
      <div className="flex items-center justify-between border-stone-100 border-b bg-stone-50/50 p-6 dark:border-stone-800 dark:bg-stone-900/50">
        <h2 className="font-bold text-lg text-stone-900 dark:text-stone-100">
          {t("subscriptionDetails")}
        </h2>
        <IconButton
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          icon={<X className="h-5 w-5" />}
          label="Close"
          onClick={onClose}
          variant="ghost"
        />
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {/* Customer and Plan Info */}
        <div className="flex items-center gap-4 rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-base dark:bg-amber-900/30 dark:text-amber-400">
            {subscription.customerName.charAt(0)}
          </div>
          <div className="min-w-0 flex-grow">
            <p className="truncate font-bold text-sm text-stone-900 dark:text-stone-100">
              {subscription.customerName}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-medium text-stone-500 text-xs dark:text-stone-400">
                {isRTL ? plan.labelAr : plan.labelEn}
              </span>
              <span className="h-0.5 w-0.5 rounded-full bg-stone-300" />
              <span className="font-bold text-amber-600 text-xs">
                {plan.price} {t("egp")}
              </span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-stone-100 p-3 dark:border-stone-800">
            <label className="mb-1 block font-bold text-stone-400 text-xs uppercase tracking-widest">
              {t("startDate")}
            </label>
            <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">
              {formatDate(subscription.startDate)}
            </p>
          </div>
          <div className="rounded-lg border border-stone-100 p-3 dark:border-stone-800">
            <label className="mb-1 block font-bold text-stone-400 text-xs uppercase tracking-widest">
              {t("endDate")}
            </label>
            <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">
              {formatDate(subscription.endDate)}
            </p>
          </div>
        </div>

        {/* Status and Remaining */}
        <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <label className="block font-bold text-stone-400 text-xs uppercase tracking-widest">
                {t("status")}
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-bold text-xs uppercase tracking-wider ${getStatusColor()}`}
                >
                  {t(subscription.status)}
                </span>
              </div>
            </div>
            {subscription.status === "active" && (
              <div className="text-end">
                <p className="mb-0.5 font-black text-stone-900 text-xl dark:text-stone-100">
                  {subscription.daysRemaining}
                </p>
                <p className="font-bold text-[10px] text-stone-400 uppercase">
                  {t("daysRemaining")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Actions (Change Plan / Cancel) */}
        {subscription.status === "active" && !showChangePlan && !showCancelConfirm && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 p-3 transition-all hover:border-amber-300 hover:bg-amber-50/30 dark:border-stone-800 dark:hover:border-amber-900/50"
              onClick={() => setShowChangePlan(true)}
            >
              <RefreshCw className="h-5 w-5 text-amber-500 transition-transform duration-500 group-hover:rotate-180" />
              <span className="font-bold text-stone-600 text-xs dark:text-stone-400">
                {t("changePlan")}
              </span>
            </button>
            <button
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 p-3 transition-all hover:border-red-300 hover:bg-red-50/30 dark:border-stone-800 dark:hover:border-red-900/50"
              onClick={() => setShowCancelConfirm(true)}
            >
              <Power className="h-5 w-5 text-red-500" />
              <span className="font-bold text-stone-600 text-xs dark:text-stone-400">
                {t("cancelSubscription")}
              </span>
            </button>
          </div>
        )}

        {/* Change Plan UI */}
        {showChangePlan && (
          <div className="animate-fade-in space-y-4 rounded-xl border-2 border-amber-100 bg-amber-50/10 p-4 dark:border-amber-900/20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-700 text-sm dark:text-amber-400">
                {t("chooseNewPlan")}
              </h3>
              <button
                className="text-stone-400 hover:text-stone-600"
                onClick={() => setShowChangePlan(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2">
              {otherPlans.map((p) => (
                <button
                  className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white p-3 transition-all hover:border-amber-500 dark:border-stone-700 dark:bg-stone-800"
                  key={p.id}
                  onClick={() => handleChangePlan(p.id)}
                >
                  <span className="font-bold text-sm text-stone-800 dark:text-stone-200">
                    {isRTL ? p.labelAr : p.labelEn}
                  </span>
                  <span className="font-bold font-mono text-amber-600">
                    {p.price} {t("egp")}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-stone-500 text-xs italic">{t("changePlanNote")}</p>
          </div>
        )}

        {/* Cancel Confirm UI */}
        {showCancelConfirm && (
          <div className="animate-fade-in space-y-4 rounded-xl border-2 border-red-100 bg-red-50/10 p-4 dark:border-red-900/20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-700 text-sm dark:text-red-400">
                {t("confirmCancellation")}
              </h3>
              <button
                className="text-stone-400 hover:text-stone-600"
                onClick={() => setShowCancelConfirm(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-red-600/80 text-xs leading-relaxed">{t("cancelWarning")}</p>
            <div className="space-y-2">
              <label className="font-bold text-stone-500 text-xs uppercase">
                {t("refundAmount")} ({t("optional")})
              </label>
              <div className="relative">
                <input
                  className="h-10 w-full rounded-lg border border-red-200 bg-white px-3 font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-900/30 dark:bg-stone-800"
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  step="any"
                  type="number"
                  value={refundAmount}
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-xs">
                  {t("egp")}
                </span>
              </div>
            </div>
            <button
              className="h-10 w-full rounded-lg bg-red-600 font-bold text-sm text-white shadow-lg shadow-red-600/10 hover:bg-red-700"
              onClick={handleCancel}
            >
              {t("confirmCancelAndRefund")}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-stone-100 border-t bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-800/50">
        {subscription.status !== "active" ? (
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleReactivate}
            size="md"
            variant="primary"
          >
            <RefreshCw className="h-4 w-4" /> {t("reactivateSubscription")}
          </Button>
        ) : (
          <Button className="flex-1" onClick={onClose} size="md" variant="outline">
            {t("close")}
          </Button>
        )}
      </div>
    </Modal>
  );
}
