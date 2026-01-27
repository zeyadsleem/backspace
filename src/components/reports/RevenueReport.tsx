import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { RevenueData, RevenueDataPoint, TopCustomer } from "@/types";
import { formatCurrency } from "@/lib/formatters";

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
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-8 p-5 lg:col-span-2 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold 3xl:text-xl text-stone-900 dark:text-stone-100">
              {t("revenueTrend")}
            </h3>
          </div>
          <div className="flex 3xl:h-96 h-48 items-end gap-2 sm:h-64">
            {revenueChart.map((point) => {
              const maxValue = Math.max(...revenueChart.map((d) => d.sessions + d.inventory)) || 1;
              const sessionHeight = (point.sessions / maxValue) * 100;
              const inventoryHeight = (point.inventory / maxValue) * 100;
              const date = new Date(point.date);
              return (
                <div className="flex flex-1 flex-col items-center gap-1" key={point.date}>
                  <div
                    className="flex w-full flex-col-reverse items-center"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="w-full 3xl:max-w-12 max-w-8 rounded-t bg-amber-500"
                      style={{ height: `${sessionHeight}%` }}
                    />
                    <div
                      className={`w-full 3xl:max-w-12 max-w-8 rounded-t bg-emerald-500 ${sessionHeight > 0 ? "mb-0.5" : ""}`}
                      style={{ height: `${inventoryHeight}%` }}
                    />
                  </div>
                  <span className="3xl:text-sm text-[10px] text-stone-500 dark:text-stone-400">
                    {date.toLocaleDateString(language === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 border-stone-100 border-t pt-4 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-stone-600 text-xs dark:text-stone-400">
                {t("sessionsLabel")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-stone-600 text-xs dark:text-stone-400">
                {t("inventoryLabel")}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-500" />
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {t("topCustomers")}
            </h3>
          </div>
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
        </div>
      </div>
    </div>
  );
}
