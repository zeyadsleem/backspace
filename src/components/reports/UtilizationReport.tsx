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
  const isRTL = useAppStore((state) => state.isRTL);

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
    <div className={`space-y-6 3xl:space-y-8 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 3xl:gap-6">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 3xl:p-6">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400 3xl:text-sm">
            {t("overallUtilization")}
          </p>
          <p className="mt-1 font-bold text-3xl text-amber-600 dark:text-amber-400 3xl:text-4xl">
            {Math.round(utilizationData.overallRate)}%
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800 3xl:h-3">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${utilizationData.overallRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 3xl:p-6">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400 3xl:text-sm">
            {t("avgSessionDuration")}
          </p>
          <div className={`mt-1 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Clock className="h-5 w-5 text-stone-400 3xl:h-6 3xl:w-6" />
            <p className="font-bold text-2xl text-stone-900 dark:text-stone-100 3xl:text-3xl">
              {formatDuration(utilizationData.averageSessionDuration)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 3xl:p-6">
          <p className="font-medium text-stone-500 text-xs uppercase dark:text-stone-400 3xl:text-sm">
            {t("peakHour")}
          </p>
          <p className="mt-1 font-bold text-2xl text-stone-900 dark:text-stone-100 3xl:text-3xl">
            {peakHourData.hour.toString().padStart(2, "0")}:00
          </p>
          <p className="mt-1 text-stone-500 text-xs dark:text-stone-400 3xl:text-sm">
            {Math.round(peakHourData.occupancy)}% {t("occupancy")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 3xl:gap-8">
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 3xl:p-8">
          <div className={`mb-4 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <h3 className="font-semibold text-stone-900 3xl:text-xl dark:text-stone-100">
              {t("resourceUtilization")}
            </h3>
          </div>
          <div className="space-y-4">
            {utilizationData.byResource.map((resource) => {
              let barColor = "bg-red-500";
              if (resource.rate >= 80) {
                barColor = "bg-emerald-500";
              } else if (resource.rate >= 50) {
                barColor = "bg-amber-500";
              }

              return (
                <button
                  className="group w-full text-left"
                  key={resource.id}
                  onClick={() => onResourceClick?.(resource.id)}
                  type="button"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-medium text-sm text-stone-700 transition-colors group-hover:text-amber-600 dark:text-stone-300 dark:group-hover:text-amber-400 3xl:text-base">
                      {resource.name}
                    </span>
                    <span className="font-bold font-mono text-sm text-stone-900 dark:text-stone-100 3xl:text-base">
                      {Math.round(resource.rate)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800 3xl:h-3.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${resource.rate}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 3xl:p-8">
          <h3 className="mb-4 font-semibold text-stone-900 3xl:text-xl dark:text-stone-100">
            {t("peakHours")}
          </h3>
          <div className="space-y-2.5">
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
                  <span className="w-14 text-right font-mono text-stone-500 text-xs 3xl:w-16 3xl:text-sm dark:text-stone-400">
                    {hour.hour.toString().padStart(2, "0")}:00
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-stone-100 dark:bg-stone-800 3xl:h-8">
                    <div
                      className={`h-full rounded transition-all duration-500 ${barColor}`}
                      style={{ width: `${hour.occupancy}%` }}
                    />
                  </div>
                  <span className="w-10 font-bold font-mono text-stone-600 text-xs 3xl:w-12 3xl:text-sm dark:text-stone-400">
                    {Math.round(hour.occupancy)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-4 border-stone-100 border-t pt-4 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-300 3xl:h-4 3xl:w-4" />
              <span className="text-stone-500 text-xs 3xl:text-sm">{t("low")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-500 3xl:h-4 3xl:w-4" />
              <span className="text-stone-500 text-xs 3xl:text-sm">{t("medium")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-amber-500 3xl:h-4 3xl:w-4" />
              <span className="text-stone-500 text-xs 3xl:text-sm">{t("high")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-red-500 3xl:h-4 3xl:w-4" />
              <span className="text-stone-500 text-xs 3xl:text-sm">{t("peak")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
