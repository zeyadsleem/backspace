import { useState } from 'react'
import type { InventoryItem, InventoryCategory, CategoryOption } from '@/types'
import { InventoryItemCard } from './InventoryItemCard'
import { LowStockAlert } from './LowStockAlert'
import { Plus, Search, Package } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface InventoryListProps {
  inventory: InventoryItem[]
  categories: CategoryOption[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
  onAdjustQuantity?: (id: string, delta: number) => void
}

export function InventoryList({ inventory, categories, onView, onEdit, onDelete, onCreate, onAdjustQuantity }: InventoryListProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'all'>('all')

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minStock && item.quantity > 0)
  const outOfStockItems = inventory.filter((item) => item.quantity === 0)

  const groupedInventory = categories.reduce((acc, category) => {
    const items = filteredInventory.filter((item) => item.category === category.id)
    if (items.length > 0) acc.push({ category, items })
    return acc
  }, [] as Array<{ category: CategoryOption; items: InventoryItem[] }>)

  const gridClass = "grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 items-stretch"

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('inventory')}</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {t('totalItems', { count: inventory.length })}
            {lowStockItems.length > 0 && <span className="text-amber-600 dark:text-amber-400"> · {lowStockItems.length} {t('lowStock')}</span>}
            {outOfStockItems.length > 0 && <span className="text-red-600 dark:text-red-400"> · {outOfStockItems.length} {t('outOfStock')}</span>}
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />{t('newItem')}
        </button>
      </div>

      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <LowStockAlert lowStockItems={lowStockItems} outOfStockItems={outOfStockItems} onItemClick={onView} />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 start-3" />
          <input type="text" placeholder={t('searchInventory')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ps-10 pe-4 text-start" />
        </div>
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-xl p-1 overflow-x-auto">
          <button onClick={() => setCategoryFilter('all')} className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${categoryFilter === 'all' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{t('allCategories')}</button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${categoryFilter === cat.id ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{isRTL ? cat.labelAr : cat.labelEn}</button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredInventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4"><Package className="h-8 w-8 text-stone-400" /></div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{t('noInventoryFound')}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('tryAdjustingFilters')}</p>
        </div>
      ) : categoryFilter === 'all' ? (
        <div className="space-y-10">
          {groupedInventory.map(({ category, items }) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-5 px-1">
                <h2 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em]">{isRTL ? category.labelAr : category.labelEn}</h2>
                <div className="h-px bg-stone-100 dark:bg-stone-800 flex-1" />
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{items.length} {t('itemsLabel') || 'Items'}</span>
              </div>
              <div className={gridClass}>
                {items.map((item) => (
                  <InventoryItemCard key={item.id} item={item} category={category} onEdit={() => onEdit?.(item.id)} onDelete={() => onDelete?.(item.id)} onAdjustQuantity={(delta) => onAdjustQuantity?.(item.id, delta)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={gridClass}>
          {filteredInventory.map((item) => {
            const category = categories.find((c) => c.id === item.category)!
            return <InventoryItemCard key={item.id} item={item} category={category} onEdit={() => onEdit?.(item.id)} onDelete={() => onDelete?.(item.id)} onAdjustQuantity={(delta) => onAdjustQuantity?.(item.id, delta)} />
          })}
        </div>
      )}
    </div>
  )
}