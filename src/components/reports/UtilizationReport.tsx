import { Clock, Activity, BarChart as BarChartIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useAppStore } from "@/stores/useAppStore";
import type { UtilizationData } from "@/types";
import { formatNumber } from "@/lib/formatters";
import { DashboardCard } from "@/components/shared";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface UtilizationReportProps {
  utilizationData: UtilizationData;
  onResourceClick?: (id: string) => void;
}

export function UtilizationReport({ utilizationData, onResourceClick }: UtilizationReportProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${formatNumber(hours)} ${t("hour").charAt(0)} ${formatNumber(mins)} ${t("minute").charAt(0)}`;
    }
    return `${formatNumber(mins)} ${t("minute").charAt(0)}`;
  };

  const peakHourData = useMemo(() => {
    if (!utilizationData.peakHours || utilizationData.peakHours.length === 0) {
      return { hour: 0, occupancy: 0 };
    }
    return utilizationData.peakHours.reduce((max, h) => (h.occupancy > max.occupancy ? h : max), {
      hour: 0,
      occupancy: 0,
    });
  }, [utilizationData.peakHours]);

  const resourceChartConfig = {
    rate: {
      label: t("utilizationRate"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const peakHoursChartConfig = {
    occupancy: {
      label: t("occupancy"),
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig;

  const getBarColor = (rate: number) => {
    if (rate >= 80) return "var(--chart-1)"; // Lime/Green
    if (rate >= 50) return "var(--chart-5)"; // Amber/Orange
    return "oklch(0.586 0.253 17.585)"; // Rose/Red (standard destructive color)
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return "oklch(0.586 0.253 17.585)"; // Peak - Red
    if (occupancy >= 60) return "var(--chart-5)"; // High - Amber
    if (occupancy >= 40) return "var(--chart-1)"; // Medium - Green
    return "oklch(0.85 0.1 140)"; // Low - Light Green
  };

  return (
    <div className="3xl:space-y-8 space-y-6">
      <div className="grid grid-cols-1 3xl:gap-6 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-6 p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-semibold 3xl:text-sm text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("overallUtilization")}
          </p>
          <p className="mt-1 font-bold 3xl:text-4xl text-3xl text-amber-600 dark:text-amber-400">
            {Math.round(utilizationData.overallRate)}%
          </p>
          <div className="mt-2 3xl:h-3 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${utilizationData.overallRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-6 p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-semibold 3xl:text-sm text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("avgSessionDuration")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Clock className="3xl:h-6 h-5 3xl:w-6 w-5 text-stone-400" />
            <p className="font-bold 3xl:text-3xl text-2xl text-stone-900 dark:text-stone-100">
              {formatDuration(utilizationData.averageSessionDuration)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-6 p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-semibold 3xl:text-sm text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("peakHour")}
          </p>
          <p className="mt-1 font-bold 3xl:text-3xl text-2xl text-stone-900 dark:text-stone-100">
            {peakHourData.hour.toString().padStart(2, "0")}:00
          </p>
          <p className="mt-1 3xl:text-sm text-stone-500 text-xs dark:text-stone-400">
            {Math.round(peakHourData.occupancy)}% {t("occupancy")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 3xl:gap-8 gap-6 lg:grid-cols-2">
        <DashboardCard
          contentClassName="3xl:p-8 p-5"
          icon={<Activity className="h-4 w-4" />}
          title={t("resourceUtilization")}
        >
          <div className="h-[400px] w-full">
            <ChartContainer config={resourceChartConfig} className="h-full w-full aspect-auto">
              <BarChart
                data={utilizationData.byResource}
                layout="vertical"
                margin={{ top: 5, right: isRTL ? 40 : 30, left: isRTL ? 30 : 40, bottom: 5 }}
                onClick={(data) => {
                  if (data?.activePayload?.[0]?.payload?.id) {
                    onResourceClick?.(data.activePayload[0].payload.id);
                  }
                }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" hide domain={[0, 100]} reversed={isRTL} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  orientation={isRTL ? "right" : "left"}
                  className="text-xs font-medium"
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Bar dataKey="rate" radius={isRTL ? [4, 0, 0, 4] : [0, 4, 4, 0]} barSize={24}>
                  {utilizationData.byResource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} className="cursor-pointer hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </DashboardCard>

        <DashboardCard
          contentClassName="3xl:p-8 p-5"
          icon={<BarChartIcon className="h-4 w-4" />}
          title={t("peakHours")}
        >
          <div className="h-[400px] w-full">
            <ChartContainer config={peakHoursChartConfig} className="h-full w-full aspect-auto">
              <BarChart
                data={utilizationData.peakHours}
                margin={{ top: 5, right: isRTL ? -20 : 10, left: isRTL ? 10 : -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toString().padStart(2, "0")}:00`}
                  className="text-[10px]"
                  reversed={isRTL}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  orientation={isRTL ? "right" : "left"}
                  className="text-[10px]"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Bar dataKey="occupancy" radius={[4, 4, 0, 0]} barSize={32}>
                  {utilizationData.peakHours.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getOccupancyColor(entry.occupancy)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 border-stone-100 border-t pt-4 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[oklch(0.85_0.1_140)]" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("low")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[var(--chart-1)]" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("medium")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[var(--chart-5)]" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("high")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[oklch(0.586_0.253_17.585)]" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("peak")}</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}