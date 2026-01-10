import { UserPlus, Play } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface QuickActionsProps {
  onNewCustomer?: () => void
  onStartSession?: () => void
}

export function QuickActions({ onNewCustomer, onStartSession }: QuickActionsProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  
  return (
    <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <button
        onClick={onNewCustomer}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-medium text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600 transition-all shadow-sm hover:shadow"
      >
        <UserPlus className="h-4 w-4" />
        {t('newCustomer')}
      </button>
      <button
        onClick={onStartSession}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium text-sm text-white transition-all shadow-sm hover:shadow-md"
      >
        <Play className="h-4 w-4" />
        {t('startSession')}
      </button>
    </div>
  )
}
