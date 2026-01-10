import type { ResourceFormProps, ResourceType } from '../types'
import { useState } from 'react'
import { Loader2, Monitor, DollarSign } from 'lucide-react'

const resourceTypeLabels: Record<ResourceType, { en: string; ar: string; icon: string }> = {
  seat: { en: 'Seat', ar: 'مقعد', icon: '💺' },
  room: { en: 'Room', ar: 'غرفة', icon: '🚪' },
  desk: { en: 'Desk', ar: 'مكتب', icon: '🖥️' },
}

export function ResourceForm({
  initialData,
  resourceTypes,
  onSubmit,
  onCancel,
  isLoading = false,
}: ResourceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    resourceType: initialData?.resourceType ?? 'seat',
    ratePerHour: initialData?.ratePerHour ?? 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Resource name is required'
    }
    if (formData.ratePerHour <= 0) {
      newErrors.ratePerHour = 'Rate must be greater than 0'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        name: formData.name.trim(),
        resourceType: formData.resourceType as ResourceType,
        ratePerHour: formData.ratePerHour,
      })
    }
  }

  const isEditing = !!initialData

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <Monitor className="h-4 w-4" />
          Resource Name
          <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Seat A1, Meeting Room 1"
          className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
            errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
          }`}
        />
        {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
      </div>

      {/* Resource Type Field */}
      <div className="space-y-1.5">
        <label htmlFor="resourceType" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Resource Type</label>
        <div className="grid grid-cols-3 gap-3">
          {resourceTypes.map((type) => {
            const typeInfo = resourceTypeLabels[type]
            const isSelected = formData.resourceType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, resourceType: type })}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  isSelected ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20' : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600'
                }`}
              >
                <span className="text-2xl">{typeInfo.icon}</span>
                <span className={`text-sm font-medium ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-stone-700 dark:text-stone-300'}`}>{typeInfo.en}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rate Field */}
      <div className="space-y-1.5">
        <label htmlFor="ratePerHour" className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <DollarSign className="h-4 w-4" />
          Hourly Rate (EGP)
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="ratePerHour"
            type="number"
            min="0"
            step="0.5"
            value={formData.ratePerHour}
            onChange={(e) => setFormData({ ...formData, ratePerHour: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className={`h-10 w-full rounded-md border pe-16 ps-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100 ${
              errors.ratePerHour ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600'
            }`}
          />
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 dark:text-stone-400">EGP/hr</span>
        </div>
        {errors.ratePerHour && <p className="text-sm text-red-600 dark:text-red-400">{errors.ratePerHour}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} disabled={isLoading} className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700">Cancel</button>
        <button type="submit" disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Resource' : 'Create Resource'}
        </button>
      </div>
    </form>
  )
}
