import { Calendar, CreditCard, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormActions, FormError, FormField, FormLabel, TextField } from "@/components/ui/form";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/use-app-store";
import type { Customer, PlanType, PlanTypeOption } from "@/types";

interface SubscriptionFormProps {
	customers: Customer[];
	planTypes: PlanTypeOption[];
	onSubmit?: (data: { customerId: string; planType: PlanType; startDate: string }) => void;
	onCancel?: () => void;
	isLoading?: boolean;
}

export function SubscriptionForm({
	customers,
	planTypes,
	onSubmit,
	onCancel,
	isLoading = false,
}: SubscriptionFormProps) {
	const t = useAppStore((state) => state.t);
	const isRTL = useAppStore((state) => state.isRTL);
	const [formData, setFormData] = useState({
		customerId: "",
		planType: "weekly" as PlanType,
		startDate: new Date().toISOString().split("T")[0],
	});
	const [searchCustomer, setSearchCustomer] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const filteredCustomers = customers.filter(
		(c) =>
			c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
			c.humanId.toLowerCase().includes(searchCustomer.toLowerCase()),
	);
	const selectedCustomer = customers.find((c) => c.id === formData.customerId);
	const selectedPlan = planTypes.find((p) => p.id === formData.planType);

	const calculateEndDate = (startDate: string, days: number): string => {
		const date = new Date(startDate);
		date.setDate(date.getDate() + days);
		return date.toISOString().split("T")[0];
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Record<string, string> = {};
		if (!formData.customerId) {
			newErrors.customerId = t("required");
		}
		if (!formData.startDate) {
			newErrors.startDate = t("startDateRequired");
		}
		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) {
			onSubmit?.(formData);
		}
	};

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Customer Selection */}
				<FormField>
					<TextField
						icon={<User className="h-4 w-4" />}
						id="customer-search"
						label={t("customer")}
						onChange={(e) => setSearchCustomer(e.target.value)}
						placeholder={t("searchByNameId")}
						required
						value={searchCustomer}
					/>
					<div className="max-h-32 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-700">
						{filteredCustomers.length === 0 ? (
							<p className="p-3 text-center text-sm text-stone-500 dark:text-stone-400">
								{t("noCustomersFound")}
							</p>
						) : (
							filteredCustomers.map((customer) => (
								<button
									className={cn(
										"flex w-full items-center justify-between p-3 transition-colors",
										formData.customerId === customer.id
											? "bg-amber-50 dark:bg-amber-900/20"
											: "hover:bg-stone-50 dark:hover:bg-stone-800",
									)}
									key={customer.id}
									onClick={() => setFormData({ ...formData, customerId: customer.id })}
									type="button"
								>
									<div>
										<p className="font-medium text-sm text-stone-900 dark:text-stone-100">
											{customer.name}
										</p>
										<p className="text-stone-500 text-xs dark:text-stone-400">{customer.humanId}</p>
									</div>
								</button>
							))
						)}
					</div>
					<FormError>{errors.customerId}</FormError>
				</FormField>

				{/* Plan Type and Dates */}
				<div className="space-y-4">
					<FormField>
						<FormLabel icon={<CreditCard className="h-4 w-4" />}>{t("planType")}</FormLabel>
						<div className="grid grid-cols-3 gap-2">
							{planTypes.map((plan) => (
								<button
									className={cn(
										"rounded-xl border-2 p-2 text-center transition-colors",
										formData.planType === plan.id
											? "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20"
											: "border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600",
									)}
									key={plan.id}
									onClick={() => setFormData({ ...formData, planType: plan.id })}
									type="button"
								>
									<p
										className={cn(
											"font-medium text-xs",
											formData.planType === plan.id
												? "text-amber-700 dark:text-amber-400"
												: "text-stone-700 dark:text-stone-300",
										)}
									>
										{isRTL ? plan.labelAr : plan.labelEn}
									</p>
									<p className="text-stone-500 text-[10px] dark:text-stone-400">
										{plan.days} {t("days")}
									</p>
									<p className="mt-1 font-bold text-amber-600 text-xs dark:text-amber-400">
										{formatCurrency(plan.price)} {t("egp")}
									</p>
								</button>
							))}
						</div>
					</FormField>

					<div className="grid grid-cols-2 gap-4">
						<TextField
							error={errors.startDate}
							icon={<Calendar className="h-4 w-4" />}
							id="startDate"
							label={t("startDate")}
							onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
							type="date"
							value={formData.startDate}
						/>

						<TextField
							className="bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
							disabled
							helperText={t("autoCalculated")}
							icon={<Calendar className="h-4 w-4" />}
							id="endDate"
							label={t("endDate")}
							type="date"
							value={selectedPlan ? calculateEndDate(formData.startDate, selectedPlan.days) : ""}
						/>
					</div>
				</div>
			</div>

			{/* Summary - Full Width */}
			{selectedCustomer && selectedPlan && (
				<div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
					<h4 className="mb-2 font-medium text-sm text-stone-700 dark:text-stone-300">
						{t("subscriptionSummary")}
					</h4>
					<div className="space-y-1 text-sm">
						<p className="text-stone-600 dark:text-stone-400">
							{t("customer")}:{" "}
							<span className="font-medium text-stone-900 dark:text-stone-100">
								{selectedCustomer.name}
							</span>
						</p>
						<p className="text-stone-600 dark:text-stone-400">
							{t("plan")}:{" "}
							<span className="font-medium text-stone-900 dark:text-stone-100">
								{isRTL ? selectedPlan.labelAr : selectedPlan.labelEn}
							</span>
						</p>
						<p className="text-stone-600 dark:text-stone-400">
							{t("duration")}:{" "}
							<span className="font-medium text-stone-900 dark:text-stone-100">
								{formData.startDate} → {calculateEndDate(formData.startDate, selectedPlan.days)}
							</span>
						</p>
						<p className="text-stone-600 dark:text-stone-400">
							{t("price")}:{" "}
							<span className="font-bold text-amber-600 dark:text-amber-400">
								{formatCurrency(selectedPlan.price)} {t("egp")}
							</span>
						</p>
					</div>
				</div>
			)}

			{/* Buttons */}
			<FormActions>
				<Button disabled={isLoading} onClick={onCancel} size="md" type="button" variant="ghost">
					{t("cancel")}
				</Button>
				<Button
					className="flex-1"
					disabled={isLoading || !formData.customerId || !formData.startDate}
					isLoading={isLoading}
					size="md"
					type="submit"
					variant="primary"
				>
					{t("createSubscription")}
				</Button>
			</FormActions>
		</form>
	);
}
