import {
  Activity,
  Armchair,
  DollarSign,
  DoorOpen,
  Monitor,
  Pencil,
  Trash2,
} from "lucide-react";
import { Modal } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import type { Resource, ResourceType } from "@/types";

interface ResourceDetailsDialogProps {
  isOpen: boolean;
  resource: Resource;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ResourceDetailsDialog({
  isOpen,
  resource,
  onClose,
  onEdit,
  onDelete,
}: ResourceDetailsDialogProps) {
  const t = useAppStore((state) => state.t);

  if (isOpen === false) {
    return null;
  }

  const typeConfig: Record<
    ResourceType,
    { icon: typeof Armchair; label: string; bg: string; color: string }
  > = {
    seat: {
      icon: Armchair,
      label: t("seatType"),
      bg: "bg-blue-100 dark:bg-blue-900/30",
      color: "text-blue-600 dark:text-blue-400",
    },
    room: {
      icon: DoorOpen,
      label: t("roomType"),
      bg: "bg-purple-100 dark:bg-purple-900/30",
      color: "text-purple-600 dark:text-purple-400",
    },
    desk: {
      icon: Monitor,
      label: t("deskType"),
      bg: "bg-amber-100 dark:bg-amber-900/30",
      color: "text-amber-600 dark:text-amber-400",
    },
  };

  const config = typeConfig[resource.resourceType];
  const Icon = config.icon;

  return (
    <Modal
      className="overflow-hidden"
      isOpen={isOpen}
      maxWidth="md"
      onClose={onClose}
      title={t("resourceDetails") || "Resource Details"}
    >
      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-2xl p-3.5 ${config.bg}`}>
            <Icon className={`h-7 w-7 ${config.color}`} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
              {resource.name}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">{config.label}</p>
          </div>
          <div className="ms-auto">
            <span
              className={`rounded-full px-2.5 py-0.5 font-semibold text-xs ${resource.isAvailable ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
            >
              {resource.isAvailable ? t("available") : t("occupied")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/50">
            <div className="mb-1.5 flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium text-xs uppercase tracking-wide">
                {t("ratePerHour")}
              </span>
            </div>
            <p className="font-bold text-lg text-stone-900 dark:text-stone-100">
              {resource.ratePerHour}{" "}
              <span className="font-normal text-sm text-stone-500">{t("egp")}</span>
            </p>
          </div>
          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/50">
            <div className="mb-1.5 flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Activity className="h-4 w-4" />
              <span className="font-medium text-xs uppercase tracking-wide">
                {t("utilization")}
              </span>
            </div>
            <p className="font-bold text-lg text-stone-900 dark:text-stone-100">
              {resource.utilizationRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 border-stone-200 border-t bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-800/50">
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => {
              onEdit();
              onClose();
            }}
            size="md"
            variant="outline"
          >
            <Pencil className="h-4 w-4" /> {t("edit")}
          </Button>
          <Button
            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={() => {
              onDelete();
              onClose();
            }}
            size="md"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" /> {t("delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
