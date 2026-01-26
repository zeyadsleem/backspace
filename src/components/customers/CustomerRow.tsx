import { Eye, Pencil, Trash2 } from "lucide-react";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer, CustomerType } from "@/types";

interface CustomerRowProps {
  customer: Customer;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CustomerRow({ customer, onView, onEdit, onDelete }: CustomerRowProps) {
  const t = useAppStore((state) => state.t);

  const typeConfig: Record<CustomerType, { labelKey: TranslationKey; color: string; bg: string }> =
    {
      visitor: {
        labelKey: "visitorType",
        color: "text-stone-600 dark:text-stone-400",
        bg: "bg-stone-100 dark:bg-stone-800",
      },
      weekly: {
        labelKey: "weeklyMember",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/30",
      },
      "half-monthly": {
        labelKey: "halfMonthlyMember",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/30",
      },
      monthly: {
        labelKey: "monthlyMember",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/30",
      },
    };

  const config = typeConfig[customer.customerType];
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const formatBalance = (balance: number) => {
    const formatted = Math.abs(balance).toLocaleString("en-EG");
    if (balance < 0) {
      return `-${formatted} ${t("egp")}`;
    }
    if (balance > 0) {
      return `+${formatted} ${t("egp")}`;
    }
    return `0 ${t("egp")}`;
  };

  return (
    <div className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-stone-50 md:grid-cols-12 md:gap-4 dark:hover:bg-stone-800/50">
      <div className="col-span-1 hidden items-center md:flex">
        <span className="font-mono text-sm text-stone-500 uppercase tracking-tight dark:text-stone-400">
          {customer.humanId}
        </span>
      </div>
      <div className="col-span-1 flex items-center gap-3 md:col-span-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <span className="font-semibold text-amber-700 text-sm dark:text-amber-300">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-sm text-stone-900 dark:text-stone-100">
              {customer.name}
            </p>
            <span className="font-mono text-stone-400 text-xs md:hidden">{customer.humanId}</span>
          </div>
          {customer.email && (
            <p className="truncate text-stone-500 text-xs dark:text-stone-400">{customer.email}</p>
          )}
        </div>
      </div>
      <div className="col-span-1 flex items-center md:col-span-2">
        <span className="font-mono text-sm text-stone-600 dark:text-stone-400">
          {customer.phone}
        </span>
      </div>
      <div className="col-span-1 flex items-center md:col-span-2">
        <span
          className={`rounded-full px-2.5 py-1 font-medium text-xs ${config.bg} ${config.color}`}
        >
          {t(config.labelKey)}
        </span>
      </div>
      <div className="col-span-1 flex items-center md:col-span-2 md:justify-center">
        <span
          className={cn(
            "font-medium text-sm",
            customer.balance < 0 && "text-red-600 dark:text-red-400",
            customer.balance > 0 && "text-emerald-600 dark:text-emerald-400",
            customer.balance === 0 && "text-stone-500 dark:text-stone-400"
          )}
        >
          {formatBalance(customer.balance)}
        </span>
      </div>
      <div className="col-span-1 flex items-center justify-end gap-1 md:col-span-2">
        <button
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          onClick={onView}
          title={t("view")}
          type="button"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          onClick={onEdit}
          title={t("edit")}
          type="button"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          onClick={onDelete}
          title={t("delete")}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
