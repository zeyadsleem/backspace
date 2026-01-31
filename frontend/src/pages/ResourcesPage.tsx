import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResourceDetailsDialog, ResourceDialog, ResourcesList } from "@/components/resources";
import { DeleteConfirmDialog } from "@/components/shared";
import { useAppStore } from "@/stores/useAppStore";
import type { ResourceType } from "@/types";

const resourceTypes: ResourceType[] = ["seat", "room", "desk"];

export function ResourcesPage() {
  const navigate = useNavigate();
  const resources = useAppStore((state) => state.resources);
  const addResource = useAppStore((state) => state.addResource);
  const updateResource = useAppStore((state) => state.updateResource);
  const deleteResource = useAppStore((state) => state.deleteResource);
  const t = useAppStore((state) => state.t);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const editResource = editId ? resources.find((r) => r.id === editId) : null;
  const selectedResource = selectedResourceId
    ? resources.find((r) => r.id === selectedResourceId)
    : null;

  return (
    <>
      <ResourcesList
        onCreate={() => setShowCreateDialog(true)}
        onDelete={(id) => setDeleteId(id)}
        onEdit={(id) => setEditId(id)}
        onSelectForSession={(id) => navigate(`/sessions?resource=${id}`)}
        onView={(id) => setSelectedResourceId(id)}
        resources={resources}
        resourceTypes={resourceTypes}
      />

      {selectedResource && (
        <ResourceDetailsDialog
          isOpen={!!selectedResourceId}
          onClose={() => setSelectedResourceId(null)}
          onDelete={() => {
            setSelectedResourceId(null);
            setDeleteId(selectedResource.id);
          }}
          onEdit={() => {
            setSelectedResourceId(null);
            setEditId(selectedResource.id);
          }}
          resource={selectedResource}
        />
      )}

      <ResourceDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={(data) => {
          addResource(data);
          setShowCreateDialog(false);
        }}
        resourceTypes={resourceTypes}
        title={t("newResource")}
      />
      <ResourceDialog
        initialData={
          editResource
            ? {
                name: editResource.name,
                resourceType: editResource.resourceType,
                ratePerHour: editResource.ratePerHour / 100, // Convert Piasters to EGP for the form
              }
            : undefined
        }
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        onSubmit={(data) => {
          if (editId) {
            updateResource(editId, data);
          }
          setEditId(null);
        }}
        resourceTypes={resourceTypes}
        title={`${t("edit")} ${t("resource")}`}
      />
      <DeleteConfirmDialog
        description={t("areYouSureResource")}
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteResource(deleteId);
          }
          setDeleteId(null);
        }}
        title={t("deleteResource")}
      />
    </>
  );
}
