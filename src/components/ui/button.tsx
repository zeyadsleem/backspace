import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500/20 shadow-lg shadow-amber-500/10 active:scale-[0.98] dark:bg-amber-600 dark:hover:bg-amber-500',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/20 shadow-lg shadow-emerald-600/10 active:scale-[0.98]',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20 shadow-lg shadow-red-600/10 active:scale-[0.98] dark:bg-red-700 dark:hover:bg-red-600',
      ghost: 'bg-stone-100 text-stone-600 hover:bg-stone-200 focus:ring-stone-400/20 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700',
      outline: 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 focus:ring-stone-400/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700',
    }
    
    const sizeClasses = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-11 px-6 text-sm',
      lg: 'h-14 px-8 text-base',
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
