import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from '@/context/AppContext'
import { APP_CONFIG } from '@/lib/config'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AppProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: APP_CONFIG.ui.animationDuration * 20,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              border: '1px solid var(--toast-border)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  )
}