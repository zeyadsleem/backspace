import { TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/stores/useAppStore";
import type { RevenueDataPoint } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

type Period = "today" | "week" | "month";

export function RevenueChart({ data }: RevenueChartProps) {
  const t = useAppStore((state) => state.t);
  const language = useAppStore((state) => state.language);
  const [period, setPeriod] = useState<Period>("week");

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

      <div className="min-h-[300px] flex-1 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
          <BarChart
            data={data}
            margin={{ top: 10, right: isRTL ? -20 : 10, left: isRTL ? 10 : -20, bottom: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => formatDate(value)}
              className="text-[10px]"
              reversed={isRTL}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              orientation={isRTL ? "right" : "left"}
              className="text-[10px]"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="inventory"
              stackId="a"
              fill="var(--color-inventory)"
              radius={[0, 0, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="sessions"
              stackId="a"
              fill="var(--color-sessions)"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}