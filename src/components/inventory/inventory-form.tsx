import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Package, Hash, AlertTriangle, DollarSign, Check } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { useI18n } from "@/lib/i18n";
import { useForm } from "@tanstack/react-form";
import { useCreateInventory, useUpdateInventory } from "@/hooks/use-inventory";
import type { Inventory } from "@/lib/tauri-api";

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Inventory;
  mode?: "create" | "edit";
}

export function InventoryForm({ open, onOpenChange, item, mode = "create" }: InventoryFormProps) {
  const { dir, lang } = useI18n();
  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const mutation = mode === "create" ? createMutation : updateMutation;

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      quantity: item?.quantity ?? 0,
      minStock: item?.minStock ?? 5,
      price: item?.price ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name: value.name,
          quantity: Number(value.quantity),
          minStock: Number(value.minStock),
          price: Number(value.price),
        });
      } else if (item) {
        await updateMutation.mutateAsync({
          id: item.id,
          data: {
            name: value.name,
            quantity: Number(value.quantity),
            minStock: Number(value.minStock),
            price: Number(value.price),
          },
        });
      }
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            {mode === "create"
              ? lang("إضافة صنف جديد", "Add New Item")
              : lang("تعديل الصنف", "Edit Item")}
          </DialogTitle>
          <DialogDescription>
            {lang("أدخل بيانات الصنف في المخزون", "Enter inventory item details")}
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
              {/* Name Field */}
              <form.Field name="name">
                {(field) => (
                  <FormField
                    label={lang("اسم الصنف", "Item Name")}
                    icon={Package}
                    field={field}
                    required
                    placeholder={lang("مثال: قهوة، شاي، مياه", "e.g. Coffee, Tea, Water")}
                  />
                )}
              </form.Field>

              {/* Quantity Field */}
              <form.Field name="quantity">
                {(field) => (
                  <FormField
                    label={lang("الكمية الحالية", "Current Quantity")}
                    icon={Hash}
                    type="number"
                    field={{
                      ...field,
                      state: {
                        ...field.state,
                        value: String(field.state.value),
                      },
                      handleChange: (v: string) => field.handleChange(Number(v) || 0),
                    }}
                    required
                    placeholder="0"
                  />
                )}
              </form.Field>

              {/* Min Stock Field */}
              <form.Field name="minStock">
                {(field) => (
                  <FormField
                    label={lang("الحد الأدنى للمخزون", "Minimum Stock Level")}
                    icon={AlertTriangle}
                    type="number"
                    field={{
                      ...field,
                      state: {
                        ...field.state,
                        value: String(field.state.value),
                      },
                      handleChange: (v: string) => field.handleChange(Number(v) || 0),
                    }}
                    required
                    placeholder="5"
                  />
                )}
              </form.Field>

              {/* Price Field */}
              <form.Field name="price">
                {(field) => (
                  <FormField
                    label={lang("السعر (ج.م)", "Price (EGP)")}
                    icon={DollarSign}
                    type="number"
                    field={{
                      ...field,
                      state: {
                        ...field.state,
                        value: String(field.state.value),
                      },
                      handleChange: (v: string) => field.handleChange(Number(v) || 0),
                    }}
                    required
                    placeholder="0.00"
                  />
                )}
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
                ? lang("إضافة الصنف", "Add Item")
                : lang("حفظ التغييرات", "Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
