import { TrendingDown, TrendingUp, Users, BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/stores/useAppStore";
import type { RevenueData, RevenueDataPoint, TopCustomer } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { DashboardCard } from "@/components/shared";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface RevenueReportProps {
  revenueData: RevenueData;
  revenueChart: RevenueDataPoint[];
  topCustomers: TopCustomer[];
  onCustomerClick?: (id: string) => void;
}

export function RevenueReport({
  revenueData,
  revenueChart,
  topCustomers,
  onCustomerClick,
}: RevenueReportProps) {
  const t = useAppStore((state) => state.t);
  const language = useAppStore((state) => state.language);
  const percentChange = revenueData.comparison.percentChange;
  const isPositive = percentChange >= 0;

  const isRTL = useAppStore((state) => state.isRTL);

  const chartConfig = {
    sessions: {
      label: t("sessionsLabel"),
      color: "var(--chart-5)",
    },
    inventory: {
      label: t("inventoryLabel"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
      weekday: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 3xl:gap-6 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-6 p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("today")}
          </p>
          <p className="mt-1 font-bold 3xl:text-3xl text-2xl text-stone-900 dark:text-stone-100">
            {formatCurrency(revenueData.today.total)}
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {t("sessionsLabel")}: {formatCurrency(revenueData.today.sessions)} ·{" "}
            {t("inventoryLabel")}: {formatCurrency(revenueData.today.inventory)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-6 p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("thisWeek")}
          </p>
          <p className="mt-1 font-bold 3xl:text-3xl text-2xl text-stone-900 dark:text-stone-100">
            {formatCurrency(revenueData.thisWeek.total)}
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {t("sessionsLabel")}: {formatCurrency(revenueData.thisWeek.sessions)} ·{" "}
            {t("inventoryLabel")}: {formatCurrency(revenueData.thisWeek.inventory)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-6 p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("thisMonth")}
          </p>
          <p className="mt-1 font-bold 3xl:text-3xl text-2xl text-amber-600 dark:text-amber-400">
            {formatCurrency(revenueData.thisMonth.total)}
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {t("sessionsLabel")}: {formatCurrency(revenueData.thisMonth.sessions)} ·{" "}
            {t("inventoryLabel")}: {formatCurrency(revenueData.thisMonth.inventory)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-6 p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-semibold text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("vsLastMonth")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <p
              className={`font-bold 3xl:text-3xl text-2xl ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
            >
              {isPositive ? "+" : ""}
              {percentChange.toFixed(1)}%
            </p>
          </div>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {t("lastMonth")}: {formatCurrency(revenueData.comparison.lastMonth.total)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 3xl:gap-8 gap-6 lg:grid-cols-3">
        <DashboardCard
          className="lg:col-span-2"
          contentClassName="3xl:p-8 p-5"
          icon={<BarChart3 className="h-4 w-4" />}
          title={t("revenueTrend")}
        >
          <div className="h-[300px] w-full sm:h-[400px]">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
              <AreaChart
                data={revenueChart}
                margin={{ top: 10, right: isRTL ? -20 : 10, left: isRTL ? 10 : -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-sessions)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-sessions)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillInventory" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-inventory)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-inventory)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => formatDate(value)}
                  className="text-[10px]"
                  reversed={isRTL}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  orientation={isRTL ? "right" : "left"}
                  className="text-[10px]"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="inventory"
                  type="monotone"
                  fill="url(#fillInventory)"
                  fillOpacity={0.4}
                  stroke="var(--color-inventory)"
                  stackId="a"
                />
                <Area
                  dataKey="sessions"
                  type="monotone"
                  fill="url(#fillSessions)"
                  fillOpacity={0.4}
                  stroke="var(--color-sessions)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </div>
        </DashboardCard>

        <DashboardCard
          contentClassName="p-5"
          icon={<Users className="h-4 w-4" />}
          title={t("topCustomers")}
        >
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <button
                className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 text-start"
                key={customer.id}
                onClick={() => onCustomerClick?.(customer.id)}
                type="button"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs dark:bg-amber-900/30 dark:text-amber-300">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900 dark:text-stone-100">
                    {customer.name}
                  </p>
                </div>
                <span className="flex-shrink-0 font-semibold text-amber-600 text-sm dark:text-amber-400">
                  {formatCurrency(customer.revenue)}
                </span>
              </button>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}