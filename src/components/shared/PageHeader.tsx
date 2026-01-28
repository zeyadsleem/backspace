import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RTLIcon } from "@/components/ui/RTLIcon";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  onBreadcrumbClick?: (href: string) => void;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onBreadcrumbClick,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((item, index) => (
            <div className="flex items-center gap-1" key={item.label}>
              {index > 0 && (
                <RTLIcon>
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </RTLIcon>
              )}
              {item.href ? (
                <Button
                  className="h-auto p-0 font-normal text-sm text-stone-600 hover:bg-transparent hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
                  onClick={() => onBreadcrumbClick?.(item.href!)}
                  variant="ghost"
                >
                  {item.label}
                </Button>
              ) : (
                <span className="text-stone-900 dark:text-stone-100">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
