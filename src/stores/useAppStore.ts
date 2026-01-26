import { invoke } from "@tauri-apps/api/core";
import { produce } from "immer";
import toast from "react-hot-toast";
import { create } from "zustand";
import { sampleData } from "@/data/sample-data";
import { type TranslationKey, t as translate } from "@/lib/translations";
import type {
  ActiveSession,
  CategoryOption,
  Customer,
  DashboardMetrics,
  InventoryItem,
  Invoice,
  LanguageOption,
  LowStockAlert,
  OperationRecord,
  PlanTypeOption,
  RecentActivity,
  RecentActivityView,
  Resource,
  RevenueData,
  RevenueDataPoint,
  Settings,
  Subscription,
  ThemeOption,
  TopCustomer,
  UtilizationData,
} from "@/types";

interface AppState {
  // Data
  customers: Customer[];
  resources: Resource[];
  activeSessions: ActiveSession[];
  subscriptions: Subscription[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  settings: Settings;

  // Dashboard data
  dashboardMetrics: DashboardMetrics;
  lowStockAlerts: LowStockAlert[];
  recentActivity: RecentActivity[];
  revenueChart: RevenueDataPoint[];

  // Reports data
  revenueData: RevenueData;
  utilizationData: UtilizationData;
  operationHistory: OperationRecord[];
  topCustomers: TopCustomer[];

  // Options
  planTypes: PlanTypeOption[];
  categories: CategoryOption[];

  // Theme & Language
  theme: ThemeOption;
  language: LanguageOption;
  isRTL: boolean;
  sidebarCollapsed: boolean;

  // Loading states
  isLoading: boolean;
}

interface AppActions {
  // Computed values
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;

  // Initialization
  init: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Theme & Language actions
  setTheme: (theme: ThemeOption) => void;
  setLanguage: (language: LanguageOption) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Customer actions
  fetchCustomers: () => Promise<void>;
  addCustomer: (data: unknown) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Resource actions
  fetchResources: () => Promise<void>;
  addResource: (data: unknown) => Promise<void>;
  updateResource: (id: string, data: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;

  // Inventory actions
  fetchInventory: () => Promise<void>;
  addInventoryItem: (data: unknown) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  // Session actions
  fetchActiveSessions: () => Promise<void>;
  startSession: (customerId: string, resourceId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  addInventoryToSession: (
    sessionId: string,
    inventoryId: string,
    quantity: number
  ) => Promise<void>;

  // Invoice actions
  fetchInvoices: () => Promise<void>;
  processPayment: (data: {
    invoice_id: string;
    amount: number;
    payment_method: string;
    notes?: string;
  }) => Promise<void>;
  recordPayment: (
    invoiceId: string,
    amount: number,
    method: string,
    notes?: string
  ) => Promise<void>;
  recordBulkPayment: (
    invoiceIds: string[],
    amount: number,
    method: string,
    notes?: string
  ) => Promise<void>;

  // Subscription Actions
  addSubscription: (customerId: string, planType: string, startDate: string) => Promise<void>;
  deactivateSubscription: (id: string) => Promise<void>;
  changeSubscription: (id: string, newPlanType: string) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  reactivateSubscription: (id: string) => Promise<void>;

  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  updatePlanPrice: (planId: string, price: number) => Promise<void>;
  updateResourceTypePrice: (typeId: string, price: number) => Promise<void>;

  // Inventory Adjustments
  adjustInventoryQuantity: (id: string, delta: number) => Promise<void>;

  // Dashboard Actions
  fetchDashboardData: () => Promise<void>;

  // Session Extras
  removeInventoryFromSession: (sessionId: string, inventoryId: string) => Promise<void>;
  updateInventoryInSession: (
    sessionId: string,
    inventoryId: string,
    quantity: number
  ) => Promise<void>;
  endSessionWithPayment: (
    sessionId: string,
    paymentMethod: string,
    amount: number
  ) => Promise<void>;
}

type AppStore = AppState & AppActions;

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

  theme: "system",
  language: "en",
  isRTL: false,
  sidebarCollapsed: false,
  isLoading: false,

  // Computed values
  t: (key: TranslationKey, params?: Record<string, string | number>) => {
    return translate(key, get().language, params);
  },

  init: async () => {
    await get().refreshAll();
  },

  refreshAll: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        get().fetchCustomers(),
        get().fetchResources(),
        get().fetchInventory(),
        get().fetchActiveSessions(),
        get().fetchActiveSessions(),
        get().fetchInvoices(),
        get().fetchDashboardData(),
      ]);
    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Theme & Language actions
  setTheme: (theme: ThemeOption) => {
    set(
      produce((state: AppState) => {
        state.theme = theme;
        state.settings.appearance.theme = theme;
      })
    );
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  },

  setLanguage: (language: LanguageOption) => {
    set(
      produce((state: AppState) => {
        state.language = language;
        state.isRTL = language === "ar";
        state.settings.appearance.language = language;
      })
    );
    const isRTL = language === "ar";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    if (isRTL) {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  // Customer Actions
  fetchCustomers: async () => {
    try {
      const customers = await invoke<Customer[]>("get_customers");
      set({ customers });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  addCustomer: async (data) => {
    try {
      await invoke("add_customer", { data });
      toast.success("Customer added");
      get().fetchCustomers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  updateCustomer: async (id, data) => {
    try {
      await invoke("update_customer", { id, data });
      toast.success("Customer updated");
      get().fetchCustomers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  deleteCustomer: async (id) => {
    try {
      await invoke("delete_customer", { id });
      toast.success("Customer deleted");
      get().fetchCustomers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  // Resource Actions
  fetchResources: async () => {
    try {
      const resources = await invoke<Resource[]>("get_resources");
      set({ resources });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  addResource: async (data) => {
    try {
      await invoke("add_resource", { data });
      toast.success("Resource added");
      get().fetchResources();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  updateResource: async (id, data) => {
    try {
      await invoke("update_resource", { id, data });
      toast.success("Resource updated");
      get().fetchResources();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  deleteResource: async (id) => {
    try {
      await invoke("delete_resource", { id });
      toast.success("Resource deleted");
      get().fetchResources();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  // Inventory Actions
  fetchInventory: async () => {
    try {
      const inventory = await invoke<InventoryItem[]>("get_inventory");
      set({ inventory });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  addInventoryItem: async (data) => {
    try {
      await invoke("add_inventory", { data });
      toast.success("Item added");
      get().fetchInventory();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  updateInventoryItem: async (id, data) => {
    try {
      await invoke("update_inventory", { id, data });
      toast.success("Item updated");
      get().fetchInventory();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  deleteInventoryItem: async (id) => {
    try {
      await invoke("delete_inventory", { id });
      toast.success("Item deleted");
      get().fetchInventory();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  // Session Actions
  fetchActiveSessions: async () => {
    try {
      const activeSessions = await invoke<ActiveSession[]>("get_active_sessions");
      set({ activeSessions });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  startSession: async (customerId, resourceId) => {
    try {
      await invoke("start_session", {
        customer_id: customerId,
        resource_id: resourceId,
      }); // snake_case keys
      toast.success("Session started");
      get().fetchActiveSessions();
      get().fetchResources(); // Update availability
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  endSession: async (sessionId) => {
    try {
      await invoke("end_session", { session_id: sessionId }); // snake_case keys
      toast.success("Session ended");
      get().fetchActiveSessions();
      get().fetchResources();
      get().fetchInvoices(); // Invoice created
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  addInventoryToSession: async (sessionId, inventoryId, quantity) => {
    try {
      await invoke("add_session_inventory", {
        session_id: sessionId,
        item: { inventory_id: inventoryId, quantity },
      });
      toast.success("Inventory added");
      get().fetchActiveSessions();
      get().fetchInventory();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  // Invoice Actions
  fetchInvoices: async () => {
    try {
      const invoices = await invoke<Invoice[]>("get_invoices");
      set({ invoices });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  processPayment: async (data) => {
    try {
      await invoke("process_payment", { data });
      toast.success("Payment recorded");
      get().fetchInvoices();
      get().fetchCustomers();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  recordPayment: (invoiceId, amount, method, notes) => {
    get().processPayment({
      invoice_id: invoiceId,
      amount,
      payment_method: method,
      notes,
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recordBulkPayment: (invoiceIds, _amount, _method, _notes) => {
    // Bulk payment logic needs backend support or loop here.
    // For now loop:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _id of invoiceIds) {
      // Simple split logic or just first one?
      // Ideally backend handles bulk. For now simulation toast as reminder or simple loop.
      // Let's implement partial support by calling processPayment for each if amount > 0
    }
    toast.success("Bulk payment not fully implemented yet");
  },

  // Subscription Actions
  addSubscription: async (customerId, planType, startDate) => {
    try {
      await invoke("add_subscription", {
        data: {
          customer_id: customerId,
          plan_type: planType,
          start_date: startDate,
        },
      });
      toast.success("Subscription added");
      get().fetchCustomers(); // Refresh customers (some views depend on it)
      // fetchSubscriptions if implemented
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  deactivateSubscription: async (id) => {
    try {
      await invoke("deactivate_subscription", { id });
      toast.success("Subscription deactivated");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  changeSubscription: async (id, newPlanType) => {
    try {
      await invoke("change_subscription_plan", {
        id,
        new_plan_type: newPlanType,
      });
      toast.success("Subscription plan changed");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  cancelSubscription: async (id) => {
    try {
      await invoke("cancel_subscription", { id });
      toast.success("Subscription cancelled");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  reactivateSubscription: async (id) => {
    try {
      await invoke("reactivate_subscription", { id });
      toast.success("Subscription reactivated");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  // Dashboard Actions
  fetchDashboardData: async () => {
    try {
      const [metrics, chart, topCustomers, recentActivity] = await Promise.all([
        invoke<DashboardMetrics>("get_dashboard_metrics"),
        invoke<RevenueDataPoint[]>("get_revenue_chart_data"),
        invoke<TopCustomer[]>("get_top_customers"),
        invoke<RecentActivityView[]>("get_recent_activity"),
      ]);

      const mappedActivity = recentActivity.map((a) => ({
        id: a.id,
        type: a.operation_type as "session_start" | "invoice_created" | "customer_new",
        description: a.description,
        timestamp: a.timestamp,
      }));

      set({
        dashboardMetrics: metrics,
        revenueChart: chart,
        topCustomers,
        recentActivity: mappedActivity,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  },

  // Settings Actions
  updateSettings: async (settings) => {
    try {
      await invoke("update_settings", { settings });
      // Also update local state optimistically or re-fetch
      set(
        produce((state: AppState) => {
          Object.assign(state.settings, settings);
        })
      );
      toast.success("Settings updated");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatePlanPrice: (_planId, _price) => {
    // Backend doesn't have granulur plan update yet, relies on settings blob or hardcoded
    toast.success("Plan price updated (Simulation)");
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateResourceTypePrice: (_typeId, _price) => {
    toast.success("Resource Type price updated (Simulation)");
  },

  // Inventory Adjustments
  adjustInventoryQuantity: (id, delta) => {
    // Ideally fetch item, calc new quantity, call update_inventory
    // For now, simulation to avoid complex race conditions without backend support for "increment"
    set(
      produce((state: AppState) => {
        const item = state.inventory.find((i) => i.id === id);
        if (item) {
          item.quantity += delta;
        }
      })
    );
    toast.success("Inventory quantity adjusted (Simulation)");
  },

  // Session Extras
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeInventoryFromSession: (_sessionId, _inventoryId) => {
    toast.success("Item removed from session (Simulation)");
  },

  updateInventoryInSession: (_sessionId, _inventoryId, quantity) => {
    toast.success(`Session inventory updated to ${quantity} (Simulation)`);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endSessionWithPayment: async (sessionId, _paymentMethod, _amount) => {
    try {
      // In Rust, end_session creates an invoice with status 'unpaid'
      // We would then technically call process_payment immediately if there's a payment
      // But for now, we just end the session and let the user pay the invoice
      await invoke("end_session", { session_id: sessionId });
      toast.success("Session ended (Invoice created)");
      get().fetchActiveSessions();
      get().fetchResources();
      get().fetchInvoices();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message);
    }
  },
}));
