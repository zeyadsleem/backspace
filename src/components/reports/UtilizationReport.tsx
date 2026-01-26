import { Clock } from "lucide-react";
import { useMemo } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { UtilizationData } from "@/types";

interface UtilizationReportProps {
  utilizationData: UtilizationData;
  onResourceClick?: (id: string) => void;
}

export function UtilizationReport({ utilizationData, onResourceClick }: UtilizationReportProps) {
  const t = useAppStore((state) => state.t);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}${t("hour").charAt(0)} ${mins}${t("minute").charAt(0)}`;
    }
    return `${mins}${t("minute").charAt(0)}`;
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("overallUtilization")}
          </p>
          <p className="mt-1 font-bold text-3xl text-amber-600 dark:text-amber-400">
            {Math.round(utilizationData.overallRate)}%
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${utilizationData.overallRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("avgSessionDuration")}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Clock className="h-5 w-5 text-stone-400" />
            <p className="font-bold text-2xl text-stone-900 dark:text-stone-100">
              {formatDuration(utilizationData.averageSessionDuration)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
            {t("peakHour")}
          </p>
          <p className="mt-1 font-bold text-2xl text-stone-900 dark:text-stone-100">
            {peakHourData.hour.toString().padStart(2, "0")}:00
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400">
            {Math.round(peakHourData.occupancy)}% {t("occupancy")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {t("resourceUtilization")}
            </h3>
          </div>
          <div className="space-y-3">
            {utilizationData.byResource.map((resource) => {
              let barColor = "bg-red-500";
              if (resource.rate >= 80) {
                barColor = "bg-emerald-500";
              } else if (resource.rate >= 50) {
                barColor = "bg-amber-500";
              }

              return (
                <button
                  className="w-full text-left"
                  key={resource.id}
                  onClick={() => onResourceClick?.(resource.id)}
                  type="button"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-sm text-stone-700 dark:text-stone-300">
                      {resource.name}
                    </span>
                    <span className="font-bold font-mono text-sm text-stone-900 dark:text-stone-100">
                      {Math.round(resource.rate)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${resource.rate}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h3 className="mb-4 font-semibold text-stone-900 dark:text-stone-100">
            {t("peakHours")}
          </h3>
          <div className="space-y-2">
            {utilizationData.peakHours.map((hour) => {
              let barColor = "bg-emerald-300";
              if (hour.occupancy >= 80) {
                barColor = "bg-red-500";
              } else if (hour.occupancy >= 60) {
                barColor = "bg-amber-500";
              } else if (hour.occupancy >= 40) {
                barColor = "bg-emerald-500";
              }

              return (
                <div className="flex items-center gap-3" key={hour.hour}>
                  <span className="w-12 text-right text-stone-500 text-xs dark:text-stone-400">
                    {hour.hour}:00
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-stone-100 dark:bg-stone-800">
                    <div
                      className={`h-full rounded transition-all ${barColor}`}
                      style={{ width: `${hour.occupancy}%` }}
                    />
                  </div>
                  <span className="w-10 font-medium text-stone-600 text-xs dark:text-stone-400">
                    {hour.occupancy}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 border-stone-100 border-t pt-4 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-300" />
              <span className="text-stone-500 text-xs">{t("low")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-500" />
              <span className="text-stone-500 text-xs">{t("medium")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-amber-500" />
              <span className="text-stone-500 text-xs">{t("high")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-red-500" />
              <span className="text-stone-500 text-xs">{t("peak")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
