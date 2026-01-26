import { Check, Coffee, Minus, Package, Plus, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form";
import { useAppStore } from "@/stores/useAppStore";
import type { ActiveSession, InventoryItem } from "@/types";

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface InventoryAddModalProps {
  session: ActiveSession;
  availableInventory: InventoryItem[];
  onAdd?: (data: { inventoryId: string; quantity: number }[]) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export function InventoryAddModal({
  session,
  availableInventory,
  onAdd,
  onClose,
  isLoading,
}: InventoryAddModalProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredItems = availableInventory.filter(
    (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.quantity > 0
  );

  const handleItemAdd = (item: InventoryItem) => {
    const existingIndex = cart.findIndex((cartItem) => cartItem.item.id === item.id);
    const currentCartQuantity = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const availableQuantity = item.quantity - currentCartQuantity;

    if (availableQuantity <= 0) {
      return;
    }

    if (existingIndex >= 0) {
      setCart((prev) =>
        prev.map((cartItem, index) =>
          index === existingIndex
            ? {
                ...cartItem,
                quantity: Math.min(cartItem.quantity + 1, item.quantity),
              }
            : cartItem
        )
      );
    } else {
      setCart((prev) => [...prev, { item, quantity: 1 }]);
    }
  };

  const handleItemRemove = (itemId: string) => {
    setCart((prev) => prev.filter((cartItem) => cartItem.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) {
      return;
    }

    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.item.id === itemId
          ? {
              ...cartItem,
              quantity: Math.min(newQuantity, cartItem.item.quantity),
            }
          : cartItem
      )
    );
  };

  const handleSubmit = () => {
    const itemsToSubmit = cart
      .filter((cartItem) => cartItem.quantity > 0)
      .map((cartItem) => ({
        inventoryId: cartItem.item.id,
        quantity: cartItem.quantity,
      }));

    onAdd?.(itemsToSubmit);
  };

  const totalAmount = cart
    .filter((cartItem) => cartItem.quantity > 0)
    .reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0);

  return (
    <Modal
      className="flex h-[70vh] flex-col overflow-hidden p-0"
      isOpen={true}
      maxWidth="max-w-4xl"
      onClose={onClose!}
      showCloseButton={true}
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-stone-900 leading-none dark:text-stone-100">
              {t("addInventoryItem")}
            </h2>
            <p className="mt-1 font-medium font-mono text-stone-500 text-xs dark:text-stone-400">
              {session.customerName}
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto bg-stone-50/30 lg:overflow-hidden dark:bg-stone-900/30">
        <div className="flex flex-col lg:grid lg:h-full lg:grid-cols-12">
          {/* Left Side: Available Items */}
          <div className="flex min-h-0 flex-col border-stone-200 border-e bg-stone-50/50 lg:col-span-8 lg:h-full dark:border-stone-800 dark:bg-stone-900/50">
            <div className="sticky top-0 z-10 border-stone-100 border-b bg-white p-4 lg:static dark:border-stone-800 dark:bg-stone-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
                  {t("availableItems")}
                </h3>
                <span className="rounded-lg bg-stone-100 px-2.5 py-1 font-bold text-stone-600 text-xs dark:bg-stone-800 dark:text-stone-400">
                  {filteredItems.length} {t("item")}
                </span>
              </div>

              <div className="relative">
                <div
                  className={`absolute top-0 flex h-10 items-center text-stone-400 ${isRTL ? "right-3" : "left-3"}`}
                >
                  <Search className="h-4 w-4" />
                </div>
                <FormInput
                  className={`h-10 border-stone-200 bg-stone-50 text-sm dark:border-stone-700 dark:bg-stone-800 ${isRTL ? "pr-10" : "pl-10"}`}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchInventory")}
                  type="text"
                  value={searchQuery}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="scrollbar-thin flex-1 p-4 lg:overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Coffee className="mb-3 h-10 w-10 text-stone-200 dark:text-stone-700" />
                  <p className="font-medium text-sm text-stone-400 dark:text-stone-500">
                    {searchQuery ? t("noInventoryFound") : t("noInventoryAvailable")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => {
                    const cartItem = cart.find((ci) => ci.item.id === item.id);
                    const isInCart = cartItem !== undefined && cartItem.quantity > 0;
                    const availableQuantity = item.quantity - (cartItem?.quantity || 0);

                    return (
                      <button
                        className={`group relative flex h-full min-h-[100px] flex-col rounded-xl border p-3 text-start transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                          isInCart
                            ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500/20 dark:bg-amber-900/10"
                            : "border-stone-200 bg-white hover:border-amber-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600"
                        }`}
                        disabled={availableQuantity <= 0}
                        key={item.id}
                        onClick={() => handleItemAdd(item)}
                      >
                        <div className="mb-3 flex w-full items-start justify-between">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              isInCart
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-stone-100 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 dark:bg-stone-700 dark:group-hover:bg-amber-900/30"
                            }`}
                          >
                            {isInCart ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Package className="h-4 w-4" />
                            )}
                          </div>
                          <span className="rounded-lg bg-amber-50 px-2 py-1 font-bold text-amber-600 text-sm dark:bg-amber-900/20 dark:text-amber-400">
                            {item.price}{" "}
                            <span className="text-[10px] uppercase opacity-70">{t("egp")}</span>
                          </span>
                        </div>

                        <div className="mt-auto w-full">
                          <p className="mb-1 line-clamp-1 font-bold text-sm text-stone-700 dark:text-stone-200">
                            {item.name}
                          </p>
                          <span className="inline-flex items-center gap-1 font-medium text-stone-400 text-xs">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${availableQuantity > 0 ? "bg-emerald-500" : "bg-red-500"}`}
                            />
                            {availableQuantity} {t("inStock")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Cart */}
          <div className="z-10 flex min-h-0 w-full flex-col border-stone-200 border-t bg-white shadow-xl lg:col-span-4 lg:h-full lg:border-t-0 lg:border-l lg:shadow-none dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between border-stone-100 border-b bg-stone-50 p-4 lg:sticky lg:top-0 dark:border-stone-800 dark:bg-stone-800/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-stone-400" />
                <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
                  {t("selectedItems")}
                </h3>
              </div>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 font-bold text-white text-xs shadow-sm">
                {cart.filter((ci) => ci.quantity > 0).length}
              </span>
            </div>

            {/* Cart Items */}
            <div className="scrollbar-thin min-h-[200px] flex-1 space-y-3 p-4 lg:min-h-0 lg:overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-8 text-center opacity-40 lg:py-0">
                  <ShoppingCart className="mb-3 h-12 w-12 text-stone-300" />
                  <p className="font-medium text-sm text-stone-500">{t("noItemsSelected")}</p>
                </div>
              ) : (
                cart.map((cartItem) => (
                  <div
                    className="group rounded-xl border border-stone-100 bg-stone-50 p-3 transition-colors hover:border-amber-200 dark:border-stone-700/50 dark:bg-stone-800/50 dark:hover:border-amber-900/30"
                    key={cartItem.item.id}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-sm text-stone-800 dark:text-stone-200">
                          {cartItem.item.name}
                        </p>
                        <p className="mt-0.5 font-medium text-stone-400 text-xs">
                          {cartItem.item.price} {t("egpCurrency")} / {t("item")}
                        </p>
                      </div>
                      <button
                        className="rounded-lg p-1.5 text-stone-300 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        onClick={() => handleItemRemove(cartItem.item.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-stone-900">
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-stone-800"
                          disabled={cartItem.quantity <= 0}
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold font-mono text-sm text-stone-700 dark:text-stone-200">
                          {cartItem.quantity}
                        </span>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-stone-800"
                          disabled={cartItem.quantity >= cartItem.item.quantity}
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-bold font-mono text-sm text-stone-900 dark:text-stone-100">
                        {cartItem.item.price * cartItem.quantity}{" "}
                        <span className="text-stone-400 text-xs">{t("egp")}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="border-stone-200 border-t bg-stone-50 p-4 lg:sticky lg:bottom-0 dark:border-stone-700 dark:bg-stone-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-400 text-xs uppercase tracking-widest">
                    {t("subtotal")}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-amber-600 text-xl dark:text-amber-400">
                      {totalAmount}
                    </span>
                    <span className="font-bold text-amber-600/70 text-xs">{t("egp")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="z-20 flex flex-shrink-0 gap-3 border-stone-200 border-t bg-white p-4 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] lg:p-6 dark:border-stone-800 dark:bg-stone-900">
        <Button className="flex-1" onClick={onClose} variant="outline">
          {t("cancel")}
        </Button>
        <Button
          className="flex-[2]"
          disabled={isLoading || cart.filter((ci) => ci.quantity > 0).length === 0}
          isLoading={isLoading}
          onClick={handleSubmit}
          variant="primary"
        >
          <Check className="h-4 w-4" />
          {t("addToSession")}
        </Button>
      </div>
    </Modal>
  );
}
