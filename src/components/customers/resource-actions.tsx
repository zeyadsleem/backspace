import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { toast } from "sonner";
import type { Resource } from "@/lib/tauri-api";
import { useI18n } from "@/lib/i18n";

interface ResourceActionsProps {
  resource: Resource;
}

export function ResourceActions({ resource }: ResourceActionsProps) {
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api.resources.delete(resource.id),
    onSuccess: () => {
      toast.success(language === "ar" ? "تم حذف المورد بنجاح" : "Resource deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error(language === "ar" ? "حدث خطأ" : "An error occurred");
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil className="h-4 w-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            {language === "ar" ? "حذف" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-lg border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "ar" ? "حذف المورد" : "Delete Resource"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "ar"
                ? `هل أنت متأكد من حذف المورد "${resource.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the resource "${resource.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === "ar" ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? language === "ar"
                  ? "جارِ الحذف..."
                  : "Deleting..."
                : language === "ar"
                  ? "حذف"
                  : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
