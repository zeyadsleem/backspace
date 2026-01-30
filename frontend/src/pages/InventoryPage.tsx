import { useState } from "react";
import { InventoryDialog, InventoryList } from "@/components/inventory";
import { DeleteConfirmDialog } from "@/components/shared";
import { useAppStore } from "@/stores/useAppStore";

export function InventoryPage() {
  const inventory = useAppStore((state) => state.inventory);
  const categories = useAppStore((state) => state.categories);
  const addInventoryItem = useAppStore((state) => state.addInventoryItem);
  const updateInventoryItem = useAppStore((state) => state.updateInventoryItem);
  const deleteInventoryItem = useAppStore((state) => state.deleteInventoryItem);
  const adjustInventoryQuantity = useAppStore((state) => state.adjustInventoryQuantity);
  const t = useAppStore((state) => state.t);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const editItem = editId ? inventory.find((i) => i.id === editId) : null;

  return (
    <>
      <InventoryList
        categories={categories}
        inventory={inventory}
        onAdjustQuantity={adjustInventoryQuantity}
        onCreate={() => setShowCreateDialog(true)}
        onDelete={(id) => setDeleteId(id)}
        onEdit={(id) => setEditId(id)}
      />
      <InventoryDialog
        categories={categories}
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={(data) => {
          addInventoryItem(data);
          setShowCreateDialog(false);
        }}
        title={t("newItem")}
      />
      <InventoryDialog
        categories={categories}
        initialData={
          editItem
            ? {
                name: editItem.name,
                category: editItem.category,
                price: editItem.price / 100, // Convert Piasters to EGP for the form
                quantity: editItem.quantity,
                minStock: editItem.minStock,
              }
            : undefined
        }
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        onSubmit={(data) => {
          if (editId) {
            updateInventoryItem(editId, data);
          }
          setEditId(null);
        }}
        title={`${t("edit")} ${t("item")}`}
      />
      <DeleteConfirmDialog
        description={t("areYouSureItem")}
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteInventoryItem(deleteId);
          }
          setDeleteId(null);
        }}
        title={t("deleteItem")}
      />
    </>
  );
}
