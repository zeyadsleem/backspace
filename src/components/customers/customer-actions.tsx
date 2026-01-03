import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Archive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { CustomerForm } from "./customer-form";
import { api, type Customer } from "@/lib/tauri-api";

interface CustomerActionsProps {
  customer: Customer;
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const { language, dir } = useI18n();
  const queryClient = useQueryClient();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.customers.delete(customer.id);
    },
    onSuccess: async () => {
      toast.success(language === "ar" ? "تم حذف العميل بنجاح" : "Customer deleted successfully");

      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        exact: false,
      });

      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error(language === "ar" ? "حدث خطأ في الحذف" : "Error deleting customer");
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
            {language === "ar" ? "تعديل" : "Edit"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Archive className="h-4 w-4 mr-2" />
            {language === "ar" ? "حذف" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Customer */}
      <CustomerForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        customer={customer}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-destructive" />
              {language === "ar" ? "حذف العميل" : "Delete Customer"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {language === "ar"
                ? `هل أنت متأكد من حذف العميل "${customer.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
