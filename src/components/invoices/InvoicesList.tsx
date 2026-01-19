import { useState } from 'react'
import type { Invoice, InvoiceStatus } from '@/types'
import { InvoiceRow } from './InvoiceRow'
import { Search, FileText } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface InvoicesListProps {
  invoices: Invoice[]
  onView?: (id: string) => void
  onRecordPayment?: (id: string) => void
}

export function InvoicesList({ invoices, onView, onRecordPayment }: InvoicesListProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter === 'paid') {
      matchesStatus = invoice.status === 'paid'
    } else if (statusFilter === 'unpaid') {
      matchesStatus = invoice.status !== 'paid'
    }
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const statusCounts = { 
    all: invoices.length, 
    paid: invoices.filter((i) => i.status === 'paid').length, 
    unpaid: invoices.filter((i) => i.status !== 'paid').length 
  }
  const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.total, 0)
  const paidAmount = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0)

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className={isRTL ? 'text-end' : 'text-start'}>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('invoices')}</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('totalAmount')}: {totalAmount.toLocaleString()} {t('egpCurrency')} · {t('collectedAmount')}: {paidAmount.toLocaleString()} {t('egpCurrency')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 start-3" />
          <input type="text" placeholder={t('searchInvoices')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ps-10 pe-4 text-start" />
        </div>
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          {(['all', 'paid', 'unpaid'] as const).map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === status ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-600 dark:text-stone-400'}`}>{status === 'all' ? t('all') : status === 'paid' ? t('paid') : t('unpaid')} ({statusCounts[status]})</button>
          ))}
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4"><FileText className="h-8 w-8 text-stone-400" /></div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{searchQuery || statusFilter !== 'all' ? t('noInvoicesFound') : t('noInvoicesYet')}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{searchQuery || statusFilter !== 'all' ? t('tryAdjustingFilters') : t('createFirstInvoice')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Table Header - Fixed */}
          <div className="flex-shrink-0 hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 text-start">
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('invoiceNumber')}</div>
            <div className="col-span-3 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('customer')}</div>
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase text-center">{t('amount')}</div>
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('status')}</div>
            <div className="col-span-1 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('dueDate')}</div>
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase text-end">{t('actions')}</div>
          </div>
          
          {/* Table Body - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredInvoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} onView={() => onView?.(invoice.id)} onRecordPayment={() => onRecordPayment?.(invoice.id)} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}