import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type {
  Customer,
  Resource,
  ActiveSession,
  Subscription,
  InventoryItem,
  Invoice,
  Settings,
  DashboardMetrics,
  LowStockAlert,
  RecentActivity,
  RevenueDataPoint,
  RevenueData,
  UtilizationData,
  OperationRecord,
  TopCustomer,
  PlanTypeOption,
  CategoryOption,
  ThemeOption,
  LanguageOption,
} from '@/types'
import { sampleData } from '@/data/sample-data'
import { t as translate, type TranslationKey } from '@/lib/translations'
import { useAppStore } from '@/stores/useAppStore'

interface AppContextType {
  // Data
  customers: Customer[]
  resources: Resource[]
  activeSessions: ActiveSession[]
  subscriptions: Subscription[]
  inventory: InventoryItem[]
  invoices: Invoice[]
  settings: Settings

  // Dashboard data
  dashboardMetrics: DashboardMetrics
  lowStockAlerts: LowStockAlert[]
  recentActivity: RecentActivity[]
  revenueChart: RevenueDataPoint[]

  // Reports data
  revenueData: RevenueData
  utilizationData: UtilizationData
  operationHistory: OperationRecord[]
  topCustomers: TopCustomer[]

  // Options
  planTypes: PlanTypeOption[]
  categories: CategoryOption[]

  // Theme & Language
  theme: ThemeOption
  language: LanguageOption
  isRTL: boolean
  t: (key: TranslationKey, params?: Record<string, string | number>) => string

  // Actions
  setTheme: (theme: ThemeOption) => void
  setLanguage: (language: LanguageOption) => void

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'humanId' | 'createdAt' | 'totalSessions' | 'totalSpent'>) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  deleteCustomer: (id: string) => void

  // Resource actions
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'utilizationRate' | 'isAvailable'>) => void
  updateResource: (id: string, data: Partial<Resource>) => void
  deleteResource: (id: string) => void

  // Session actions
  startSession: (customerId: string, resourceId: string) => void
  endSession: (sessionId: string) => void
  addInventoryToSession: (sessionId: string, inventoryId: string, quantity: number) => void

  // Subscription actions
  addSubscription: (customerId: string, planType: string, startDate: string) => void
  deactivateSubscription: (id: string) => void

  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void
  adjustInventoryQuantity: (id: string, delta: number) => void

  // Invoice actions
  recordPayment: (invoiceId: string, amount: number, method: string, date: string, notes?: string) => void

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(sampleData.customers)
  const [resources, setResources] = useState<Resource[]>(sampleData.resources)
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(sampleData.activeSessions)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(sampleData.subscriptions)
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleData.inventory)
  const [invoices, setInvoices] = useState<Invoice[]>(sampleData.invoices)
  const [settings, setSettings] = useState<Settings>(sampleData.settings)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(sampleData.recentActivity)
  const [operationHistory] = useState<OperationRecord[]>(sampleData.operationHistory)

  const [theme, setThemeState] = useState<ThemeOption>(() => {
    const saved = localStorage.getItem('backspace-theme')
    return (saved as ThemeOption) || 'system'
  })
  const [language, setLanguageState] = useState<LanguageOption>(() => {
    const saved = localStorage.getItem('backspace-language')
    return (saved as LanguageOption) || 'en'
  })

  const isRTL = language === 'ar'

  // Translation function
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    return translate(key, language, params)
  }, [language])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    // Initial fetch
    useAppStore.getState().fetchDashboardData()
  }, [theme])

  // Apply RTL
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [isRTL])

  const setTheme = (newTheme: ThemeOption) => {
    setThemeState(newTheme)
    localStorage.setItem('backspace-theme', newTheme)
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, theme: newTheme }
    }))
  }

  const setLanguage = (newLanguage: LanguageOption) => {
    setLanguageState(newLanguage)
    localStorage.setItem('backspace-language', newLanguage)
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, language: newLanguage }
    }))
  }

  // Computed values
  const lowStockAlerts: LowStockAlert[] = inventory
    .filter(item => item.quantity <= item.minStock && item.quantity > 0)
    .map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      minStock: item.minStock,
    }))

  const dashboardMetrics: DashboardMetrics = {
    todayRevenue: sampleData.dashboardMetrics.todayRevenue,
    sessionRevenue: sampleData.dashboardMetrics.sessionRevenue,
    inventoryRevenue: sampleData.dashboardMetrics.inventoryRevenue,
    activeSessions: activeSessions.length,
    newCustomersToday: sampleData.dashboardMetrics.newCustomersToday,
    activeSubscriptions: subscriptions.filter(s => s.isActive).length,
    resourceUtilization: Math.round((resources.filter(r => !r.isAvailable).length / resources.length) * 100),
  }

  const topCustomers: TopCustomer[] = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map(c => ({ id: c.id, name: c.name, revenue: c.totalSpent }))

  // Helper to generate IDs
  const generateId = () => Math.random().toString(36).substring(2, 11)

  // Helper to add activity
  const addActivity = (type: RecentActivity['type'], description: string) => {
    const activity: RecentActivity = {
      id: generateId(),
      type,
      description,
      timestamp: new Date().toISOString(),
    }
    setRecentActivity(prev => [activity, ...prev].slice(0, 20))
  }

  // Customer actions
  const addCustomer = (data: Omit<Customer, 'id' | 'humanId' | 'createdAt' | 'totalSessions' | 'totalSpent'>) => {
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      humanId: `C-${String(customers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      totalSessions: 0,
      totalSpent: 0,
    }
    setCustomers(prev => [...prev, newCustomer])
    addActivity('customer_new', `New customer: ${newCustomer.name} registered`)
  }

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id))
  }

  // Resource actions
  const addResource = (data: Omit<Resource, 'id' | 'createdAt' | 'utilizationRate' | 'isAvailable'>) => {
    const newResource: Resource = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      utilizationRate: 0,
      isAvailable: true,
    }
    setResources(prev => [...prev, newResource])
  }

  const updateResource = (id: string, data: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
  }

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id))
  }

  // Session actions
  const startSession = (customerId: string, resourceId: string) => {
    const customer = customers.find(c => c.id === customerId)
    const resource = resources.find(r => r.id === resourceId)
    if (!customer || !resource) return

    const isSubscribed = subscriptions.some(s => s.customerId === customerId && s.isActive)

    const newSession: ActiveSession = {
      id: generateId(),
      customerId,
      customerName: customer.name,
      resourceId,
      resourceName: resource.name,
      resourceRate: resource.ratePerHour,
      startedAt: new Date().toISOString(),
      isSubscribed,
      inventoryConsumptions: [],
      inventoryTotal: 0,
    }

    setActiveSessions(prev => [...prev, newSession])
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, isAvailable: false } : r))
    addActivity('session_start', `${customer.name} started session on ${resource.name}`)
  }

  const endSession = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId)
    if (!session) return

    // Mark resource as available
    setResources(prev => prev.map(r => r.id === session.resourceId ? { ...r, isAvailable: true } : r))

    // Remove from active sessions
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId))

    // Calculate session cost
    const startTime = new Date(session.startedAt)
    const endTime = new Date()
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
    const sessionCost = session.isSubscribed ? 0 : (durationMinutes / 60) * session.resourceRate
    const totalAmount = sessionCost + session.inventoryTotal

    // Create invoice
    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(4, '0')}`,
      customerId: session.customerId,
      customerName: session.customerName,
      customerPhone: customers.find(c => c.id === session.customerId)?.phone || '',
      sessionId,
      amount: totalAmount,
      discount: 0,
      total: totalAmount,
      paidAmount: 0,
      status: 'unpaid',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paidDate: null,
      createdAt: new Date().toISOString(),
      lineItems: [
        ...(sessionCost > 0 ? [{
          description: `Session - ${session.resourceName} (${durationMinutes} min)`,
          quantity: 1,
          rate: sessionCost,
          amount: sessionCost,
        }] : []),
        ...session.inventoryConsumptions.map(ic => ({
          description: ic.itemName,
          quantity: ic.quantity,
          rate: ic.price,
          amount: ic.price * ic.quantity,
        })),
      ],
      payments: [],
    }

    setInvoices(prev => [...prev, invoice])
    addActivity('session_end', `${session.customerName} ended session - ${Math.round(totalAmount)} ${t('egp')}`)
  }

  const addInventoryToSession = (sessionId: string, inventoryId: string, quantity: number) => {
    const item = inventory.find(i => i.id === inventoryId)
    if (!item || item.quantity < quantity) return

    // Deduct from inventory
    setInventory(prev => prev.map(i =>
      i.id === inventoryId ? { ...i, quantity: i.quantity - quantity } : i
    ))

    // Add to session
    setActiveSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      const consumption = {
        id: generateId(),
        itemName: item.name,
        quantity,
        price: item.price,
        addedAt: new Date().toISOString(),
      }
      return {
        ...s,
        inventoryConsumptions: [...s.inventoryConsumptions, consumption],
        inventoryTotal: s.inventoryTotal + (item.price * quantity),
      }
    }))

    const session = activeSessions.find(s => s.id === sessionId)
    if (session) {
      addActivity('inventory_add', `${item.name} added to ${session.customerName}'s session`)
    }
  }

  // Subscription actions
  const addSubscription = (customerId: string, planType: string, startDate: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return

    const plan = sampleData.planTypes.find(p => p.id === planType)
    if (!plan) return

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + plan.days)

    const newSubscription: Subscription = {
      id: generateId(),
      customerId,
      customerName: customer.name,
      planType: planType as any,
      startDate,
      endDate: end.toISOString().split('T')[0],
      isActive: true,
      status: 'active',
      daysRemaining: plan.days,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSubscriptions(prev => [...prev, newSubscription])
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, customerType: planType as any } : c
    ))
    addActivity('subscription_new', `${customer.name} subscribed to ${plan.labelEn} plan`)
  }

  const deactivateSubscription = (id: string) => {
    setSubscriptions(prev => prev.map(s =>
      s.id === id ? { ...s, isActive: false } : s
    ))
  }

  // Inventory actions
  const addInventoryItem = (data: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setInventory(prev => [...prev, newItem])
  }

  const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
  }

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id))
  }

  const adjustInventoryQuantity = (id: string, delta: number) => {
    setInventory(prev => prev.map(i =>
      i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    ))
  }

  // Invoice actions
  const recordPayment = (invoiceId: string, amount: number, method: string, date: string, notes?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv

      const newPayment = {
        id: generateId(),
        amount,
        method: method as any,
        date,
        notes: notes || '',
      }

      const newPaidAmount = inv.paidAmount + amount
      const newStatus = newPaidAmount >= inv.total ? 'paid' : 'pending'

      return {
        ...inv,
        payments: [...inv.payments, newPayment],
        paidAmount: newPaidAmount,
        status: newStatus as any,
        paidDate: newStatus === 'paid' ? date : null,
      }
    }))

    addActivity('invoice_paid', `Payment of ${amount} ${t('egp')} recorded`)
  }

  // Settings actions
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <AppContext.Provider value={{
      customers,
      resources,
      activeSessions,
      subscriptions,
      inventory,
      invoices,
      settings,
      dashboardMetrics,
      lowStockAlerts,
      recentActivity,
      revenueChart: sampleData.revenueChart,
      revenueData: sampleData.revenueData,
      utilizationData: sampleData.utilizationData,
      operationHistory,
      topCustomers,
      planTypes: sampleData.planTypes,
      categories: sampleData.categories,
      theme,
      language,
      isRTL,
      t,
      setTheme,
      setLanguage,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addResource,
      updateResource,
      deleteResource,
      startSession,
      endSession,
      addInventoryToSession,
      addSubscription,
      deactivateSubscription,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      adjustInventoryQuantity,
      recordPayment,
      updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
