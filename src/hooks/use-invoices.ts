import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => api.invoices.list(),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => api.invoices.get(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.invoices.create>[0]) => api.invoices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(language === "ar" ? "تم إنشاء الفاتورة بنجاح" : "Invoice created successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل إنشاء الفاتورة: ${message}` : `Failed to create invoice: ${message}`);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.invoices.update>[1] }) =>
      api.invoices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(language === "ar" ? "تم تحديث الفاتورة بنجاح" : "Invoice updated successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل تحديث الفاتورة: ${message}` : `Failed to update invoice: ${message}`);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  return useMutation({
    mutationFn: (id: string) => api.invoices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(language === "ar" ? "تم حذف الفاتورة بنجاح" : "Invoice deleted successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(language === "ar" ? `فشل حذف الفاتورة: ${message}` : `Failed to delete invoice: ${message}`);
    },
  });
}
