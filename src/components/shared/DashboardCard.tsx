import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  fullHeight?: boolean;
}

export function DashboardCard({
  title,
  icon,
  extra,
  children,
  className,
  contentClassName,
  fullHeight = true,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900",
        fullHeight && "h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-stone-200 border-b p-4 dark:border-stone-800">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="rounded-lg bg-stone-100 p-2 dark:bg-stone-800">
              <div className="flex h-4 w-4 items-center justify-center text-stone-600 dark:text-stone-400">
                {icon}
              </div>
            </div>
          )}
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
        </div>
        {extra && <div className="flex-shrink-0">{extra}</div>}
      </div>

      {/* Content */}
      <div className={cn("scrollbar-thin min-h-0 flex-1 overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
