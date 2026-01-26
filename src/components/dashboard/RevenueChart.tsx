import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { RevenueDataPoint } from "@/types";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

type Period = "today" | "week" | "month";

export function RevenueChart({ data }: RevenueChartProps) {
  const t = useAppStore((state) => state.t);
  const language = useAppStore((state) => state.language);
  const [period, setPeriod] = useState<Period>("week");

  const maxValue = Math.max(...data.map((d) => d.sessions + d.inventory));
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const totalInventory = data.reduce((sum, d) => sum + d.inventory, 0);
  const total = totalSessions + totalInventory;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <div className="mb-5 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {t("revenueTrend")}
            </h3>
            <p className="text-stone-500 text-xs dark:text-stone-400">
              {t("total")}: {formatCurrency(total)} {t("egp")}
            </p>
          </div>
        </div>
        <div className="flex rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
          {(["today", "week", "month"] as Period[]).map((p) => {
            let label = t("thisMonth");
            if (p === "today") {
              label = t("today");
            }
            if (p === "week") {
              label = t("thisWeek");
            }

            return (
              <button
                className={`rounded-md px-3 py-1.5 font-medium text-xs transition-all ${period === p ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"}`}
                key={p}
                onClick={() => setPeriod(p)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-shrink-0 gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-stone-600 text-xs dark:text-stone-400">
            {t("sessionsLabel")} ({formatCurrency(totalSessions)} {t("egp")})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-stone-600 text-xs dark:text-stone-400">
            {t("inventoryLabel")} ({formatCurrency(totalInventory)} {t("egp")})
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-end gap-2 pt-4">
        {data.map((point) => {
          const sessionHeight = (point.sessions / maxValue) * 100;
          const inventoryHeight = (point.inventory / maxValue) * 100;
          return (
            <div
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              key={point.date}
            >
              <div className="flex min-h-0 w-full flex-1 flex-col-reverse items-center">
                <div
                  className="w-full max-w-10 rounded-t bg-amber-500 transition-all duration-300"
                  style={{ height: `${sessionHeight}%` }}
                  title={`${t("sessionsLabel")}: ${formatCurrency(point.sessions)} ${t("egp")}`}
                />
                <div
                  className="w-full max-w-10 rounded-t bg-emerald-500 transition-all duration-300"
                  style={{ height: `${inventoryHeight}%` }}
                  title={`${t("inventoryLabel")}: ${formatCurrency(point.inventory)} ${t("egp")}`}
                />
              </div>
              <span className="mt-1 flex-shrink-0 text-center text-[10px] text-stone-500 dark:text-stone-400">
                {formatDate(point.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
