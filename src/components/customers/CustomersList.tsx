import { useState } from 'react'
import type { Customer, CustomerType } from '@/types'
import { CustomerRow } from './CustomerRow'
import { Search, Filter, Plus, Users } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface CustomersListProps {
  customers: Customer[]
  customerTypes: CustomerType[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
}

export function CustomersList({ customers, customerTypes, onView, onEdit, onDelete, onCreate }: CustomersListProps) {
  const t = useAppStore((state) => state.t)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || customer.phone.includes(searchQuery) || customer.humanId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || customer.customerType === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const typeLabels: Record<CustomerType, string> = { visitor: t('visitor'), weekly: t('weekly'), 'half-monthly': t('halfMonthly'), monthly: t('monthly') }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('customers')}</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('totalCustomers', { count: customers.length })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCreate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"><Plus className="h-4 w-4" />{t('newCustomer')}</button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 start-3" />
          <input type="text" placeholder={t('searchCustomers')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-400 ps-10 pe-4 text-start" />
        </div>
        <div className="relative">
          <Filter className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 start-3" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CustomerType | 'all')} className="py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer ps-10 pe-8 text-start">
            <option value="all">{t('allTypes')}</option>
            {customerTypes.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}
          </select>
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'date')} className="px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer text-start">
          <option value="date">{t('newestFirst')}</option>
          <option value="name">{t('nameAZ')}</option>
        </select>
      </div>

      {/* Content */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4"><Users className="h-8 w-8 text-stone-400" /></div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{t('noCustomersFound')}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm">{t('tryAdjustingFilters')}</p>
          {!searchQuery && typeFilter === 'all' && <button onClick={onCreate} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"><Plus className="h-4 w-4" />{t('newCustomer')}</button>}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Table Header - Fixed */}
          <div className="flex-shrink-0 hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 text-start">
            <div className="col-span-1 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('id')}</div>
            <div className="col-span-3 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('customer')}</div>
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('phone')}</div>
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">{t('type')}</div>
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase text-center">{t('balance')}</div>
            <div className="col-span-2 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase text-end">{t('actions')}</div>
          </div>
          
          {/* Table Body - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredCustomers.map((customer) => <CustomerRow key={customer.id} customer={customer} onView={() => onView?.(customer.id)} onEdit={() => onEdit?.(customer.id)} onDelete={() => onDelete?.(customer.id)} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
