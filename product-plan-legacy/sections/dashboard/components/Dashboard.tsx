import type { DashboardProps } from '../types'
import { MetricCard } from './MetricCard'
import { LowStockBanner } from './LowStockBanner'
import { QuickActions } from './QuickActions'
import { RevenueChart } from './RevenueChart'
import { ActivityFeed } from './ActivityFeed'
import {
  DollarSign,
  Clock,
  Users,
  CreditCard,
  Activity,
} from 'lucide-react'

export function Dashboard({
  metrics,
  lowStockAlerts,
  recentActivity,
  revenueChart,
  onNewCustomer,
  onStartSession,
  onNavigateToSection,
  onViewInventoryItem,
}: DashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' EGP'
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Low Stock Alert Banner */}
      {lowStockAlerts.length > 0 && (
        <LowStockBanner
          alerts={lowStockAlerts}
          onViewItem={onViewInventoryItem}
          onViewAll={() => onNavigateToSection?.('inventory')}
        />
      )}

      {/* Quick Actions */}
      <QuickActions
        onNewCustomer={onNewCustomer}
        onStartSession={onStartSession}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(metrics.todayRevenue)}
          subtitle={`Sessions: ${formatCurrency(metrics.sessionRevenue)} · Inventory: ${formatCurrency(metrics.inventoryRevenue)}`}
          icon={<DollarSign className="h-5 w-5" />}
          variant="primary"
          onClick={() => onNavigateToSection?.('sessions')}
        />
        <MetricCard
          title="Active Sessions"
          value={metrics.activeSessions.toString()}
          subtitle="Currently in progress"
          icon={<Clock className="h-5 w-5" />}
          variant="default"
          onClick={() => onNavigateToSection?.('sessions')}
        />
        <MetricCard
          title="New Customers"
          value={metrics.newCustomersToday.toString()}
          subtitle="Registered today"
          icon={<Users className="h-5 w-5" />}
          variant="default"
          onClick={() => onNavigateToSection?.('customers')}
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions.toString()}
          subtitle="Currently active"
          icon={<CreditCard className="h-5 w-5" />}
          variant="default"
          onClick={() => onNavigateToSection?.('subscriptions')}
        />
        <MetricCard
          title="Utilization"
          value={`${metrics.resourceUtilization}%`}
          subtitle="Resource usage"
          icon={<Activity className="h-5 w-5" />}
          variant={metrics.resourceUtilization > 80 ? 'success' : 'default'}
          onClick={() => onNavigateToSection?.('resources')}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChart} />
        </div>

        {/* Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </div>
  )
}
