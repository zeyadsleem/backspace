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

export const api = {
  customers: {
    list: () => invoke<Customer[]>("get_customers"),
    get: (id: string) => invoke<Customer>("get_customer", { id }),
    create: (data: CreateCustomer) => invoke<Customer>("create_customer", { data }),
    update: (id: string, data: UpdateCustomer) => invoke<Customer>("update_customer", { id, data }),
    delete: (id: string) => invoke<void>("delete_customer", { id }),
  },
  database: {
    reset: () => invoke<void>("reset_database"),
  },
};
