import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { ReportsPage } from '@/components/reports'

export function ReportsPageWrapper() {
  const navigate = useNavigate()
  const revenueData = useAppStore((state) => state.revenueData)
  const revenueChart = useAppStore((state) => state.revenueChart)
  const topCustomers = useAppStore((state) => state.topCustomers)
  const utilizationData = useAppStore((state) => state.utilizationData)
  const operationHistory = useAppStore((state) => state.operationHistory)

  return (
    <ReportsPage
      revenueData={revenueData}
      revenueChart={revenueChart}
      topCustomers={topCustomers}
      utilizationData={utilizationData}
      operationHistory={operationHistory}
      onCustomerClick={(id) => navigate(`/customers/${id}`)}
      onResourceClick={(id) => navigate(`/resources?highlight=${id}`)}
    />
  )
}
