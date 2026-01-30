import { useAppStore } from "@/stores/useAppStore";
import type { PlanTypeOption, Subscription } from "@/types";

interface SubscriptionCardProps {
  subscription: Subscription;
  planType: PlanTypeOption;
  onView?: (id: string) => void;
}

export function SubscriptionCard({ subscription, planType, onView }: SubscriptionCardProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });

  const isExpiringSoon = subscription.status === "active" && subscription.daysRemaining <= 3;

  const getStatusColor = () => {
    if (subscription.status === "active") {
      return isExpiringSoon ? "bg-amber-500" : "bg-emerald-500";
    }
    if (subscription.status === "expired") {
      return "bg-red-500";
    }
    return "bg-stone-200 dark:bg-stone-800";
  };

  const getTextColor = () => {
    if (subscription.status === "active") {
      return isExpiringSoon ? "text-amber-500" : "text-emerald-500";
    }
    if (subscription.status === "expired") {
      return "text-red-500";
    }
    return "text-stone-400";
  };

  return (
    <div
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
      onClick={() => onView?.(subscription.id)}
    >
      <div className={`h-1.5 w-full ${getStatusColor()}`} />

      <div className="flex flex-1 flex-col space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-lg text-stone-900 dark:text-stone-100">
              {subscription.customerName}
            </h3>
            <p className="font-normal text-sm text-stone-500 dark:text-stone-400">
              {isRTL ? planType.labelAr : planType.labelEn}
            </p>
          </div>
          {subscription.status === "active" && (
            <div className="shrink-0 text-end">
              <span className={`font-semibold text-sm ${getTextColor()}`}>
                {subscription.daysRemaining} {t("days")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-end gap-3">
          <div className="flex items-center justify-between font-medium text-stone-400 text-xs uppercase tracking-tight">
            <span>{formatDate(subscription.startDate)}</span>
            <span>{formatDate(subscription.endDate)}</span>
          </div>

          {subscription.status === "active" ? (
            <div className="h-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isExpiringSoon ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{
                  width: `${Math.min(100, Math.max(0, (subscription.daysRemaining / planType.days) * 100))}%`,
                }}
              />
            </div>
          ) : (
            <div
              className={`rounded py-1 text-center font-bold text-xs uppercase tracking-widest ${subscription.status === "expired" ? "bg-red-50 text-red-500 dark:bg-red-900/10" : "bg-stone-100 text-stone-400 dark:bg-stone-800/50"}`}
            >
              {t(subscription.status)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
