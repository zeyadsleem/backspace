import {
  Activity,
  Coffee,
  CreditCard,
  FileText,
  Play,
  Receipt,
  Square,
  UserPlus,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { RecentActivity } from "@/types";

interface ActivityFeedProps {
  activities: RecentActivity[];
}

const activityConfig: Record<
  RecentActivity["type"],
  { icon: typeof Play; color: string; bg: string }
> = {
  session_start: {
    icon: Play,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  session_end: {
    icon: Square,
    color: "text-stone-600 dark:text-stone-400",
    bg: "bg-stone-100 dark:bg-stone-800",
  },
  inventory_add: {
    icon: Coffee,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/50",
  },
  customer_new: {
    icon: UserPlus,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/50",
  },
  invoice_paid: {
    icon: Receipt,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  subscription_new: {
    icon: CreditCard,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/50",
  },
  invoice_created: {
    icon: FileText,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-900/50",
  },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const t = useAppStore((state) => state.t);
  const language = useAppStore((state) => state.language);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) {
      return t("justNow");
    }
    if (diffMins < 60) {
      return language === "ar" ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return language === "ar" ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      {/* Header - Fixed */}
      <div className="flex flex-shrink-0 items-center gap-2 border-stone-200 border-b p-4 dark:border-stone-800">
        <div className="rounded-lg bg-stone-100 p-2 dark:bg-stone-800">
          <Activity className="h-4 w-4 text-stone-600 dark:text-stone-400" />
        </div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t("recentActivity")}</h3>
      </div>

      {/* Content - Scrollable */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
        <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
          {activities.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
              {t("noRecentActivity")}
            </p>
          ) : (
            activities.map((activity) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              return (
                <div
                  className="flex items-start gap-3 p-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  key={activity.id}
                >
                  <div className={`flex-shrink-0 rounded-lg p-2 ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-stone-700 leading-snug dark:text-stone-300">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-stone-400 text-xs dark:text-stone-500">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
