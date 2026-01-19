import type { Resource, ResourceType } from '@/types'
import { X, Pencil, Trash2, Monitor, DoorOpen, Armchair, DollarSign, Activity, Play } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface ResourceDetailsDialogProps {
  isOpen: boolean
  resource: Resource
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onStartSession: () => void
}

export function ResourceDetailsDialog({ isOpen, resource, onClose, onEdit, onDelete, onStartSession }: ResourceDetailsDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)

  if (!isOpen) return null

  const typeConfig: Record<ResourceType, { icon: typeof Armchair; label: string; bg: string; color: string }> = {
    seat: { icon: Armchair, label: t('seatType'), bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    room: { icon: DoorOpen, label: t('roomType'), bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
    desk: { icon: Monitor, label: t('deskType'), bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
  }

  const config = typeConfig[resource.resourceType]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-stone-900 shadow-xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('resourceDetails') || 'Resource Details'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${config.bg}`}>
              <Icon className={`h-7 w-7 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{resource.name}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{config.label}</p>
            </div>
            <div className="ms-auto">
               <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${resource.isAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                 {resource.isAvailable ? t('available') : t('occupied')}
               </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-stone-500 dark:text-stone-400">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{t('ratePerHour')}</span>
              </div>
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{resource.ratePerHour} <span className="text-sm font-normal text-stone-500">{t('egp')}</span></p>
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-stone-500 dark:text-stone-400">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{t('utilization')}</span>
              </div>
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{resource.utilizationRate}%</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-3">
          {resource.isAvailable && (
            <button 
              onClick={() => { onStartSession(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm"
            >
              <Play className="h-4 w-4" /> {t('startSession')}
            </button>
          )}
          <div className="flex gap-3">
            <button 
              onClick={() => { onEdit(); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <Pencil className="h-4 w-4" /> {t('edit')}
            </button>
            <button 
              onClick={() => { onDelete(); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> {t('delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
