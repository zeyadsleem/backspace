import { Check, Coffee, Minus, Package, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form";
import { formatCurrency } from "@/lib/formatters";
import { useAppStore } from "@/stores/use-app-store";
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
	const [showCart, setShowCart] = useState(false);

	const filteredItems = availableInventory.filter((item) =>
		item.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleItemAdd = (item: InventoryItem) => {
		if (item.quantity <= 0) return;

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
						: cartItem,
				),
			);
		} else {
			setCart((prev) => [...prev, { item, quantity: 1 }]);
		}
	};

	const handleItemRemove = (itemId: string) => {
		setCart((prev) => prev.filter((cartItem) => cartItem.item.id !== itemId));
	};

	const updateQuantity = (itemId: string, newQuantity: number) => {
		if (newQuantity <= 0) {
			handleItemRemove(itemId);
			return;
		}

		setCart((prev) =>
			prev.map((cartItem) =>
				cartItem.item.id === itemId
					? {
							...cartItem,
							quantity: Math.min(newQuantity, cartItem.item.quantity),
						}
					: cartItem,
			),
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

	const cartItemCount = cart.length;

	return (
		<Modal
			className="p-0"
			isOpen={true}
			maxWidth="2xl"
			onClose={onClose || (() => {})}
			title={
				<div className="flex items-center gap-3">
					<div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
						<ShoppingCart className="h-5 w-5" />
					</div>
					<div className="flex flex-col">
						<h2 className="font-bold text-lg leading-none">{t("addInventoryItem")}</h2>
						<p className="mt-1 font-medium text-stone-500 text-xs dark:text-stone-400">
							{session.customerName}
						</p>
					</div>
				</div>
			}
		>
			<div className="flex h-[60vh] flex-col overflow-hidden">
				{/* Top: Search & Items */}
				<div className="flex flex-1 flex-col overflow-hidden bg-stone-50/30 dark:bg-stone-900/20">
					<div className="flex-shrink-0 border-stone-100 border-b p-4 dark:border-stone-800">
						<div className="relative">
							<Search
								className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 ${isRTL ? "right-3" : "left-3"}`}
							/>
							<FormInput
								className={`h-11 border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-800 ${isRTL ? "pr-10" : "pl-10"}`}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={t("searchInventory")}
								type="text"
								value={searchQuery}
							/>
						</div>
					</div>

					<div className="scrollbar-thin flex-1 overflow-y-auto p-4">
						{filteredItems.length === 0 ? (
							<div className="flex h-full flex-col items-center justify-center py-12 text-center">
								<Coffee className="mb-4 h-12 w-12 text-stone-200 dark:text-stone-700" />
								<p className="font-medium text-stone-400 dark:text-stone-500">
									{searchQuery ? t("noInventoryFound") : t("noInventoryAvailable")}
								</p>
							</div>
						) : (
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{filteredItems.map((item) => {
									const cartItem = cart.find((ci) => ci.item.id === item.id);
									const isInCart = cartItem !== undefined && cartItem.quantity > 0;
									const availableQuantity = item.quantity - (cartItem?.quantity || 0);
									const isOutOfStock = item.quantity <= 0;

									return (
										<button
											className={`group relative flex flex-col rounded-xl border p-2.5 text-start transition-all ${
												isOutOfStock
													? "cursor-not-allowed border-stone-100 bg-stone-50/50 opacity-60 dark:border-stone-800 dark:bg-stone-900/30"
													: isInCart
														? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500/20 dark:border-amber-500/50 dark:bg-amber-900/20"
														: "border-stone-200 bg-white shadow-sm hover:border-amber-200 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:hover:border-amber-900/50"
											}`}
											disabled={isOutOfStock || availableQuantity <= 0}
											key={item.id}
											onClick={() => handleItemAdd(item)}
											type="button"
										>
											{/* Quantity Badge if in cart */}
											{isInCart && (
												<div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 font-bold text-white text-[10px] shadow-sm">
													{cartItem.quantity}
												</div>
											)}

											<div className="mb-2 flex w-full items-start justify-between">
												<div
													className={`flex h-8 w-8 items-center justify-center rounded-lg ${
														isInCart
															? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
															: "bg-stone-100 text-stone-400 dark:bg-stone-700"
													}`}
												>
													<Package className="h-4 w-4" />
												</div>
												<div className="text-right">
													<p
														className={`font-bold text-sm ${isInCart ? "text-amber-600 dark:text-amber-400" : "text-stone-900 dark:text-stone-100"}`}
													>
														{formatCurrency(item.price)}
													</p>
													<p className="font-medium text-[10px] text-stone-400 uppercase tracking-wider leading-none">
														{t("egp")}
													</p>
												</div>
											</div>

											<div className="mt-auto">
												<h4 className="line-clamp-1 font-bold text-sm text-stone-800 dark:text-stone-200">
													{item.name}
												</h4>
												<div className="mt-0.5 flex items-center gap-1.5">
													<span
														className={`h-1 w-1 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-emerald-500"}`}
													/>
													<span className="font-medium text-stone-400 text-xs">
														{isOutOfStock
															? t("outOfStock")
															: `${availableQuantity} ${t("inStock")}`}
													</span>
												</div>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Bottom: Cart Summary & Actions */}
				<div className="flex-shrink-0 border-stone-100 border-t bg-white shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-10 dark:border-stone-800 dark:bg-stone-900">
					{/* Collapsible Cart List */}
					{cart.length > 0 && (
						<div className="border-stone-100 border-b dark:border-stone-800">
							<button
								className="flex w-full items-center justify-between bg-stone-50 px-6 py-2 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800"
								onClick={() => setShowCart(!showCart)}
								type="button"
							>
								<div className="flex items-center gap-2">
									<span className="font-bold text-stone-500 text-xs uppercase tracking-widest">
										{t("selectedItems")} ({cartItemCount})
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-bold text-amber-600 dark:text-amber-400">
										{formatCurrency(totalAmount)} {t("egp")}
									</span>
									<div className={`transform transition-transform ${showCart ? "rotate-180" : ""}`}>
										<Minus className="h-4 w-4 text-stone-400" />
									</div>
								</div>
							</button>

							{showCart && (
								<div className="scrollbar-thin max-h-[180px] overflow-y-auto bg-stone-50/50 p-4 dark:bg-stone-900/50">
									<div className="space-y-2">
										{cart.map((cartItem) => (
											<div
												className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-2 dark:border-stone-700 dark:bg-stone-800"
												key={cartItem.item.id}
											>
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-stone-500 dark:bg-stone-700">
														<Package className="h-4 w-4" />
													</div>
													<div>
														<p className="font-bold text-sm text-stone-900 dark:text-stone-100">
															{cartItem.item.name}
														</p>
														<p className="text-[10px] text-stone-400">
															{formatCurrency(cartItem.item.price)} {t("egp")}
														</p>
													</div>
												</div>

												<div className="flex items-center gap-3">
													<div className="flex items-center rounded-md border border-stone-200 bg-stone-50 dark:border-stone-600 dark:bg-stone-900">
														<button
															className="flex h-7 w-7 items-center justify-center text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700"
															onClick={() =>
																updateQuantity(cartItem.item.id, cartItem.quantity - 1)
															}
															type="button"
														>
															<Minus className="h-3 w-3" />
														</button>
														<span className="w-8 text-center font-bold font-mono text-sm">
															{cartItem.quantity}
														</span>
														<button
															className="flex h-7 w-7 items-center justify-center text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700"
															disabled={cartItem.quantity >= cartItem.item.quantity}
															onClick={() =>
																updateQuantity(cartItem.item.id, cartItem.quantity + 1)
															}
															type="button"
														>
															<Plus className="h-3 w-3" />
														</button>
													</div>
													<button
														className="text-stone-400 hover:text-red-500"
														onClick={() => handleItemRemove(cartItem.item.id)}
														type="button"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					<div className="p-6">
						<div className="flex gap-3">
							<Button className="flex-1" onClick={onClose} variant="outline">
								{t("cancel")}
							</Button>
							<Button
								className="flex-[2]"
								disabled={isLoading || cart.length === 0}
								isLoading={isLoading}
								onClick={handleSubmit}
								variant="primary"
							>
								<Check className="h-4 w-4" />
								{t("addToSession")}
								{cart.length > 0 && !showCart && ` • ${formatCurrency(totalAmount)} ${t("egp")}`}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
