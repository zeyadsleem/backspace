import type { SearchInputProps } from '../types'
import { Search, X } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

export function SearchInput({
  value,
  placeholder = 'Search...',
  onChange,
  onSubmit,
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange?.(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange, debounceMs])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange?.('')
  }, [onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSubmit?.(localValue)
      }
    },
    [localValue, onSubmit]
  )

  return (
    <div className="relative">
      {/* Search Icon */}
      <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-stone-300 bg-white ps-9 pe-9 text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-amber-500"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
