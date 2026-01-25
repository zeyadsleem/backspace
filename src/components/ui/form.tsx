import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// FormLabel Component
export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  icon?: React.ReactNode
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, icon, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest',
          className
        )}
        {...props}
      >
        {icon}
        <span>{children}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
    )
  }
)

FormLabel.displayName = 'FormLabel'

// FormInput Component
export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  isRTL?: boolean
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, isRTL, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border px-3 text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500',
          'dark:bg-stone-800 dark:text-stone-100',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-stone-200 dark:border-stone-700',
          isRTL && 'text-right',
          className
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
        {...props}
      />
    )
  }
)

FormInput.displayName = 'FormInput'

// FormTextarea Component
export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  isRTL?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, isRTL, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl border px-3 py-2 text-sm font-medium transition-all resize-none',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500',
          'dark:bg-stone-800 dark:text-stone-100',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-stone-200 dark:border-stone-700',
          isRTL && 'text-right',
          className
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
        {...props}
      />
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

// FormSelect Component
export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border px-3 text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500',
          'bg-white dark:bg-stone-800 dark:text-stone-100',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-stone-200 dark:border-stone-700',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)

FormSelect.displayName = 'FormSelect'

// FormError Component
export interface FormErrorProps {
  children?: React.ReactNode
}

export const FormError = ({ children }: FormErrorProps) => {
  if (!children) return null

  return (
    <p className="text-xs text-red-600 dark:text-red-400 font-bold">
      {children}
    </p>
  )
}

FormError.displayName = 'FormError'

// FormField Container
export interface FormFieldProps {
  children: React.ReactNode
  className?: string
}

export const FormField = ({ children, className }: FormFieldProps) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {children}
    </div>
  )
}

FormField.displayName = 'FormField'
