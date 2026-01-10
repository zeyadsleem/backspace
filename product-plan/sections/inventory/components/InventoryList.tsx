import { useState } from 'react'
import type { InventoryListProps, InventoryCategory } from '../types'
import { InventoryItemCard } from './InventoryItemCard'
import { LowStockAlert } from './LowStockAlert'
import { Plus, Search, Package } from 'lucide-react'

export function InventoryList({
  inventory,
  categories,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onAdjustQuantity,
  onUpdatePrice,
  language = 'en',
}: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'all'>('all')

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minStock && item.quantity > 0)
  const outOfStockItems = inventory.filter((item) => item.quantity === 0)

  // Group by category
  const groupedInventory = categories.reduce((acc, category) => {
    const items = filteredInventory.filter((item) => item.category === category.id)
    if (items.length > 0) {
      acc.push({ category, items })
    }
    return acc
  }, [] as Array<{ category: typeof categories[0]; items: typeof filteredInventory }>)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {language === 'ar' ? 'المخزون' : 'Inventory'}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {inventory.length} items
            {lowStockItems.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400"> · {lowStockItems.length} low stock</span>
            )}
            {outOfStockItems.length > 0 && (
              <span className="text-red-600 dark:text-red-400"> · {outOfStockItems.length} out of stock</span>
            )}
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                   text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'إضافة منتج' : 'Add Item'}
        </button>
      </div>

      {/* Low Stock Alert */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <LowStockAlert
          lowStockItems={lowStockItems}
          outOfStockItems={outOfStockItems}
          onItemClick={onView}
          language={language}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث...' : 'Search items...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-stone-900
                     border border-stone-200 dark:border-stone-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              categoryFilter === 'all'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                categoryFilter === cat.id
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              {language === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4">
            <Package className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">
            {searchQuery || categoryFilter !== 'all' 
              ? (language === 'ar' ? 'لا توجد نتائج' : 'No items found')
              : (language === 'ar' ? 'لا توجد منتجات' : 'No inventory items')}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {searchQuery || categoryFilter !== 'all'
              ? (language === 'ar' ? 'جرب تغيير البحث' : 'Try adjusting your search')
              : (language === 'ar' ? 'أضف أول منتج' : 'Add your first item to get started')}
          </p>
        </div>
      ) : categoryFilter === 'all' ? (
        // Grouped view
        <div className="space-y-8">
          {groupedInventory.map(({ category, items }) => (
            <div key={category.id}>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
                {language === 'ar' ? category.labelAr : category.labelEn}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item) => (
                  <InventoryItemCard
                    key={item.id}
                    item={item}
                    category={category}
                    onEdit={() => onEdit?.(item.id)}
                    onDelete={() => onDelete?.(item.id)}
                    onAdjustQuantity={(delta) => onAdjustQuantity?.(item.id, delta)}
                    language={language}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat view for single category
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInventory.map((item) => {
            const category = categories.find((c) => c.id === item.category)!
            return (
              <InventoryItemCard
                key={item.id}
                item={item}
                category={category}
                onEdit={() => onEdit?.(item.id)}
                onDelete={() => onDelete?.(item.id)}
                onAdjustQuantity={(delta) => onAdjustQuantity?.(item.id, delta)}
                language={language}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
