import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const t = useAppStore((state) => state.t);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} maxWidth="sm" onClose={onCancel!} showCloseButton={false}>
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{title}</h3>
        <p className="mt-2 text-sm text-stone-500 leading-relaxed dark:text-stone-400">
          {description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            className="font-semibold"
            disabled={isLoading}
            onClick={onCancel}
            type="button"
            variant="ghost"
          >
            {cancelText || t("cancel")}
          </Button>
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            onClick={onConfirm}
            type="button"
            variant="danger"
          >
            {confirmText || t("delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
