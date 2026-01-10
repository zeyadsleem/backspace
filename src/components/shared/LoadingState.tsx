import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  variant?: 'spinner' | 'dots' | 'skeleton'
  text?: string
  fullPage?: boolean
  skeletonCount?: number
}

export function LoadingState({ variant = 'spinner', text, fullPage = false, skeletonCount = 3 }: LoadingStateProps) {
  const content = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            {text && <p className="text-sm text-stone-600 dark:text-stone-400">{text}</p>}
          </div>
        )
      case 'dots':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.3s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.15s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-amber-500" />
            </div>
            {text && <p className="text-sm text-stone-600 dark:text-stone-400">{text}</p>}
          </div>
        )
      case 'skeleton':
        return (
          <div className="w-full space-y-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-stone-200 dark:bg-stone-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-stone-200 dark:bg-stone-700" />
                    <div className="h-3 w-1/2 rounded bg-stone-200 dark:bg-stone-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  if (fullPage) {
    return <div className="flex min-h-[400px] items-center justify-center">{content()}</div>
  }

  return <div className="py-8">{content()}</div>
}
