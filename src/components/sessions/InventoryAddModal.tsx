import { useState } from 'react'
import type { InventoryItem, ActiveSession } from '@/types'
import { X, Search, Minus, Plus, Coffee, Check, ShoppingCart } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Modal } from '@/components/shared'

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
    <Modal
      isOpen={true}
      onClose={onClose!}
      maxWidth="max-w-5xl"
      showCloseButton={false}
      className="h-[85vh] flex flex-col p-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('addInventoryItem')}</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium font-mono">{session.customerName}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden bg-stone-50/30 dark:bg-stone-900/30">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:h-full">

          {/* Left Side: Available Items */}
          <div className="lg:col-span-8 flex flex-col lg:h-full border-e border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-10 lg:static">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{t('availableItems')}</h3>
                <span className="px-2.5 py-1 text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg">{filteredItems.length} {t('item')}</span>
              </div>

              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  placeholder={t('searchInventory')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-11 bg-stone-50 dark:bg-stone-800 border-none ring-1 ring-stone-200 dark:ring-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400 transition-all ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 p-4 lg:overflow-y-auto scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Coffee className="h-10 w-10 text-stone-200 dark:text-stone-700 mb-3" />
                  <p className="text-sm font-medium text-stone-400 dark:text-stone-500">
                    {searchQuery ? t('noInventoryFound') : t('noInventoryAvailable')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredItems.map((item) => {
                    const cartItem = cart.find(ci => ci.item.id === item.id)
                    const isInCart = !!cartItem && cartItem.quantity > 0
                    const availableQuantity = item.quantity - (cartItem?.quantity || 0)

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemAdd(item)}
                        disabled={availableQuantity <= 0}
                        className={`group text-start relative flex flex-col p-3 rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-full min-h-[100px] ${isInCart
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 ring-1 ring-amber-500/20'
                          : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600'
                          }`}
                      >
                        <div className="flex items-start justify-between w-full mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isInCart ? 'bg-amber-500 text-white shadow-sm' : 'bg-stone-100 dark:bg-stone-700 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/30'
                            }`}>
                            {isInCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </div>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                            {item.price} <span className="text-[10px] uppercase opacity-70">{t('egp')}</span>
                          </span>
                        </div>

                        <div className="mt-auto w-full">
                          <p className="text-sm font-bold text-stone-700 dark:text-stone-200 line-clamp-1 mb-1">{item.name}</p>
                          <span className="text-xs text-stone-400 font-medium inline-flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${availableQuantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {availableQuantity} {t('inStock')}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Cart */}
          <div className="lg:col-span-4 flex flex-col lg:h-full bg-white dark:bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 shadow-xl lg:shadow-none z-10 w-full">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50 lg:sticky lg:top-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-stone-400" />
                <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{t('selectedItems')}</h3>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full shadow-sm">
                {cart.filter(ci => ci.quantity > 0).length}
              </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 p-4 lg:overflow-y-auto space-y-3 scrollbar-thin min-h-[200px] lg:min-h-0">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8 lg:py-0">
                  <ShoppingCart className="h-12 w-12 text-stone-300 mb-3" />
                  <p className="text-sm font-medium text-stone-500">{t('noItemsSelected')}</p>
                </div>
              ) : (
                cart.map((cartItem) => (
                  <div key={cartItem.item.id} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-700/50 group hover:border-amber-200 dark:hover:border-amber-900/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">{cartItem.item.name}</p>
                        <p className="text-xs text-stone-400 font-medium mt-0.5">{cartItem.item.price} {t('egpCurrency')} / {t('item')}</p>
                      </div>
                      <button
                        onClick={() => handleItemRemove(cartItem.item.id)}
                        className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 p-1">
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                          disabled={cartItem.quantity <= 0}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors disabled:opacity-30"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-stone-700 dark:text-stone-200 font-mono">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          disabled={cartItem.quantity >= cartItem.item.quantity}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                        {cartItem.item.price * cartItem.quantity} <span className="text-xs text-stone-400">{t('egp')}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 lg:sticky lg:bottom-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{t('subtotal')}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{totalAmount}</span>
                    <span className="text-xs font-bold text-amber-600/70">{t('egp')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer (Always Visible, Outside Scrolls) */}
      <div className="flex-shrink-0 border-t border-stone-200 dark:border-stone-800 p-4 lg:p-6 bg-white dark:bg-stone-900 flex gap-3 z-20 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        <button
          onClick={onClose}
          className="flex-1 py-3 text-sm font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-all uppercase tracking-wider"
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || cart.filter(ci => ci.quantity > 0).length === 0}
          className="flex-[2] py-3 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-wider"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="h-5 w-5" />
              {t('addToSession')}
            </>
          )}
        </button>
      </div>
    </Modal>
  )
}