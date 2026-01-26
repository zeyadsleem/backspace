import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReportsPage } from "@/components/reports";
import { useAppStore } from "@/stores/useAppStore";

export function ReportsPageWrapper() {
  const navigate = useNavigate();
  const revenueData = useAppStore((state) => state.revenueData);
  const revenueChart = useAppStore((state) => state.revenueChart);
  const topCustomers = useAppStore((state) => state.topCustomers);
  const utilizationData = useAppStore((state) => state.utilizationData);
  const operationHistory = useAppStore((state) => state.operationHistory);
  const fetchDashboardData = useAppStore((state) => state.fetchDashboardData);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
