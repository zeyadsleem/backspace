import { Coffee, CreditCard, History, Play, Receipt, Search, Square, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { OperationRecord, OperationType } from "@/types";

const operationConfig: Record<
  OperationType,
  { icon: typeof Play; label: string; color: string; bg: string }
> = {
  session_start: {
    icon: Play,
    label: "Session Started",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  session_end: {
    icon: Square,
    label: "Session Ended",
    color: "text-stone-600 dark:text-stone-400",
    bg: "bg-stone-100 dark:bg-stone-800",
  },
  inventory_add: {
    icon: Coffee,
    label: "Inventory Added",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  invoice_created: {
    icon: Receipt,
    label: "Invoice Created",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  payment_received: {
    icon: CreditCard,
    label: "Payment Received",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  customer_new: {
    icon: UserPlus,
    label: "New Customer",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  subscription_new: {
    icon: CreditCard,
    label: "New Subscription",
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
  const isRTL = useAppStore((state) => state.isRTL);

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || op.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 ${isRTL ? "end-3" : "start-3"}`}
          />
          <input
            className={`w-full rounded-lg border border-stone-200 bg-white py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900 ${isRTL ? "ps-10 pe-4 text-end" : "ps-10 pe-4 text-start"}`}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operations..."
            type="text"
            value={searchQuery}
          />
        </div>
        <select
          className={`rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900 ${isRTL ? "text-end" : "text-start"}`}
          onChange={(e) => setTypeFilter(e.target.value as OperationType | "all")}
          value={typeFilter}
        >
          <option value="all">All Types</option>
          {Object.entries(operationConfig).map(([type, config]) => (
            <option key={type} value={type}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {filteredOperations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-stone-100 p-4 dark:bg-stone-800">
            <History className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="font-medium text-lg text-stone-900 dark:text-stone-100">
            No operations found
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {searchQuery || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Operations will appear here as they happen"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredOperations.map((operation) => {
              const config = operationConfig[operation.type];
              const Icon = config.icon;
              return (
                <button
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
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
                      {config.label}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-stone-500 text-xs dark:text-stone-400">
                    {formatTime(operation.timestamp)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
