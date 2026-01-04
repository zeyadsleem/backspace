import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/tauri-api";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Resource } from "@/lib/tauri-api";
import { useI18n } from "@/lib/i18n";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { ResourceForm } from "./resource-form";

interface ResourceActionsProps {
  resource: Resource;
}

export function ResourceActions({ resource }: ResourceActionsProps) {
  const { language, dir, lang } = useI18n();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api.resources.delete(resource.id),
    onSuccess: () => {
      toast.success(lang("تم حذف المورد بنجاح", "Resource deleted successfully"));
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(lang(`حدث خطأ: ${message}`, `Error: ${message}`));
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{lang("فتح القائمة", "Open menu")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="w-48">
          <DropdownMenuItem onClick={() => setShowEditForm(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            {lang("تعديل", "Edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {lang("حذف", "Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResourceForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        resource={resource}
        mode="edit"
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={lang("حذف المورد", "Delete Resource")}
        description={lang(
          `هل أنت متأكد من حذف المورد "${resource.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
          `Are you sure you want to delete "${resource.name}"? This action cannot be undone.`,
        )}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        icon={Trash2}
      />
    </>
  );
}
