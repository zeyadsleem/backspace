import { useMemo } from "react";
import type { DashboardMetrics, LowStockAlert, Resource, TopCustomer } from "@/types";
import { useAppStore } from "./useAppStore";

// Re-export useAppStore so it can be used directly
export { useAppStore } from "./useAppStore";

// Optimized hooks to prevent infinite loops
export const useCustomers = () => useAppStore((state) => state.customers);
export const useResources = () => useAppStore((state) => state.resources);
export const useActiveSessions = () => useAppStore((state) => state.activeSessions);
export const useSubscriptions = () => useAppStore((state) => state.subscriptions);
export const useInventory = () => useAppStore((state) => state.inventory);
export const useInvoices = () => useAppStore((state) => state.invoices);
export const useSettings = () => useAppStore((state) => state.settings);
export const useRecentActivity = () => useAppStore((state) => state.recentActivity);
export const useTranslation = () => useAppStore((state) => state.t);
export const useLanguage = () => useAppStore((state) => state.language);
export const useTheme = () => useAppStore((state) => state.theme);
export const useIsRTL = () => useAppStore((state) => state.isRTL);

// Computed hooks with memoization
export const useDashboardMetrics = (): DashboardMetrics => {
  const backendMetrics = useAppStore((state) => state.dashboardMetrics);
  const activeSessions = useAppStore((state) => state.activeSessions);
  const subscriptions = useAppStore((state) => state.subscriptions);
  const resources = useAppStore((state) => state.resources);
  const invoices = useAppStore((state) => state.invoices);
  const customers = useAppStore((state) => state.customers);

  return useMemo(() => {
    // If backend metrics are loaded and non-zero (or just trust them)
    // Actually, backendMetrics is initialized with sample data in store initially.
    // In a real app, we check if they've been fetched.

    // For now, let's keep the client-side calculation as it provides "Live" updates
    // before the next poll/refresh, but let's align it with backend fields.

    const today = new Date().toISOString().split("T")[0];

    // Calculate today's invoices
    const todayInvoices = invoices.filter((inv) => inv.createdAt.startsWith(today));

    let sessionRev = 0;
    let inventoryRev = 0;

    for (const inv of todayInvoices) {
      for (const item of inv.lineItems) {
        const desc = item.description.toLowerCase();
        if (
          desc.includes("session") ||
          desc.includes("جلسة") ||
          desc.includes("subscription") ||
          desc.includes("اشتراك")
        ) {
          sessionRev += item.amount;
        } else {
          inventoryRev += item.amount;
        }
      }
    }

    const todayTotal = sessionRev + inventoryRev;
    const newCustomersToday = customers.filter((c) => c.createdAt.startsWith(today)).length;

    // We can merge backend metrics with live client state for better UX
    return {
      todayRevenue: todayTotal || backendMetrics.todayRevenue,
      sessionRevenue: sessionRev || backendMetrics.sessionRevenue,
      inventoryRevenue: inventoryRev || backendMetrics.inventoryRevenue,
      activeSessions: activeSessions.length,
      newCustomersToday: newCustomersToday || backendMetrics.newCustomersToday,
      activeSubscriptions: subscriptions.filter((s) => s.status === "active").length,
      resourceUtilization:
        resources.length > 0
          ? Math.round((resources.filter((r) => !r.isAvailable).length / resources.length) * 100)
          : backendMetrics.resourceUtilization,
    };
  }, [backendMetrics, activeSessions.length, subscriptions, resources, invoices, customers]);
};

export const useLowStockAlerts = (): LowStockAlert[] => {
  const inventory = useAppStore((state) => state.inventory);

  return useMemo(
    () =>
      inventory
        .filter((item) => item.quantity <= item.minStock && item.quantity > 0)
        .map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          minStock: item.minStock,
        })),
    [inventory]
  );
};

export const useTopCustomers = (): TopCustomer[] => {
  const customers = useAppStore((state) => state.customers);

  return useMemo(
    () =>
      [...customers]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
        .map((c) => ({ id: c.id, name: c.name, revenue: c.totalSpent })),
    [customers]
  );
};

export const useAvailableResources = (): Resource[] => {
  const resources = useAppStore((state) => state.resources);

  return useMemo(() => resources.filter((r) => r.isAvailable), [resources]);
};

export const useSessionActions = () => {
  const startSession = useAppStore((state) => state.startSession);
  const endSession = useAppStore((state) => state.endSession);
  const addInventoryToSession = useAppStore((state) => state.addInventoryToSession);

  return { startSession, endSession, addInventoryToSession };
};

export const useCustomerActions = () => {
  const addCustomer = useAppStore((state) => state.addCustomer);
  const updateCustomer = useAppStore((state) => state.updateCustomer);
  const deleteCustomer = useAppStore((state) => state.deleteCustomer);

  return { addCustomer, updateCustomer, deleteCustomer };
};

export const useResourceActions = () => {
  const addResource = useAppStore((state) => state.addResource);
  const updateResource = useAppStore((state) => state.updateResource);
  const deleteResource = useAppStore((state) => state.deleteResource);

  return { addResource, updateResource, deleteResource };
};

export const useInventoryActions = () => {
  const addInventoryItem = useAppStore((state) => state.addInventoryItem);
  const updateInventoryItem = useAppStore((state) => state.updateInventoryItem);
  const deleteInventoryItem = useAppStore((state) => state.deleteInventoryItem);
  const adjustInventoryQuantity = useAppStore((state) => state.adjustInventoryQuantity);

  return {
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustInventoryQuantity,
  };
};

export const useSubscriptionActions = () => {
  const addSubscription = useAppStore((state) => state.addSubscription);
  const deactivateSubscription = useAppStore((state) => state.deactivateSubscription);

  return { addSubscription, deactivateSubscription };
};

export const useInvoiceActions = () => {
  const recordPayment = useAppStore((state) => state.recordPayment);

  return { recordPayment };
};

export const useSettingsActions = () => {
  const updateSettings = useAppStore((state) => state.updateSettings);

  return { updateSettings };
};

export const useThemeActions = () => {
  const setTheme = useAppStore((state) => state.setTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return { setTheme, setLanguage };
};

// Dashboard specific hook
export const useDashboardData = () => {
  const dashboardMetrics = useDashboardMetrics();
  const lowStockAlerts = useLowStockAlerts();
  const recentActivity = useAppStore((state) => state.recentActivity);
  const revenueChart = useAppStore((state) => state.revenueChart);
  const topCustomers = useTopCustomers();

  return {
    dashboardMetrics,
    lowStockAlerts,
    recentActivity,
    revenueChart,
    topCustomers,
  };
};
