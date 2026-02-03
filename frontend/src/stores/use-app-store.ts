import { produce } from "immer";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toPiasters } from "@/lib/formatters";
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
	Resource,
	RevenueData,
	RevenueDataPoint,
	Settings,
	Subscription,
	ThemeOption,
	TopCustomer,
	UtilizationData,
} from "@/types";
import * as App from "../../wailsjs/go/main/App";

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
	refundSubscription: (id: string, method: string) => Promise<void>;
	upgradeSubscription: (data: {
		customer_id: string;
		new_plan: string;
		new_price: number;
		start_date: string;
	}) => Promise<void>;
	cancelSubscription: (id: string) => Promise<void>;
	reactivateSubscription: (id: string) => Promise<void>;
	updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;
	deleteSubscription: (id: string) => Promise<void>;
	withdrawBalance: (customerId: string, amount: number) => Promise<void>;
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
		quantity: number,
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
		notes?: string,
	) => Promise<void>;
	recordBulkPayment: (
		invoiceIds: string[],
		amount: number,
		method: string,
		notes?: string,
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
		quantity: number,
	) => Promise<void>;
	endSessionWithPayment: (
		sessionId: string,
		paymentMethod: string,
		amount: number,
	) => Promise<void>;
}

type AppStore = AppState & AppActions;

// Extend Window interface for Wails runtime
declare global {
	interface Window {
		go?: {
			main?: {
				App?: typeof App;
			};
		};
	}
}

// Helper to check if Wails backend is available
const isWailsAvailable = (): boolean => {
	return typeof window !== "undefined" && window.go?.main?.App !== undefined;
};

// Wait for Wails to be ready with a more robust retry logic
const waitForWails = async (retries = 50, delay = 200): Promise<boolean> => {
	if (isWailsAvailable()) {
		console.log("✅ Wails Runtime Detected");
		return true;
	}
	if (retries <= 0) return false;
	await new Promise((resolve) => setTimeout(resolve, delay));
	return waitForWails(retries - 1, delay);
};

// Track if init retry is already scheduled to prevent stacking
let initRetryScheduled = false;

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
				// 1. Apply UI/UX configs (Theme/RTL) immediately
				const { theme, language } = get();
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
				const isRTL = language === "ar";
				document.documentElement.dir = isRTL ? "rtl" : "ltr";
				document.documentElement.lang = language;
				set({ isRTL });

				// 2. Start the connection bridge
				console.log("🔗 Attempting to connect to Backend...");
				const ready = await waitForWails();

				if (ready) {
					set({ isWailsReady: true });
					initRetryScheduled = false; // Reset retry flag on success

					// 3. Sync Settings and Data
					try {
						const settings = await App.GetSettings();
						if (settings) {
							set(
								produce((state: AppState) => {
									state.settings = settings as Settings;
									state.theme = (settings.appearance.theme || state.theme) as ThemeOption;
									state.language = (settings.appearance.language ||
										state.language) as LanguageOption;
								}),
							);
							get().setTheme(get().theme);
							get().setLanguage(get().language);
						}
						await get().refreshAll();
						console.log("🚀 System Synchronized Successfully");
					} catch (err) {
						console.error("❌ Sync Error:", err);
					}
				} else {
					console.warn("⚠️ Backend connection timeout. Retrying in background...");
					// Prevent multiple retry timers from stacking
					if (!initRetryScheduled) {
						initRetryScheduled = true;
						setTimeout(() => {
							initRetryScheduled = false;
							get().init();
						}, 2000);
					}
				}
			},

			refreshAll: async () => {
				// Double check availability before calling Go methods
				if (!isWailsAvailable()) {
					set({ isWailsReady: false });
					return;
				}

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
					set({ isWailsReady: true });
				} catch (error) {
					console.error("Failed to refresh data", error);
					// If we get a generic 'window.go is undefined' error here, set ready to false
					if (String(error).includes("undefined")) {
						set({ isWailsReady: false });
					}
				} finally {
					set({ isLoading: false });
				}
			},

			setTheme: (theme) => {
				set(
					produce((state: AppState) => {
						state.theme = theme;
						state.settings.appearance.theme = theme;
					}),
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
					App.UpdateSettings(get().settings).catch(console.error);
				}
			},

			setLanguage: (language) => {
				const isRTL = language === "ar";
				set(
					produce((state: AppState) => {
						state.language = language;
						state.isRTL = isRTL;
						state.settings.appearance.language = language;
					}),
				);
				document.documentElement.dir = isRTL ? "rtl" : "ltr";
				document.documentElement.lang = language;

				if (isWailsAvailable()) {
					App.UpdateSettings(get().settings).catch(console.error);
				}
			},

			setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

			fetchCustomers: async () => {
				if (!isWailsAvailable()) return;
				try {
					const customers = await App.GetCustomers();
					set({ customers: customers });
				} catch (err) {
					toast.error(String(err));
				}
			},

			addCustomer: async (data: Partial<Customer>) => {
				if (!isWailsAvailable()) return;
				try {
					await App.AddCustomer(data);
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
					await App.UpdateCustomer(id, data);
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
					return customer;
				} catch (err) {
					console.error("Duplicate check failed", err);
					return null;
				}
			},

			fetchResources: async () => {
				if (!isWailsAvailable()) return;
				try {
					const resources = await App.GetResources();
					set({ resources: resources });
				} catch (err) {
					toast.error(String(err));
				}
			},

			addResource: async (data: Partial<Resource>) => {
				if (!isWailsAvailable()) return;
				try {
					if (data.ratePerHour) data.ratePerHour = toPiasters(data.ratePerHour);
					await App.AddResource(data);
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
					await App.UpdateResource(id, data);
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
					set({ inventory: inventory });
				} catch (err) {
					toast.error(String(err));
				}
			},

			addInventoryItem: async (data: Partial<InventoryItem>) => {
				if (!isWailsAvailable()) return;
				try {
					if (data.price) data.price = toPiasters(data.price);
					await App.AddInventory(data);
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
					await App.UpdateInventory(id, data);
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
					set({ activeSessions: activeSessions });
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
					if (!invoiceId) {
						return;
					}
					if (amount > 0) {
						await get().processPayment({
							invoice_id: invoiceId,
							amount: amount / 100,
							payment_method: paymentMethod,
						});
					}
					await get().fetchDashboardData();
				} catch (err) {
					toast.error(String(err));
					throw err; // Re-throw so UI can handle it
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
					set({ invoices: invoices });
				} catch (err) {
					toast.error(String(err));
				}
			},

			processPayment: async (data) => {
				if (!isWailsAvailable()) return;
				try {
					const payload = { ...data, amount: toPiasters(data.amount) };
					await App.ProcessPayment(payload);
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
					set({ subscriptions: subscriptions });
				} catch (err) {
					toast.error(String(err));
				}
			},

			addSubscription: async (customerId: string, planType: string, startDate: string) => {
				if (!isWailsAvailable()) return;
				try {
					const plan = get().planTypes.find((p) => p.id === planType);
					const price = plan ? toPiasters(plan.price) : 0;

					await App.AddSubscription({
						customer_id: customerId,
						plan_type: planType,
						price: price,
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

			refundSubscription: async (id, method) => {
				if (!isWailsAvailable()) return;
				try {
					await App.RefundSubscription(id, method);
					toast.success(get().t("success"));
					get().fetchSubscriptions();
					get().fetchCustomers();
					get().fetchDashboardData();
				} catch (err) {
					toast.error(String(err));
				}
			},

			upgradeSubscription: async (data) => {
				if (!isWailsAvailable()) return;
				try {
					await App.UpgradeSubscription({
						...data,
						new_price: toPiasters(data.new_price),
					});
					toast.success(get().t("success"));
					get().fetchSubscriptions();
					get().fetchCustomers();
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

			updateSubscription: async (id, data) => {
				if (!isWailsAvailable()) return;
				try {
					await App.UpdateSubscription(id, data);
					toast.success(get().t("success"));
					get().fetchSubscriptions();
				} catch (err) {
					toast.error(String(err));
				}
			},

			deleteSubscription: async (id) => {
				if (!isWailsAvailable()) return;
				try {
					await App.DeleteSubscription(id);
					toast.success(get().t("success"));
					get().fetchSubscriptions();
					get().fetchCustomers();
				} catch (err) {
					toast.error(String(err));
				}
			},

			withdrawBalance: async (customerId, amount) => {
				if (!isWailsAvailable()) return;
				try {
					await App.WithdrawBalance(customerId, toPiasters(amount));
					toast.success(get().t("success"));
					get().fetchCustomers();
					get().fetchInvoices();
					get().fetchDashboardData();
				} catch (err) {
					toast.error(String(err));
				}
			},

			updateSettings: async (settings) => {
				if (!isWailsAvailable()) return;
				try {
					await App.UpdateSettings(settings as Settings);
					set(
						produce((state: AppState) => {
							Object.assign(state.settings, settings);
						}),
					);
					toast.success(get().t("success"));
				} catch (err) {
					toast.error(String(err));
					throw err;
				}
			},

			updatePlanPrice: (planId, price) => {
				set(
					produce((state: AppState) => {
						const plan = state.planTypes.find((p) => p.id === planId);
						if (plan) {
							plan.price = price;
						}
					}),
				);
				toast.success(get().t("success"));
			},

			updateResourceTypePrice: async (typeId, price) => {
				const { resources } = get();
				const resourcesToUpdate = resources.filter((r) => r.resourceType === typeId);

				if (!isWailsAvailable() || resourcesToUpdate.length === 0) return;

				const piasters = toPiasters(price);

				try {
					await Promise.all(
						resourcesToUpdate.map((r) => App.UpdateResource(r.id, { ratePerHour: piasters })),
					);
					set(
						produce((state: AppState) => {
							for (const r of state.resources) {
								if (r.resourceType === typeId) {
									r.ratePerHour = piasters;
								}
							}
						}),
					);
					toast.success(get().t("success"));
				} catch (err) {
					toast.error(String(err));
					throw err;
				}
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
					const message = await App.ResetAndSeedDatabase();
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
					set({ dashboardMetrics: metrics });
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
		},
	),
);
