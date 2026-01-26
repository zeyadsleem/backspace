import { Package, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { CategoryOption, InventoryCategory, InventoryItem } from "@/types";
import { InventoryItemCard } from "./InventoryItemCard";
import { LowStockAlert } from "./LowStockAlert";

interface InventoryListProps {
  inventory: InventoryItem[];
  categories: CategoryOption[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onAdjustQuantity?: (id: string, delta: number) => void;
}

export function InventoryList({
  inventory,
  categories,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onAdjustQuantity,
}: InventoryListProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | "all">("all");

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minStock && item.quantity > 0
  );
  const outOfStockItems = inventory.filter((item) => item.quantity === 0);

  const groupedInventory = categories.reduce(
    (acc, category) => {
      const items = filteredInventory.filter((item) => item.category === category.id);
      if (items.length > 0) {
        acc.push({ category, items });
      }
      return acc;
    },
    [] as Array<{ category: CategoryOption; items: InventoryItem[] }>
  );

  const gridClass =
    "grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 items-stretch";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-6 p-6 pb-2">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">
              {t("inventory")}
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {t("totalItems", { count: inventory.length })}
              {lowStockItems.length > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {" "}
                  · {lowStockItems.length} {t("lowStock")}
                </span>
              )}
              {outOfStockItems.length > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  {" "}
                  · {outOfStockItems.length} {t("outOfStock")}
                </span>
              )}
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-amber-600"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            {t("newItem")}
          </button>
        </div>

        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <LowStockAlert
            lowStockItems={lowStockItems}
            onItemClick={onView}
            outOfStockItems={outOfStockItems}
          />
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              className="w-full rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-4 text-start text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchInventory")}
              type="text"
              value={searchQuery}
            />
          </div>
          <div className="flex overflow-x-auto rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
            <button
              className={`whitespace-nowrap rounded-lg px-4 py-1.5 font-medium text-sm transition-all ${categoryFilter === "all" ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-500 hover:text-stone-700"}`}
              onClick={() => setCategoryFilter("all")}
            >
              {t("allCategories")}
            </button>
            {categories.map((cat) => (
              <button
                className={`whitespace-nowrap rounded-lg px-4 py-1.5 font-medium text-sm transition-all ${categoryFilter === cat.id ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-500 hover:text-stone-700"}`}
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {isRTL ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Items Grid */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-6 pt-2">
        {filteredInventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-stone-100 p-4 dark:bg-stone-800">
              <Package className="h-8 w-8 text-stone-400" />
            </div>
            <h3 className="font-medium text-lg text-stone-900 dark:text-stone-100">
              {t("noInventoryFound")}
            </h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {t("tryAdjustingFilters")}
            </p>
          </div>
        ) : categoryFilter === "all" ? (
          <div className="space-y-10 pb-6">
            {groupedInventory.map(({ category, items }) => (
              <div key={category.id}>
                <div className="mb-5 flex items-center gap-3 px-1">
                  <h2 className="font-bold text-sm text-stone-400 uppercase tracking-[0.2em]">
                    {isRTL ? category.labelAr : category.labelEn}
                  </h2>
                  <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
                  <span className="font-bold text-stone-300 text-xs uppercase tracking-widest">
                    {t("items", { count: items.length })}
                  </span>
                </div>{" "}
                <div className={gridClass}>
                  {items.map((item) => (
                    <InventoryItemCard
                      category={category}
                      item={item}
                      key={item.id}
                      onAdjustQuantity={(delta) => onAdjustQuantity?.(item.id, delta)}
                      onDelete={() => onDelete?.(item.id)}
                      onEdit={() => onEdit?.(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${gridClass} pb-6`}>
            {filteredInventory.map((item) => {
              const category = categories.find((c) => c.id === item.category)!;
              return (
                <InventoryItemCard
                  category={category}
                  item={item}
                  key={item.id}
                  onAdjustQuantity={(delta) => onAdjustQuantity?.(item.id, delta)}
                  onDelete={() => onDelete?.(item.id)}
                  onEdit={() => onEdit?.(item.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
