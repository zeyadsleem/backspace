import { CreditCard, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { PlanType, PlanTypeOption, Subscription } from "@/types";
import { SubscriptionCard } from "./SubscriptionCard";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  planTypes: PlanTypeOption[];
  onView?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onCreate?: () => void;
}

export function SubscriptionsList({
  subscriptions,
  planTypes,
  onView,
  onCreate,
}: SubscriptionsListProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<PlanType | "all">("all");

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && sub.isActive) ||
      (statusFilter === "inactive" && !sub.isActive);
    const matchesType = typeFilter === "all" || sub.planType === typeFilter;
    return matchesStatus && matchesType;
  });

  const activeCount = subscriptions.filter((s) => s.isActive).length;
  const expiringCount = subscriptions.filter((s) => s.isActive && s.daysRemaining <= 3).length;

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">
            {t("subscriptions")}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            <span className="text-emerald-600 dark:text-emerald-400">
              {activeCount} {t("active")}
            </span>
            {expiringCount > 0 && (
              <>
                {" · "}
                <span className="text-amber-600 dark:text-amber-400">
                  {expiringCount} {t("expiringSoon")}
                </span>
              </>
            )}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-amber-600"
          onClick={onCreate}
        >
          <Plus className="h-4 w-4" />
          {t("newSubscription")}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${statusFilter === status ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"}`}
              key={status}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? t("all") : status === "active" ? t("active") : t("inactive")}
            </button>
          ))}
        </div>
        <div className="relative">
          <Filter className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <select
            className="cursor-pointer appearance-none rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-8 text-start text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
            onChange={(e) => setTypeFilter(e.target.value as PlanType | "all")}
            value={typeFilter}
          >
            <option value="all">{t("allPlans")}</option>
            {planTypes.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {isRTL ? plan.labelAr : plan.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredSubscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-stone-100 p-4 dark:bg-stone-800">
            <CreditCard className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="font-medium text-lg text-stone-900 dark:text-stone-100">
            {t("noSubscriptionsFound")}
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {statusFilter !== "all" || typeFilter !== "all"
              ? t("tryAdjustingFilters")
              : t("createFirstSubscription")}
          </p>
          {statusFilter === "all" && typeFilter === "all" && (
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-amber-600"
              onClick={onCreate}
            >
              <Plus className="h-4 w-4" />
              {t("newSubscription")}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-8">
          {filteredSubscriptions.map((subscription) => {
            const planType = planTypes.find((p) => p.id === subscription.planType)!;
            return (
              <SubscriptionCard
                key={subscription.id}
                onView={() => onView?.(subscription.id)}
                planType={planType}
                subscription={subscription}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
