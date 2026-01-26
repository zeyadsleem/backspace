import { Activity, BarChart3, History } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type {
  OperationRecord,
  RevenueData,
  RevenueDataPoint,
  TopCustomer,
  UtilizationData,
} from "@/types";
import { OperationHistory } from "./OperationHistory";
import { RevenueReport } from "./RevenueReport";
import { UtilizationReport } from "./UtilizationReport";

type Tab = "revenue" | "utilization" | "history";

interface ReportsPageProps {
  revenueData: RevenueData;
  revenueChart: RevenueDataPoint[];
  topCustomers: TopCustomer[];
  utilizationData: UtilizationData;
  operationHistory: OperationRecord[];
  onCustomerClick?: (id: string) => void;
  onResourceClick?: (id: string) => void;
}

export function ReportsPage({
  revenueData,
  revenueChart,
  topCustomers,
  utilizationData,
  operationHistory,
  onCustomerClick,
  onResourceClick,
}: ReportsPageProps) {
  const t = useAppStore((state) => state.t);
  const [activeTab, setActiveTab] = useState<Tab>("revenue");
  const tabs = [
    { id: "revenue" as Tab, label: t("revenue"), icon: BarChart3 },
    { id: "utilization" as Tab, label: t("utilization"), icon: Activity },
    { id: "history" as Tab, label: t("history"), icon: History },
  ];

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div>
        <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">{t("reports")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("analyticsAndInsights")}
        </p>
      </div>

      <div className="flex w-fit rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium text-sm transition-all ${activeTab === tab.id ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "revenue" && (
        <RevenueReport
          onCustomerClick={onCustomerClick}
          revenueChart={revenueChart}
          revenueData={revenueData}
          topCustomers={topCustomers}
        />
      )}
      {activeTab === "utilization" && (
        <UtilizationReport onResourceClick={onResourceClick} utilizationData={utilizationData} />
      )}
      {activeTab === "history" && <OperationHistory operations={operationHistory} />}
    </div>
  );
}
