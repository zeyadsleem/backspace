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
    <div className={`3xl:space-y-8 space-y-6 ${isRTL ? "text-end" : "text-start"}`}>
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
          <div className={`mt-1 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
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
        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-8 p-5 dark:border-stone-800 dark:bg-stone-900">
          <div
            className={`mb-4 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <h3 className="font-semibold 3xl:text-xl text-stone-900 dark:text-stone-100">
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
                  className={`group w-full ${isRTL ? "text-end" : "text-start"}`}
                  key={resource.id}
                  onClick={() => onResourceClick?.(resource.id)}
                  type="button"
                >
                  <div
                    className={`mb-1.5 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span className="font-medium 3xl:text-base text-sm text-stone-700 transition-colors group-hover:text-amber-600 dark:text-stone-300 dark:group-hover:text-amber-400">
                      {resource.name}
                    </span>
                    <span className="font-bold font-mono 3xl:text-base text-sm text-stone-900 dark:text-stone-100">
                      {Math.round(resource.rate)}%
                    </span>
                  </div>
                  <div className="3xl:h-3.5 h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor} ${isRTL ? "origin-right" : "origin-left"}`}
                      style={{ width: `${resource.rate}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white 3xl:p-8 p-5 dark:border-stone-800 dark:bg-stone-900">
          <h3
            className={`mb-4 font-semibold 3xl:text-xl text-stone-900 dark:text-stone-100 ${isRTL ? "text-end" : "text-start"}`}
          >
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
                <div
                  className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                  key={hour.hour}
                >
                  <span
                    className={`3xl:w-16 w-14 font-mono 3xl:text-sm text-stone-500 text-xs dark:text-stone-400 ${isRTL ? "text-start" : "text-end"}`}
                  >
                    {hour.hour.toString().padStart(2, "0")}:00
                  </span>
                  <div className="3xl:h-8 h-6 flex-1 overflow-hidden rounded bg-stone-100 dark:bg-stone-800">
                    <div
                      className={`h-full rounded transition-all duration-500 ${barColor} ${isRTL ? "origin-right" : "origin-left"}`}
                      style={{ width: `${hour.occupancy}%` }}
                    />
                  </div>
                  <span
                    className={`3xl:w-12 w-10 font-bold font-mono 3xl:text-sm text-stone-600 text-xs dark:text-stone-400 ${isRTL ? "text-end" : "text-start"}`}
                  >
                    {Math.round(hour.occupancy)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div
            className={`mt-6 flex flex-wrap gap-4 border-stone-100 border-t pt-4 dark:border-stone-800 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="3xl:h-4 h-3 3xl:w-4 w-3 rounded bg-emerald-300" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("low")}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="3xl:h-4 h-3 3xl:w-4 w-3 rounded bg-emerald-500" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("medium")}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="3xl:h-4 h-3 3xl:w-4 w-3 rounded bg-amber-500" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("high")}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="3xl:h-4 h-3 3xl:w-4 w-3 rounded bg-red-500" />
              <span className="3xl:text-sm text-stone-500 text-xs">{t("peak")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
