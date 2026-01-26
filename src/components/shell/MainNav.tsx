interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface MainNavProps {
  items: NavigationItem[];
  collapsed?: boolean;
  onNavigate?: (href: string) => void;
}

export function MainNav({ items, collapsed = false, onNavigate }: MainNavProps) {
  return (
    <ul className="space-y-1 px-2">
      {items.map((item) => (
        <li key={item.href}>
          <button
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors duration-150 ${
              item.isActive
                ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            }
              ${collapsed ? "justify-center" : "justify-between text-end"}
            `}
            onClick={() => onNavigate?.(item.href)}
            title={collapsed ? item.label : undefined}
          >
            {!collapsed && <span>{item.label}</span>}
            {item.icon && (
              <span
                className={`flex-shrink-0 ${item.isActive ? "text-amber-600 dark:text-amber-400" : ""}`}
              >
                {item.icon}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
