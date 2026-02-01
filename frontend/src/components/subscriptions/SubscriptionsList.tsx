import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && sub.isActive) ||
      (statusFilter === "inactive" && !sub.isActive);
    const matchesType = typeFilter === "all" || sub.planType === typeFilter;
    const matchesSearch = searchQuery === "" || 
      sub.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const activeCount = subscriptions.filter((s) => s.isActive).length;
  const expiringCount = subscriptions.filter((s) => s.isActive && s.daysRemaining <= 3).length;

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
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
        <Button onClick={onCreate} size="md" variant="primary">
          <Plus className="h-4 w-4" />
          {t("newSubscription")}
        </Button>
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
        <div className="relative flex-1">
          <Search className={`absolute ${isRTL ? "end-3" : "start-3"} top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400`} />
          <input
            className="w-full rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchSubscriptions")}
            type="text"
            value={searchQuery}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-280px)]">
        {filteredSubscriptions.length === 0 ? (
          <EmptyState
            description={
              statusFilter !== "all" || typeFilter !== "all" || searchQuery
                ? t("tryAdjustingFilters")
                : t("createFirstSubscription")
            }
            icon="subscriptions"
            title={t("noSubscriptionsFound")}
          />
        ) : (
          <div className="grid 3xl:grid-cols-6 4xl:grid-cols-8 grid-cols-1 items-stretch gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
    </div>
  );
}
