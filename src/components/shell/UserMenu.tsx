import { LogOut } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { RTLIcon } from '../ui/RTLIcon'

interface UserMenuProps {
  user?: { name: string; role?: string; avatarUrl?: string }
  collapsed?: boolean
  onLogout?: () => void
}

export function UserMenu({ user, collapsed = false, onLogout }: UserMenuProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className={`p-2 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
      {/* User Info */}
      <div
        className={`
          flex items-center gap-3 p-2 rounded-lg
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        {/* Avatar */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {initials}
            </span>
          </div>
        )}

        {/* Name & Role */}
        {!collapsed && (
          <div className={`flex-1 min-w-0 ${isRTL ? 'text-end' : 'text-start'}`}>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {user?.name || t('admin')}
            </p>
            {user?.role && (
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                {user.role === 'Manager' ? t('manager') : user.role}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800
          hover:text-red-600 dark:hover:text-red-400 transition-colors
          ${collapsed ? 'justify-center w-full' : `w-full ${isRTL ? 'flex-row-reverse' : ''}`}
        `}
        title={collapsed ? t('logout') : undefined}
      >
        <RTLIcon>
          <LogOut className="h-4 w-4" />
        </RTLIcon>
        {!collapsed && <span>{t('logout')}</span>}
      </button>
    </div>
  )
}
