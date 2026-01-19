import { useState } from 'react'
import type { Customer, CustomerType, Invoice, OperationRecord } from '@/types'
import { ArrowLeft, Edit, Trash2, Phone, Mail, Calendar, CreditCard, Clock, Receipt, FileText, History } from 'lucide-react'
import { useTranslation, useLanguage, useAppStore } from '@/stores/hooks' // useAppStore added
import { InvoiceRow } from '../invoices/InvoiceRow'

interface CustomerProfileProps {
  customer: Customer
  invoices?: Invoice[]
  history?: OperationRecord[]
  onEdit?: () => void
  onDelete?: () => void
  onBack?: () => void
  onViewInvoice?: (id: string) => void
}

export function CustomerProfile({ customer, invoices = [], history = [], onEdit, onDelete, onBack, onViewInvoice }: CustomerProfileProps) {
  const t = useTranslation()
  const language = useLanguage()
  const isRTL = useAppStore((state) => state.isRTL)
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'history'>('overview')
  
  const customerTypeLabels: Record<CustomerType, { label: string; color: string }> = {
    visitor: { label: t('visitorType'), color: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300' },
    weekly: { label: t('weeklyMember'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    'half-monthly': { label: t('halfMonthlyMember'), color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    monthly: { label: t('monthlyMember'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  }
  
  const typeInfo = customerTypeLabels[customer.customerType]
  const initials = customer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formatCurrency = (amount: number) => `${amount.toLocaleString('en-EG')} ${t('egp')}`

  // Calculate real-time statistics from props
  const realTotalSpent = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const realTotalSessions = history.filter(op => op.type === 'session_end').length
  const avgPerSession = realTotalSessions > 0 ? Math.round(realTotalSpent / realTotalSessions) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t('backToCustomers')}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onEdit} className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"><Edit className="h-4 w-4" />{t('edit')}</button>
          <button type="button" onClick={onDelete} className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"><Trash2 className="h-4 w-4" />{t('delete')}</button>
        </div>
      </div>

      <div className="flex border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
        >
          {t('details')}
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'invoices' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
        >
          {t('invoices')}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
        >
          {t('history')}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0 shadow-sm">{initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate">{customer.name}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeInfo.color}`}>{typeInfo.label}</span>
                </div>
                <p className="mt-0.5 text-xs font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest">{customer.humanId}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{customer.phone}</span></div>
                  {customer.email && <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400"><Mail className="h-3.5 w-3.5" /><span>{customer.email}</span></div>}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400"><Calendar className="h-3.5 w-3.5" /><span>{t('memberSince')} {formatDate(customer.createdAt)}</span></div>
                </div>
              </div>
              <div className="text-end hidden sm:block">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('balance')}</p>
                <p className={`text-lg font-black ${customer.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(customer.balance)}</p>
              </div>
            </div>
            {customer.notes && <div className="mt-4 rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800"><p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{customer.notes}</p></div>}
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0"><Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                <div><p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('totalSessions')}</p><p className="text-lg font-black text-stone-900 dark:text-stone-100">{realTotalSessions}</p></div>
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0"><Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
                <div><p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('totalSpent')}</p><p className="text-lg font-black text-stone-900 dark:text-stone-100">{formatCurrency(realTotalSpent)}</p></div>
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0"><CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
                <div><p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('avgPerSession')}</p><p className="text-lg font-black text-stone-900 dark:text-stone-100">{formatCurrency(avgPerSession)}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {invoices.length > 0 ? (
             <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
               <div className={`hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 ${isRTL ? 'text-end' : 'text-start'}`}>
                 <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">{t('invoiceNumber')}</div>
                 <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">{t('customer')}</div>
                 <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase text-end">{t('amount')}</div>
                 <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">{t('status')}</div>
                 <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">{t('dueDate')}</div>
                 <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase text-end">{t('actions')}</div>
               </div>
               <div className="divide-y divide-stone-100 dark:divide-stone-800">
                 {invoices.map(invoice => <InvoiceRow key={invoice.id} invoice={invoice} onView={() => onViewInvoice?.(invoice.id)} />)}
               </div>
             </div>
          ) : (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400">
              <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>{t('noInvoicesFound')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length > 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {history.map(op => (
                  <div key={op.id} className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100">{op.description}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(op.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400">
              <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>{t('noOperations')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
