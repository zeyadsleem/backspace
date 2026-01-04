import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

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
  const { language } = useI18n();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.inventory.create>[0]) => api.inventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(language === "ar" ? "تم إنشاء العنصر بنجاح" : "Item created successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل إنشاء العنصر: ${message}` : `Failed to create item: ${message}`);
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.inventory.update>[1] }) =>
      api.inventory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(language === "ar" ? "تم تحديث العنصر بنجاح" : "Item updated successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل تحديث العنصر: ${message}` : `Failed to update item: ${message}`);
    },
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  return useMutation({
    mutationFn: (id: string) => api.inventory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(language === "ar" ? "تم حذف العنصر بنجاح" : "Item deleted successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل حذف العنصر: ${message}` : `Failed to delete item: ${message}`);
    },
  });
}
