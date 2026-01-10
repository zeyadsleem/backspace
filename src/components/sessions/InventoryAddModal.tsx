import { useState } from 'react'
import type { InventoryItem } from '@/types'
import { X, Search, Minus, Plus, Coffee, Check, ShoppingCart } from 'lucide-react'

interface CartItem {
  item: InventoryItem
  quantity: number
}

interface InventoryAddModalProps {
  availableInventory: InventoryItem[]
  onAdd?: (data: { inventoryId: string; quantity: number }[]) => void
  onClose?: () => void
  isLoading?: boolean
}

export function InventoryAddModal({ availableInventory, onAdd, onClose, isLoading }: InventoryAddModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  const filteredItems = availableInventory.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.quantity > 0
  )
  
  // Add item to cart or increase quantity - with stock validation
  const handleItemAdd = (item: InventoryItem) => {
    const existingIndex = cart.findIndex(cartItem => cartItem.item.id === item.id)
    const currentCartQuantity = existingIndex >= 0 ? cart[existingIndex].quantity : 0
    const availableQuantity = item.quantity - currentCartQuantity
    
    if (availableQuantity <= 0) return // منع الإضافة إذا نفد المخزون
    
    if (existingIndex >= 0) {
      // Increase quantity
      setCart(prev => prev.map((cartItem, index) => 
        index === existingIndex 
          ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, item.quantity) }
          : cartItem
      ))
    } else {
      // Add new item
      setCart(prev => [...prev, { item, quantity: 1 }])
    }
  }

  // Remove item completely from cart
  const handleItemRemove = (itemId: string) => {
    setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId))
  }

  // Update quantity (can go to 0 but not negative)
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setCart(prev => prev.map(cartItem => 
      cartItem.item.id === itemId 
        ? { ...cartItem, quantity: Math.min(newQuantity, cartItem.item.quantity) }
        : cartItem
    ))
  }

  // Submit cart
  const handleSubmit = () => {
    const itemsToSubmit = cart
      .filter(cartItem => cartItem.quantity > 0)
      .map(cartItem => ({
        inventoryId: cartItem.item.id,
        quantity: cartItem.quantity
      }))
    
    onAdd?.(itemsToSubmit)
  }

  const totalAmount = cart
    .filter(cartItem => cartItem.quantity > 0)
    .reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-xl shadow-xl flex flex-col h-[70vh]" dir="rtl">
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">إضافة منتجات</h2>
          <button onClick={onClose} className="p-1.5 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            
            {/* Cart - Right Side in RTL */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  {cart.filter(cartItem => cartItem.quantity > 0).length} منتج
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">السلة</h3>
                  <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>

              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-3 inventory-scroll">
                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-stone-300 dark:text-stone-600" />
                    </div>
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">السلة فارغة</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">اختر منتجات من القائمة</p>
                  </div>
                ) : (
                  cart.map((cartItem, index) => (
                    <div key={cartItem.item.id} className={`border rounded-lg p-3 transition-all hover:shadow-sm ${
                      cartItem.quantity === 0 
                        ? 'border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 opacity-60' 
                        : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
                    }`}>
                      {/* Item Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <button 
                          onClick={() => handleItemRemove(cartItem.item.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{cartItem.item.name}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            {cartItem.item.price} ج.م × {cartItem.quantity} = {' '}
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {cartItem.item.price * cartItem.quantity} ج.م
                            </span>
                          </p>
                        </div>
                        <span className="w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                      </div>
                      
                      {/* Quantity Controls - RTL Button Order */}
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center gap-2">
                          {/* Minus Button (Left in RTL) */}
                          <button 
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            disabled={cartItem.quantity <= 0}
                            className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          {/* Quantity */}
                          <span className="w-10 text-center text-sm font-bold text-stone-900 dark:text-stone-100 bg-amber-100 dark:bg-amber-900/30 rounded px-2 py-1">
                            {cartItem.quantity}
                          </span>
                          
                          {/* Plus Button (Right in RTL) */}
                          <button 
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= cartItem.item.quantity}
                            className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">الكمية</span>
                      </div>
                      
                      {/* Stock Warning or Zero Quantity Notice */}
                      {cartItem.quantity >= cartItem.item.quantity && cartItem.quantity > 0 && (
                        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs text-orange-700 dark:text-orange-300 text-right">
                          ⚠️ تم الوصول للحد الأقصى المتاح
                        </div>
                      )}
                      {cartItem.quantity === 0 && (
                        <div className="mt-2 p-2 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded text-xs text-stone-600 dark:text-stone-400 text-right">
                          🚫 تم إزالة هذا المنتج من الطلب
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Cart Total */}
              {cart.filter(cartItem => cartItem.quantity > 0).length > 0 && (
                <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {totalAmount} ج.م
                    </span>
                    <span className="text-lg font-bold text-stone-900 dark:text-stone-100">الإجمالي</span>
                  </div>
                </div>
              )}
            </div>

            {/* Available Items - Left Side in RTL */}
            <div className="flex flex-col h-full border-r border-stone-200 dark:border-stone-700 pr-4">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <span className="text-xs text-stone-500 dark:text-stone-400">{filteredItems.length} منتج</span>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">المنتجات المتاحة</h3>
              </div>
              
              {/* Search */}
              <div className="relative mb-3 flex-shrink-0">
                <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 right-3" />
                <input 
                  type="text" 
                  placeholder="البحث في المنتجات..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400 pr-10 pl-4 text-right"
                  dir="rtl"
                />
              </div>

              {/* Items List - Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-2 inventory-scroll">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center">
                    <Coffee className="h-8 w-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {searchQuery ? 'لا توجد منتجات مطابقة للبحث' : 'لا توجد منتجات متاحة'}
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isInCart = cart.some(cartItem => cartItem.item.id === item.id)
                    const cartItem = cart.find(cartItem => cartItem.item.id === item.id)
                    const availableQuantity = item.quantity - (cartItem?.quantity || 0)
                    
                    return (
                      <button 
                        key={item.id} 
                        onClick={() => handleItemAdd(item)}
                        disabled={availableQuantity <= 0}
                        className={`w-full border rounded-lg transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          isInCart 
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                            : availableQuantity <= 0
                              ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3">
                          {/* Price */}
                          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex-shrink-0">
                            {item.price} ج.م
                          </span>
                          
                          {/* Product Info */}
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{item.name}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {availableQuantity > 0 ? `${availableQuantity} متوفر` : 'نفد المخزون'}
                              {cartItem && ` (${cartItem.quantity} في السلة)`}
                            </p>
                          </div>
                          
                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                            isInCart 
                              ? 'border-amber-500 bg-amber-500' 
                              : 'border-stone-300 dark:border-stone-600'
                          }`}>
                            {isInCart && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-stone-200 dark:border-stone-800 p-4">
          <div className="flex gap-3">
            <button 
              onClick={handleSubmit} 
              disabled={isLoading || cart.filter(cartItem => cartItem.quantity > 0).length === 0} 
              className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  إضافة المنتجات ({cart.filter(cartItem => cartItem.quantity > 0).length})
                </div>
              )}
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
