import { useAppStore } from '@/stores/useAppStore'
import { clsx } from 'clsx'

interface RTLIconProps {
  children: React.ReactNode
  className?: string
  flip?: boolean
}

export function RTLIcon({ children, className, flip = true }: RTLIconProps) {
  const isRTL = useAppStore((state) => state.isRTL)
  
  return (
    <span className={clsx(className, isRTL && flip && 'rtl-flip')}>
      {children}
    </span>
  )
}