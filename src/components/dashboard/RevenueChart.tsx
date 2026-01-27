import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/formatters";
import { useAppStore } from "@/stores/useAppStore";
import type { RevenueDataPoint } from "@/types";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

type Period = "today" | "week" | "month";

export function RevenueChart({ data }: RevenueChartProps) {
  const t = useAppStore((state) => state.t);
  const language = useAppStore((state) => state.language);
  const [period, setPeriod] = useState<Period>("today");

  const isRTL = useAppStore((state) => state.isRTL);

  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const totalInventory = data.reduce((sum, d) => sum + d.inventory, 0);
  const total = totalSessions + totalInventory;

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
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="mb-4 flex flex-shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-stone-900 dark:text-stone-100">
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
                className={`rounded-md px-3 py-1.5 font-semibold text-[13px] transition-all ${
                  period === p
                    ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
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

      <div className="min-h-[300px] flex-1 w-full">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
          >
            <CartesianGrid className="stroke-border/50" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              className="font-medium text-[10px]"
              dataKey="date"
              reversed={isRTL}
              tickFormatter={(value) => formatDate(value)}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              className="font-medium text-[10px]"
              orientation={isRTL ? "right" : "left"}
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* @ts-ignore */}
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              barSize={32}
              dataKey="inventory"
              fill="var(--color-inventory)"
              radius={[0, 0, 0, 0]}
              stackId="a"
            />
            <Bar
              barSize={32}
              dataKey="sessions"
              fill="var(--color-sessions)"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
