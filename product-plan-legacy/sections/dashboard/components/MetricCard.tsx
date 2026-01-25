import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: ReactNode
  variant?: 'default' | 'primary' | 'success'
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onClick,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      container: 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800',
      icon: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
      value: 'text-stone-900 dark:text-stone-100',
    },
    primary: {
      container: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
      icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      value: 'text-amber-700 dark:text-amber-300',
    },
    success: {
      container: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      value: 'text-emerald-700 dark:text-emerald-300',
    },
  }

  const styles = variantStyles[variant]

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl border text-left transition-all duration-200
        hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
        ${styles.container}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${styles.value}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg flex-shrink-0 ${styles.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </button>
  )
}
