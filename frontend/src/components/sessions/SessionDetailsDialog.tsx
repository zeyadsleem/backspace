import { Clock, Monitor, Receipt, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/shared";
import { IconButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { useAppStore } from "@/stores/use-app-store";
import type { ActiveSession } from "@/types";

interface SessionDetailsDialogProps {
	session: ActiveSession;
	isOpen: boolean;
	onClose: () => void;
}

export function SessionDetailsDialog({ session, isOpen, onClose }: SessionDetailsDialogProps) {
	const t = useAppStore((state) => state.t);
	const [elapsedTime, setElapsedTime] = useState("");
	const [sessionCost, setSessionCost] = useState(0);

	useEffect(() => {
		const calculateTime = () => {
			const start = new Date(session.startedAt);
			const now = new Date();
			const diffMs = now.getTime() - start.getTime();
			const diffMins = Math.floor(diffMs / 60_000);
			const hours = Math.floor(diffMins / 60);
			const mins = diffMins % 60;

			setElapsedTime(
				hours > 0
					? `${hours}${t("hour").charAt(0)} ${mins}${t("minute").charAt(0)}`
					: `${mins}${t("minute").charAt(0)}`,
			);

			if (!session.isSubscribed) {
				const cost = Math.floor((diffMins * session.resourceRate) / 60);
				setSessionCost(cost);
			}
		};

		calculateTime();
		const interval = setInterval(calculateTime, 1000);
		return () => clearInterval(interval);
	}, [session, t]);

	const totalCost = sessionCost + session.inventoryTotal;

	return (
		<Modal
			className="overflow-hidden"
			isOpen={isOpen}
			maxWidth="md"
			onClose={onClose}
			showCloseButton={false}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-stone-100 border-b bg-stone-50/50 p-6 dark:border-stone-800 dark:bg-stone-900/50">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
						<Receipt className="h-5 w-5" />
					</div>
					<div>
						<h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
							{t("sessionDetails")}
						</h2>
						<p className="font-mono text-stone-500 text-xs">{session.customerName}</p>
					</div>
				</div>
				<IconButton
					className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
					icon={<X className="h-5 w-5" />}
					label={t("close")}
					onClick={onClose}
					variant="ghost"
				/>
			</div>

			<div className="scrollbar-thin max-h-[70vh] overflow-y-auto p-5">
				<div className="space-y-6">
					{/* Info Cards */}
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1 rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900/50">
							<span className="flex items-center gap-1.5 text-stone-500 text-xs dark:text-stone-400">
								<User className="h-3.5 w-3.5" />
								{t("customer")}
							</span>
							<span className="truncate font-medium text-sm text-stone-900 dark:text-stone-100">
								{session.customerName}
							</span>
						</div>
						<div className="flex flex-col gap-1 rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900/50">
							<span className="flex items-center gap-1.5 text-stone-500 text-xs dark:text-stone-400">
								<Monitor className="h-3.5 w-3.5" />
								{t("resource")}
							</span>
							<span className="truncate font-medium text-sm text-stone-900 dark:text-stone-100">
								{session.resourceName}
							</span>
						</div>
					</div>

					{/* Session Cost */}
					<div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
						<div className="flex items-center justify-between border-stone-100 border-b bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
							<div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
								<Clock className="h-4 w-4" />
								<span className="font-semibold text-xs uppercase tracking-wider">
									{t("session")}
								</span>
							</div>
							<span
								className={`font-mono font-semibold ${
									session.isSubscribed
										? "text-emerald-600 dark:text-emerald-400"
										: "text-stone-900 dark:text-stone-100"
								}`}
							>
								{session.isSubscribed ? t("covered") : `${formatCurrency(sessionCost)} ${t("egp")}`}
							</span>
						</div>
						<div className="flex items-center justify-between p-3 text-sm">
							<span className="font-mono text-stone-600 dark:text-stone-400">{elapsedTime}</span>
							<span className="text-stone-400 text-xs">
								{formatCurrency(session.resourceRate)} {t("egpHr")}
							</span>
						</div>
					</div>

					{/* Inventory Items */}
					<div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
						<div className="flex items-center justify-between border-stone-100 border-b bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
							<div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
								<ShoppingBag className="h-4 w-4" />
								<span className="font-semibold text-xs uppercase tracking-wider">
									{t("orders")}
								</span>
							</div>
							<span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
								{formatCurrency(session.inventoryTotal)} {t("egp")}
							</span>
						</div>
						<div className="divide-y divide-stone-100 dark:divide-stone-700">
							{session.inventoryConsumptions.length === 0 ? (
								<p className="p-4 text-center text-stone-400 text-xs italic">{t("noOrders")}</p>
							) : (
								session.inventoryConsumptions.map((item) => (
									<div className="flex items-center justify-between p-3 text-sm" key={item.id}>
										<div className="flex items-center gap-2">
											<span className="font-medium text-stone-800 dark:text-stone-200">
												{item.itemName}
											</span>
											<span className="text-stone-400 text-xs">x{item.quantity}</span>
										</div>
										<span className="font-mono text-stone-600 dark:text-stone-400">
											{formatCurrency(item.quantity * item.price)}
										</span>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Footer Total */}
			<div className="border-stone-200 border-t bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
				<div className="flex items-end justify-between">
					<span className="mb-0.5 font-medium text-stone-500 text-xs uppercase tracking-widest">
						{t("totalCurrent")}
					</span>
					<div className="flex items-baseline gap-1">
						<span className="font-bold text-stone-900 text-2xl dark:text-stone-100">
							{formatCurrency(totalCost)}
						</span>
						<span className="font-medium text-stone-400 text-sm">{t("egp")}</span>
					</div>
				</div>
			</div>
		</Modal>
	);
}
