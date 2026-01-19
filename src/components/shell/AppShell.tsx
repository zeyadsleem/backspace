import { useState } from 'react'
import { MainNav } from './MainNav'
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  isActive?: boolean
}

interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  settingsItem: NavigationItem
  onNavigate?: (href: string) => void
  isRTL?: boolean
}

export function AppShell({
  children,
  navigationItems,
  settingsItem,
  onNavigate,
  isRTL = false,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`h-screen overflow-hidden bg-stone-50 dark:bg-stone-950 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center px-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className={`font-bold text-lg ${isRTL ? 'mr-3' : 'ml-3'}`}>Backspace</span>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 z-50 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800
          transition-all duration-300 flex flex-col
          ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
          ${mobileMenuOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Logo */}
        <div className={`h-14 flex items-center border-b border-stone-200 dark:border-stone-800 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'}`}>
          {sidebarCollapsed ? (
            <span className="font-bold text-xl text-amber-600">B</span>
          ) : (
            <span className="font-bold text-xl">Backspace</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <MainNav
            items={navigationItems}
            collapsed={sidebarCollapsed}
            onNavigate={(href) => {
              onNavigate?.(href)
              setMobileMenuOpen(false)
            }}
          />
        </nav>

        {/* Settings Section */}
        <div className="border-t border-stone-200 dark:border-stone-800 p-2">
          <MainNav
            items={[settingsItem]}
            collapsed={sidebarCollapsed}
            onNavigate={(href) => {
              onNavigate?.(href)
              setMobileMenuOpen(false)
            }}
          />
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`
            hidden lg:flex absolute top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center
            bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full
            hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors
            ${isRTL ? '-left-3' : '-right-3'}
          `}
        >
          {sidebarCollapsed ? (
            isRTL ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
          ) : (
            isRTL ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={`
          h-screen flex flex-col pt-14 lg:pt-0 transition-all duration-300
          ${isRTL ? (sidebarCollapsed ? 'lg:mr-16' : 'lg:mr-60') : (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60')}
        `}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
