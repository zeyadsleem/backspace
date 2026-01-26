import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Monitor } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormError, FormField, FormInput, FormLabel, FormSelect } from "@/components/ui/form";
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
  const isRTL = useAppStore((state) => state.isRTL);

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

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Name Field */}
        <FormField>
          <FormLabel htmlFor="name" icon={<Monitor className="h-4 w-4" />} required>
            {t("resourceName") || "Resource Name"}
          </FormLabel>
          <FormInput
            id="name"
            type="text"
            {...register("name")}
            disabled={isLoading}
            error={!!errors.name}
            isRTL={isRTL}
            placeholder="Enter resource name"
          />
          <FormError>{errors.name?.message}</FormError>
        </FormField>

        {/* Rate Per Hour Field */}
        <FormField>
          <FormLabel htmlFor="ratePerHour" icon={<DollarSign className="h-4 w-4" />} required>
            {t("ratePerHour") || `Rate (${t("egp")}/hr)`}
          </FormLabel>
          <FormInput
            id="ratePerHour"
            min="0"
            step="any"
            type="number"
            {...register("ratePerHour", { valueAsNumber: true })}
            disabled={isLoading}
            error={!!errors.ratePerHour}
            placeholder="0.00"
          />
          <FormError>{errors.ratePerHour?.message}</FormError>
        </FormField>
      </div>

      {/* Resource Type Field - Full Width */}
      <FormField>
        <FormLabel htmlFor="resourceType" required>
          {t("resourceType") || "Resource Type"}
        </FormLabel>
        <FormSelect
          id="resourceType"
          {...register("resourceType")}
          disabled={isLoading}
          error={!!errors.resourceType}
        >
          {Object.entries(resourceTypeLabels).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </FormSelect>
        <FormError>{errors.resourceType?.message}</FormError>
      </FormField>

      {/* Action Buttons */}
      <div className="flex gap-3 border-stone-100 border-t pt-4 dark:border-stone-800">
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
      </div>
    </form>
  );
}
