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

  };

  onSubmit?: (data: { name: string; resourceType: ResourceType; ratePerHour: number }) => void;

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

  const resources = useAppStore((state) => state.resources);



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

      ratePerHour: 0,

    },

    mode: "onChange",

  });



  const resourceTypeLabels: Record<ResourceType, string> = {

    seat: t("seatType"),

    room: t("roomType"),

    desk: t("deskType"),

  };



  const onFormSubmit = (data: ResourceFormData) => {

    // Get the current rate for this resource type from existing resources

    // since settings is the source of truth and updates all resources of the same type.

    const existingResource = resources.find(r => r.resourceType === data.resourceType);

    const currentRate = existingResource ? existingResource.ratePerHour / 100 : data.ratePerHour;



    onSubmit?.({

      name: data.name,

      resourceType: data.resourceType,

      ratePerHour: currentRate,

    });

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

      <div className="space-y-6">

        {/* Name Field */}

        <TextField

          disabled={isLoading}

          error={errors.name?.message}

          icon={<Monitor className="h-4 w-4" />}

          id="name"

          label={t("resourceName")}

          placeholder={t("resourceExample")}

          required

          {...register("name", { required: true })}

        />



        {/* Resource Type Field */}

        <SelectField

          disabled={isLoading}

          error={errors.resourceType?.message}

          id="resourceType"

          label={t("resourceType")}

          options={resourceTypeOptions}

          required

          {...register("resourceType")}

        />

      </div>



      {/* Action Buttons */}

      <FormActions className="mt-8">

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

          {isEditing ? t("updateResource") : t("createResource")}

        </Button>

      </FormActions>

    </form>

  );

}
