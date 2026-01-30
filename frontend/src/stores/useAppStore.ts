import * as App from "../../wailsjs/go/main/App";
import { produce } from "immer";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type TranslationKey, t as translate } from "@/lib/translations";
import { toPiasters } from "@/lib/formatters";
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
  isWailsReady: boolean;
}

interface AppActions {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  init: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setTheme: (theme: ThemeOption) => void;
  setLanguage: (language: LanguageOption) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  fetchCustomers: () => Promise<void>;
  addCustomer: (data: Partial<Customer>) => Promise<void>;
  checkCustomerDuplicate: (name: string, phone: string) => Promise<Customer | null>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (customerId: string, planType: string, startDate: string) => Promise<void>;
  deactivateSubscription: (id: string) => Promise<void>;
  changeSubscription: (id: string, newPlanType: string) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  reactivateSubscription: (id: string) => Promise<void>;
  fetchResources: () => Promise<void>;
  addResource: (data: Partial<Resource>) => Promise<void>;
  updateResource: (id: string, data: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  fetchInventory: () => Promise<void>;
  addInventoryItem: (data: Partial<InventoryItem>) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  fetchActiveSessions: () => Promise<void>;
  startSession: (customerId: string, resourceId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<string | null>;
  addInventoryToSession: (
    sessionId: string,
    inventoryId: string,
    quantity: number
  ) => Promise<void>;
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
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  updatePlanPrice: (planId: string, price: number) => void;
  updateResourceTypePrice: (typeId: string, price: number) => Promise<void>;
  adjustInventoryQuantity: (id: string, delta: number) => Promise<void>;
  seedDatabase: () => Promise<void>;
  fetchDashboardData: () => Promise<void>;
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

// Helper to check if Wails backend is available
const isWailsAvailable = () => {
  return (
    typeof window !== "undefined" &&
    // @ts-ignore
    window.go &&
    // @ts-ignore
    window.go.main &&
    // @ts-ignore
    window.go.main.App
  );
};

// Wait for Wails to be ready with a timeout
const waitForWails = async (retries = 50, delay = 100): Promise<boolean> => {
  if (isWailsAvailable()) return true;
  if (retries === 0) return false;
  await new Promise((resolve) => setTimeout(resolve, delay));
  return waitForWails(retries - 1, delay);
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      customers: [],
      resources: [],
      activeSessions: [],
      subscriptions: [],
      inventory: [],
      invoices: [],
      settings: {
        company: { name: "", address: "", phone: "", email: "" },
        regional: {
          currency: "EGP",
          currencySymbol: "E£",
          timezone: "Africa/Cairo",
          dateFormat: "DD/MM/YYYY",
        },
        tax: { enabled: false, rate: 0 },
        appearance: { theme: "system", language: "ar" },
        discounts: { enabled: false, value: 0, label: "" },
      },
      dashboardMetrics: {
        todayRevenue: 0,
        activeSessions: 0,
        newCustomersToday: 0,
        activeSubscriptions: 0,
      },
      lowStockAlerts: [],
      recentActivity: [],
      revenueChart: [],
      revenueData: {
        today: { sessions: 0, inventory: 0, total: 0 },
        thisWeek: { sessions: 0, inventory: 0, total: 0 },
        thisMonth: { sessions: 0, inventory: 0, total: 0 },
        comparison: { lastMonth: { sessions: 0, inventory: 0, total: 0 }, percentChange: 0 },
      },
      utilizationData: { overallRate: 0, byResource: [], peakHours: [], averageSessionDuration: 0 },
      operationHistory: [],
      topCustomers: [],
      planTypes: [
        { id: "weekly", labelEn: "Weekly", labelAr: "أسبوعي", days: 7, price: 0 },
        { id: "half-monthly", labelEn: "Half-Monthly", labelAr: "نصف شهري", days: 15, price: 0 },
        { id: "monthly", labelEn: "Monthly", labelAr: "شهري", days: 30, price: 0 },
      ],
      categories: [
        { id: "beverage", labelEn: "Beverages", labelAr: "مشروبات" },
        { id: "snack", labelEn: "Snacks", labelAr: "سناكس" },
        { id: "other", labelEn: "Other", labelAr: "أخرى" },
      ],
      theme: "system",
      language: "ar",
      isRTL: true,
      sidebarCollapsed: false,
      isLoading: false,
      isWailsReady: false,

      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        translate(key, get().language, params),

      init: async () => {
        try {
          // 1. Apply persisted state immediately (UI/UX)
          const { theme, language } = get();
          
          // Apply Theme
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

          // Apply Language
          const isRTL = language === "ar";
          document.documentElement.dir = isRTL ? "rtl" : "ltr";
          document.documentElement.lang = language;
          set({ isRTL });

          // 2. Wait for Wails to be ready before fetching data
          console.log("Waiting for Wails runtime...");
          const ready = await waitForWails();
          console.log("Wails Ready Status:", ready);
          set({ isWailsReady: ready });

          if (ready) {
            // 3. Sync Settings from Backend
            try {
                const settings = await App.GetSettings();
                if (settings) {
                  set(
                    produce((state: AppState) => {
                      state.settings = settings as any;
                      if (settings.appearance.theme) {
                        state.theme = settings.appearance.theme as ThemeOption;
                      }
                      if (settings.appearance.language) {
                         state.language = settings.appearance.language as LanguageOption;
                      }
                    })
                  );
                  // Re-apply in case backend settings changed them
                  const newTheme = settings.appearance.theme as ThemeOption;
                  const newLang = settings.appearance.language as LanguageOption;
                  get().setTheme(newTheme);
                  get().setLanguage(newLang);
                }
            } catch (err) {
                console.error("Failed to fetch settings from backend:", err);
            }
            
            // 4. Fetch all other data
            await get().refreshAll();
          } else {
            console.error("Wails runtime not found. App running in detached mode.");
            toast.error("خطأ في الاتصال بالنظام (Backend Disconnected)");
          }
        } catch (e) {
          console.error("Failed to initialize app", e);
        }
      },

      refreshAll: async () => {
        if (!get().isWailsReady) return;
        set({ isLoading: true });
        try {
          await Promise.all([
            get().fetchCustomers(),
            get().fetchResources(),
            get().fetchInventory(),
            get().fetchActiveSessions(),
            get().fetchSubscriptions(),
            get().fetchInvoices(),
            get().fetchDashboardData(),
          ]);
        } catch (error) {
          console.error("Failed to refresh data", error);
        } finally {
          set({ isLoading: false });
        }
      },

      setTheme: (theme) => {
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
        
        if (isWailsAvailable()) {
          App.UpdateSettings(get().settings as any).catch(console.error);
        }
      },

      setLanguage: (language) => {
        const isRTL = language === "ar";
        set(
          produce((state: AppState) => {
            state.language = language;
            state.isRTL = isRTL;
            state.settings.appearance.language = language;
          })
        );
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = language;
        
        if (isWailsAvailable()) {
          App.UpdateSettings(get().settings as any).catch(console.error);
        }
      },

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      fetchCustomers: async () => {
        if (!isWailsAvailable()) return;
        try {
          const customers = await App.GetCustomers();
          set({ customers: customers as any });
        } catch (err) {
          toast.error(String(err));
        }
      },

      addCustomer: async (data: Partial<Customer>) => {
        if (!isWailsAvailable()) return;
        try {
          await App.AddCustomer(data as any);
          toast.success(get().t("success"));
          get().fetchCustomers();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      updateCustomer: async (id, data) => {
        if (!isWailsAvailable()) return;
        try {
          await App.UpdateCustomer(id, data as any);
          toast.success(get().t("success"));
          get().fetchCustomers();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      deleteCustomer: async (id) => {
        if (!isWailsAvailable()) return;
        try {
          await App.DeleteCustomer(id);
          toast.success(get().t("success"));
          get().fetchCustomers();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      checkCustomerDuplicate: async (name, phone) => {
        if (!isWailsAvailable()) return null;
        try {
          const customer = await App.CheckCustomerDuplicate(name, phone);
          return customer as any;
        } catch (err) {
          console.error("Duplicate check failed", err);
          return null;
        }
      },

      fetchResources: async () => {
        if (!isWailsAvailable()) return;
        try {
          const resources = await App.GetResources();
          set({ resources: resources as any });
        } catch (err) {
          toast.error(String(err));
        }
      },

      addResource: async (data: Partial<Resource>) => {
        if (!isWailsAvailable()) return;
        try {
          if (data.ratePerHour) data.ratePerHour = toPiasters(data.ratePerHour);
          await App.AddResource(data as any);
          toast.success(get().t("success"));
          get().fetchResources();
        } catch (err) {
          toast.error(String(err));
        }
      },

      updateResource: async (id, data: Partial<Resource>) => {
        if (!isWailsAvailable()) return;
        try {
          if (data.ratePerHour) data.ratePerHour = toPiasters(data.ratePerHour);
          await App.UpdateResource(id, data as any);
          toast.success(get().t("success"));
          get().fetchResources();
        } catch (err) {
          toast.error(String(err));
        }
      },

      deleteResource: async (id) => {
        if (!isWailsAvailable()) return;
        try {
          await App.DeleteResource(id);
          toast.success(get().t("success"));
          get().fetchResources();
        } catch (err) {
          toast.error(String(err));
        }
      },

      fetchInventory: async () => {
        if (!isWailsAvailable()) return;
        try {
          const inventory = await App.GetInventory();
          set({ inventory: inventory as any });
        } catch (err) {
          toast.error(String(err));
        }
      },

      addInventoryItem: async (data: Partial<InventoryItem>) => {
        if (!isWailsAvailable()) return;
        try {
          if (data.price) data.price = toPiasters(data.price);
          await App.AddInventory(data as any);
          toast.success(get().t("success"));
          get().fetchInventory();
        } catch (err) {
          toast.error(String(err));
        }
      },

      updateInventoryItem: async (id, data: Partial<InventoryItem>) => {
        if (!isWailsAvailable()) return;
        try {
          if (data.price) data.price = toPiasters(data.price);
          await App.UpdateInventory(id, data as any);
          toast.success(get().t("success"));
          get().fetchInventory();
        } catch (err) {
          toast.error(String(err));
        }
      },

      deleteInventoryItem: async (id) => {
        if (!isWailsAvailable()) return;
        try {
          await App.DeleteInventory(id);
          toast.success(get().t("success"));
          get().fetchInventory();
        } catch (err) {
          toast.error(String(err));
        }
      },

      fetchActiveSessions: async () => {
        if (!isWailsAvailable()) return;
        try {
          const activeSessions = await App.GetActiveSessions();
          set({ activeSessions: activeSessions as any });
        } catch (err) {
          toast.error(String(err));
        }
      },

      startSession: async (customerId, resourceId) => {
        if (!isWailsAvailable()) return;
        try {
          await App.StartSession(customerId, resourceId);
          toast.success(get().t("success"));
          get().fetchActiveSessions();
          get().fetchResources();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      endSession: async (sessionId) => {
        if (!isWailsAvailable()) return null;
        try {
          const invoiceId = await App.EndSession(sessionId);
          toast.success(get().t("success"));
          await get().refreshAll();
          return invoiceId;
        } catch (err) {
          toast.error(String(err));
          return null;
        }
      },

      endSessionWithPayment: async (sessionId, paymentMethod, amount) => {
        if (!isWailsAvailable()) return;
        try {
          const invoiceId = await get().endSession(sessionId);
          if (invoiceId && amount > 0) {
            await get().processPayment({
              invoice_id: invoiceId,
              amount: amount / 100,
              payment_method: paymentMethod,
            });
          }
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      addInventoryToSession: async (sessionId, inventoryId, quantity) => {
        if (!isWailsAvailable()) return;
        try {
          await App.AddSessionInventory(sessionId, { inventory_id: inventoryId, quantity });
          toast.success(get().t("success"));
          get().fetchActiveSessions();
          get().fetchInventory();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      fetchInvoices: async () => {
        if (!isWailsAvailable()) return;
        try {
          const invoices = await App.GetInvoices();
          set({ invoices: invoices as any });
        } catch (err) {
          toast.error(String(err));
        }
      },

      processPayment: async (data) => {
        if (!isWailsAvailable()) return;
        try {
          const payload = { ...data, amount: toPiasters(data.amount) };
          await App.ProcessPayment(payload as any);
          toast.success(get().t("success"));
          get().fetchInvoices();
          get().fetchCustomers();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      recordPayment: async (invoiceId, amount, method, notes) => {
        await get().processPayment({
          invoice_id: invoiceId,
          amount,
          payment_method: method,
          notes: notes || "",
        });
      },

      recordBulkPayment: async (invoiceIds, amount, method, notes) => {
        if (!isWailsAvailable()) return;
        try {
          await App.ProcessBulkPayment({
            invoice_ids: invoiceIds,
            amount: toPiasters(amount),
            payment_method: method,
            notes: notes || "",
          });
          toast.success(get().t("success"));
          get().fetchInvoices();
          get().fetchCustomers();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      fetchSubscriptions: async () => {
        if (!isWailsAvailable()) return;
        try {
          const subscriptions = await App.GetSubscriptions();
          set({ subscriptions: subscriptions as any });
        } catch (err) {
          toast.error(String(err));
        }
      },

      addSubscription: async (customerId, planType, startDate) => {
        if (!isWailsAvailable()) return;
        try {
          await App.AddSubscription({
            customer_id: customerId,
            plan_type: planType,
            start_date: startDate,
          });
          toast.success(get().t("success"));
          get().fetchCustomers();
          get().fetchSubscriptions();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      deactivateSubscription: async (id) => {
        if (!isWailsAvailable()) return;
        try {
          await App.DeactivateSubscription(id);
          toast.success(get().t("success"));
          get().fetchSubscriptions();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      changeSubscription: async (id, newPlanType) => {
        if (!isWailsAvailable()) return;
        try {
          await App.ChangeSubscriptionPlan(id, newPlanType);
          toast.success(get().t("success"));
          get().fetchSubscriptions();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      cancelSubscription: async (id) => {
        if (!isWailsAvailable()) return;
        try {
          await App.CancelSubscription(id);
          toast.success(get().t("success"));
          get().fetchSubscriptions();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      reactivateSubscription: async (id) => {
        if (!isWailsAvailable()) return;
        try {
          await App.ReactivateSubscription(id);
          toast.success(get().t("success"));
          get().fetchSubscriptions();
          get().fetchDashboardData();
        } catch (err) {
          toast.error(String(err));
        }
      },

      updateSettings: async (settings) => {
        if (isWailsAvailable()) {
          try {
            await App.UpdateSettings(settings as any);
            toast.success(get().t("success"));
          } catch (err) {
            toast.error(String(err));
          }
        }
        set(
          produce((state: AppState) => {
            Object.assign(state.settings, settings);
          })
        );
      },

      updatePlanPrice: (planId, price) => {
        set(
          produce((state: AppState) => {
            const plan = state.planTypes.find((p) => p.id === planId);
            if (plan) {
              plan.price = price;
            }
          })
        );
        toast.success(get().t("success"));
      },

      updateResourceTypePrice: async (typeId, price) => {
        const { resources } = get();
        const resourcesToUpdate = resources.filter((r) => r.resourceType === typeId);
        
        const piasters = toPiasters(price);
        
        if (isWailsAvailable()) {
          try {
            await Promise.all(
              resourcesToUpdate.map((r) => App.UpdateResource(r.id, { ratePerHour: piasters } as any))
            );
            toast.success(get().t("success"));
          } catch (err) {
            toast.error(String(err));
          }
        }

        set(
          produce((state: AppState) => {
            for (const r of state.resources) {
              if (r.resourceType === typeId) {
                r.ratePerHour = piasters;
              }
            }
          })
        );
      },

      adjustInventoryQuantity: async (id, delta) => {
        if (!isWailsAvailable()) return;
        try {
          await App.AdjustInventoryQuantity(id, delta);
          toast.success(get().t("success"));
          get().fetchInventory();
        } catch (err) {
          toast.error(String(err));
        }
      },

      seedDatabase: async () => {
        if (!isWailsAvailable()) return;
        try {
          set({ isLoading: true });
          const message = await App.SeedDatabase();
          toast.success(message);
          await get().refreshAll();
        } catch (err) {
          toast.error(String(err));
        } finally {
          set({ isLoading: false });
        }
      },

      fetchDashboardData: async () => {
        if (!isWailsAvailable()) return;
        try {
          const metrics = await App.GetDashboardMetrics();
          set({ dashboardMetrics: metrics as any });
        } catch (err) {
          console.warn("Dashboard metrics unavailable", err);
        }
      },

      removeInventoryFromSession: async (sessionId, inventoryId) => {
        if (!isWailsAvailable()) return;
        try {
          await App.RemoveSessionInventory(sessionId, inventoryId);
          toast.success(get().t("success"));
          get().fetchActiveSessions();
          get().fetchInventory();
        } catch (err) {
          toast.error(String(err));
        }
      },

      updateInventoryInSession: async (sessionId, inventoryId, quantity) => {
        if (!isWailsAvailable()) return;
        try {
          await App.UpdateSessionInventory(sessionId, inventoryId, quantity);
          toast.success(get().t("success"));
          get().fetchActiveSessions();
          get().fetchInventory();
        } catch (err) {
          toast.error(String(err));
        }
      },
    }),
    {
      name: "backspace-app-storage",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        isRTL: state.isRTL,
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      }),
    }
  )
);
