import { useState } from 'react'
import type { Resource, ResourceType } from '@/types'
import { ResourceCard } from './ResourceCard'
import { Plus, LayoutGrid, List, Building2 } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface ResourcesListProps {
  resources: Resource[]
  resourceTypes: ResourceType[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
  onSelectForSession?: (id: string) => void
}

export function ResourcesList({ resources, resourceTypes, onView, onEdit, onDelete, onCreate, onSelectForSession }: ResourcesListProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredResources = resources.filter((resource) => typeFilter === 'all' || resource.resourceType === typeFilter)
  const availableCount = filteredResources.filter((r) => r.isAvailable).length
  const occupiedCount = filteredResources.filter((r) => !r.isAvailable).length
  
  const typeLabels: Record<ResourceType, string> = { 
    seat: t('seat'), 
    room: t('room'), 
    desk: t('desk') 
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className={isRTL ? 'text-end' : 'text-start'}>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('resources')}</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1"><span className="text-emerald-600 dark:text-emerald-400">{availableCount} {t('available')}</span>{' · '}<span className="text-red-600 dark:text-red-400">{occupiedCount} {t('occupied')}</span></p>
        </div>
        <button onClick={onCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"><Plus className="h-4 w-4" />{t('addResource')}</button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          <button onClick={() => setTypeFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${typeFilter === 'all' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}>{t('all')} ({resources.length})</button>
          {resourceTypes.map((type) => {
            const count = resources.filter((r) => r.resourceType === type).length
            return <button key={type} onClick={() => setTypeFilter(type)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${typeFilter === type ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}`}>{typeLabels[type]} ({count})</button>
          })}
        </div>
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400'}`}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400'}`}><List className="h-4 w-4" /></button>
        </div>
      </div>
      {filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4"><Building2 className="h-8 w-8 text-stone-400" /></div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{t('noResourcesFound')}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{typeFilter !== 'all' ? t('trySelectingDifferent') : t('addFirstResource')}</p>
          {typeFilter === 'all' && <button onClick={onCreate} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"><Plus className="h-4 w-4" />{t('addResource')}</button>}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch' : 'space-y-3'}>
          {filteredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} viewMode={viewMode} onClick={() => onView?.(resource.id)} onEdit={() => onEdit?.(resource.id)} onDelete={() => onDelete?.(resource.id)} onSelectForSession={resource.isAvailable ? () => onSelectForSession?.(resource.id) : undefined} />)}
        </div>
      )}
    </div>
  )
}
