import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { RTLIcon } from '@/components/ui/RTLIcon'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  onBreadcrumbClick?: (href: string) => void
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, onBreadcrumbClick }: PageHeaderProps) {
  const isRTL = useAppStore((state) => state.isRTL)
  
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={`flex items-center gap-1 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          {breadcrumbs.map((item, index) => (
            <div key={item.label} className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {index > 0 && <RTLIcon><ChevronRight className="h-4 w-4 text-stone-400" /></RTLIcon>}
              {item.href ? (
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick?.(item.href!)}
                  className="text-stone-600 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-stone-900 dark:text-stone-100">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{subtitle}</p>}
        </div>
        {actions && <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>{actions}</div>}
      </div>
    </div>
  )
}
