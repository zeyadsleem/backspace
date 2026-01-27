import { Check, Coffee, Edit3, Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
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
  const [editingItems, setEditingItems] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) {
    return null;
  }

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
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl dark:bg-stone-900"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-stone-200 border-b p-6 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Edit3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
                تعديل المنتجات
              </h2>
              <p className="text-stone-500 text-xs dark:text-stone-400">{session.customerName}</p>
            </div>
          </div>
        </div>
        <IconButton
          className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
          icon={<X className="h-5 w-5" />}
          label="Close"
          onClick={onClose}
          variant="ghost"
        />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {session.inventoryConsumptions.length === 0 ? (
          <div className="py-8 text-center">
            <Coffee className="mx-auto mb-3 h-8 w-8 text-stone-300 dark:text-stone-600" />
            <p className="mb-1 font-medium text-sm text-stone-500 dark:text-stone-400">
              لا توجد منتجات
            </p>
            <p className="text-stone-400 text-xs dark:text-stone-500">
              لم يتم إضافة أي منتجات لهذه الجلسة بعد
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {session.inventoryConsumptions.map((item, index) => {
              const displayQuantity = getDisplayQuantity(item.id, item.quantity);
              const isEdited = editingItems[item.id] !== undefined;
              const isRemoved = displayQuantity === 0;

              return (
                <div
                  className={`rounded-lg border p-3 transition-all ${isRemoved
                    ? "border-red-200 bg-red-50 opacity-60 dark:border-red-800 dark:bg-red-900/20"
                    : isEdited
                      ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                      : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800"
                    }`}
                  key={item.id}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white text-xs">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="mb-1 font-medium text-sm text-stone-900 dark:text-stone-100">
                          {item.itemName}
                        </h4>
                        <div className="flex items-center gap-3 text-stone-500 text-xs dark:text-stone-400">
                          <span>
                            {new Date(item.addedAt).toLocaleTimeString("ar-EG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span>{item.price} ج.م للوحدة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <IconButton
                          className="h-8 w-8 rounded border border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                          disabled={displayQuantity <= 0}
                          icon={<Minus className="h-4 w-4" />}
                          label="Decrease"
                          onClick={() => handleQuantityChange(item.id, displayQuantity - 1)}
                          variant="ghost"
                        />

                        <div className="min-w-[40px] rounded border border-stone-200 bg-stone-50 px-2 py-1 text-center dark:border-stone-700 dark:bg-stone-800">
                          <span
                            className={`font-bold text-sm ${isRemoved
                              ? "text-red-600 dark:text-red-400"
                              : isEdited
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-stone-900 dark:text-stone-100"
                              }`}
                          >
                            {displayQuantity}
                          </span>
                        </div>

                        <IconButton
                          className="h-8 w-8 rounded border border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
                          icon={<Plus className="h-4 w-4" />}
                          label="Increase"
                          onClick={() => handleQuantityChange(item.id, displayQuantity + 1)}
                          variant="ghost"
                        />
                      </div>

                      {/* Total & Remove */}
                      <div className="text-left">
                        <p
                          className={`font-bold text-sm ${isRemoved
                            ? "text-red-600 line-through dark:text-red-400"
                            : isEdited
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-stone-900 dark:text-stone-100"
                            }`}
                        >
                          {(item.price * displayQuantity).toFixed(0)} ج.م
                        </p>
                        <p className="text-stone-500 text-xs dark:text-stone-400">
                          {displayQuantity} × {item.price} ج.م
                        </p>
                      </div>

                      {/* Remove Button */}
                      <IconButton
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        icon={<Trash2 className="h-4 w-4" />}
                        label="حذف المنتج"
                        onClick={() => handleRemoveItem(item.id)}
                        variant="ghost"
                      />
                    </div>
                  </div>

                  {/* Status Messages */}
                  {isRemoved && (
                    <div className="mt-2 rounded border border-red-200 bg-red-100 p-2 text-right text-red-700 text-xs dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                      سيتم حذف هذا المنتج عند الحفظ
                    </div>
                  )}
                  {isEdited && !isRemoved && (
                    <div className="mt-2 rounded border border-amber-200 bg-amber-100 p-2 text-right text-amber-700 text-xs dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      تم تعديل الكمية - اضغط حفظ لتطبيق التغييرات
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-stone-200 border-t p-6 dark:border-stone-800">
        {/* New Total */}
        {hasChanges && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-3 dark:border-amber-800 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-600 text-lg dark:text-amber-400">
                {calculateNewTotal().toFixed(0)} ج.م
              </span>
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                الإجمالي الجديد
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              disabled={isLoading}
              isLoading={isLoading}
              onClick={handleSaveChanges}
              size="md"
              variant="primary"
            >
              {!isLoading && <Check className="h-4 w-4" />}
              حفظ التغييرات
            </Button>
          )}
          <Button
            className={hasChanges ? "" : "flex-1"}
            onClick={onClose}
            size="md"
            variant="outline"
          >
            {hasChanges ? "إلغاء" : "إغلاق"}
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
}
