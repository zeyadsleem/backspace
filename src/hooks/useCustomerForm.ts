import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormData } from '@/lib/validations'
import type { CustomerType } from '@/types'

interface UseCustomerFormProps {
  initialData?: { 
    name: string
    phone: string
    email: string | null
    customerType: CustomerType
    notes: string 
  }
  onSubmit?: (data: {
    name: string
    phone: string
    email?: string
    customerType: CustomerType
    notes?: string
  }) => void
}

export function useCustomerForm({ initialData, onSubmit }: UseCustomerFormProps = {}) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      customerType: initialData?.customerType ?? 'visitor',
      notes: initialData?.notes ?? '',
    },
    mode: 'onChange',
  })

  const handleSubmit = (data: CustomerFormData) => {
    onSubmit?.({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      customerType: data.customerType,
      notes: data.notes?.trim() || undefined,
    })
  }

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isEditing: !!initialData,
  }
}