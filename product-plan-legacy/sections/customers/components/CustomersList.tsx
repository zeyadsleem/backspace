import { useState } from 'react'
import type { CustomersListProps, Customer, CustomerType } from '../types'
import { CustomerRow } from './CustomerRow'
import { Search, Filter, Plus, Download, Users } from 'lucide-react'

export function CustomersList({
  customers,
  customerTypes,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onExport,
}: CustomersListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.humanId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || customer.customerType === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const typeLabels: Record<CustomerType, string> = {
    visitor: 'Visitor',
    weekly: 'Weekly',
    'half-monthly': 'Half-Monthly',
    monthly: 'Monthly',
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Customers</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {customers.length} total customers
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
            New Customer
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
            placeholder="Search by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-stone-900
                     border border-stone-200 dark:border-stone-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500
                     placeholder:text-stone-400"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CustomerType | 'all')}
            className="pl-10 pr-8 py-2 text-sm bg-white dark:bg-stone-900
                     border border-stone-200 dark:border-stone-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500
                     appearance-none cursor-pointer"
          >
            <option value="all">All Types</option>
            {customerTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
          className="px-3 py-2 text-sm bg-white dark:bg-stone-900
                   border border-stone-200 dark:border-stone-700 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500
                   appearance-none cursor-pointer"
        >
          <option value="date">Newest First</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4">
            <Users className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">
            {searchQuery || typeFilter !== 'all' ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first customer'}
          </p>
          {!searchQuery && typeFilter === 'all' && (
            <button
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                       text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">ID</div>
            <div className="col-span-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Customer</div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Phone</div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Type</div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase text-right">Balance</div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredCustomers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onView={() => onView?.(customer.id)}
                onEdit={() => onEdit?.(customer.id)}
                onDelete={() => onDelete?.(customer.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
