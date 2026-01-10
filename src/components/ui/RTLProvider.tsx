import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

interface RTLProviderProps {
  children: React.ReactNode
}

export function RTLProvider({ children }: RTLProviderProps) {
  const { isRTL, language } = useAppStore()

  useEffect(() => {
    // Apply RTL direction to document
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    
    // Add RTL class to body for additional styling
    if (isRTL) {
      document.body.classList.add('rtl')
    } else {
      document.body.classList.remove('rtl')
    }
  }, [isRTL, language])

  return <>{children}</>
}