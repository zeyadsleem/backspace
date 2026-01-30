import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Hash, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormActions, SelectField, TextField } from "@/components/ui/form";
import { type InventoryFormData, inventorySchema } from "@/lib/validations";
import { useAppStore } from "@/stores/useAppStore";
import type { InventoryCategory } from "@/types";

interface InventoryFormProps {
  initialData?: {
    name: string;
    category: InventoryCategory;
    price: number;
    quantity: number;
    minStock: number;
  };
  categories: Array<{
    id: InventoryCategory;
    labelEn: string;
    labelAr: string;
  }>;
  onSubmit?: (data: InventoryFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function InventoryForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: InventoryFormProps) {
  const t = useAppStore((state) => state.t);
  const language = useAppStore((state) => state.language);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      category: initialData?.category ?? "beverage",
      price: initialData?.price ?? 0,
      quantity: initialData?.quantity ?? 0,
      minStock: initialData?.minStock ?? 5,
    },
    mode: "onChange",
  });

  const onFormSubmit = (data: InventoryFormData) => {
    onSubmit?.(data);
  };

  const handleReset = () => {
    reset();
    onCancel?.();
  };

  const isEditing = !!initialData;

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: language === "ar" ? category.labelAr : category.labelEn,
  }));

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Name Field */}
        <TextField
          disabled={isLoading}
          error={errors.name?.message}
          icon={<Package className="h-4 w-4" />}
          id="name"
          label={t("itemName") || "Item Name"}
          placeholder={t("inventoryExample") || "Enter item name"}
          required
          {...register("name")}
        />

        {/* Price Field */}
        <TextField
          disabled={isLoading}
          error={errors.price?.message}
          icon={<DollarSign className="h-4 w-4" />}
          id="price"
          label={t("price") || `Price (${t("egp")})`}
          min="0"
          placeholder="0.00"
          required
          step="any"
          type="number"
          {...register("price", { valueAsNumber: true })}
        />

        {/* Quantity Field */}
        <TextField
          disabled={isLoading}
          error={errors.quantity?.message}
          icon={<Hash className="h-4 w-4" />}
          id="quantity"
          label={t("quantity") || "Quantity"}
          min="0"
          placeholder="0"
          required
          type="number"
          {...register("quantity", { valueAsNumber: true })}
        />

        {/* Min Stock Field */}
        <TextField
          disabled={isLoading}
          error={errors.minStock?.message}
          icon={<Hash className="h-4 w-4" />}
          id="minStock"
          label={t("minStock") || "Minimum Stock"}
          min="0"
          placeholder="5"
          required
          type="number"
          {...register("minStock", { valueAsNumber: true })}
        />
      </div>

      {/* Category Field - Full Width */}
      <SelectField
        disabled={isLoading}
        error={errors.category?.message}
        id="category"
        label={t("category") || "Category"}
        options={categoryOptions}
        required
        {...register("category")}
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
          {isEditing ? t("updateItem") : t("newItem")}
        </Button>
      </FormActions>
    </form>
  );
}
