import { Armchair, DoorOpen, Monitor } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
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
      className="group relative flex cursor-pointer items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-all duration-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
      onClick={onClick}
    >
      <div className={`shrink-0 rounded-lg p-3 ${config.bg}`}>
        <Icon className={`h-6 w-6 ${config.color}`} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="mb-1 truncate font-bold text-sm text-stone-900 dark:text-stone-100">
          {resource.name}
        </h3>
        <p className="flex items-center gap-1 font-medium text-stone-500 text-xs dark:text-stone-400">
          {config.label} <span className="text-stone-300 dark:text-stone-600">|</span>{" "}
          {resource.ratePerHour} {t("egp")}
        </p>
      </div>

      <div className="shrink-0">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold text-xs ${statusBg} ${statusText}`}
        >
          {resource.isAvailable ? t("available") : t("occupied")}
        </span>
      </div>
    </div>
  );
}
