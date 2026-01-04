import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";
import { toast } from "sonner";

export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => api.subscriptions.list(),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => api.subscriptions.get(id),
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.subscriptions.create>[0]) =>
      api.subscriptions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription created successfully");
    },
    onError: () => {
      toast.error("Failed to create subscription");
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof api.subscriptions.update>[1];
    }) => api.subscriptions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription updated successfully");
    },
    onError: () => {
      toast.error("Failed to update subscription");
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.subscriptions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete subscription");
    },
  });
}
