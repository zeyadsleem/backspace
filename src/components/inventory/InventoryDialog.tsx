import { Package } from "lucide-react";
import { Modal } from "@/components/shared";
import type { CategoryOption, InventoryCategory } from "@/types";
import { InventoryForm } from "./InventoryForm";

interface InventoryDialogProps {
  isOpen: boolean;
  title: string;
  initialData?: {
    name: string;
    category: InventoryCategory;
    price: number;
    quantity: number;
    minStock: number;
  };
  categories: CategoryOption[];
  onSubmit?: (data: {
    name: string;
    category: InventoryCategory;
    price: number;
    quantity: number;
    minStock: number;
  }) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export function InventoryDialog({
  isOpen,
  title,
  initialData,
  categories,
  onSubmit,
  onClose,
  isLoading,
}: InventoryDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      maxWidth="max-w-2xl"
      onClose={onClose!}
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Package className="h-5 w-5" />
          </div>
          <h2>{title}</h2>
        </div>
      }
    >
      <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
        <InventoryForm
          categories={categories}
          initialData={initialData}
          isLoading={isLoading}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </Modal>
  );
}
