import { Play, UserPlus } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

interface QuickActionsProps {
  onNewCustomer?: () => void;
  onStartSession?: () => void;
}

export function QuickActions({ onNewCustomer, onStartSession }: QuickActionsProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  return (
    <div className={`flex flex-wrap gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
      <button
        className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 font-medium text-sm text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50 hover:shadow dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-800"
        onClick={onNewCustomer}
      >
        <UserPlus className="h-4 w-4" />
        {t("newCustomer")}
      </button>
      <button
        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-sm text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md"
        onClick={onStartSession}
      >
        <Play className="h-4 w-4" />
        {t("startSession")}
      </button>
    </div>
  );
}
