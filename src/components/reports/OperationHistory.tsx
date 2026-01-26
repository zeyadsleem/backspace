import { Coffee, CreditCard, Filter, History, Play, Receipt, Search, Square, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { TranslationKey } from "@/lib/translations";
import type { OperationRecord, OperationType } from "@/types";

const operationConfig: Record<
  OperationType,
  { icon: typeof Play; labelKey: TranslationKey; color: string; bg: string }
> = {
  session_start: {
    icon: Play,
    labelKey: "session_start",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  session_end: {
    icon: Square,
    labelKey: "session_end",
    color: "text-stone-600 dark:text-stone-400",
    bg: "bg-stone-100 dark:bg-stone-800",
  },
  inventory_add: {
    icon: Coffee,
    labelKey: "inventory_add",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  invoice_created: {
    icon: Receipt,
    labelKey: "invoice_created",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  payment_received: {
    icon: CreditCard,
    labelKey: "payment_received",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  customer_new: {
    icon: UserPlus,
    labelKey: "customer_new",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  subscription_new: {
    icon: CreditCard,
    labelKey: "subscription_new",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
};

interface OperationHistoryProps {
  operations: OperationRecord[];
  onOperationClick?: (id: string) => void;
}

export function OperationHistory({ operations, onOperationClick }: OperationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OperationType | "all">("all");
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const language = useAppStore((state) => state.language);

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || op.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className={`flex flex-shrink-0 flex-col gap-3 sm:flex-row ${isRTL ? "sm:flex-row-reverse" : ""}`}>
        <div className="relative flex-1">
          <Search
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 ${isRTL ? "right-3" : "left-3"}`}
          />
          <input
            className={`w-full rounded-lg border border-stone-200 bg-white py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900 ${isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"}`}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchByNamePhone")}
            type="text"
            value={searchQuery}
          />
        </div>
        <div className="relative">
          <Filter className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 ${isRTL ? "right-3" : "left-3"}`} />
          <select
            className={`cursor-pointer appearance-none rounded-lg border border-stone-200 bg-white py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900 ${isRTL ? "pr-10 pl-8 text-right" : "pl-10 pr-8 text-left"}`}
            onChange={(e) => setTypeFilter(e.target.value as OperationType | "all")}
            value={typeFilter}
          >
            <option value="all">{t("allTypes")}</option>
            {Object.entries(operationConfig).map(([type, config]) => (
              <option key={type} value={type}>
                {t(config.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="scrollbar-thin h-full overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
          {filteredOperations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-stone-100 p-4 dark:bg-stone-800">
                <History className="h-8 w-8 text-stone-400" />
              </div>
              <h3 className="font-medium text-lg text-stone-900 dark:text-stone-100">
                {t("noOperations")}
              </h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {searchQuery || typeFilter !== "all" ? t("tryAdjustingFilters") : t("noOperations")}
              </p>
            </div>
          ) : (
            filteredOperations.map((operation) => {
              const config = operationConfig[operation.type];
              const Icon = config.icon;
              return (
                <button
                  className={`flex w-full items-center gap-4 p-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50 ${isRTL ? "text-right flex-row-reverse" : "text-left"}`}
                  key={operation.id}
                  onClick={() => onOperationClick?.(operation.id)}
                  type="button"
                >
                  <div className={`flex-shrink-0 rounded-lg p-2 ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
                      {operation.description}
                    </p>
                    <p className="mt-0.5 text-stone-500 text-xs dark:text-stone-400">
                      {t(config.labelKey)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-stone-500 text-xs dark:text-stone-400">
                    {formatTime(operation.timestamp)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
