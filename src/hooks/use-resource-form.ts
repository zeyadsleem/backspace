import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { api, type Resource, type CreateResource } from "@/lib/tauri-api";
import { useI18n } from "@/lib/i18n";

const resourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
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
    validators: {
      onChange: ({ value }) => {
        const result = resourceSchema.safeParse(value);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of result.error.issues) {
            const path = issue.path.join(".");
            fieldErrors[path] = issue.message;
          }
          return fieldErrors;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const result = resourceSchema.safeParse(value);
      if (!result.success) {
        toast.error(language === "ar" ? "يرجى تصحيح الأخطاء" : "Please fix the errors");
        return;
      }
      mutation.mutate(result.data);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      const createData: CreateResource = {
        name: data.name.trim(),
        resourceType: data.resourceType,
      };

      if (mode === "create") {
        return api.resources.create(createData);
      } else {
        return api.resources.update(resource!.id, {
          name: data.name.trim(),
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
    onError: (error) => {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(language === "ar" ? `حدث خطأ: ${message}` : message);
    },
  });

  return { form, mutation, resourceSchema };
}
