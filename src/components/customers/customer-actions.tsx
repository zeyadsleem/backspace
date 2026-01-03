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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Archive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { CustomerForm } from "./customer-form";

interface Customer {
  id: string;
  name: string;
}

interface CustomerActionsProps {
  customer: Customer;
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const { language, dir } = useI18n();
  const queryClient = useQueryClient();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/customers/${customer.id}/archive`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to archive customer");
      }
    },
    onSuccess: async () => {
      toast.success(language === "ar" ? "تم أرشفة العميل بنجاح" : "Customer archived successfully");

      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        exact: false,
      });

      setShowArchiveDialog(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error(language === "ar" ? "حدث خطأ في الأرشفة" : "Error archiving customer");
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{language === "ar" ? "فتح القائمة" : "Open menu"}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="w-48">
          <DropdownMenuItem onClick={() => setShowEditForm(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowArchiveDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Archive className="h-4 w-4 mr-2" />
            {language === "ar" ? "أرشفة" : "Archive"}
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

      {/* Archive Confirmation */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-destructive" />
              {language === "ar" ? "أرشفة العميل" : "Archive Customer"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {language === "ar"
                ? `هل أنت متأكد من أرشفة العميل "${customer.name}"؟ يمكن استرجاعه لاحقاً.`
                : `Are you sure you want to archive "${customer.name}"? You can restore the customer later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveMutation.isPending}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {language === "ar" ? "أرشفة" : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
