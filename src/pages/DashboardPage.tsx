import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dashboard } from '@/components/dashboard'
import { StartSessionDialog } from '@/components/sessions/StartSessionDialog'
import { CustomerDialog } from '@/components/customers/CustomerDialog'
import { useAppStore } from '@/stores/useAppStore'
import type { CustomerType } from '@/types'

const customerTypes: CustomerType[] = ['visitor', 'weekly', 'half-monthly', 'monthly']

export function DashboardPage() {
  const navigate = useNavigate()
  const [showStartSessionDialog, setShowStartSessionDialog] = useState(false)
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  
  // Get data from store
  const {
    customers,
    resources,
    subscriptions,
    planTypes,
    startSession,
    addCustomer,
    t
  } = useAppStore()

  const handleStartSession = (data: { customerId: string; resourceId: string }) => {
    startSession(data.customerId, data.resourceId)
    setShowStartSessionDialog(false)
  }

  const handleCreateCustomer = (data: { name: string; phone: string; email?: string; customerType: any; notes?: string }) => {
    addCustomer({
      ...data,
      balance: 0,
      email: data.email || null,
      notes: data.notes || ''
    })
    setShowNewCustomerDialog(false)
  }

  return (
    <>
      <Dashboard
        onStartSession={() => setShowStartSessionDialog(true)}
        onNewCustomer={() => setShowNewCustomerDialog(true)}
        onNavigateToSection={(section) => navigate(`/${section}`)}
        onViewInventoryItem={(id) => navigate(`/inventory?highlight=${id}`)}
      />
      
      <StartSessionDialog
        isOpen={showStartSessionDialog}
        customers={customers}
        resources={resources}
        subscriptions={subscriptions}
        onSubmit={handleStartSession}
        onClose={() => setShowStartSessionDialog(false)}
      />
      
      <CustomerDialog
        isOpen={showNewCustomerDialog}
        title={t('newCustomer')}
        customerTypes={customerTypes}
        onSubmit={handleCreateCustomer}
        onClose={() => setShowNewCustomerDialog(false)}
      />
    </>
  )
}
