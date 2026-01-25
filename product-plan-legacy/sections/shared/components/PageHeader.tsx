import type { PageHeaderProps } from '../types'
import { ChevronRight } from 'lucide-react'

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onBreadcrumbClick,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={item.label} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-stone-400 rtl:rotate-180" />
              )}
              {item.href ? (
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick?.(item.href!)}
                  className="text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-stone-900 dark:text-stone-100">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
