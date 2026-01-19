import { useState } from 'react'
import type { InventoryItem, ActiveSession } from '@/types'
import { X, Search, Minus, Plus, Coffee, Check, ShoppingCart } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface CartItem {
  item: InventoryItem
  quantity: number
}

interface InventoryAddModalProps {
  session: ActiveSession
  availableInventory: InventoryItem[]
  onAdd?: (data: { inventoryId: string; quantity: number }[]) => void
  onClose?: () => void
  isLoading?: boolean
}

export function InventoryAddModal({ session, availableInventory, onAdd, onClose, isLoading }: InventoryAddModalProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])

  const filteredItems = availableInventory.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.quantity > 0
  )
  
  const handleItemAdd = (item: InventoryItem) => {
    const existingIndex = cart.findIndex(cartItem => cartItem.item.id === item.id)
    const currentCartQuantity = existingIndex >= 0 ? cart[existingIndex].quantity : 0
    const availableQuantity = item.quantity - currentCartQuantity
    
    if (availableQuantity <= 0) return
    
    if (existingIndex >= 0) {
      setCart(prev => prev.map((cartItem, index) => 
        index === existingIndex 
          ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, item.quantity) }
          : cartItem
      ))
    } else {
      setCart(prev => [...prev, { item, quantity: 1 }])
    }
  }

  const handleItemRemove = (itemId: string) => {
    setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setCart(prev => prev.map(cartItem => 
      cartItem.item.id === itemId 
        ? { ...cartItem, quantity: Math.min(newQuantity, cartItem.item.quantity) }
        : cartItem
    ))
  }

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-5xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl flex flex-col h-[70vh] overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('addInventoryItem')}</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{session.customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            
            {/* Left Side: Available Items */}
            <div className="lg:col-span-7 flex flex-col h-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
              <div className="p-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{t('availableItems')}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full">{filteredItems.length} {t('item')}</span>
                </div>
                
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input 
                    type="text" 
                    placeholder={t('searchInventory')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className={`w-full py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder:text-stone-400 ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                {filteredItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-8 text-center">
                    <Coffee className="h-8 w-8 text-stone-200 dark:text-stone-700 mb-2" />
                    <p className="text-sm font-medium text-stone-400 dark:text-stone-500">
                      {searchQuery ? t('noInventoryFound') : t('noInventoryAvailable')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredItems.map((item) => {
                      const cartItem = cart.find(ci => ci.item.id === item.id)
                      const isInCart = !!cartItem && cartItem.quantity > 0
                      const availableQuantity = item.quantity - (cartItem?.quantity || 0)
                      
                      return (
                        <button 
                          key={item.id} 
                          onClick={() => handleItemAdd(item)}
                          disabled={availableQuantity <= 0}
                          className={`group text-start flex items-center gap-2.5 p-1.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isInCart 
                              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' 
                              : 'border-stone-100 bg-stone-50 hover:bg-white hover:border-amber-200 dark:border-stone-800 dark:bg-stone-800/50 dark:hover:bg-stone-800 dark:hover:border-stone-700'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                            isInCart ? 'bg-amber-500 text-white' : 'bg-white dark:bg-stone-800 text-stone-400 border border-stone-100 dark:border-stone-700'
                          }`}>
                            {isInCart ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{item.price} {t('egpCurrency')}</span>
                              <span className="text-[10px] text-stone-400 font-medium tracking-tight">• {availableQuantity} {t('inStock')}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Cart */}
            <div className="lg:col-span-5 flex flex-col h-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
              <div className="p-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/30 dark:bg-stone-800/30">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-stone-400" />
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{t('selectedItems')}</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                  {cart.filter(ci => ci.quantity > 0).length}
                </span>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <ShoppingCart className="h-10 w-10 text-stone-300 mb-2" />
                    <p className="text-sm font-medium text-stone-500">{t('noItemsSelected')}</p>
                  </div>
                ) : (
                  cart.map((cartItem) => (
                    <div key={cartItem.item.id} className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-100 dark:border-stone-700/50 group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-stone-800 dark:text-stone-200 truncate">{cartItem.item.name}</p>
                          <p className="text-[11px] text-stone-400 font-medium">{cartItem.item.price} {t('egpCurrency')} / {t('item')}</p>
                        </div>
                        <button 
                          onClick={() => handleItemRemove(cartItem.item.id)}
                          className="p-1.5 text-stone-300 hover:text-red-500 rounded transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-1.5 rounded-md border border-stone-100 dark:border-stone-800 shadow-sm">
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            disabled={cartItem.quantity <= 0}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors disabled:opacity-30"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-stone-700 dark:text-stone-200">
                            {cartItem.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= cartItem.item.quantity}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 px-1.5">
                          {cartItem.item.price * cartItem.quantity} <span className="text-[11px] text-stone-400 font-medium">{t('egpCurrency')}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{t('subtotal')}</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalAmount} {t('egpCurrency')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-stone-200 dark:border-stone-800 p-3 bg-white dark:bg-stone-900 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-all uppercase tracking-wider"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || cart.filter(ci => ci.quantity > 0).length === 0} 
            className="flex-[2] py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {t('addToSession')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}