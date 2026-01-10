import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  required?: boolean
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, icon, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label 
          htmlFor={props.id} 
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          className={cn(
            "h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
              : "border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  required?: boolean
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, helperText, icon, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label 
          htmlFor={props.id} 
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
              : "border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

TextareaField.displayName = 'TextareaField'

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
  required?: boolean
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, helperText, options, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          className={cn(
            "h-10 w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-1 dark:bg-stone-800 dark:text-stone-100",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
              : "border-stone-300 focus:border-amber-500 focus:ring-amber-500 dark:border-stone-600",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

SelectField.displayName = 'SelectField'