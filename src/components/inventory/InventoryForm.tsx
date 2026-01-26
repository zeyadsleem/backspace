import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Hash, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormError, FormField, FormInput, FormLabel, FormSelect } from "@/components/ui/form";
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
  const isRTL = useAppStore((state) => state.isRTL);

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

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Name Field */}
        <FormField>
          <FormLabel htmlFor="name" icon={<Package className="h-4 w-4" />} required>
            {t("itemName") || "Item Name"}
          </FormLabel>
          <FormInput
            id="name"
            type="text"
            {...register("name")}
            disabled={isLoading}
            error={!!errors.name}
            isRTL={isRTL}
            placeholder={t("inventoryExample") || "Enter item name"}
          />
          <FormError>{errors.name?.message}</FormError>
        </FormField>

        {/* Price Field */}
        <FormField>
          <FormLabel htmlFor="price" icon={<DollarSign className="h-4 w-4" />} required>
            {t("price") || `Price (${t("egp")})`}
          </FormLabel>
          <FormInput
            id="price"
            min="0"
            step="any"
            type="number"
            {...register("price", { valueAsNumber: true })}
            disabled={isLoading}
            error={!!errors.price}
            placeholder="0.00"
          />
          <FormError>{errors.price?.message}</FormError>
        </FormField>

        {/* Quantity Field */}
        <FormField>
          <FormLabel htmlFor="quantity" icon={<Hash className="h-4 w-4" />} required>
            {t("quantity") || "Quantity"}
          </FormLabel>
          <FormInput
            id="quantity"
            min="0"
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            disabled={isLoading}
            error={!!errors.quantity}
            placeholder="0"
          />
          <FormError>{errors.quantity?.message}</FormError>
        </FormField>

        {/* Min Stock Field */}
        <FormField>
          <FormLabel htmlFor="minStock" icon={<Hash className="h-4 w-4" />} required>
            {t("minStock") || "Minimum Stock"}
          </FormLabel>
          <FormInput
            id="minStock"
            min="0"
            type="number"
            {...register("minStock", { valueAsNumber: true })}
            disabled={isLoading}
            error={!!errors.minStock}
            placeholder="5"
          />
          <FormError>{errors.minStock?.message}</FormError>
        </FormField>
      </div>

      {/* Category Field - Full Width */}
      <FormField>
        <FormLabel htmlFor="category" required>
          {t("category") || "Category"}
        </FormLabel>
        <FormSelect
          id="category"
          {...register("category")}
          disabled={isLoading}
          error={!!errors.category}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {language === "ar" ? category.labelAr : category.labelEn}
            </option>
          ))}
        </FormSelect>
        <FormError>{errors.category?.message}</FormError>
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
          {isEditing ? t("updateItem") : t("newItem")}
        </Button>
      </div>
    </form>
  );
}
