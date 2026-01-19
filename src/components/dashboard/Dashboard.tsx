import { MetricCard } from './MetricCard'
import { LowStockBanner } from './LowStockBanner'
import { QuickActions } from './QuickActions'
import { ActivityFeed } from './ActivityFeed'
import { PendingInvoices } from './PendingInvoices'
import { RevenueChart } from './RevenueChart'
import { DollarSign, Clock, Users, CreditCard, Activity } from 'lucide-react'
import { useDashboardData, useTranslation } from '@/stores/hooks'
import { useAppStore } from '@/stores/useAppStore'

interface DashboardProps {
  onNewCustomer?: () => void
  onStartSession?: () => void
  onNavigateToSection?: (section: string) => void
  onViewInventoryItem?: (id: string) => void
  onViewInvoice?: (id: string) => void
}

export function Dashboard({ onNewCustomer, onStartSession, onNavigateToSection, onViewInventoryItem, onViewInvoice }: DashboardProps) {
  const t = useTranslation()
  const isRTL = useAppStore((state) => state.isRTL)
  const invoices = useAppStore((state) => state.invoices)
  const { dashboardMetrics: metrics, lowStockAlerts, recentActivity, revenueChart } = useDashboardData()
  
  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat('en-EG', { 
      style: 'decimal', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount)
    return `${formattedNumber} ${t('egp')}`
  }

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-2rem)] overflow-y-auto lg:overflow-hidden">
      {/* Top Section - Metric Cards (Fixed) */}
      <div className="flex-shrink-0 p-6 pb-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className={isRTL ? 'text-end' : 'text-start'}>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('dashboard')}</h1>
          </div>
          <QuickActions onNewCustomer={onNewCustomer} onStartSession={onStartSession} />
        </div>
        
        {lowStockAlerts.length > 0 && (
          <LowStockBanner alerts={lowStockAlerts} onViewItem={onViewInventoryItem} onViewAll={() => onNavigateToSection?.('inventory')} />
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard title={t('todaysRevenue')} value={formatCurrency(metrics.todayRevenue)} subtitle={`${t('sessionsLabel')}: ${formatCurrency(metrics.sessionRevenue)} · ${t('inventoryLabel')}: ${formatCurrency(metrics.inventoryRevenue)}`} icon={<DollarSign className="h-5 w-5" />} variant="primary" onClick={() => onNavigateToSection?.('sessions')} />
          <MetricCard title={t('activeSessions')} value={metrics.activeSessions.toString()} subtitle={t('currentlyInProgress')} icon={<Clock className="h-5 w-5" />} variant="default" onClick={() => onNavigateToSection?.('sessions')} />
          <MetricCard title={t('newCustomers')} value={metrics.newCustomersToday.toString()} subtitle={t('registeredToday')} icon={<Users className="h-5 w-5" />} variant="default" onClick={() => onNavigateToSection?.('customers')} />
          <MetricCard title={t('activeSubscriptions')} value={metrics.activeSubscriptions.toString()} subtitle={t('currentlyActive')} icon={<CreditCard className="h-5 w-5" />} variant="default" onClick={() => onNavigateToSection?.('subscriptions')} />
          <MetricCard title={t('utilization')} value={`${metrics.resourceUtilization}%`} subtitle={t('resourceUsage')} icon={<Activity className="h-5 w-5" />} variant={metrics.resourceUtilization > 80 ? 'success' : 'default'} onClick={() => onNavigateToSection?.('resources')} />
        </div>
      </div>
      
      {/* Bottom Section - Split Activity and Unpaid Invoices */}
      <div className="flex-1 min-h-0 px-6 pb-6 lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-auto lg:h-full">
          {/* Recent Activity - Taking full width since Unpaid is hidden */}
          <div className="h-[320px] lg:h-full">
            <ActivityFeed activities={recentActivity} />
          </div>
          
          {/* Unpaid Invoices - Hidden for now
          <div className="h-[320px] lg:h-full">
            <PendingInvoices invoices={invoices} onViewInvoice={onViewInvoice} />
          </div>
          */}
        </div>
      </div>
    </div>
  )
}
