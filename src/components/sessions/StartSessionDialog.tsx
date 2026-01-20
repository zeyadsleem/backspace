import { useState } from 'react'
import type { Customer, Resource, Subscription } from '@/types'
import { X, Loader2, User, Monitor, Clock } from 'lucide-react'
import { useTranslation } from '@/stores/hooks'
import { useAppStore } from '@/stores/useAppStore'

interface StartSessionDialogProps {
  isOpen: boolean
  customers: Customer[]
  resources: Resource[]
  subscriptions: Subscription[]
  onSubmit?: (data: { customerId: string; resourceId: string }) => void
  onCancel?: () => void
  onClose?: () => void
  isLoading?: boolean
}

export function StartSessionDialog({ isOpen, customers, resources, subscriptions, onSubmit, onCancel, onClose, isLoading = false }: StartSessionDialogProps) {
  const t = useTranslation()
  const isRTL = useAppStore((state) => state.isRTL)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [selectedResource, setSelectedResource] = useState<string>('')
  const [searchCustomer, setSearchCustomer] = useState('')

  if (!isOpen) return null

  const availableResources = resources.filter(r => r.isAvailable)
  const filteredCustomers = customers.filter((c) => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.humanId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer)
  const selectedResourceData = resources.find((r) => r.id === selectedResource)
  const isSubscribed = selectedCustomer ? subscriptions.some(s => s.customerId === selectedCustomer && s.isActive) : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCustomer && selectedResource) {
      onSubmit?.({ customerId: selectedCustomer, resourceId: selectedResource })
    }
  }

  const handleClose = () => { 
    setSelectedCustomer('')
    setSelectedResource('')
    setSearchCustomer('')
    onClose?.()
    onCancel?.() 
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative z-10 w-full max-w-3xl rounded-xl bg-white dark:bg-stone-900 shadow-2xl flex flex-col max-h-[80vh] ${isRTL ? 'rtl-dialog' : 'ltr-dialog'}`}>
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{t('startNewSession')}</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <User className="h-4 w-4" />
                  <span>{t('selectCustomer')}</span>
                </label>
                
                <input 
                  type="text" 
                  value={searchCustomer} 
                  onChange={(e) => setSearchCustomer(e.target.value)} 
                  placeholder={t('searchByNameOrId')} 
                  className={`h-11 w-full rounded-lg border border-stone-200 px-4 text-[15px] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? 'text-right' : 'text-left'}`} 
                />

                <div className="h-64 overflow-y-auto rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/30 scrollbar-thin">
                  {filteredCustomers.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4 text-center text-stone-400 opacity-70">
                      <p className="text-sm">{t('noCustomersFound')}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {filteredCustomers.map((customer) => {
                        const customerIsSubscribed = subscriptions.some(s => s.customerId === customer.id && s.isActive)
                        const customerHasActiveSession = activeSessions.some(s => s.customerId === customer.id)
                        const isSelected = selectedCustomer === customer.id
                        
                        return (
                          <button 
                            key={customer.id} 
                            type="button" 
                            onClick={() => !customerHasActiveSession && setSelectedCustomer(customer.id)} 
                            disabled={customerHasActiveSession}
                            className={`w-full flex items-center justify-between p-3.5 transition-all ${isSelected ? 'bg-amber-50 dark:bg-amber-900/20' : customerHasActiveSession ? 'opacity-50 cursor-not-allowed bg-stone-50 dark:bg-stone-800/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}
                          >
                            <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
                              <span className={`text-[15px] ${isSelected ? 'font-bold text-amber-700 dark:text-amber-400' : 'font-semibold text-stone-700 dark:text-stone-300'}`}>{customer.name}</span>
                              <span className="text-xs text-stone-400 font-mono uppercase font-normal">{customer.humanId}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {customerIsSubscribed && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                        {t('subscribed')}
                                    </span>
                                )}
                                {customerHasActiveSession && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                                        {isRTL ? 'مشغول حالياً' : 'Busy Now'}
                                    </span>
                                )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Selection */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <Monitor className="h-4 w-4" />
                  <span>{t('selectResource')}</span>
                </label>
                
                <div className="h-11" /> {/* Align with search box */}

                <div className="h-64 overflow-y-auto scrollbar-thin">
                  <div className="grid grid-cols-2 gap-3">
                    {availableResources.map((resource) => {
                      const isSelected = selectedResource === resource.id
                      return (
                        <button 
                          key={resource.id} 
                          type="button" 
                          onClick={() => setSelectedResource(resource.id)} 
                          className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border transition-all h-20 ${isSelected ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-500' : 'border-stone-200 bg-white hover:border-amber-200 dark:border-stone-800 dark:bg-stone-800 dark:hover:border-stone-700'}`}
                        >
                          <span className={`text-sm ${isSelected ? 'font-bold text-amber-700 dark:text-amber-400' : 'font-semibold text-stone-700 dark:text-stone-200'} text-center line-clamp-1`}>{resource.name}</span>
                          <span className="text-[11px] font-bold text-stone-400 uppercase">
                            {resource.ratePerHour} {t('egp')}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {selectedCustomerData && selectedResourceData && (
              <div className="rounded-xl bg-stone-50 border border-stone-100 p-4 dark:bg-stone-800/50 dark:border-stone-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-stone-400 font-bold tracking-tight">{t('customer')}</span>
                    <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{selectedCustomerData.name}</span>
                  </div>
                  <div className="w-px h-8 bg-stone-200 dark:bg-stone-700"></div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-stone-400 font-bold tracking-tight">{t('resource')}</span>
                    <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{selectedResourceData.name}</span>
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-xs uppercase text-stone-400 font-bold tracking-tight block">{t('rate')}</span>
                  <span className={`text-base font-black ${isSubscribed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isSubscribed ? t('freeSubscription') : `${selectedResourceData.ratePerHour} ${t('egpHr')}`}
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 rounded-b-xl flex gap-4">
          <button type="button" onClick={handleClose} disabled={isLoading} className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition-colors dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 uppercase tracking-wide">
            {t('cancel')}
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isLoading || !selectedCustomer || !selectedResource} 
            className="flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm dark:bg-amber-600 dark:hover:bg-amber-500 flex uppercase tracking-wide"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('startSession')}
          </button>
        </div>
      </div>
    </div>
  )
}
