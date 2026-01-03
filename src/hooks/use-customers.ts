import { useQuery } from "@tanstack/react-query";
import { api, type Customer } from "@/lib/tauri-api";

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => api.customers.list(),
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["customers", "detail", id],
    queryFn: () => api.customers.get(id),
  });
}
