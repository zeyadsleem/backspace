import { AlertTriangle, XCircle } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { InventoryItem } from "@/types";

interface LowStockAlertProps {
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  onItemClick?: (id: string) => void;
}

export function LowStockAlert({ lowStockItems, outOfStockItems, onItemClick }: LowStockAlertProps) {
  const t = useAppStore((state) => state.t);
  if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {outOfStockItems.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                {t("outOfStockTitle")}
              </h3>
              <p className="mt-1 text-red-700 text-sm dark:text-red-300">
                {outOfStockItems.length} {t("outOfStockMessage")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {outOfStockItems.slice(0, 5).map((item) => (
                  <button
                    className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-stone-900 dark:hover:bg-red-950/50"
                    key={item.id}
                    onClick={() => onItemClick?.(item.id)}
                  >
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {item.name}
                    </span>
                  </button>
                ))}
                {outOfStockItems.length > 5 && (
                  <span className="self-center text-red-600 text-sm dark:text-red-400">
                    +{outOfStockItems.length - 5} {t("moreItems")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                {t("lowStockWarning")}
              </h3>
              <p className="mt-1 text-amber-700 text-sm dark:text-amber-300">
                {lowStockItems.length} {t("lowStockMessage")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-amber-50 dark:border-amber-800 dark:bg-stone-900 dark:hover:bg-amber-950/50"
                    key={item.id}
                    onClick={() => onItemClick?.(item.id)}
                  >
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {item.name}
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {item.quantity}/{item.minStock}
                    </span>
                  </button>
                ))}
                {lowStockItems.length > 5 && (
                  <span className="self-center text-amber-600 text-sm dark:text-amber-400">
                    +{lowStockItems.length - 5} {t("moreItems")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
