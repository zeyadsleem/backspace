import { Armchair, DoorOpen, Monitor } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { formatCurrency } from "@/lib/formatters";
import type { Resource, ResourceType } from "@/types";

interface ResourceCardProps {
  resource: Resource;
  viewMode?: "grid" | "list";
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelectForSession?: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const t = useAppStore((state) => state.t);

  const typeConfig: Record<
    ResourceType,
    { icon: typeof Armchair; label: string; color: string; bg: string }
  > = {
    seat: {
      icon: Armchair,
      label: t("seatType"),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    room: {
      icon: DoorOpen,
      label: t("roomType"),
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    desk: {
      icon: Monitor,
      label: t("deskType"),
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  };

  const config = typeConfig[resource.resourceType];
  const Icon = config.icon;

  const statusText = resource.isAvailable
    ? "text-emerald-700 dark:text-emerald-300"
    : "text-red-700 dark:text-red-300";
  const statusBg = resource.isAvailable
    ? "bg-emerald-100 dark:bg-emerald-900/30"
    : "bg-red-100 dark:bg-red-900/30";

  return (
    <div
      className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-all duration-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
      onClick={onClick}
    >
      <div className={`shrink-0 rounded-lg p-2.5 ${config.bg}`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-sm text-stone-900 leading-tight dark:text-stone-100">
            {resource.name}
          </h3>
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[9px] uppercase tracking-wider ${statusBg} ${statusText} shadow-sm`}
          >
            {resource.isAvailable ? t("available") : t("occupied")}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <p className="font-semibold text-stone-500 text-[11px] dark:text-stone-400">
            {config.label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-semibold text-stone-600 text-[11px] dark:text-stone-400">
              {formatCurrency(resource.ratePerHour)}
            </span>
            <span className="text-[9px] font-semibold text-stone-400 uppercase">{t("egp")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
