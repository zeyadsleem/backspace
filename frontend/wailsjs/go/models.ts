export namespace main {
	
	export class AddSubscriptionData {
	    customer_id: string;
	    plan_type: string;
	    price: number;
	    start_date: string;
	
	    static createFrom(source: any = {}) {
	        return new AddSubscriptionData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.customer_id = source["customer_id"];
	        this.plan_type = source["plan_type"];
	        this.price = source["price"];
	        this.start_date = source["start_date"];
	    }
	}
	export class BulkPaymentData {
	    invoice_ids: string[];
	    amount: number;
	    payment_method: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new BulkPaymentData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.invoice_ids = source["invoice_ids"];
	        this.amount = source["amount"];
	        this.payment_method = source["payment_method"];
	        this.notes = source["notes"];
	    }
	}
	export class ProcessPaymentData {
	    invoice_id: string;
	    amount: number;
	    payment_method: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new ProcessPaymentData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.invoice_id = source["invoice_id"];
	        this.amount = source["amount"];
	        this.payment_method = source["payment_method"];
	        this.notes = source["notes"];
	    }
	}

}

export namespace models {
	
	export class AppearanceSettings {
	    theme: string;
	    language: string;
	
	    static createFrom(source: any = {}) {
	        return new AppearanceSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.theme = source["theme"];
	        this.language = source["language"];
	    }
	}
	export class CompanySettings {
	    name: string;
	    address: string;
	    phone: string;
	    email: string;
	
	    static createFrom(source: any = {}) {
	        return new CompanySettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.address = source["address"];
	        this.phone = source["phone"];
	        this.email = source["email"];
	    }
	}
	export class Payment {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    invoiceId: string;
	    amount: number;
	    method: string;
	    date: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new Payment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.invoiceId = source["invoiceId"];
	        this.amount = source["amount"];
	        this.method = source["method"];
	        this.date = source["date"];
	        this.notes = source["notes"];
	    }
	}
	export class LineItem {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    invoiceId: string;
	    description: string;
	    quantity: number;
	    rate: number;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new LineItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.invoiceId = source["invoiceId"];
	        this.description = source["description"];
	        this.quantity = source["quantity"];
	        this.rate = source["rate"];
	        this.amount = source["amount"];
	    }
	}
	export class Invoice {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    invoiceNumber: string;
	    customerId: string;
	    customerName: string;
	    customerPhone: string;
	    sessionId?: string;
	    amount: number;
	    discount: number;
	    total: number;
	    paidAmount: number;
	    status: string;
	    dueDate: string;
	    paidDate?: string;
	    lineItems: LineItem[];
	    payments: Payment[];
	
	    static createFrom(source: any = {}) {
	        return new Invoice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.invoiceNumber = source["invoiceNumber"];
	        this.customerId = source["customerId"];
	        this.customerName = source["customerName"];
	        this.customerPhone = source["customerPhone"];
	        this.sessionId = source["sessionId"];
	        this.amount = source["amount"];
	        this.discount = source["discount"];
	        this.total = source["total"];
	        this.paidAmount = source["paidAmount"];
	        this.status = source["status"];
	        this.dueDate = source["dueDate"];
	        this.paidDate = source["paidDate"];
	        this.lineItems = this.convertValues(source["lineItems"], LineItem);
	        this.payments = this.convertValues(source["payments"], Payment);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Subscription {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    customerId: string;
	    customerName: string;
	    planType: string;
	    price: number;
	    startDate: string;
	    endDate: string;
	    isActive: boolean;
	    status: string;
	    invoiceId?: string;
	    daysRemaining: number;
	
	    static createFrom(source: any = {}) {
	        return new Subscription(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.customerId = source["customerId"];
	        this.customerName = source["customerName"];
	        this.planType = source["planType"];
	        this.price = source["price"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	        this.isActive = source["isActive"];
	        this.status = source["status"];
	        this.invoiceId = source["invoiceId"];
	        this.daysRemaining = source["daysRemaining"];
	    }
	}
	export class Customer {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    humanId: string;
	    name: string;
	    phone: string;
	    email?: string;
	    customerType: string;
	    balance: number;
	    notes?: string;
	    totalSessions: number;
	    totalSpent: number;
	    subscriptions: Subscription[];
	    invoices: Invoice[];
	
	    static createFrom(source: any = {}) {
	        return new Customer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.humanId = source["humanId"];
	        this.name = source["name"];
	        this.phone = source["phone"];
	        this.email = source["email"];
	        this.customerType = source["customerType"];
	        this.balance = source["balance"];
	        this.notes = source["notes"];
	        this.totalSessions = source["totalSessions"];
	        this.totalSpent = source["totalSpent"];
	        this.subscriptions = this.convertValues(source["subscriptions"], Subscription);
	        this.invoices = this.convertValues(source["invoices"], Invoice);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DashboardMetrics {
	    todayRevenue: number;
	    activeSessions: number;
	    newCustomersToday: number;
	    activeSubscriptions: number;
	
	    static createFrom(source: any = {}) {
	        return new DashboardMetrics(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.todayRevenue = source["todayRevenue"];
	        this.activeSessions = source["activeSessions"];
	        this.newCustomersToday = source["newCustomersToday"];
	        this.activeSubscriptions = source["activeSubscriptions"];
	    }
	}
	export class DiscountSettings {
	    enabled: boolean;
	    value: number;
	    label: string;
	
	    static createFrom(source: any = {}) {
	        return new DiscountSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.value = source["value"];
	        this.label = source["label"];
	    }
	}
	export class InventoryConsumption {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    sessionId: string;
	    itemId: string;
	    itemName: string;
	    quantity: number;
	    price: number;
	    addedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new InventoryConsumption(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.sessionId = source["sessionId"];
	        this.itemId = source["itemId"];
	        this.itemName = source["itemName"];
	        this.quantity = source["quantity"];
	        this.price = source["price"];
	        this.addedAt = source["addedAt"];
	    }
	}
	export class InventoryItem {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    name: string;
	    category: string;
	    price: number;
	    quantity: number;
	    minStock: number;
	
	    static createFrom(source: any = {}) {
	        return new InventoryItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.name = source["name"];
	        this.category = source["category"];
	        this.price = source["price"];
	        this.quantity = source["quantity"];
	        this.minStock = source["minStock"];
	    }
	}
	
	
	
	export class RegionalSettings {
	    currency: string;
	    currencySymbol: string;
	    timezone: string;
	    dateFormat: string;
	
	    static createFrom(source: any = {}) {
	        return new RegionalSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.currency = source["currency"];
	        this.currencySymbol = source["currencySymbol"];
	        this.timezone = source["timezone"];
	        this.dateFormat = source["dateFormat"];
	    }
	}
	export class Resource {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    name: string;
	    resourceType: string;
	    ratePerHour: number;
	    isAvailable: boolean;
	    utilizationRate: number;
	
	    static createFrom(source: any = {}) {
	        return new Resource(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.name = source["name"];
	        this.resourceType = source["resourceType"];
	        this.ratePerHour = source["ratePerHour"];
	        this.isAvailable = source["isAvailable"];
	        this.utilizationRate = source["utilizationRate"];
	    }
	}
	export class Session {
	    id: string;
	    createdAt: string;
	    updatedAt: string;
	    customerId: string;
	    customerName: string;
	    resourceId: string;
	    resourceName: string;
	    resourceRate: number;
	    startedAt: string;
	    endedAt?: string;
	    isSubscribed: boolean;
	    inventoryConsumptions: InventoryConsumption[];
	    inventoryTotal: number;
	    sessionCost: number;
	    totalAmount: number;
	    durationMinutes: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new Session(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.customerId = source["customerId"];
	        this.customerName = source["customerName"];
	        this.resourceId = source["resourceId"];
	        this.resourceName = source["resourceName"];
	        this.resourceRate = source["resourceRate"];
	        this.startedAt = source["startedAt"];
	        this.endedAt = source["endedAt"];
	        this.isSubscribed = source["isSubscribed"];
	        this.inventoryConsumptions = this.convertValues(source["inventoryConsumptions"], InventoryConsumption);
	        this.inventoryTotal = source["inventoryTotal"];
	        this.sessionCost = source["sessionCost"];
	        this.totalAmount = source["totalAmount"];
	        this.durationMinutes = source["durationMinutes"];
	        this.status = source["status"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SessionInventoryInput {
	    inventory_id: string;
	    quantity: number;
	
	    static createFrom(source: any = {}) {
	        return new SessionInventoryInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.inventory_id = source["inventory_id"];
	        this.quantity = source["quantity"];
	    }
	}
	export class TaxSettings {
	    enabled: boolean;
	    rate: number;
	
	    static createFrom(source: any = {}) {
	        return new TaxSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.rate = source["rate"];
	    }
	}
	export class Settings {
	    company: CompanySettings;
	    regional: RegionalSettings;
	    tax: TaxSettings;
	    appearance: AppearanceSettings;
	    discounts: DiscountSettings;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.company = this.convertValues(source["company"], CompanySettings);
	        this.regional = this.convertValues(source["regional"], RegionalSettings);
	        this.tax = this.convertValues(source["tax"], TaxSettings);
	        this.appearance = this.convertValues(source["appearance"], AppearanceSettings);
	        this.discounts = this.convertValues(source["discounts"], DiscountSettings);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

