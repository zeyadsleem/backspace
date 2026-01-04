import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

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
  const { language } = useI18n();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.subscriptions.create>[0]) =>
      api.subscriptions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(language === "ar" ? "تم إنشاء الاشتراك بنجاح" : "Subscription created successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل إنشاء الاشتراك: ${message}` : `Failed to create subscription: ${message}`);
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

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
      toast.success(language === "ar" ? "تم تحديث الاشتراك بنجاح" : "Subscription updated successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل تحديث الاشتراك: ${message}` : `Failed to update subscription: ${message}`);
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  return useMutation({
    mutationFn: (id: string) => api.subscriptions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(language === "ar" ? "تم حذف الاشتراك بنجاح" : "Subscription deleted successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل حذف الاشتراك: ${message}` : `Failed to delete subscription: ${message}`);
    },
  });
}
