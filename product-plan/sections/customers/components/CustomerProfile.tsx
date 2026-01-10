import type { CustomerProfileProps, CustomerType } from '../types'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Clock,
  Receipt,
} from 'lucide-react'

const customerTypeLabels: Record<CustomerType, { en: string; ar: string; color: string }> = {
  visitor: { en: 'Visitor', ar: 'زائر', color: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300' },
  weekly: { en: 'Weekly', ar: 'أسبوعي', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  'half-monthly': { en: 'Half-Monthly', ar: 'نصف شهري', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  monthly: { en: 'Monthly', ar: 'شهري', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

export function CustomerProfile({
  customer,
  onEdit,
  onDelete,
  onBack,
}: CustomerProfileProps) {
  const typeInfo = customerTypeLabels[customer.customerType]
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} EGP`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          Back to Customers
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {customer.name}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${typeInfo.color}`}
              >
                {typeInfo.en}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {customer.humanId}
            </p>

            {/* Contact Info */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="text-end">
            <p className="text-sm text-stone-500 dark:text-stone-400">Balance</p>
            <p
              className={`text-2xl font-bold ${
                customer.balance >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(customer.balance)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {customer.notes && (
          <div className="mt-6 rounded-md bg-stone-50 p-4 dark:bg-stone-800">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {customer.notes}
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Total Sessions
              </p>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {customer.totalSessions}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Total Spent
              </p>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {formatCurrency(customer.totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Avg. per Session
              </p>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {customer.totalSessions > 0
                  ? formatCurrency(Math.round(customer.totalSpent / customer.totalSessions))
                  : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
        <div className="border-b border-stone-200 dark:border-stone-700">
          <nav className="flex gap-4 px-4">
            {['Sessions', 'Subscriptions', 'Invoices', 'Consumptions'].map(
              (tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`border-b-2 px-2 py-3 text-sm font-medium ${
                    index === 0
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>
        <div className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">
          Session history will be displayed here
        </div>
      </div>
    </div>
  )
}
