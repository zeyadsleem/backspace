import { Activity, Clock, CreditCard, DollarSign, Users } from "lucide-react";
import { useDashboardData, useTranslation } from "@/stores/hooks";
import { useAppStore } from "@/stores/useAppStore";
import { ActivityFeed } from "./ActivityFeed";
import { LowStockBanner } from "./LowStockBanner";
import { MetricCard } from "./MetricCard";
import { PendingInvoices } from "./PendingInvoices";
import { QuickActions } from "./QuickActions";

interface DashboardProps {
  onNewCustomer?: () => void;
  onStartSession?: () => void;
  onNavigateToSection?: (section: string) => void;
  onViewInventoryItem?: (id: string) => void;
  onViewCustomerDebt?: (customerId: string) => void;
}

export function Dashboard({
  onNewCustomer,
  onStartSession,
  onNavigateToSection,
  onViewInventoryItem,
  onViewCustomerDebt,
}: DashboardProps) {
  const t = useTranslation();
  const isRTL = useAppStore((state) => state.isRTL);
  const invoices = useAppStore((state) => state.invoices);
  const { dashboardMetrics: metrics, lowStockAlerts, recentActivity } = useDashboardData();

  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat("en-EG", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formattedNumber} ${t("egp")}`;
  };

  return (
    <div className="flex h-auto flex-col overflow-y-auto scrollbar-thin lg:h-full lg:overflow-hidden">
      {/* Top Section - Metric Cards */}
      <div className="flex-shrink-0 space-y-6 p-4 sm:p-6 lg:pb-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className={isRTL ? "text-end" : "text-start"}>
            <h1 className="font-bold text-2xl tracking-tight text-stone-900 lg:text-3xl dark:text-stone-100">
              {t("dashboard")}
            </h1>
          </div>
          <QuickActions onNewCustomer={onNewCustomer} onStartSession={onStartSession} />
        </div>

        {lowStockAlerts.length > 0 && (
          <LowStockBanner
            alerts={lowStockAlerts}
            onViewAll={() => onNavigateToSection?.("inventory")}
            onViewItem={onViewInventoryItem}
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:gap-6 3xl:grid-cols-5">
          <MetricCard
            icon={<DollarSign className="h-5 w-5" />}
            onClick={() => onNavigateToSection?.("sessions")}
            subtitle={`${t("sessionsLabel")}: ${formatCurrency(metrics.sessionRevenue)} · ${t("inventoryLabel")}: ${formatCurrency(metrics.inventoryRevenue)}`}
            title={t("todaysRevenue")}
            value={formatCurrency(metrics.todayRevenue)}
            variant="primary"
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            onClick={() => onNavigateToSection?.("sessions")}
            subtitle={t("currentlyInProgress")}
            title={t("activeSessions")}
            value={metrics.activeSessions.toString()}
            variant="default"
          />
          <MetricCard
            icon={<Users className="h-5 w-5" />}
            onClick={() => onNavigateToSection?.("customers")}
            subtitle={t("registeredToday")}
            title={t("newCustomers")}
            value={metrics.newCustomersToday.toString()}
            variant="default"
          />
          <MetricCard
            icon={<CreditCard className="h-5 w-5" />}
            onClick={() => onNavigateToSection?.("subscriptions")}
            subtitle={t("currentlyActive")}
            title={t("activeSubscriptions")}
            value={metrics.activeSubscriptions.toString()}
            variant="default"
          />
          <MetricCard
            icon={<Activity className="h-5 w-5" />}
            onClick={() => onNavigateToSection?.("resources")}
            subtitle={t("resourceUsage")}
            title={t("utilization")}
            value={`${metrics.resourceUtilization}%`}
            variant={metrics.resourceUtilization > 80 ? "success" : "default"}
          />
        </div>
      </div>

      {/* Bottom Section - Split Activity and Unpaid Invoices */}
      <div className="min-h-0 flex-1 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12 3xl:gap-8">
          {/* Recent Activity - Taking 7 columns */}
          <div className="min-h-[400px] lg:col-span-7 lg:h-full">
            <ActivityFeed activities={recentActivity} />
          </div>

          {/* Unpaid Invoices */}
          <div className="min-h-[400px] lg:col-span-5 lg:h-full">
            <PendingInvoices invoices={invoices} onViewCustomerDebt={onViewCustomerDebt} />
          </div>
        </div>
      </div>
    </div>
  );
}
