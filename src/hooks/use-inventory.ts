import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";
import { toast } from "sonner";

export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: () => api.inventory.list(),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ["inventory", id],
    queryFn: () => api.inventory.get(id),
    enabled: !!id,
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.inventory.create>[0]) => api.inventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item created successfully");
    },
    onError: () => {
      toast.error("Failed to create item");
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.inventory.update>[1] }) =>
      api.inventory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item updated successfully");
    },
    onError: () => {
      toast.error("Failed to update item");
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.inventory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete item");
    },
  });
}
