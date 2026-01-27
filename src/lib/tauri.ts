import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { type TranslationKey } from "@/lib/translations";
import type { 
  Customer, 
  Resource, 
  InventoryItem, 
  ActiveSession, 
  Subscription, 
  Invoice, 
  Settings,
  DashboardMetrics,
  RevenueDataPoint,
  TopCustomer,
  RecentActivityView,
  RevenueData,
  UtilizationData,
  OperationRecord
} from "@/types";

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Sample Data for Mocks
const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", humanId: "CUST-001", name: "Ahmed Ali", phone: "01012345678", email: "ahmed@example.com", customerType: "monthly", balance: 0, notes: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), totalSessions: 10, totalSpent: 5000 },
  { id: "2", humanId: "CUST-002", name: "Sara Mohamed", phone: "01112345678", email: "sara@example.com", customerType: "visitor", balance: 50, notes: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), totalSessions: 2, totalSpent: 150 },
];

const MOCK_RESOURCES: Resource[] = [
  { id: "1", name: "Room A", resourceType: "room", ratePerHour: 50, isAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), utilizationRate: 75 },
  { id: "2", name: "Desk 1", resourceType: "desk", ratePerHour: 20, isAvailable: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), utilizationRate: 40 },
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: "1", name: "Coffee", category: "beverage", price: 25, quantity: 100, minStock: 20, createdAt: new Date().toISOString() },
  { id: "2", name: "Tea", category: "beverage", price: 15, quantity: 80, minStock: 20, createdAt: new Date().toISOString() },
  { id: "3", name: "Chips", category: "snack", price: 10, quantity: 50, minStock: 10, createdAt: new Date().toISOString() },
];

const MOCK_SETTINGS: Settings = {
  company: { name: "Backspace", address: "Cairo, Egypt", phone: "01000000000", email: "info@backspace.com" },
  regional: { currency: "EGP", currencySymbol: "E£", timezone: "Africa/Cairo", dateFormat: "DD/MM/YYYY" },
  tax: { enabled: true, rate: 14 },
  appearance: { theme: "light", language: "ar" },
  discounts: { enabled: true, value: 10, label: "Student Discount" },
};

export async function invoke<T>(cmd: string, args?: any): Promise<T> {
  if (isTauri) {
    return tauriInvoke(cmd, args);
  }

  console.log(`[Mock Invoke] ${cmd}`, args);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  switch (cmd) {
    case "get_settings":
      return MOCK_SETTINGS as unknown as T;
    
    case "get_customers":
      return MOCK_CUSTOMERS as unknown as T;
      
    case "get_resources":
      return MOCK_RESOURCES as unknown as T;
      
    case "get_inventory":
      return MOCK_INVENTORY as unknown as T;
      
    case "get_active_sessions":
      return [] as unknown as T;
      
    case "get_subscriptions":
      return [] as unknown as T;
      
    case "get_invoices":
      return [] as unknown as T;

    case "get_dashboard_metrics":
      return {
        todayRevenue: 1250,
        sessionRevenue: 850,
        inventoryRevenue: 400,
        activeSessions: 5,
        newCustomersToday: 2,
        activeSubscriptions: 12,
        resourceUtilization: 65,
      } as unknown as T;

    case "get_revenue_chart_data":
      // Generate last 7 days data
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split('T')[0],
          sessions: Math.floor(Math.random() * 1000) + 500,
          inventory: Math.floor(Math.random() * 500) + 100,
        };
      }) as unknown as T;

    case "get_top_customers":
      return [
        { id: "1", name: "Ahmed Ali", revenue: 5000 },
        { id: "2", name: "Sara Mohamed", revenue: 3200 },
        { id: "3", name: "Mahmoud Hassan", revenue: 2100 },
        { id: "4", name: "Nour Ezz", revenue: 1800 },
        { id: "5", name: "Omar Khaled", revenue: 1200 },
      ] as unknown as T;

    case "get_recent_activity":
      return [
        { id: "1", description: "Ahmed Ali started a session", operation_type: "session_start", timestamp: new Date().toISOString() },
        { id: "2", description: "Payment received from Sara", operation_type: "invoice_paid", timestamp: new Date(Date.now() - 3600000).toISOString() },
      ] as unknown as T;

    case "get_revenue_report":
      return {
        today: { sessions: 850, inventory: 400, total: 1250 },
        this_week: { sessions: 5000, inventory: 2000, total: 7000 },
        this_month: { sessions: 20000, inventory: 8000, total: 28000 },
        comparison: {
          last_month: { sessions: 18000, inventory: 7000, total: 25000 },
          percent_change: 12.5,
        },
      } as unknown as T;

    case "get_utilization_report":
      return {
        overall_rate: 65,
        average_session_duration: 125, // minutes
        by_resource: [
          { id: "1", name: "Room A", rate: 85 },
          { id: "2", name: "Desk 1", rate: 45 },
          { id: "3", name: "Desk 2", rate: 30 },
        ],
        peak_hours: [
          { hour: 9, occupancy: 20 },
          { hour: 12, occupancy: 85 },
          { hour: 15, occupancy: 60 },
          { hour: 18, occupancy: 90 },
          { hour: 21, occupancy: 40 },
        ],
      } as unknown as T;

    case "get_operation_history":
      return [
        { id: "1", description: "Session started for Ahmed", operation_type: "session_start", timestamp: new Date().toISOString() },
        { id: "2", description: "Inventory added: Coffee", operation_type: "inventory_add", timestamp: new Date(Date.now() - 7200000).toISOString() },
      ] as unknown as T;

    default:
      console.warn(`[Mock Invoke] No mock implementation for command: ${cmd}`);
      return null as unknown as T;
  }
}
