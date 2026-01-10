import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { InventoryList, InventoryDialog } from '@/components/inventory'
import { DeleteConfirmDialog } from '@/components/shared'

export function InventoryPage() {
  const inventory = useAppStore((state) => state.inventory)
  const categories = useAppStore((state) => state.categories)
  const addInventoryItem = useAppStore((state) => state.addInventoryItem)
  const updateInventoryItem = useAppStore((state) => state.updateInventoryItem)
  const deleteInventoryItem = useAppStore((state) => state.deleteInventoryItem)
  const adjustInventoryQuantity = useAppStore((state) => state.adjustInventoryQuantity)
  const t = useAppStore((state) => state.t)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const editItem = editId ? inventory.find(i => i.id === editId) : null

  return (
    <>
      <InventoryList
        inventory={inventory}
        categories={categories}
        onEdit={(id) => setEditId(id)}
        onDelete={(id) => setDeleteId(id)}
        onCreate={() => setShowCreateDialog(true)}
        onAdjustQuantity={adjustInventoryQuantity}
      />
      <InventoryDialog
        isOpen={showCreateDialog}
        title={t('newItem')}
        categories={categories}
        onSubmit={(data) => { addInventoryItem(data); setShowCreateDialog(false) }}
        onClose={() => setShowCreateDialog(false)}
      />
      <InventoryDialog
        isOpen={!!editId}
        title={t('edit') + ' ' + t('item')}
        initialData={editItem ? { name: editItem.name, category: editItem.category, price: editItem.price, quantity: editItem.quantity, minStock: editItem.minStock } : undefined}
        categories={categories}
        onSubmit={(data) => { if (editId) updateInventoryItem(editId, data); setEditId(null) }}
        onClose={() => setEditId(null)}
      />
      <DeleteConfirmDialog
        isOpen={!!deleteId}
        title={t('deleteItem')}
        description={t('areYouSureItem')}
        onConfirm={() => { if (deleteId) deleteInventoryItem(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
