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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check, MapPin } from "lucide-react";
import { useResourceForm } from "@/hooks/use-resource-form";
import { useI18n } from "@/lib/i18n";
import type { Resource } from "@/lib/tauri-api";

interface ResourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
  mode?: "create" | "edit";
}

export function ResourceForm({ open, onOpenChange, resource, mode = "create" }: ResourceFormProps) {
  const { language, dir } = useI18n();
  const { form, mutation } = useResourceForm(resource, mode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5" />
            {mode === "create"
              ? language === "ar"
                ? "إضافة مورد جديد"
                : "Add New Resource"
              : language === "ar"
                ? "تعديل بيانات المورد"
                : "Edit Resource"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" ? "أدخل بيانات المورد" : "Enter resource details"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label className="flex gap-2 items-center text-sm font-bold">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {language === "ar" ? "الاسم" : "Name"}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-9"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="resourceType">
            {(field) => (
              <div className="space-y-2">
                <Label className="flex gap-2 items-center text-sm font-bold">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {language === "ar" ? "النوع" : "Type"}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as "seat" | "desk" | "room")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seat">{language === "ar" ? "مقعد" : "Seat"}</SelectItem>
                    <SelectItem value="desk">{language === "ar" ? "مكتب" : "Desk"}</SelectItem>
                    <SelectItem value="room">{language === "ar" ? "غرفة" : "Room"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
              className="ltr:mr-auto rtl:ml-auto"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>

            <Button onClick={form.handleSubmit} disabled={mutation.isPending} className="gap-2">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4" />
              {mode === "create"
                ? language === "ar"
                  ? "إنشاء"
                  : "Create"
                : language === "ar"
                  ? "حفظ"
                  : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
