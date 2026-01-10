import { useState } from 'react'
import type { ActiveSession } from '@/types'
import { X, Edit3, Trash2, Plus, Minus, Check, Coffee } from 'lucide-react'

interface EditInventoryModalProps {
  session: ActiveSession
  isOpen: boolean
  onClose: () => void
  onUpdateItem?: (itemId: string, newQuantity: number) => void
  onRemoveItem?: (itemId: string) => void
  isLoading?: boolean
}

export function EditInventoryModal({ 
  session, 
  isOpen, 
  onClose, 
  onUpdateItem, 
  onRemoveItem, 
  isLoading 
}: EditInventoryModalProps) {
  const [editingItems, setEditingItems] = useState<Record<string, number>>({})
  const [hasChanges, setHasChanges] = useState(false)

  if (!isOpen) return null

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setEditingItems(prev => ({
      ...prev,
      [itemId]: newQuantity
    }))
    setHasChanges(true)
  }

  const handleSaveChanges = () => {
    Object.entries(editingItems).forEach(([itemId, quantity]) => {
      if (quantity === 0) {
        onRemoveItem?.(itemId)
      } else {
        onUpdateItem?.(itemId, quantity)
      }
    })
    
    setEditingItems({})
    setHasChanges(false)
    onClose()
  }

  const handleRemoveItem = (itemId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      onRemoveItem?.(itemId)
    }
  }

  const getDisplayQuantity = (itemId: string, originalQuantity: number) => {
    return editingItems[itemId] !== undefined ? editingItems[itemId] : originalQuantity
  }

  const calculateNewTotal = () => {
    return session.inventoryConsumptions.reduce((total, item) => {
      const quantity = getDisplayQuantity(item.id, item.quantity)
      return total + (item.price * quantity)
    }, 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-xl shadow-xl max-h-[75vh] flex flex-col" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Edit3 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">تعديل المنتجات</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{session.customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {session.inventoryConsumptions.length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="h-8 w-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">لا توجد منتجات</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">لم يتم إضافة أي منتجات لهذه الجلسة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {session.inventoryConsumptions.map((item, index) => {
                const displayQuantity = getDisplayQuantity(item.id, item.quantity)
                const isEdited = editingItems[item.id] !== undefined
                const isRemoved = displayQuantity === 0
                
                return (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-3 transition-all ${
                      isRemoved 
                        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 opacity-60' 
                        : isEdited 
                          ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' 
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-medium text-stone-900 dark:text-stone-100 text-sm mb-1">{item.itemName}</h4>
                          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                            <span>
                              {new Date(item.addedAt).toLocaleTimeString('ar-EG', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span>•</span>
                            <span>{item.price} ج.م للوحدة</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, displayQuantity - 1)}
                            disabled={displayQuantity <= 0}
                            className="p-1 rounded bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                          >
                            <Minus className="h-3 w-3 text-stone-600 dark:text-stone-300" />
                          </button>
                          
                          <div className="px-2 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded min-w-[40px] text-center">
                            <span className={`text-sm font-bold ${
                              isRemoved 
                                ? 'text-red-600 dark:text-red-400' 
                                : isEdited 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-stone-900 dark:text-stone-100'
                            }`}>
                              {displayQuantity}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, displayQuantity + 1)}
                            className="p-1 rounded bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                          >
                            <Plus className="h-3 w-3 text-stone-600 dark:text-stone-300" />
                          </button>
                        </div>

                        {/* Total & Remove */}
                        <div className="text-left">
                          <p className={`text-sm font-bold ${
                            isRemoved 
                              ? 'text-red-600 dark:text-red-400 line-through' 
                              : isEdited 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-stone-900 dark:text-stone-100'
                          }`}>
                            {(item.price * displayQuantity).toFixed(0)} ج.م
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            {displayQuantity} × {item.price} ج.م
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Status Messages */}
                    {isRemoved && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300 text-right">
                        سيتم حذف هذا المنتج عند الحفظ
                      </div>
                    )}
                    {isEdited && !isRemoved && (
                      <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-300 text-right">
                        تم تعديل الكمية - اضغط حفظ لتطبيق التغييرات
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 dark:border-stone-800 p-3 flex-shrink-0">
          {/* New Total */}
          {hasChanges && (
            <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {calculateNewTotal().toFixed(0)} ج.م
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">الإجمالي الجديد</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    حفظ التغييرات
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className={`${hasChanges ? 'px-4' : 'flex-1'} py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors`}
            >
              {hasChanges ? 'إلغاء' : 'إغلاق'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}