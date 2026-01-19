import type { UtilizationData } from '@/types'
import { Clock } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface UtilizationReportProps {
  utilizationData: UtilizationData
  onResourceClick?: (id: string) => void
}

export function UtilizationReport({ utilizationData, onResourceClick }: UtilizationReportProps) {
  const t = useAppStore((state) => state.t)
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}${t('hours').charAt(0)} ${mins}${t('minutes').charAt(0)}`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('overallUtilization')}</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{utilizationData.overallRate}%</p>
          <div className="mt-2 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${utilizationData.overallRate}%` }} /></div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('avgSessionDuration')}</p>
          <div className="flex items-center gap-2 mt-1"><Clock className="h-5 w-5 text-stone-400" /><p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{formatDuration(utilizationData.averageSessionDuration)}</p></div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('peakHour')}</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{utilizationData.peakHours.reduce((max, h) => h.occupancy > max.occupancy ? h : max).hour}:00</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{utilizationData.peakHours.reduce((max, h) => h.occupancy > max.occupancy ? h : max).occupancy}% {t('occupancy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{t('resourceUtilization')}</h3>
          </div>
          <div className="space-y-3">
            {utilizationData.byResource.map((resource) => (
              <button key={resource.id} onClick={() => onResourceClick?.(resource.id)} className="w-full text-left">
                <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-stone-700 dark:text-stone-300">{resource.name}</span><span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{resource.rate}%</span></div>
                <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${resource.rate >= 80 ? 'bg-emerald-500' : resource.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${resource.rate}%` }} /></div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('peakHours')}</h3>
          <div className="space-y-2">
            {utilizationData.peakHours.map((hour) => (
              <div key={hour.hour} className="flex items-center gap-3">
                <span className="w-12 text-xs text-stone-500 dark:text-stone-400 text-right">{hour.hour}:00</span>
                <div className="flex-1 h-6 bg-stone-100 dark:bg-stone-800 rounded overflow-hidden"><div className={`h-full rounded transition-all ${hour.occupancy >= 80 ? 'bg-red-500' : hour.occupancy >= 60 ? 'bg-amber-500' : hour.occupancy >= 40 ? 'bg-emerald-500' : 'bg-emerald-300'}`} style={{ width: `${hour.occupancy}%` }} /></div>
                <span className="w-10 text-xs font-medium text-stone-600 dark:text-stone-400">{hour.occupancy}%</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-300" /><span className="text-xs text-stone-500">{t('low')}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-stone-500">{t('medium')}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500" /><span className="text-xs text-stone-500">{t('high')}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-stone-500">{t('peak')}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
