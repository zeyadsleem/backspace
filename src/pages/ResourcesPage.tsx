import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import { ResourcesList, ResourceDialog } from '@/components/resources'
import { DeleteConfirmDialog } from '@/components/shared'
import type { ResourceType } from '@/types'

const resourceTypes: ResourceType[] = ['seat', 'room', 'desk']

export function ResourcesPage() {
  const navigate = useNavigate()
  const resources = useAppStore((state) => state.resources)
  const addResource = useAppStore((state) => state.addResource)
  const updateResource = useAppStore((state) => state.updateResource)
  const deleteResource = useAppStore((state) => state.deleteResource)
  const t = useAppStore((state) => state.t)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const editResource = editId ? resources.find(r => r.id === editId) : null

  return (
    <>
      <ResourcesList
        resources={resources}
        resourceTypes={resourceTypes}
        onEdit={(id) => setEditId(id)}
        onDelete={(id) => setDeleteId(id)}
        onCreate={() => setShowCreateDialog(true)}
        onSelectForSession={(id) => navigate(`/sessions?resource=${id}`)}
      />
      <ResourceDialog
        isOpen={showCreateDialog}
        title={t('newResource')}
        resourceTypes={resourceTypes}
        onSubmit={(data) => { addResource(data); setShowCreateDialog(false) }}
        onClose={() => setShowCreateDialog(false)}
      />
      <ResourceDialog
        isOpen={!!editId}
        title={t('edit') + ' ' + t('resource')}
        resourceTypes={resourceTypes}
        initialData={editResource ? { name: editResource.name, resourceType: editResource.resourceType, ratePerHour: editResource.ratePerHour } : undefined}
        onSubmit={(data) => { if (editId) updateResource(editId, data); setEditId(null) }}
        onClose={() => setEditId(null)}
      />
      <DeleteConfirmDialog
        isOpen={!!deleteId}
        title={t('deleteResource')}
        description={t('areYouSureResource')}
        onConfirm={() => { if (deleteId) deleteResource(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
