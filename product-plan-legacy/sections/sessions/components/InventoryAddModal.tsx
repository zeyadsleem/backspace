import { useState } from 'react'
import type { ActiveSession, AvailableInventoryItem, InventoryAddData } from '../types'
import { X, Search, Minus, Plus, Coffee } from 'lucide-react'

interface InventoryAddModalProps {
  session: ActiveSession
  availableInventory: AvailableInventoryItem[]
  onAdd?: (data: InventoryAddData) => void
  onClose?: () => void
  isLoading?: boolean
}

export function InventoryAddModal({ session, availableInventory, onAdd, onClose, isLoading }: InventoryAddModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<AvailableInventoryItem | null>(null)
  const [quantity, setQuantity] = useState(1)

  const filteredItems = availableInventory.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.quantity > 0)
  const handleSubmit = () => { if (selectedItem) { onAdd?.({ inventoryId: selectedItem.id, quantity }) } }
  const maxQuantity = selectedItem?.quantity || 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Add Inventory</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">{session.customerName} · {session.resourceName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400" />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center"><Coffee className="h-8 w-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" /><p className="text-sm text-stone-500 dark:text-stone-400">{searchQuery ? 'No items found' : 'No items available'}</p></div>
            ) : (
              filteredItems.map((item) => (
                <button key={item.id} onClick={() => { setSelectedItem(item); setQuantity(1) }} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedItem?.id === item.id ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500' : 'bg-stone-50 dark:bg-stone-800 border-2 border-transparent hover:border-stone-200 dark:hover:border-stone-700'}`}>
                  <div className="text-left"><p className="font-medium text-stone-900 dark:text-stone-100">{item.name}</p><p className="text-xs text-stone-500 dark:text-stone-400">{item.quantity} in stock</p></div>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{item.price} EGP</span>
                </button>
              ))
            )}
          </div>
          {selectedItem && (
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm font-medium text-stone-700 dark:text-stone-300">{selectedItem.name}</span><span className="text-sm text-stone-500 dark:text-stone-400">{selectedItem.price} EGP each</span></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600 dark:text-stone-400">Quantity</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center font-semibold text-stone-900 dark:text-stone-100">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} disabled={quantity >= maxQuantity} className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-700"><span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Total</span><span className="text-lg font-bold text-amber-600 dark:text-amber-400">{selectedItem.price * quantity} EGP</span></div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-4 border-t border-stone-200 dark:border-stone-800">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!selectedItem || isLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Adding...' : 'Add to Session'}</button>
        </div>
      </div>
    </div>
  )
}
