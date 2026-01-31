import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
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

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minStock && item.quantity > 0
  );
  const outOfStockItems = inventory.filter((item) => item.quantity === 0);

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
          <Button onClick={onCreate} size="md" variant="primary">
            <Plus className="h-4 w-4" />
            {t("newItem")}
          </Button>
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
              type="button"
            >
              {t("allCategories")}
            </button>
            {categories.map((cat) => (
              <button
                className={`whitespace-nowrap rounded-lg px-4 py-1.5 font-medium text-sm transition-all ${categoryFilter === cat.id ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-500 hover:text-stone-700"}`}
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                type="button"
              >
                {isRTL ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Items Grid */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        {filteredItems.length === 0 ? (
          <EmptyState description={t("noItemsFound")} icon="inventory" title={t("noItemsFound")} />
        ) : categoryFilter === "all" ? (
          <div className="space-y-10 pb-6">
            {categories.map((category) => {
              const categoryItems = filteredItems.filter((item) => item.category === category.id);
              if (categoryItems.length === 0) {
                return null;
              }

              return (
                <div className="space-y-4" key={category.id}>
                  <div className="flex items-center gap-2 border-stone-100 border-b pb-2 dark:border-stone-800">
                    <h2 className="font-bold text-sm text-stone-900 uppercase tracking-widest dark:text-stone-100">
                      {isRTL ? category.labelAr : category.labelEn}
                    </h2>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 font-bold text-stone-500 text-xs dark:bg-stone-800">
                      {categoryItems.length}
                    </span>
                  </div>
                  <div className="grid 3xl:grid-cols-9 4xl:grid-cols-12 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                    {categoryItems.map((item) => (
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
              );
            })}
          </div>
        ) : (
          <div className="grid 3xl:grid-cols-9 4xl:grid-cols-12 grid-cols-1 gap-4 pb-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {filteredItems.map((item) => (
              <InventoryItemCard
                category={categories.find((c) => c.id === item.category)!}
                item={item}
                key={item.id}
                onAdjustQuantity={(delta) => onAdjustQuantity?.(item.id, delta)}
                onDelete={() => onDelete?.(item.id)}
                onEdit={() => onEdit?.(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
