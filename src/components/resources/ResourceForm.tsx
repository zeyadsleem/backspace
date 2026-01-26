import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Monitor } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormActions, SelectField, TextField } from "@/components/ui/form";
import { type ResourceFormData, resourceSchema } from "@/lib/validations";
import { useAppStore } from "@/stores/useAppStore";
import type { ResourceType } from "@/types";

interface ResourceFormProps {
  initialData?: {
    name: string;
    resourceType: ResourceType;
    ratePerHour: number;
  };
  onSubmit?: (data: ResourceFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ResourceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ResourceFormProps) {
  const t = useAppStore((state) => state.t);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      resourceType: initialData?.resourceType ?? "seat",
      ratePerHour: initialData?.ratePerHour ?? 0,
    },
    mode: "onChange",
  });

  const resourceTypeLabels: Record<ResourceType, string> = {
    seat: t("seat") || "Seat",
    room: t("room") || "Room",
    desk: t("desk") || "Desk",
  };

  const onFormSubmit = (data: ResourceFormData) => {
    onSubmit?.(data);
  };

  const handleReset = () => {
    reset();
    onCancel?.();
  };

  const isEditing = !!initialData;

  const resourceTypeOptions = Object.entries(resourceTypeLabels).map(([type, label]) => ({
    value: type,
    label,
  }));

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Name Field */}
        <TextField
          disabled={isLoading}
          error={errors.name?.message}
          icon={<Monitor className="h-4 w-4" />}
          id="name"
          label={t("resourceName") || "Resource Name"}
          placeholder="Enter resource name"
          required
          {...register("name")}
        />

        {/* Rate Per Hour Field */}
        <TextField
          disabled={isLoading}
          error={errors.ratePerHour?.message}
          icon={<DollarSign className="h-4 w-4" />}
          id="ratePerHour"
          label={t("ratePerHour") || `Rate (${t("egp")}/hr)`}
          min="0"
          placeholder="0.00"
          required
          step="any"
          type="number"
          {...register("ratePerHour", { valueAsNumber: true })}
        />
      </div>

      {/* Resource Type Field - Full Width */}
      <SelectField
        disabled={isLoading}
        error={errors.resourceType?.message}
        id="resourceType"
        label={t("resourceType") || "Resource Type"}
        options={resourceTypeOptions}
        required
        {...register("resourceType")}
      />

      {/* Action Buttons */}
      <FormActions>
        <Button disabled={isLoading} onClick={handleReset} type="button" variant="outline">
          {t("cancel")}
        </Button>
        <Button
          className="flex-1"
          disabled={isLoading || !isValid || !(isDirty || isEditing)}
          isLoading={isLoading}
          type="submit"
          variant="primary"
        >
          {isEditing
            ? t("updateResource") || "Update Resource"
            : t("createResource") || "Create Resource"}
        </Button>
      </FormActions>
    </form>
  );
}
