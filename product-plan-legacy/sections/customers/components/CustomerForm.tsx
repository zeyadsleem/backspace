import type { CustomerFormProps, CustomerType } from '../types'
import { useState } from 'react'
import { Loader2, User, Phone, Mail, FileText } from 'lucide-react'

const customerTypeLabels: Record<CustomerType, { en: string; ar: string }> = {
  visitor: { en: 'Visitor', ar: 'زائر' },
  weekly: { en: 'Weekly Member', ar: 'عضو أسبوعي' },
  'half-monthly': { en: 'Half-Monthly Member', ar: 'عضو نصف شهري' },
  monthly: { en: 'Monthly Member', ar: 'عضو شهري' },
}

export function CustomerForm({
  initialData,
  customerTypes,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    customerType: initialData?.customerType ?? 'visitor',
    notes: initialData?.notes ?? '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePhone = (phone: string): boolean => {
    // Egyptian phone validation: 01[0125]XXXXXXXX
    const normalized = phone.replace(/[\s\-\+]/g, '')
    const pattern = /^(0|20)?1[0125]\d{8}$/
    return pattern.test(normalized)
  }

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Optional
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid Egyptian phone number'
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        customerType: formData.customerType as CustomerType,
        notes: formData.notes.trim() || undefined,
      })
    }
  }

  const isEditing = !!initialData

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <User className="h-4 w-4" />
          Customer Name
          <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter customer name"
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.name
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Phone Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="phone"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <Phone className="h-4 w-4" />
          Phone Number
          <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="01012345678"
          dir="ltr"
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.phone
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.phone ? (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Egyptian format: 01XXXXXXXXX
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <Mail className="h-4 w-4" />
          Email
          <span className="text-stone-400">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="customer@example.com"
          dir="ltr"
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.email
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Customer Type Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="customerType"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Customer Type
        </label>
        <select
          id="customerType"
          value={formData.customerType}
          onChange={(e) =>
            setFormData({ ...formData, customerType: e.target.value as CustomerType })
          }
          className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        >
          {customerTypes.map((type) => (
            <option key={type} value={type}>
              {customerTypeLabels[type].en}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="notes"
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          <FileText className="h-4 w-4" />
          Notes
          <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the customer..."
          rows={3}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  )
}
