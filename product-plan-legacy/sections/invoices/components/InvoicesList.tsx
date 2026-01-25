import { useState } from 'react'
import type { InvoicesListProps, InvoiceStatus } from '../types'
import { InvoiceRow } from './InvoiceRow'
import { Plus, Download, Search, FileText } from 'lucide-react'

export function InvoicesList({
  invoices,
  onView,
  onEdit,
  onRecordPayment,
  onPrint,
  onCreate,
  onExport,
}: InvoicesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    unpaid: invoices.filter((i) => i.status === 'unpaid').length,
    pending: invoices.filter((i) => i.status === 'pending').length,
  }

  const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.total, 0)
  const paidAmount = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Invoices</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Total: {totalAmount.toLocaleString()} EGP · Collected: {paidAmount.toLocaleString()} EGP
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
                     text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-900
                     border border-stone-200 dark:border-stone-700 rounded-lg
                     hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                     text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-stone-900
                     border border-stone-200 dark:border-stone-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          {(['all', 'paid', 'unpaid', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                statusFilter === status
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4">
            <FileText className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">
            {searchQuery || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first invoice to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                       text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Invoice #</div>
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Customer</div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase text-right">Amount</div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Status</div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Due</div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredInvoices.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onView={() => onView?.(invoice.id)}
                onRecordPayment={() => onRecordPayment?.(invoice.id)}
                onPrint={() => onPrint?.(invoice.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
