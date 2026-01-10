import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from './components/shell'
import { useAppStore } from './stores/useAppStore'
import { RTLProvider } from './components/ui/RTLProvider'
import { LayoutDashboard, Users, Monitor, Clock, CreditCard, Package, FileText, BarChart3, Settings } from 'lucide-react'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isRTL, t } = useAppStore()

  const mainNavigationItems = [
    { label: t('dashboard'), href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: t('customers'), href: '/customers', icon: <Users className="h-5 w-5" /> },
    { label: t('resources'), href: '/resources', icon: <Monitor className="h-5 w-5" /> },
    { label: t('sessions'), href: '/sessions', icon: <Clock className="h-5 w-5" /> },
    { label: t('subscriptions'), href: '/subscriptions', icon: <CreditCard className="h-5 w-5" /> },
    { label: t('inventory'), href: '/inventory', icon: <Package className="h-5 w-5" /> },
    { label: t('invoices'), href: '/invoices', icon: <FileText className="h-5 w-5" /> },
    // { label: t('reports'), href: '/reports', icon: <BarChart3 className="h-5 w-5" /> }, // Temporarily hidden
  ].map(item => ({
    ...item,
    isActive: location.pathname === item.href || (item.href === '/dashboard' && location.pathname === '/'),
  }))

  const settingsItem = {
    label: t('settings'),
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    isActive: location.pathname === '/settings',
  }

  return (
    <RTLProvider>
      <AppShell
        navigationItems={mainNavigationItems}
        settingsItem={settingsItem}
        onNavigate={navigate}
        isRTL={isRTL}
      >
        <Outlet />
      </AppShell>
    </RTLProvider>
  )
}

export default App
