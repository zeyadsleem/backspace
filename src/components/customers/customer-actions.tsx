import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Archive } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { CustomerForm } from "./customer-form";
import { api, type Customer } from "@/lib/tauri-api";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";

interface CustomerActionsProps {
  customer: Customer;
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const { language, dir, lang } = useI18n();
  const queryClient = useQueryClient();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.customers.delete(customer.id);
    },
    onSuccess: async () => {
      toast.success(lang("تم حذف العميل بنجاح", "Customer deleted successfully"));

      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        exact: false,
      });

      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error(lang("حدث خطأ في الحذف", "Error deleting customer"));
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{language === "ar" ? "فتح القائمة" : "Open menu"}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="w-48">
          <DropdownMenuItem onClick={() => setShowEditForm(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {lang("تعديل", "Edit")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Archive className="h-4 w-4 mr-2" />
            {lang("حذف", "Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        customer={customer}
        mode="edit"
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={lang("حذف العميل", "Delete Customer")}
        description={lang(
          `هل أنت متأكد من حذف العميل "${customer.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
          `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
        )}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        icon={Archive}
      />
    </>
  );
}
