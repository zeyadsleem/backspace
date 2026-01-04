import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { api, type Resource, type CreateResource } from "@/lib/tauri-api";
import { useI18n } from "@/lib/i18n";

const resourceSchema = z.object({
  name: z.string().min(2).max(100),
  resourceType: z.enum(["seat", "desk", "room"]),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

export function useResourceForm(
  resource?: Resource,
  mode: "create" | "edit" = "create",
  onSuccess?: (resource: Resource) => void,
) {
  const queryClient = useQueryClient();
  const { language } = useI18n();

  const form = useForm({
    defaultValues: {
      name: resource?.name ?? "",
      resourceType: (resource?.resourceType ?? "seat") as "seat" | "desk" | "room",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      const createData: CreateResource = {
        name: data.name,
        resourceType: data.resourceType,
      };

      if (mode === "create") {
        return api.resources.create(createData);
      } else {
        return api.resources.update(resource!.id, {
          name: data.name,
          resourceType: data.resourceType,
        });
      }
    },
    onSuccess: async (result) => {
      toast.success(
        language === "ar"
          ? mode === "create"
            ? "تم إنشاء المورد بنجاح"
            : "تم تحديث المورد بنجاح"
          : mode === "create"
            ? "Resource created successfully"
            : "Resource updated successfully",
      );

      await queryClient.invalidateQueries({
        queryKey: ["resources"],
        exact: false,
      });

      onSuccess?.(result);
      form.reset();
    },
    onError: () => {
      toast.error(language === "ar" ? "حدث خطأ" : "An error occurred");
    },
  });

  return { form, mutation };
}
