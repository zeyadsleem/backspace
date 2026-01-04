import { invoke } from "@tauri-apps/api/core";

export interface Customer {
  id: string;
  humanId: string;
  name: string;
  phone: string;
  email?: string;
  customerType: string;
  notes?: string;
  createdAt: string;
}

export interface CreateCustomer {
  name: string;
  phone: string;
  email?: string;
  customerType: string;
  notes?: string;
}

export interface UpdateCustomer {
  name?: string;
  phone?: string;
  email?: string;
  customerType?: string;
  notes?: string;
}

export interface Resource {
  id: string;
  name: string;
  resourceType: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CreateResource {
  name: string;
  resourceType: string;
}

export interface UpdateResource {
  name?: string;
  resourceType?: string;
  isAvailable?: boolean;
}

export interface Session {
  id: string;
  customerId: string;
  resourceId: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  amount: number | null;
  createdAt: string;
}

export interface SessionWithDetails {
  id: string;
  customerId: string;
  customerName: string;
  customerHumanId: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  amount: number | null;
  createdAt: string;
}

export interface CreateSession {
  customerId: string;
  resourceId: string;
}

export interface Inventory {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  price: number;
  createdAt: string;
}

export interface CreateInventory {
  name: string;
  quantity: number;
  minStock: number;
  price: number;
}

export interface UpdateInventory {
  name?: string;
  quantity?: number;
  minStock?: number;
  price?: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string | null;
  customerHumanId: string | null;
  planType: string;
  startDate: string;
  endDate: string | null;
  hoursAllowance: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSubscription {
  customerId: string;
  planType: string;
  startDate: string;
  endDate: string | null;
  hoursAllowance: number | null;
}

export interface UpdateSubscription {
  planType?: string;
  startDate?: string;
  endDate?: string | null;
  hoursAllowance?: number | null;
  isActive?: boolean;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string | null;
  customerHumanId: string | null;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceWithItems {
  id: string;
  customerId: string;
  customerName: string | null;
  customerHumanId: string | null;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
  createdAt: string;
  items: InvoiceItem[];
}

export interface CreateInvoice {
  customerId: string;
  amount: number;
  status: string;
  dueDate: string;
  items: CreateInvoiceItem[];
}

export interface CreateInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateInvoice {
  status?: string;
  paidDate?: string;
}

export const api = {
  customers: {
    list: () => invoke<Customer[]>("get_customers"),
    get: (id: string) => invoke<Customer>("get_customer", { id }),
    create: (data: CreateCustomer) => invoke<Customer>("create_customer", { data }),
    update: (id: string, data: UpdateCustomer) => invoke<Customer>("update_customer", { id, data }),
    delete: (id: string) => invoke<void>("delete_customer", { id }),
  },
  resources: {
    list: () => invoke<Resource[]>("get_resources"),
    get: (id: string) => invoke<Resource>("get_resource", { id }),
    create: (data: CreateResource) => invoke<Resource>("create_resource", { data }),
    update: (id: string, data: UpdateResource) => invoke<Resource>("update_resource", { id, data }),
    delete: (id: string) => invoke<void>("delete_resource", { id }),
  },
  sessions: {
    list: () => invoke<SessionWithDetails[]>("get_sessions"),
    get: (id: string) => invoke<SessionWithDetails>("get_session", { id }),
    getActive: () => invoke<SessionWithDetails[]>("get_active_sessions"),
    start: (data: CreateSession) => invoke<Session>("start_session", { data }),
    end: (id: string) => invoke<SessionWithDetails>("end_session", { id }),
  },
  inventory: {
    list: () => invoke<Inventory[]>("get_inventory"),
    get: (id: string) => invoke<Inventory>("get_inventory_item", { id }),
    create: (data: CreateInventory) => invoke<Inventory>("create_inventory", { data }),
    update: (id: string, data: UpdateInventory) =>
      invoke<Inventory>("update_inventory", { id, data }),
    delete: (id: string) => invoke<void>("delete_inventory", { id }),
  },
  subscriptions: {
    list: () => invoke<Subscription[]>("get_subscriptions"),
    get: (id: string) => invoke<Subscription>("get_subscription", { id }),
    create: (data: CreateSubscription) => invoke<Subscription>("create_subscription", { data }),
    update: (id: string, data: UpdateSubscription) =>
      invoke<Subscription>("update_subscription", { id, data }),
    delete: (id: string) => invoke<void>("delete_subscription", { id }),
  },
  invoices: {
    list: () => invoke<Invoice[]>("get_invoices"),
    get: (id: string) => invoke<InvoiceWithItems>("get_invoice", { id }),
    create: (data: CreateInvoice) => invoke<Invoice>("create_invoice", { data }),
    update: (id: string, data: UpdateInvoice) => invoke<Invoice>("update_invoice", { id, data }),
    delete: (id: string) => invoke<void>("delete_invoice", { id }),
  },
  database: {
    reset: () => invoke<void>("reset_database"),
  },
};
