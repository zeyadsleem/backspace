import { AlertTriangle, ChevronRight } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { LowStockAlert } from "@/types";

interface LowStockBannerProps {
  alerts: LowStockAlert[];
  onViewItem?: (id: string) => void;
  onViewAll?: () => void;
}

export function LowStockBanner({ alerts, onViewItem, onViewAll }: LowStockBannerProps) {
  const t = useAppStore((state) => state.t);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">{t("lowStockAlert")}</h3>
          <p className="mt-1 text-amber-700 text-sm dark:text-amber-300">
            {t("itemsBelowMinStock", { count: alerts.length })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {alerts.slice(0, 3).map((alert) => (
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-amber-50 dark:border-amber-800 dark:bg-stone-900 dark:hover:bg-amber-950/50"
                key={alert.id}
                onClick={() => onViewItem?.(alert.id)}
              >
                <span className="font-medium text-stone-700 dark:text-stone-300">{alert.name}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {alert.quantity}/{alert.minStock}
                </span>
              </button>
            ))}
            {alerts.length > 3 && (
              <span className="self-center text-amber-600 text-sm dark:text-amber-400">
                {t("more", { count: alerts.length - 3 })}
              </span>
            )}
          </div>
        </div>
        <button
          className="flex flex-shrink-0 items-center gap-1 font-medium text-amber-700 text-sm transition-colors hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
          onClick={onViewAll}
        >
          {t("viewAll")}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
