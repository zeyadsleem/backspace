import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { RevenueData, RevenueDataPoint, TopCustomer } from "@/types";

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
  const isRTL = useAppStore((state) => state.isRTL);
  const language = useAppStore((state) => state.language);
  const formatCurrency = (amount: number) => `${amount.toLocaleString(language === "ar" ? "ar-EG" : "en-US")} ${t("egp")}`;
  const percentChange = revenueData.comparison.percentChange;
  const isPositive = percentChange >= 0;

  return (
    <div className={`space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 3xl:gap-6">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 3xl:p-6">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("today")}
          </p>
          <p className="mt-1 font-bold text-2xl text-stone-900 3xl:text-3xl dark:text-stone-100">
            {formatCurrency(revenueData.today.total)}
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {t("sessionsLabel")}: {formatCurrency(revenueData.today.sessions)} · {t("inventoryLabel")}:{" "}
            {formatCurrency(revenueData.today.inventory)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 3xl:p-6">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("thisWeek")}
          </p>
          <p className="mt-1 font-bold text-2xl text-stone-900 3xl:text-3xl dark:text-stone-100">
            {formatCurrency(revenueData.thisWeek.total)}
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {t("sessionsLabel")}: {formatCurrency(revenueData.thisWeek.sessions)} · {t("inventoryLabel")}:{" "}
            {formatCurrency(revenueData.thisWeek.inventory)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 3xl:p-6">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("thisMonth")}
          </p>
          <p className="mt-1 font-bold text-2xl text-amber-600 3xl:text-3xl dark:text-amber-400">
            {formatCurrency(revenueData.thisMonth.total)}
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {t("sessionsLabel")}: {formatCurrency(revenueData.thisMonth.sessions)} · {t("inventoryLabel")}:{" "}
            {formatCurrency(revenueData.thisMonth.inventory)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 3xl:p-6">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("vsLastMonth")}
          </p>
          <div className={`mt-1 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <p
              className={`font-bold text-2xl 3xl:text-3xl ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 3xl:gap-8">
        <div className="rounded-xl border border-stone-200 bg-white p-5 lg:col-span-2 dark:border-stone-800 dark:bg-stone-900 3xl:p-8">
          <div className={`mb-4 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <h3 className="font-semibold text-stone-900 3xl:text-xl dark:text-stone-100">
              {t("revenueTrend")}
            </h3>
          </div>
          <div className="flex h-48 items-end gap-2 sm:h-64 3xl:h-96">
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
                      className="w-full max-w-8 rounded-t bg-amber-500 3xl:max-w-12"
                      style={{ height: `${sessionHeight}%` }}
                    />
                    <div
                      className={`w-full max-w-8 rounded-t bg-emerald-500 3xl:max-w-12 ${sessionHeight > 0 ? "mb-0.5" : ""}`}
                      style={{ height: `${inventoryHeight}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 3xl:text-sm dark:text-stone-400">
                    {date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 border-stone-100 border-t pt-4 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-stone-600 text-xs dark:text-stone-400">{t("sessionsLabel")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-stone-600 text-xs dark:text-stone-400">{t("inventoryLabel")}</span>
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
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
                key={customer.id}
                onClick={() => onCustomerClick?.(customer.id)}
                type="button"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-xs dark:bg-amber-900/30 dark:text-amber-300">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900 dark:text-stone-100">
                    {customer.name}
                  </p>
                </div>
                <span className="font-semibold text-amber-600 text-sm dark:text-amber-400">
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
