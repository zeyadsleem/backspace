interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  isActive?: boolean
}

interface MainNavProps {
  items: NavigationItem[]
  collapsed?: boolean
  onNavigate?: (href: string) => void
}

export function MainNav({ items, collapsed = false, onNavigate }: MainNavProps) {
  return (
    <ul className="space-y-1 px-2">
      {items.map((item) => (
        <li key={item.href}>
          <button
            onClick={() => onNavigate?.(item.href)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${item.isActive
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              }
              ${collapsed ? 'justify-center' : 'justify-between text-end'}
            `}
            title={collapsed ? item.label : undefined}
          >
            {!collapsed && <span>{item.label}</span>}
            {item.icon && (
              <span className={`flex-shrink-0 ${item.isActive ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                {item.icon}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}
