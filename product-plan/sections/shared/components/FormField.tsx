import type { FormFieldProps } from '../types'

export function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-stone-700 dark:text-stone-300"
      >
        {label}
        {required && <span className="text-red-500 ms-1">*</span>}
      </label>

      {/* Input */}
      {children}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p className="text-sm text-stone-500 dark:text-stone-400">{helperText}</p>
      )}
    </div>
  )
}
