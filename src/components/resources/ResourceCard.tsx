import type { Resource, ResourceType } from '@/types'
import { Armchair, DoorOpen, Monitor } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface ResourceCardProps {
  resource: Resource
  viewMode?: 'grid' | 'list'
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSelectForSession?: () => void
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const t = useAppStore((state) => state.t)
  
  const typeConfig: Record<ResourceType, { icon: typeof Armchair; label: string; color: string; bg: string }> = {
    seat: { icon: Armchair, label: t('seatType'), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    room: { icon: DoorOpen, label: t('roomType'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    desk: { icon: Monitor, label: t('deskType'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  }
  
  const config = typeConfig[resource.resourceType]
  const Icon = config.icon

  const statusText = resource.isAvailable ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
  const statusBg = resource.isAvailable ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'

  return (
    <div 
      className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4"
      onClick={onClick}
    >
      <div className={`shrink-0 p-3 rounded-lg ${config.bg}`}>
        <Icon className={`h-6 w-6 ${config.color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate mb-1">{resource.name}</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
          {config.label} <span className="text-stone-300 dark:text-stone-600">|</span> {resource.ratePerHour} {t('egp')}
        </p>
      </div>

      <div className="shrink-0">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBg} ${statusText}`}>
          {resource.isAvailable ? t('available') : t('occupied')}
        </span>
      </div>
    </div>
  )
}
