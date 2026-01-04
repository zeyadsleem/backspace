import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, AlertTriangle, History, Package } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useInventory } from "@/hooks/use-inventory";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

export default function InventoryPage() {
  const { t, language, dir, lang } = useI18n();
  const { data: inventory, isLoading, error } = useInventory();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={t("inventory").title[language]}
        subtitle={t("inventory").subtitle[language]}
        action={
          <Button size="default">
            <Plus className="h-4 w-4" />
            {t("inventory").add_item[language]}
          </Button>
        }
      />

      <Card className="rounded-lg border shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-extrabold">
              {t("inventory").stock_items[language]}
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <SearchInput placeholder={t("inventory").search_items[language]} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState type="table" count={5} />
          ) : error ? (
            <EmptyState
              icon={Package}
              title={lang("خطأ في تحميل البيانات", "Error loading data")}
            />
          ) : !inventory?.length ? (
            <EmptyState icon={Package} title={lang("لا توجد مخزون", "No inventory items")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("الاسم", "Name")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("الكمية", "Quantity")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("الحد الأدنى", "Min Stock")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("السعر", "Price")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-right"} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <TableCell className="text-sm font-bold">
                      <div className="flex items-center gap-2">
                        {item.quantity <= item.minStock && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell
                      className={item.quantity <= item.minStock ? "text-destructive font-bold" : ""}
                    >
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium">
                      {item.minStock}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-primary">
                      ج.م {item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-right"}>
                      <Button variant="ghost" size="icon-sm">
                        <History className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
