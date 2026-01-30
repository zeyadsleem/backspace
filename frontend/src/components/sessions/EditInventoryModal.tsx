import { Check, Coffee, Edit3, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/shared";
import { Button, IconButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { useAppStore } from "@/stores/useAppStore";
import type { ActiveSession } from "@/types";

interface EditInventoryModalProps {
  session: ActiveSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem?: (itemId: string, newQuantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  isLoading?: boolean;
}

export function EditInventoryModal({
  session,
  isOpen,
  onClose,
  onUpdateItem,
  onRemoveItem,
  isLoading,
}: EditInventoryModalProps) {
  const t = useAppStore((state) => state.t);
  const [editingItems, setEditingItems] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) {
      return;
    }

    setEditingItems((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    Object.entries(editingItems).forEach(([itemId, quantity]) => {
      if (quantity === 0) {
        onRemoveItem?.(itemId);
      } else {
        onUpdateItem?.(itemId, quantity);
      }
    });

    setEditingItems({});
    setHasChanges(false);
    onClose();
  };

  const handleRemoveItem = (itemId: string) => {
    if (confirm(t("areYouSureItem"))) {
      onRemoveItem?.(itemId);
    }
  };

  const getDisplayQuantity = (itemId: string, originalQuantity: number) => {
    return editingItems[itemId] !== undefined ? editingItems[itemId] : originalQuantity;
  };

  const calculateNewTotal = () => {
    return session.inventoryConsumptions.reduce((total, item) => {
      const quantity = getDisplayQuantity(item.id, item.quantity);
      return total + item.price * quantity;
    }, 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      maxWidth="3xl"
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Edit3 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg leading-none">{t("editInventory")}</h2>
            <p className="mt-1 font-medium text-stone-500 text-xs dark:text-stone-400">
              {session.customerName}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Content */}
        <div className="scrollbar-thin max-h-[60vh] overflow-y-auto p-6">
          {session.inventoryConsumptions.length === 0 ? (
            <div className="py-12 text-center">
              <Coffee className="mx-auto mb-4 h-12 w-12 text-stone-200 dark:text-stone-700" />
              <p className="font-medium text-stone-500 dark:text-stone-400">{t("noItemsAdded")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {session.inventoryConsumptions.map((item, index) => {
                const displayQuantity = getDisplayQuantity(item.id, item.quantity);
                const isEdited = editingItems[item.id] !== undefined;
                const isRemoved = displayQuantity === 0;

                return (
                  <div
                    className={`rounded-xl border p-4 transition-all ${
                      isRemoved
                        ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10"
                        : isEdited
                          ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-900/10"
                          : "border-stone-100 bg-white dark:border-stone-800 dark:bg-stone-900/50"
                    }`}
                    key={item.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 font-bold text-amber-700 text-sm dark:bg-amber-900/30 dark:text-amber-400">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-bold text-stone-900 dark:text-stone-100">
                            {item.itemName}
                          </h4>
                          <p className="mt-0.5 font-medium text-stone-400 text-xs">
                            {formatCurrency(item.price)} {t("egpCurrency")} / {t("item")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="flex items-center rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-stone-900">
                          <IconButton
                            className="h-8 w-8 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                            disabled={displayQuantity <= 0}
                            icon={<Minus className="h-4 w-4" />}
                            label="Decrease"
                            onClick={() => handleQuantityChange(item.id, displayQuantity - 1)}
                            variant="ghost"
                          />
                          <span
                            className={`w-10 text-center font-bold font-mono text-sm ${
                              isRemoved
                                ? "text-red-600 dark:text-red-400"
                                : isEdited
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-stone-700 dark:text-stone-200"
                            }`}
                          >
                            {displayQuantity}
                          </span>
                          <IconButton
                            className="h-8 w-8 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                            icon={<Plus className="h-4 w-4" />}
                            label="Increase"
                            onClick={() => handleQuantityChange(item.id, displayQuantity + 1)}
                            variant="ghost"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p
                              className={`font-bold font-mono ${
                                isRemoved
                                  ? "text-red-600 line-through dark:text-red-400"
                                  : isEdited
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-stone-900 dark:text-stone-100"
                              }`}
                            >
                              {formatCurrency(item.price * displayQuantity)}{" "}
                              <span className="text-[10px] uppercase opacity-60">{t("egp")}</span>
                            </p>
                          </div>
                          <IconButton
                            className="text-stone-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            icon={<Trash2 className="h-4 w-4" />}
                            label={t("deleteItem")}
                            onClick={() => handleRemoveItem(item.id)}
                            variant="ghost"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-stone-200 border-t bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {hasChanges && (
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-stone-500 text-xs uppercase tracking-widest">
                    {t("newTotal")}
                  </span>
                  <span className="font-bold text-amber-600 text-xl dark:text-amber-400">
                    {formatCurrency(calculateNewTotal())}
                  </span>
                  <span className="font-bold text-amber-600/70 text-xs">{t("egp")}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline">
                {hasChanges ? t("cancel") : t("close")}
              </Button>
              {hasChanges && (
                <Button
                  className="px-8"
                  disabled={isLoading}
                  isLoading={isLoading}
                  onClick={handleSaveChanges}
                  variant="primary"
                >
                  <Check className="h-4 w-4" />
                  {t("saveChanges")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}