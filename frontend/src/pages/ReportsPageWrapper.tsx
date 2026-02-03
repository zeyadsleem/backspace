import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReportsPage } from "@/components/reports";
import { useAppStore } from "@/stores/use-app-store";

export function ReportsPageWrapper() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);

	const revenueData = useAppStore((state) => state.revenueData);
	const revenueChart = useAppStore((state) => state.revenueChart);
	const topCustomers = useAppStore((state) => state.topCustomers);
	const utilizationData = useAppStore((state) => state.utilizationData);
	const operationHistory = useAppStore((state) => state.operationHistory);
	const fetchDashboardData = useAppStore((state) => state.fetchDashboardData);

	useEffect(() => {
		async function loadData() {
			try {
				await fetchDashboardData();
			} finally {
				setIsLoading(false);
			}
		}
		loadData();
	}, [fetchDashboardData]);

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
			</div>
		);
	}

	return (
		<ReportsPage
			onCustomerClick={(id) => navigate(`/customers/${id}`)}
			onResourceClick={(id) => navigate(`/resources?highlight=${id}`)}
			operationHistory={operationHistory}
			revenueChart={revenueChart}
			revenueData={revenueData}
			topCustomers={topCustomers}
			utilizationData={utilizationData}
		/>
	);
}
