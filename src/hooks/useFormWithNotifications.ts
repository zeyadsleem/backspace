import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form'
import { notifications } from '@/lib/notifications'

interface UseFormWithNotificationsProps<T extends FieldValues> extends UseFormProps<T> {
  onSubmitSuccess?: (data: T) => void | Promise<void>
  onSubmitError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

export function useFormWithNotifications<T extends FieldValues>({
  onSubmitSuccess,
  onSubmitError,
  successMessage,
  errorMessage,
  ...formProps
}: UseFormWithNotificationsProps<T>) {
  const form = useForm<T>({
    mode: 'onChange',
    ...formProps,
  })

  const handleSubmit = form.handleSubmit(async (data: T) => {
    try {
      const loadingToast = notifications.loading('Processing...')

      await onSubmitSuccess?.(data)

      notifications.dismiss(loadingToast)

      if (successMessage) {
        notifications.success(successMessage)
      }
    } catch (error) {
      notifications.dismiss()

      const errorMsg = error instanceof Error ? error.message : 'An error occurred'

      if (onSubmitError) {
        onSubmitError(error as Error)
      } else {
        notifications.error(errorMessage || errorMsg)
      }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (errors: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      notifications.validationError(firstError.message)
    }
  }

  return {
    ...form,
    handleSubmit: (onValid?: (data: T) => void) =>
      onValid ? form.handleSubmit(onValid, handleError) : handleSubmit,
    submitWithNotifications: handleSubmit,
  }
}