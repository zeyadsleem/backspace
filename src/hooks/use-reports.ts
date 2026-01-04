import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";

export function useDailyRevenue() {
  return useQuery({
    queryKey: ["reports", "dailyRevenue"],
    queryFn: () => api.reports.getDailyRevenue(),
  });
}

export function useTopCustomers(limit?: number) {
  return useQuery({
    queryKey: ["reports", "topCustomers", limit],
    queryFn: () => api.reports.getTopCustomers(limit),
  });
}

export function useResourceUtilization() {
  return useQuery({
    queryKey: ["reports", "resourceUtilization"],
    queryFn: () => api.reports.getResourceUtilization(),
  });
}

export function useOverviewStats() {
  return useQuery({
    queryKey: ["reports", "overviewStats"],
    queryFn: () => api.reports.getOverviewStats(),
  });
}
