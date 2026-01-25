import type { SessionStartFormProps, SessionStartData } from '../types'
import { useState } from 'react'
import { X, Loader2, User, Monitor, Clock, CreditCard } from 'lucide-react'

interface StartSessionDialogProps extends SessionStartFormProps {
  isOpen: boolean
  onClose?: () => void
}

export function StartSessionDialog({ isOpen, customers, resources, onSubmit, onCancel, onClose, isLoading = false }: StartSessionDialogProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [selectedResource, setSelectedResource] = useState<string>('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const filteredCustomers = customers.filter((c) => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.humanId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer)
  const selectedResourceData = resources.find((r) => r.id === selectedResource)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!selectedCustomer) newErrors.customer = 'Please select a customer'
    if (!selectedResource) newErrors.resource = 'Please select a resource'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onSubmit?.({ customerId: selectedCustomer, resourceId: selectedResource })
  }

  const handleClose = () => { onClose?.(); onCancel?.() }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={handleClose} onKeyDown={(e) => e.key === 'Escape' && handleClose()} />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-stone-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30"><Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Start New Session</h2>
          </div>
          <button type="button" onClick={handleClose} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"><User className="h-4 w-4" />Select Customer<span className="text-red-500">*</span></label>
            <input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder="Search by name or ID..." className="h-9 w-full rounded-md border border-stone-300 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100" />
            <div className="max-h-40 overflow-y-auto rounded-md border border-stone-200 dark:border-stone-700">
              {filteredCustomers.length === 0 ? (
                <p className="p-3 text-center text-sm text-stone-500 dark:text-stone-400">No customers found</p>
              ) : (
                filteredCustomers.map((customer) => (
                  <button key={customer.id} type="button" onClick={() => setSelectedCustomer(customer.id)} className={`flex w-full items-center justify-between p-3 text-start transition-colors ${selectedCustomer === customer.id ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800'}`}>
                    <div><p className="text-sm font-medium text-stone-900 dark:text-stone-100">{customer.name}</p><p className="text-xs text-stone-500 dark:text-stone-400">{customer.humanId}</p></div>
                    {customer.isSubscribed && <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CreditCard className="h-3 w-3" />Subscribed</span>}
                  </button>
                ))
              )}
            </div>
            {errors.customer && <p className="text-sm text-red-600 dark:text-red-400">{errors.customer}</p>}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"><Monitor className="h-4 w-4" />Select Resource<span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {resources.map((resource) => (
                <button key={resource.id} type="button" onClick={() => setSelectedResource(resource.id)} className={`rounded-lg border-2 p-3 text-start transition-colors ${selectedResource === resource.id ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20' : 'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600'}`}>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{resource.name}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{resource.ratePerHour} EGP/hr</p>
                </button>
              ))}
            </div>
            {errors.resource && <p className="text-sm text-red-600 dark:text-red-400">{errors.resource}</p>}
          </div>
          {selectedCustomerData && selectedResourceData && (
            <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
              <h4 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">Session Summary</h4>
              <div className="space-y-1 text-sm">
                <p className="text-stone-600 dark:text-stone-400">Customer: <span className="font-medium text-stone-900 dark:text-stone-100">{selectedCustomerData.name}</span></p>
                <p className="text-stone-600 dark:text-stone-400">Resource: <span className="font-medium text-stone-900 dark:text-stone-100">{selectedResourceData.name}</span></p>
                <p className="text-stone-600 dark:text-stone-400">Rate: <span className="font-medium text-stone-900 dark:text-stone-100">{selectedCustomerData.isSubscribed ? 'Free (Subscription)' : `${selectedResourceData.ratePerHour} EGP/hr`}</span></p>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={isLoading} className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500">{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}Start Session</button>
          </div>
        </form>
      </div>
    </div>
  )
}
