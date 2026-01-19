import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer'
import type {
  Customer,
  Resource,
  ResourceType,
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

interface AppState {
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
}

interface AppActions {
  // Computed values
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  
  // Theme & Language actions
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
  endSessionWithPayment: (sessionId: string, paymentData: { amount: number; method: string; date: string; notes?: string; status: 'paid' | 'unpaid' | 'pending' }) => void
  addInventoryToSession: (sessionId: string, inventoryId: string, quantity: number) => void
  updateInventoryInSession: (sessionId: string, consumptionId: string, newQuantity: number) => void
  removeInventoryFromSession: (sessionId: string, consumptionId: string) => void
  
  // Subscription actions
  addSubscription: (customerId: string, planType: string, startDate: string) => void
  updateSubscription: (id: string, data: Partial<Subscription>) => void
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
  updatePlanPrice: (planId: string, price: number) => void
  updateResourceTypePrice: (type: ResourceType, price: number) => void
  
  // Internal actions
  addActivity: (type: RecentActivity['type'], description: string) => void
  generateId: () => string
  updateDashboardMetrics: () => void
  updateLowStockAlerts: () => void
  updateTopCustomers: () => void
}

type AppStore = AppState & AppActions

const initialState: AppState = {
  customers: sampleData.customers,
  resources: sampleData.resources,
  activeSessions: sampleData.activeSessions,
  subscriptions: sampleData.subscriptions,
  inventory: sampleData.inventory,
  invoices: sampleData.invoices,
  settings: sampleData.settings,
  dashboardMetrics: sampleData.dashboardMetrics,
  lowStockAlerts: sampleData.inventory
    .filter(item => item.quantity <= item.minStock && item.quantity > 0)
    .map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      minStock: item.minStock,
    })),
  recentActivity: sampleData.recentActivity,
  revenueChart: sampleData.revenueChart,
  revenueData: sampleData.revenueData,
  utilizationData: sampleData.utilizationData,
  operationHistory: sampleData.operationHistory,
  topCustomers: [...sampleData.customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map(c => ({ id: c.id, name: c.name, revenue: c.totalSpent })),
  planTypes: sampleData.planTypes,
  categories: sampleData.categories,
  theme: 'system',
  language: 'en',
  isRTL: false,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Computed values
      t: (key: TranslationKey, params?: Record<string, string | number>) => {
        return translate(key, get().language, params)
      },
      
      // Helper functions
      generateId: () => Math.random().toString(36).substring(2, 11),
      
      addActivity: (type: RecentActivity['type'], description: string) => {
        set(produce((state: AppState) => {
          const activity: RecentActivity = {
            id: get().generateId(),
            type,
            description,
            timestamp: new Date().toISOString(),
          }
          state.recentActivity.unshift(activity)
          state.recentActivity = state.recentActivity.slice(0, 20)
        }))
      },
      
      updateDashboardMetrics: () => {
        set(produce((state: AppState) => {
          const { activeSessions, subscriptions, resources } = state
          state.dashboardMetrics = {
            ...state.dashboardMetrics,
            activeSessions: activeSessions.length,
            activeSubscriptions: subscriptions.filter(s => s.isActive).length,
            resourceUtilization: resources.length > 0 ? Math.round((resources.filter(r => !r.isAvailable).length / resources.length) * 100) : 0,
          }
        }))
      },
      
      updateLowStockAlerts: () => {
        set(produce((state: AppState) => {
          state.lowStockAlerts = state.inventory
            .filter(item => item.quantity <= item.minStock && item.quantity > 0)
            .map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              minStock: item.minStock,
            }))
        }))
      },
      
      updateTopCustomers: () => {
        set(produce((state: AppState) => {
          state.topCustomers = [...state.customers]
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map(c => ({ id: c.id, name: c.name, revenue: c.totalSpent }))
        }))
      },
      
      // Theme & Language actions
      setTheme: (theme: ThemeOption) => {
        set(produce((state: AppState) => {
          state.theme = theme
          state.settings.appearance.theme = theme
        }))
        
        // Apply theme to DOM
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          root.classList.add(systemTheme)
        } else {
          root.classList.add(theme)
        }
      },
      
      setLanguage: (language: LanguageOption) => {
        set(produce((state: AppState) => {
          state.language = language
          state.isRTL = language === 'ar'
          state.settings.appearance.language = language
        }))
        
        // Apply RTL to DOM
        const isRTL = language === 'ar'
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
        
        // Add RTL class to body
        if (isRTL) {
          document.body.classList.add('rtl')
        } else {
          document.body.classList.remove('rtl')
        }
      },
      
      // Customer actions
      addCustomer: (data) => {
        const newCustomer: Customer = {
          ...data,
          id: get().generateId(),
          humanId: `C-${String(get().customers.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          totalSessions: 0,
          totalSpent: 0,
        }
        
        set(produce((state: AppState) => {
          state.customers.push(newCustomer)
        }))
        
        get().addActivity('customer_new', `New customer: ${data.name} registered`)
        get().updateTopCustomers()
      },
      
      updateCustomer: (id: string, data: Partial<Customer>) => {
        set(produce((state: AppState) => {
          const index = state.customers.findIndex(c => c.id === id)
          if (index !== -1) {
            Object.assign(state.customers[index], data)
          }
        }))
        get().updateTopCustomers()
      },
      
      deleteCustomer: (id: string) => {
        set(produce((state: AppState) => {
          state.customers = state.customers.filter(c => c.id !== id)
        }))
        get().updateTopCustomers()
      },
      
      // Resource actions
      addResource: (data) => {
        let rate = data.ratePerHour;
        if (rate === 0) {
          const existing = get().resources.find(r => r.resourceType === data.resourceType);
          if (existing) {
            rate = existing.ratePerHour;
          } else {
            // Default rates if no existing resource of this type
            if (data.resourceType === 'seat') rate = 25;
            else if (data.resourceType === 'room') rate = 100;
            else if (data.resourceType === 'desk') rate = 50;
          }
        }

        const newResource: Resource = {
          ...data,
          ratePerHour: rate,
          id: get().generateId(),
          createdAt: new Date().toISOString(),
          utilizationRate: 0,
          isAvailable: true,
        }
        
        set(produce((state: AppState) => {
          state.resources.push(newResource)
        }))
        
        get().updateDashboardMetrics()
      },
      
      updateResource: (id: string, data: Partial<Resource>) => {
        set(produce((state: AppState) => {
          const index = state.resources.findIndex(r => r.id === id)
          if (index !== -1) {
            Object.assign(state.resources[index], data)
          }
        }))
      },
      
      deleteResource: (id: string) => {
        set(produce((state: AppState) => {
          state.resources = state.resources.filter(r => r.id !== id)
        }))
        get().updateDashboardMetrics()
      },
      
      // Session actions
      startSession: (customerId: string, resourceId: string) => {
        const { customers, resources, subscriptions } = get()
        const customer = customers.find(c => c.id === customerId)
        const resource = resources.find(r => r.id === resourceId)
        
        if (!customer || !resource) return
        
        const isSubscribed = subscriptions.some(s => s.customerId === customerId && s.isActive)
        
        const newSession: ActiveSession = {
          id: get().generateId(),
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
        
        set(produce((state: AppState) => {
          state.activeSessions.push(newSession)
          
          const resourceIndex = state.resources.findIndex(r => r.id === resourceId)
          if (resourceIndex !== -1) {
            state.resources[resourceIndex].isAvailable = false
          }
        }))
        
        get().addActivity('session_start', `${customer.name} started session on ${resource.name}`)
        get().updateDashboardMetrics()
      },
      
      endSession: (sessionId: string) => {
        const session = get().activeSessions.find(s => s.id === sessionId)
        if (!session) return
        
        // Calculate session cost and create invoice
        const startTime = new Date(session.startedAt)
        const endTime = new Date()
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        const sessionCost = session.isSubscribed ? 0 : (durationMinutes / 60) * session.resourceRate
        const totalAmount = sessionCost + session.inventoryTotal
        
        const customer = get().customers.find(c => c.id === session.customerId)
        
        const invoice: Invoice = {
          id: get().generateId(),
          invoiceNumber: `INV-${String(get().invoices.length + 1).padStart(4, '0')}`,
          customerId: session.customerId,
          customerName: session.customerName,
          customerPhone: customer?.phone || '',
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
        
        set(produce((state: AppState) => {
          // Mark resource as available
          const resourceIndex = state.resources.findIndex(r => r.id === session.resourceId)
          if (resourceIndex !== -1) {
            state.resources[resourceIndex].isAvailable = true
          }
          
          // Remove from active sessions
          state.activeSessions = state.activeSessions.filter(s => s.id !== sessionId)
          
          // Add invoice
          state.invoices.push(invoice)
        }))
        
        get().addActivity('session_end', `${session.customerName} ended session - ${Math.round(totalAmount)} EGP`)
        get().updateDashboardMetrics()
      },

      endSessionWithPayment: (sessionId: string, paymentData) => {
        const session = get().activeSessions.find(s => s.id === sessionId)
        if (!session) return
        
        const startTime = new Date(session.startedAt)
        const endTime = new Date()
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        const sessionCost = session.isSubscribed ? 0 : (durationMinutes / 60) * session.resourceRate
        const totalAmount = sessionCost + session.inventoryTotal
        
        const customer = get().customers.find(c => c.id === session.customerId)
        
        const invoiceId = get().generateId()
        const invoice: Invoice = {
          id: invoiceId,
          invoiceNumber: `INV-${String(get().invoices.length + 1).padStart(4, '0')}`,
          customerId: session.customerId,
          customerName: session.customerName,
          customerPhone: customer?.phone || '',
          sessionId,
          amount: totalAmount,
          discount: 0,
          total: totalAmount,
          paidAmount: paymentData.amount,
          status: paymentData.status,
          dueDate: paymentData.date,
          paidDate: paymentData.status === 'paid' ? paymentData.date : null,
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
          payments: paymentData.amount > 0 ? [{
            id: get().generateId(),
            amount: paymentData.amount,
            method: paymentData.method as any,
            date: paymentData.date,
            notes: paymentData.notes || '',
          }] : [],
        }
        
        set(produce((state: AppState) => {
          // Mark resource as available
          const resourceIndex = state.resources.findIndex(r => r.id === session.resourceId)
          if (resourceIndex !== -1) {
            state.resources[resourceIndex].isAvailable = true
          }
          
          // Remove from active sessions
          state.activeSessions = state.activeSessions.filter(s => s.id !== sessionId)
          
          // Add invoice
          state.invoices.push(invoice)

          // Update customer balance if debt
          if (paymentData.status !== 'paid' && totalAmount > paymentData.amount) {
            const customerIndex = state.customers.findIndex(c => c.id === session.customerId)
            if (customerIndex !== -1) {
              state.customers[customerIndex].balance -= (totalAmount - paymentData.amount)
            }
          }

          // Update customer stats
          const customerIndex = state.customers.findIndex(c => c.id === session.customerId)
          if (customerIndex !== -1) {
            state.customers[customerIndex].totalSessions += 1
            state.customers[customerIndex].totalSpent += paymentData.amount
          }
        }))
        
        get().addActivity('session_end', `${session.customerName} ended session - ${Math.round(totalAmount)} EGP`)
        if (paymentData.amount > 0) {
          get().addActivity('invoice_paid', `Payment of ${paymentData.amount} EGP recorded`)
        }
        get().updateDashboardMetrics()
      },
      
      addInventoryToSession: (sessionId: string, inventoryId: string, quantity: number) => {
        const item = get().inventory.find(i => i.id === inventoryId)
        if (!item || item.quantity < quantity) return
        
        const consumption = {
          id: get().generateId(),
          itemName: item.name,
          quantity,
          price: item.price,
          addedAt: new Date().toISOString(),
        }
        
        set(produce((state: AppState) => {
          // Deduct from inventory
          const inventoryIndex = state.inventory.findIndex(i => i.id === inventoryId)
          if (inventoryIndex !== -1) {
            state.inventory[inventoryIndex].quantity -= quantity
          }
          
          // Add to session
          const sessionIndex = state.activeSessions.findIndex(s => s.id === sessionId)
          if (sessionIndex !== -1) {
            state.activeSessions[sessionIndex].inventoryConsumptions.push(consumption)
            state.activeSessions[sessionIndex].inventoryTotal += item.price * quantity
          }
        }))
        
        const session = get().activeSessions.find(s => s.id === sessionId)
        if (session) {
          get().addActivity('inventory_add', `${item.name} added to ${session.customerName}'s session`)
        }
        
        get().updateLowStockAlerts()
      },

      updateInventoryInSession: (sessionId: string, consumptionId: string, newQuantity: number) => {
        set(produce((state: AppState) => {
          const session = state.activeSessions.find(s => s.id === sessionId)
          if (!session) return

          const consumptionIndex = session.inventoryConsumptions.findIndex(ic => ic.id === consumptionId)
          if (consumptionIndex === -1) return

          const consumption = session.inventoryConsumptions[consumptionIndex]
          const diff = newQuantity - consumption.quantity

          // Update inventory stock (reverse the diff)
          const inventoryItem = state.inventory.find(i => i.name === consumption.itemName)
          if (inventoryItem) {
            inventoryItem.quantity -= diff
          }

          // Update session
          session.inventoryTotal += (diff * consumption.price)
          consumption.quantity = newQuantity
        }))
        get().updateLowStockAlerts()
      },

      removeInventoryFromSession: (sessionId: string, consumptionId: string) => {
        set(produce((state: AppState) => {
          const session = state.activeSessions.find(s => s.id === sessionId)
          if (!session) return

          const consumptionIndex = session.inventoryConsumptions.findIndex(ic => ic.id === consumptionId)
          if (consumptionIndex === -1) return

          const consumption = session.inventoryConsumptions[consumptionIndex]
          
          // Restore inventory stock
          const inventoryItem = state.inventory.find(i => i.name === consumption.itemName)
          if (inventoryItem) {
            inventoryItem.quantity += consumption.quantity
          }

          // Update session
          session.inventoryTotal -= (consumption.quantity * consumption.price)
          session.inventoryConsumptions.splice(consumptionIndex, 1)
        }))
        get().updateLowStockAlerts()
      },
      
      // Subscription actions
      addSubscription: (customerId: string, planType: string, startDate: string) => {
        const customer = get().customers.find(c => c.id === customerId)
        const plan = get().planTypes.find(p => p.id === planType)
        
        if (!customer || !plan) return
        
        const start = new Date(startDate)
        const end = new Date(start)
        end.setDate(end.getDate() + plan.days)
        
        const newSubscription: Subscription = {
          id: get().generateId(),
          customerId,
          customerName: customer.name,
          planType: planType as any,
          startDate,
          endDate: end.toISOString().split('T')[0],
          isActive: true,
          daysRemaining: plan.days,
          createdAt: new Date().toISOString(),
        }

        const invoice: Invoice = {
          id: get().generateId(),
          invoiceNumber: `INV-${String(get().invoices.length + 1).padStart(4, '0')}`,
          customerId,
          customerName: customer.name,
          customerPhone: customer.phone,
          sessionId: null,
          amount: plan.price,
          discount: 0,
          total: plan.price,
          paidAmount: 0,
          status: 'unpaid',
          dueDate: startDate,
          paidDate: null,
          createdAt: new Date().toISOString(),
          lineItems: [
            {
              description: `Subscription - ${plan.labelEn} (${plan.days} days)`,
              quantity: 1,
              rate: plan.price,
              amount: plan.price,
            }
          ],
          payments: [],
        }
        
        set(produce((state: AppState) => {
          state.subscriptions.push(newSubscription)
          
          const customerIndex = state.customers.findIndex(c => c.id === customerId)
          if (customerIndex !== -1) {
            state.customers[customerIndex].customerType = planType as any
          }

          state.invoices.push(invoice)
        }))
        
        get().addActivity('subscription_new', `${customer.name} subscribed to ${plan.labelEn} plan`)
        get().addActivity('invoice_created', `Invoice generated for subscription: ${plan.price} EGP`)
        get().updateDashboardMetrics()
      },
      
      updateSubscription: (id: string, data: Partial<Subscription>) => {
        set(produce((state: AppState) => {
          const index = state.subscriptions.findIndex(s => s.id === id)
          if (index !== -1) {
            Object.assign(state.subscriptions[index], data)
            
            // Recalculate days remaining if end date changes
            const sub = state.subscriptions[index]
            const end = new Date(sub.endDate)
            const now = new Date()
            const diffTime = Math.max(0, end.getTime() - now.getTime())
            sub.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          }
        }))
        get().updateDashboardMetrics()
      },

      deactivateSubscription: (id: string) => {
        set(produce((state: AppState) => {
          const index = state.subscriptions.findIndex(s => s.id === id)
          if (index !== -1) {
            state.subscriptions[index].isActive = false
          }
        }))
        get().updateDashboardMetrics()
      },
      
      // Inventory actions
      addInventoryItem: (data) => {
        const newItem: InventoryItem = {
          ...data,
          id: get().generateId(),
          createdAt: new Date().toISOString(),
        }
        
        set(produce((state: AppState) => {
          state.inventory.push(newItem)
        }))
        
        get().updateLowStockAlerts()
      },
      
      updateInventoryItem: (id: string, data: Partial<InventoryItem>) => {
        set(produce((state: AppState) => {
          const index = state.inventory.findIndex(i => i.id === id)
          if (index !== -1) {
            Object.assign(state.inventory[index], data)
          }
        }))
        get().updateLowStockAlerts()
      },
      
      deleteInventoryItem: (id: string) => {
        set(produce((state: AppState) => {
          state.inventory = state.inventory.filter(i => i.id !== id)
        }))
        get().updateLowStockAlerts()
      },
      
      adjustInventoryQuantity: (id: string, delta: number) => {
        set(produce((state: AppState) => {
          const index = state.inventory.findIndex(i => i.id === id)
          if (index !== -1) {
            state.inventory[index].quantity = Math.max(0, state.inventory[index].quantity + delta)
          }
        }))
        get().updateLowStockAlerts()
      },
      
      // Invoice actions
      recordPayment: (invoiceId: string, amount: number, method: string, date: string, notes?: string) => {
        const newPayment = {
          id: get().generateId(),
          amount,
          method: method as any,
          date,
          notes: notes || '',
        }
        
        set(produce((state: AppState) => {
          const index = state.invoices.findIndex(inv => inv.id === invoiceId)
          if (index === -1) return
          
          const invoice = state.invoices[index]
          const newPaidAmount = invoice.paidAmount + amount
          const newStatus = newPaidAmount >= invoice.total ? 'paid' : 'pending'
          
          invoice.payments.push(newPayment)
          invoice.paidAmount = newPaidAmount
          invoice.status = newStatus as any
          invoice.paidDate = newStatus === 'paid' ? date : null
        }))
        
        get().addActivity('invoice_paid', `Payment of ${amount} EGP recorded`)
      },
      
      // Settings actions
      updateSettings: (newSettings: Partial<Settings>) => {
        set(produce((state: AppState) => {
          Object.assign(state.settings, newSettings)
        }))
      },

      updatePlanPrice: (planId: string, price: number) => {
        set(produce((state: AppState) => {
          const plan = state.planTypes.find(p => p.id === planId)
          if (plan) {
            plan.price = price
          }
        }))
      },

      updateResourceTypePrice: (type: ResourceType, price: number) => {
        set(produce((state: AppState) => {
          state.resources.forEach(r => {
            if (r.resourceType === type) {
              r.ratePerHour = price
            }
          })
        }))
      },
    }),
    {
      name: 'backspace-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customers: state.customers,
        resources: state.resources,
        activeSessions: state.activeSessions,
        subscriptions: state.subscriptions,
        inventory: state.inventory,
        invoices: state.invoices,
        settings: state.settings,
        recentActivity: state.recentActivity,
        theme: state.theme,
        language: state.language,
        isRTL: state.isRTL,
      }),
    }
  )
)

// Apply theme and language on initialization
setTimeout(() => {
  const { theme, isRTL } = useAppStore.getState()
  
  // Apply theme
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
  
  // Apply RTL
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  
  // Add RTL class to body
  if (isRTL) {
    document.body.classList.add('rtl')
  } else {
    document.body.classList.remove('rtl')
  }
}, 0)