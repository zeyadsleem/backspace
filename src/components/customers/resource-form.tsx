import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Check, MapPin, Armchair, Monitor, DoorOpen, Tag } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { useResourceForm } from "@/hooks/use-resource-form";
import { useI18n } from "@/lib/i18n";
import type { Resource } from "@/lib/tauri-api";

interface ResourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
  mode?: "create" | "edit";
}

const resourceTypeIcons = {
  seat: Armchair,
  desk: Monitor,
  room: DoorOpen,
};

export function ResourceForm({ open, onOpenChange, resource, mode = "create" }: ResourceFormProps) {
  const { lang, dir } = useI18n();
  const { form, mutation } = useResourceForm(resource, mode, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5" />
            {mode === "create"
              ? lang("إضافة مورد جديد", "Add New Resource")
              : lang("تعديل بيانات المورد", "Edit Resource")}
          </DialogTitle>
          <DialogDescription>
            {lang("أدخل بيانات المورد", "Enter resource details")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <Card>
            <CardContent className="pt-6 space-y-4">
              <form.Field name="name">
                {(field) => (
                  <FormField
                    label={lang("اسم المورد", "Resource Name")}
                    icon={Tag}
                    field={field}
                    required
                    placeholder={lang(
                      "مثال: مقعد 1، غرفة اجتماعات أ",
                      "e.g., Seat 1, Meeting Room A",
                    )}
                  />
                )}
              </form.Field>

              <form.Field name="resourceType">
                {(field) => {
                  const TypeIcon = resourceTypeIcons[field.state.value] || MapPin;
                  return (
                    <div className="space-y-2">
                      <Label className="flex gap-2 items-center text-sm font-bold">
                        <TypeIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        {lang("نوع المورد", "Resource Type")}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as "seat" | "desk" | "room")
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seat">
                            <div className="flex items-center gap-2">
                              <Armchair className="h-4 w-4" />
                              {lang("مقعد", "Seat")}
                            </div>
                          </SelectItem>
                          <SelectItem value="desk">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              {lang("مكتب", "Desk")}
                            </div>
                          </SelectItem>
                          <SelectItem value="room">
                            <div className="flex items-center gap-2">
                              <DoorOpen className="h-4 w-4" />
                              {lang("غرفة", "Room")}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }}
              </form.Field>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
              className="ltr:mr-auto rtl:ml-auto"
            >
              {lang("إلغاء", "Cancel")}
            </Button>

            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              {mode === "create"
                ? lang("إنشاء المورد", "Create Resource")
                : lang("حفظ التغييرات", "Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
