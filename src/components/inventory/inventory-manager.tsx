import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Edit2, Package, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  INVENTORY_ITEMS,
  INVENTORY_CATEGORIES,
  type InventoryItem,
} from "@/shared/constants/inventory-items";
import { useInventory, useUpdateInventory } from "@/hooks/use-inventory";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InventoryItemData {
  id: string;
  quantity: number;
  price: number;
  minStock: number;
}

export function InventoryManager() {
  const { language, lang } = useI18n();
  const { data: inventoryData = [], isLoading } = useInventory();
  const updateMutation = useUpdateInventory();

  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // دمج البيانات الثابتة مع بيانات قاعدة البيانات
  const getInventoryItemData = (item: InventoryItem): InventoryItemData => {
    const dbItem = inventoryData.find(
      (inv) => inv.name === (language === "ar" ? item.nameAr : item.nameEn),
    );
    return {
      id: item.id,
      quantity: dbItem?.quantity || 0,
      price: dbItem?.price || item.defaultPrice,
      minStock: dbItem?.minStock || 5,
    };
  };

  const updateQuantity = async (item: InventoryItem, change: number) => {
    const currentData = getInventoryItemData(item);
    const newQuantity = Math.max(0, currentData.quantity + change);

    try {
      await updateMutation.mutateAsync({
        id: currentData.id,
        data: {
          name: language === "ar" ? item.nameAr : item.nameEn,
          quantity: newQuantity,
          price: currentData.price,
          minStock: currentData.minStock,
        },
      });

      toast.success(
        language === "ar" ? `تم تحديث كمية ${item.nameAr}` : `Updated ${item.nameEn} quantity`,
      );
    } catch (error) {
      toast.error(language === "ar" ? "حدث خطأ في التحديث" : "Error updating quantity");
    }
  };

  const updatePrice = async (item: InventoryItem, newPrice: number) => {
    const currentData = getInventoryItemData(item);

    try {
      await updateMutation.mutateAsync({
        id: currentData.id,
        data: {
          name: language === "ar" ? item.nameAr : item.nameEn,
          quantity: currentData.quantity,
          price: newPrice,
          minStock: currentData.minStock,
        },
      });

      toast.success(
        language === "ar" ? `تم تحديث سعر ${item.nameAr}` : `Updated ${item.nameEn} price`,
      );
      setEditingPrice(null);
    } catch (error) {
      toast.error(language === "ar" ? "حدث خطأ في التحديث" : "Error updating price");
    }
  };

  const handlePriceEdit = (item: InventoryItem) => {
    const currentData = getInventoryItemData(item);
    setEditingPrice(item.id);
    setTempPrice(currentData.price);
  };

  const handlePriceSave = (item: InventoryItem) => {
    updatePrice(item, tempPrice);
  };

  const renderInventoryItem = (item: InventoryItem) => {
    const data = getInventoryItemData(item);
    const isLowStock = data.quantity <= data.minStock;
    const isOutOfStock = data.quantity === 0;

    return (
      <Card
        key={item.id}
        className={cn(
          "transition-all hover:shadow-md",
          isOutOfStock && "border-destructive/50 bg-destructive/5",
          isLowStock && !isOutOfStock && "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20",
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <span>{language === "ar" ? item.nameAr : item.nameEn}</span>
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs">
                  {lang("نفد", "Out")}
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {lang("قليل", "Low")}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* الكمية */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{lang("الكمية", "Quantity")}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(item, -1)}
                disabled={data.quantity === 0 || updateMutation.isPending}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <span className="min-w-[3rem] text-center font-medium">{data.quantity}</span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(item, 1)}
                disabled={updateMutation.isPending}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* السعر */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{lang("السعر", "Price")}</span>
            <div className="flex items-center gap-2">
              {editingPrice === item.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(Number(e.target.value))}
                    className="h-8 w-16 text-sm"
                    min="0"
                    step="0.5"
                  />
                  <Button
                    size="sm"
                    onClick={() => handlePriceSave(item)}
                    disabled={updateMutation.isPending}
                    className="h-8 px-2"
                  >
                    <Package className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPrice(null)}
                    className="h-8 px-2"
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {data.price} {lang("ج.م", "EGP")}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePriceEdit(item)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* الوحدة */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{lang("الوحدة", "Unit")}</span>
            <span className="text-sm">{item.unit}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p>{lang("جاري تحميل المخزون...", "Loading inventory...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{lang("إدارة المخزون", "Inventory Management")}</h2>
          <p className="text-muted-foreground">
            {lang("إدارة الكميات والأسعار للمنتجات", "Manage quantities and prices for products")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="beverages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(INVENTORY_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <span>{category.icon}</span>
              {language === "ar" ? category.nameAr : category.nameEn}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(INVENTORY_CATEGORIES).map(([categoryKey, category]) => (
          <TabsContent key={categoryKey} value={categoryKey} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {INVENTORY_ITEMS.filter((item) => item.category === categoryKey).map(
                renderInventoryItem,
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
