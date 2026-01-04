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
  database: {
    reset: () => invoke<void>("reset_database"),
  },
};
