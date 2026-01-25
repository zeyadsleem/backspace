import { create } from 'zustand'
import { produce } from 'immer'
import { invoke } from '@tauri-apps/api/core'
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
import toast from 'react-hot-toast'

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
  sidebarCollapsed: boolean

  // Loading states
  isLoading: boolean
}

interface AppActions {
  // Computed values
  t: (key: TranslationKey, params?: Record<string, string | number>) => string

  // Initialization
  init: () => Promise<void>
  refreshAll: () => Promise<void>

  // Theme & Language actions
  setTheme: (theme: ThemeOption) => void
  setLanguage: (language: LanguageOption) => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Customer actions
  fetchCustomers: () => Promise<void>
  addCustomer: (data: unknown) => Promise<void>
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>

  // Resource actions
  fetchResources: () => Promise<void>
  addResource: (data: unknown) => Promise<void>
  updateResource: (id: string, data: Partial<Resource>) => Promise<void>
  deleteResource: (id: string) => Promise<void>

  // Inventory actions
  fetchInventory: () => Promise<void>
  addInventoryItem: (data: unknown) => Promise<void>
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>

  // Session actions
  fetchActiveSessions: () => Promise<void>
  startSession: (customerId: string, resourceId: string) => Promise<void>
  endSession: (sessionId: string) => Promise<void>
  addInventoryToSession: (sessionId: string, inventoryId: string, quantity: number) => Promise<void>

  // Invoice actions
  fetchInvoices: () => Promise<void>
  processPayment: (data: { invoice_id: string; amount: number; payment_method: string; notes?: string }) => Promise<void>
}

type AppStore = AppState & AppActions

export const useAppStore = create<AppStore>()((set, get) => ({
  // Initialize all AppState fields explicitly
  customers: [],
  resources: [],
  activeSessions: [],
  subscriptions: [],
  inventory: [],
  invoices: [],
  settings: sampleData.settings, // Fallback to sample settings initially

  dashboardMetrics: sampleData.dashboardMetrics,
  lowStockAlerts: [],
  recentActivity: [],
  revenueChart: [],

  revenueData: sampleData.revenueData,
  utilizationData: sampleData.utilizationData,
  operationHistory: [],
  topCustomers: [],

  planTypes: sampleData.planTypes,
  categories: sampleData.categories,

  theme: 'system',
  language: 'en',
  isRTL: false,
  sidebarCollapsed: false,
  isLoading: false,

  // Computed values
  t: (key: TranslationKey, params?: Record<string, string | number>) => {
    return translate(key, get().language, params)
  },

  init: async () => {
    await get().refreshAll()
  },

  refreshAll: async () => {
    set({ isLoading: true })
    try {
      await Promise.all([
        get().fetchCustomers(),
        get().fetchResources(),
        get().fetchInventory(),
        get().fetchActiveSessions(),
        get().fetchInvoices(),
      ])
    } catch (error) {
      console.error('Failed to refresh data', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // Theme & Language actions
  setTheme: (theme: ThemeOption) => {
    set(produce((state: AppState) => {
      state.theme = theme
      state.settings.appearance.theme = theme
    }))
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
    const isRTL = language === 'ar'
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    if (isRTL) document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed })
  },

  // Customer Actions
  fetchCustomers: async () => {
    try {
      const customers = await invoke<Customer[]>('get_customers')
      set({ customers })
    } catch (err) {
      toast.error(String(err))
    }
  },

  addCustomer: async (data) => {
    try {
      await invoke('add_customer', { data })
      toast.success('Customer added')
      get().fetchCustomers()
    } catch (err) {
      toast.error(String(err))
    }
  },

  updateCustomer: async (id, data) => {
    try {
      await invoke('update_customer', { id, data })
      toast.success('Customer updated')
      get().fetchCustomers()
    } catch (err) {
      toast.error(String(err))
    }
  },

  deleteCustomer: async (id) => {
    try {
      await invoke('delete_customer', { id })
      toast.success('Customer deleted')
      get().fetchCustomers()
    } catch (err) {
      toast.error(String(err))
    }
  },

  // Resource Actions
  fetchResources: async () => {
    try {
      const resources = await invoke<Resource[]>('get_resources')
      set({ resources })
    } catch (err) {
      toast.error(String(err))
    }
  },

  addResource: async (data) => {
    try {
      await invoke('add_resource', { data })
      toast.success('Resource added')
      get().fetchResources()
    } catch (err) {
      toast.error(String(err))
    }
  },

  updateResource: async (id, data) => {
    try {
      await invoke('update_resource', { id, data })
      toast.success('Resource updated')
      get().fetchResources()
    } catch (err) {
      toast.error(String(err))
    }
  },

  deleteResource: async (id) => {
    try {
      await invoke('delete_resource', { id })
      toast.success('Resource deleted')
      get().fetchResources()
    } catch (err) {
      toast.error(String(err))
    }
  },

  // Inventory Actions
  fetchInventory: async () => {
    try {
      const inventory = await invoke<InventoryItem[]>('get_inventory')
      set({ inventory })
    } catch (err) {
      toast.error(String(err))
    }
  },

  addInventoryItem: async (data) => {
    try {
      await invoke('add_inventory', { data })
      toast.success('Item added')
      get().fetchInventory()
    } catch (err) {
      toast.error(String(err))
    }
  },

  updateInventoryItem: async (id, data) => {
    try {
      await invoke('update_inventory', { id, data })
      toast.success('Item updated')
      get().fetchInventory()
    } catch (err) {
      toast.error(String(err))
    }
  },

  deleteInventoryItem: async (id) => {
    try {
      await invoke('delete_inventory', { id })
      toast.success('Item deleted')
      get().fetchInventory()
    } catch (err) {
      toast.error(String(err))
    }
  },

  // Session Actions
  fetchActiveSessions: async () => {
    try {
      const activeSessions = await invoke<ActiveSession[]>('get_active_sessions')
      set({ activeSessions })
    } catch (err) {
      toast.error(String(err))
    }
  },

  startSession: async (customerId, resourceId) => {
    try {
      await invoke('start_session', { customer_id: customerId, resource_id: resourceId }) // snake_case keys
      toast.success('Session started')
      get().fetchActiveSessions()
      get().fetchResources() // Update availability
    } catch (err) {
      toast.error(String(err))
    }
  },

  endSession: async (sessionId) => {
    try {
      await invoke('end_session', { session_id: sessionId }) // snake_case keys
      toast.success('Session ended')
      get().fetchActiveSessions()
      get().fetchResources()
      get().fetchInvoices() // Invoice created
    } catch (err) {
      toast.error(String(err))
    }
  },

  addInventoryToSession: async (sessionId, inventoryId, quantity) => {
    try {
      await invoke('add_session_inventory', { session_id: sessionId, item: { inventory_id: inventoryId, quantity } })
      toast.success('Inventory added')
      get().fetchActiveSessions()
      get().fetchInventory()
    } catch (err) {
      toast.error(String(err))
    }
  },

  // Invoice Actions
  fetchInvoices: async () => {
    try {
      const invoices = await invoke<Invoice[]>('get_invoices')
      set({ invoices })
    } catch (err) {
      toast.error(String(err))
    }
  },

  processPayment: async (data) => {
    try {
      await invoke('process_payment', { data })
      toast.success('Payment recorded')
      get().fetchInvoices()
      get().fetchCustomers()
    } catch (err) {
      toast.error(String(err))
    }
  },

}))