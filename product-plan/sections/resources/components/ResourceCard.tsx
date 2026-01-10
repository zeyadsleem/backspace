import type { Resource, ResourceType } from '../types'
import { Armchair, DoorOpen, Monitor, Pencil, Trash2, Play } from 'lucide-react'

interface ResourceCardProps {
  resource: Resource
  viewMode?: 'grid' | 'list'
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSelectForSession?: () => void
}

const typeConfig: Record<ResourceType, { icon: typeof Armchair; label: string }> = {
  seat: { icon: Armchair, label: 'Seat' },
  room: { icon: DoorOpen, label: 'Room' },
  desk: { icon: Monitor, label: 'Desk' },
}

export function ResourceCard({
  resource,
  viewMode = 'grid',
  onClick,
  onEdit,
  onDelete,
  onSelectForSession,
}: ResourceCardProps) {
  const config = typeConfig[resource.resourceType]
  const Icon = config.icon
  const formatRate = (rate: number) => `${rate} EGP/hr`

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:shadow-md transition-all cursor-pointer ${!resource.isAvailable ? 'opacity-75' : ''}`}
        onClick={onClick}
      >
        <div className={`p-3 rounded-xl ${resource.isAvailable ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <Icon className={`h-5 w-5 ${resource.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{resource.name}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${resource.isAvailable ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
              {resource.isAvailable ? 'Available' : 'Occupied'}
            </span>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{config.label} · {formatRate(resource.ratePerHour)} · {resource.utilizationRate}% utilization</p>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {resource.isAvailable && onSelectForSession && (
            <button onClick={onSelectForSession} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Start Session"><Play className="h-4 w-4" /></button>
          )}
          <button onClick={onEdit} className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
          <button onClick={onDelete} className="p-2 text-stone-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div
      className={`relative p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:shadow-md transition-all cursor-pointer group ${!resource.isAvailable ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full ${resource.isAvailable ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
        {resource.isAvailable ? 'Available' : 'Occupied'}
      </div>
      <div className={`inline-flex p-3 rounded-xl mb-3 ${resource.isAvailable ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
        <Icon className={`h-6 w-6 ${resource.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
      </div>
      <h3 className="font-semibold text-stone-900 dark:text-stone-100">{resource.name}</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{config.label}</p>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatRate(resource.ratePerHour)}</span>
        <span className="text-xs text-stone-500 dark:text-stone-400">{resource.utilizationRate}% used</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-white dark:from-stone-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        {resource.isAvailable && onSelectForSession && (
          <button onClick={onSelectForSession} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors" title="Start Session"><Play className="h-4 w-4" /></button>
        )}
        <button onClick={onEdit} className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
        <button onClick={onDelete} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
