import {
  AlertCircle,
  Box,
  Coffee,
  Cookie,
  Minus,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { CategoryOption, InventoryItem } from "@/types";

interface InventoryItemCardProps {
  item: InventoryItem;
  category: CategoryOption;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdjustQuantity?: (delta: number) => void;
}

export function InventoryItemCard({
  item,
  category,
  onEdit,
  onDelete,
  onAdjustQuantity,
}: InventoryItemCardProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  const getStockStatus = () => {
    if (item.quantity === 0) {
      return "out-of-stock";
    }
    if (item.quantity <= item.minStock) {
      return "low-stock";
    }
    return "in-stock";
  };

  const status = getStockStatus();
  const statusColors = {
    "in-stock": "text-stone-900 dark:text-stone-100",
    "low-stock": "text-amber-600 dark:text-amber-400",
    "out-of-stock": "text-red-600 dark:text-red-400",
  };

  const categoryIcons = {
    beverage: <Coffee className="h-4 w-4" />,
    snack: <Cookie className="h-4 w-4" />,
    other: <Box className="h-4 w-4" />,
  };

  return (
    <div
      className={`group relative flex h-full flex-col rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 ${status === "out-of-stock" ? "border-l-4 border-l-red-500" : "hover:border-amber-400/50"}`}
    >
      {/* 1. Top Row: Category & Actions */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          {categoryIcons[item.category as keyof typeof categoryIcons] || (
            <Package className="h-4 w-4" />
          )}
          <span className="font-bold text-xs uppercase tracking-wider">
            {isRTL ? category.labelAr : category.labelEn}
          </span>
        </div>

        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Hero Info: Name & Price */}
      <div className="flex flex-1 flex-col items-center px-4 py-3 text-center">
        <h3
          className="mb-1 line-clamp-2 font-bold text-base text-stone-800 leading-tight dark:text-stone-100"
          title={item.name}
        >
          {item.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-bold text-amber-600 text-lg dark:text-amber-500">{item.price}</span>
          <span className="font-medium text-stone-400 text-xs uppercase">{t("egp")}</span>
        </div>
      </div>

      {/* 3. Footer: Unified Stock Control */}
      <div className="mt-auto flex items-center justify-between rounded-b-xl border-stone-100 border-t bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-900/50">
        {/* Stock Indicator */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-bold font-mono text-xl ${statusColors[status]}`}>
              {item.quantity}
            </span>
            {status !== "in-stock" && (
              <AlertCircle
                className={`h-4 w-4 ${status === "out-of-stock" ? "text-red-500" : "text-amber-500"}`}
              />
            )}
          </div>
          <span className="font-medium text-stone-400 text-xs uppercase tracking-tight">
            {t("minStock")}: {item.minStock}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1 shadow-sm dark:border-stone-700 dark:bg-stone-800">
          <button
            className="flex h-7 w-7 items-center justify-center rounded bg-stone-100 text-stone-600 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-30 dark:bg-stone-700 dark:text-stone-300"
            disabled={item.quantity <= 0}
            onClick={() => onAdjustQuantity?.(-1)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded bg-stone-100 text-stone-600 transition-colors hover:bg-emerald-100 hover:text-emerald-600 dark:bg-stone-700 dark:text-stone-300"
            onClick={() => onAdjustQuantity?.(1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
