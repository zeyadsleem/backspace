import { useState } from 'react'
import type { Customer, Resource, Subscription } from '@/types'
import { X, Loader2, User, Monitor, Clock, CreditCard } from 'lucide-react'
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
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const availableResources = resources.filter(r => r.isAvailable)
  const filteredCustomers = customers.filter((c) => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.humanId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer)
  const selectedResourceData = resources.find((r) => r.id === selectedResource)
  const isSubscribed = selectedCustomer ? subscriptions.some(s => s.customerId === selectedCustomer && s.isActive) : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!selectedCustomer) newErrors.customer = t('pleaseSelectCustomer')
    if (!selectedResource) newErrors.resource = t('pleaseSelectResource')
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onSubmit?.({ customerId: selectedCustomer, resourceId: selectedResource })
  }

  const handleClose = () => { onClose?.(); onCancel?.() }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={handleClose} />
      <div className={`relative z-10 w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-stone-900 ${isRTL ? 'rtl-dialog' : 'ltr-dialog'}`}>
        <div className={`mb-6 flex items-center justify-between ${isRTL ? '' : 'flex-row-reverse'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30"><Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
            <h2 className={`text-lg font-semibold text-stone-900 dark:text-stone-100 ${isRTL ? 'text-end' : 'text-start'}`}>{t('startNewSession')}</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    <User className="h-4 w-4" />
                    <span>{t('selectCustomer')}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    <span>{t('selectCustomer')}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder={t('searchByNameOrId')} dir={isRTL ? 'rtl' : 'ltr'} className={`h-9 w-full rounded-md border border-stone-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${isRTL ? 'rtl-text-input' : 'ltr-text-input'}`} />
              <div className="max-h-40 overflow-y-auto rounded-md border border-stone-200 dark:border-stone-700">
                {filteredCustomers.length === 0 ? (
                  <p className={`p-3 text-center text-sm text-stone-500 dark:text-stone-400 ${isRTL ? 'text-end' : 'text-start'}`}>{t('noCustomersFound')}</p>
                ) : (
                  filteredCustomers.map((customer) => {
                    const customerIsSubscribed = subscriptions.some(s => s.customerId === customer.id && s.isActive)
                    return (
                      <button key={customer.id} type="button" onClick={() => setSelectedCustomer(customer.id)} className={`flex w-full items-center justify-between p-3 transition-colors ${isRTL ? '' : 'flex-row-reverse'} ${isRTL ? 'text-start' : 'text-end'} ${selectedCustomer === customer.id ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800'}`}>
                        <div className={isRTL ? 'text-start' : 'text-end'}><p className="text-sm font-medium text-stone-900 dark:text-stone-100">{customer.name}</p><p className="text-xs text-stone-500 dark:text-stone-400">{customer.humanId}</p></div>
                        {customerIsSubscribed && <span className={`flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ${isRTL ? '' : 'flex-row-reverse'}`}><CreditCard className="h-3 w-3" />{t('subscribed')}</span>}
                      </button>
                    )
                  })
                )}
              </div>
              {errors.customer && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.customer}</p>}
            </div>

            {/* Resource Selection */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    <Monitor className="h-4 w-4" />
                    <span>{t('selectResource')}</span>
                    <span className="text-red-500">*</span>
                  </>
                ) : (
                  <>
                    <Monitor className="h-4 w-4" />
                    <span>{t('selectResource')}</span>
                    <span className="text-red-500">*</span>
                  </>
                )}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableResources.map((resource) => (
                  <button key={resource.id} type="button" onClick={() => setSelectedResource(resource.id)} className={`rounded-lg border-2 p-3 transition-colors ${isRTL ? 'text-end' : 'text-start'} ${selectedResource === resource.id ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20' : 'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600'}`}>
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{resource.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{resource.ratePerHour} {t('egpHr')}</p>
                  </button>
                ))}
              </div>
              {errors.resource && <p className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-end' : 'text-start'}`}>{errors.resource}</p>}
            </div>
          </div>
          {selectedCustomerData && selectedResourceData && (
            <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
              <h4 className={`mb-2 text-sm font-medium text-stone-700 dark:text-stone-300 ${isRTL ? 'text-end' : 'text-start'}`}>{t('sessionSummary')}</h4>
              <div className="space-y-1 text-sm">
                <p className={`text-stone-600 dark:text-stone-400 ${isRTL ? 'text-end' : 'text-start'}`}>{t('customer')}: <span className="font-medium text-stone-900 dark:text-stone-100">{selectedCustomerData.name}</span></p>
                <p className={`text-stone-600 dark:text-stone-400 ${isRTL ? 'text-end' : 'text-start'}`}>{t('resource')}: <span className="font-medium text-stone-900 dark:text-stone-100">{selectedResourceData.name}</span></p>
                <p className={`text-stone-600 dark:text-stone-400 ${isRTL ? 'text-end' : 'text-start'}`}>{t('rate')}: <span className="font-medium text-stone-900 dark:text-stone-100">{isSubscribed ? t('freeSubscription') : `${selectedResourceData.ratePerHour} ${t('egpHr')}`}</span></p>
              </div>
            </div>
          )}
          <div className={`flex gap-3 pt-2 ${isRTL ? '' : 'flex-row-reverse'}`}>
            <button type="button" onClick={handleClose} disabled={isLoading} className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700">{t('cancel')}</button>
            <button type="submit" disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500">{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}{t('startSession')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
