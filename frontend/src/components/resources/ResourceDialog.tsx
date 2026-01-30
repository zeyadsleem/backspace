import { Monitor } from "lucide-react";
import { Modal } from "@/components/shared";
import type { ResourceType } from "@/types";
import { ResourceForm } from "./ResourceForm";

interface ResourceDialogProps {
  isOpen: boolean;
  title: string;
  onClose?: () => void;
  initialData?: {
    name: string;
    resourceType: ResourceType;
  };
  resourceTypes: ResourceType[];
  onSubmit?: (data: { name: string; resourceType: ResourceType; ratePerHour: number }) => void;
  isLoading?: boolean;
}

export function ResourceDialog({ isOpen, title, onClose, ...formProps }: ResourceDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      maxWidth="lg"
      onClose={onClose!}
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Monitor className="h-5 w-5" />
          </div>
          <h2>{title}</h2>
        </div>
      }
    >
      <div className="p-6">
        <ResourceForm {...formProps} onCancel={onClose} />
      </div>
    </Modal>
  );
}
