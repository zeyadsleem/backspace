import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, AlertTriangle, Plus as PlusIcon, Minus as MinusIcon, History } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

const mockInventory = [
  {
    id: "1",
    name: "Espresso",
    sku: "COFF-001",
    category: "drink" as const,
    currentQuantity: 25,
    minQuantity: 10,
    unitPrice: 25,
  },
  {
    id: "2",
    name: "Croissant",
    sku: "BAKE-001",
    category: "snack" as const,
    currentQuantity: 3,
    minQuantity: 5,
    unitPrice: 30,
  },
  {
    id: "3",
    name: "Bottled Water",
    sku: "DRNK-001",
    category: "drink" as const,
    currentQuantity: 50,
    minQuantity: 15,
    unitPrice: 5,
  },
  {
    id: "4",
    name: "Sandwich",
    sku: "FOOD-001",
    category: "snack" as const,
    currentQuantity: 8,
    minQuantity: 5,
    unitPrice: 60,
  },
];

const mockMovements = [
  {
    id: "1",
    type: "add" as const,
    quantity: 10,
    reason: "Restock",
    date: "2025-01-02T10:00:00",
    previous: 15,
    new: 25,
  },
  {
    id: "2",
    type: "remove" as const,
    quantity: 5,
    reason: "Session #123",
    date: "2025-01-02T11:30:00",
    previous: 20,
    new: 15,
  },
  {
    id: "3",
    type: "adjust" as const,
    quantity: -2,
    reason: "Damaged items",
    date: "2025-01-01T16:00:00",
    previous: 17,
    new: 15,
  },
];

export default function InventoryPage() {
  const { t, language, dir } = useI18n();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
            {t("inventory").title[language]}
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {t("inventory").subtitle[language]}
          </p>
        </div>
        <Button size="default">
          <Plus className="h-4 w-4" />
          {t("inventory").add_item[language]}
        </Button>
      </div>

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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("inventory").item[language]}
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("inventory").sku[language]}
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("inventory").category[language]}
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("inventory").quantity[language]}
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("inventory").unit_price[language]}
                </TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("common").actions[language]}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((item) => (
                <TableRow key={item.id} className="border-b transition-colors hover:bg-muted/50">
                  <TableCell className="font-bold text-sm">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-medium">
                    {item.sku}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize text-[10px] font-bold px-2 py-0.5"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      {item.currentQuantity <= item.minQuantity && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <span
                        className={
                          item.currentQuantity <= item.minQuantity
                            ? "text-destructive font-bold"
                            : "font-semibold"
                        }
                      >
                        {item.currentQuantity}
                      </span>
                      <span className="text-sm text-muted-foreground">/ {item.minQuantity}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-bold">
                    ج.م {item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Drawer>
                      <DrawerTrigger>
                        <Button variant="ghost" size="sm" className="font-semibold">
                          <History className="h-4 w-4" />
                          {t("inventory").history[language]}
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent dir={dir}>
                        <div className="mx-auto w-full max-w-2xl">
                          <DrawerHeader className="text-left border-b pb-4">
                            <DrawerTitle className="text-base font-bold">
                              {t("inventory").movement_history[language]} - {item.name}
                            </DrawerTitle>
                          </DrawerHeader>
                          <div className="p-4">
                            <ScrollArea className="h-[60vh] pr-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                  <div>
                                    <p className="text-sm font-bold">
                                      {t("inventory").current_stock[language]}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-primary">
                                      {item.currentQuantity}
                                    </p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                      {language === "ar" ? "وحدات" : "units"}
                                    </p>
                                  </div>
                                </div>

                                <Table>
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                      <TableHead className="text-xs font-bold uppercase tracking-widest">
                                        {t("inventory").type[language]}
                                      </TableHead>
                                      <TableHead className="text-xs font-bold uppercase tracking-widest">
                                        {t("inventory").quantity[language]}
                                      </TableHead>
                                      <TableHead className="text-xs font-bold uppercase tracking-widest">
                                        {t("inventory").reason[language]}
                                      </TableHead>
                                      <TableHead className="text-xs font-bold uppercase tracking-widest">
                                        {t("customers").date[language]}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {mockMovements.map((movement) => (
                                      <TableRow
                                        key={movement.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                      >
                                        <TableCell className="py-2">
                                          <Badge
                                            variant={
                                              movement.type === "add"
                                                ? "default"
                                                : movement.type === "remove"
                                                  ? "secondary"
                                                  : "outline"
                                            }
                                            className="capitalize font-bold text-[10px] px-2 py-0.5"
                                          >
                                            {movement.type}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="py-2">
                                          <span
                                            className={cn(
                                              "text-sm font-bold",
                                              movement.type === "add"
                                                ? "text-green-600"
                                                : movement.type === "remove"
                                                  ? "text-red-600"
                                                  : "",
                                            )}
                                          >
                                            {movement.quantity > 0 ? "+" : ""}
                                            {movement.quantity}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium py-2">
                                          {movement.reason}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-medium py-2">
                                          {new Date(movement.date).toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>

                                <div className="flex gap-3 pt-4">
                                  <Button
                                    variant="outline"
                                    className="flex-1 h-9 text-sm font-bold"
                                    size="default"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                    {t("inventory").add_stock[language]}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 h-9 text-sm font-bold"
                                    size="default"
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                    {t("inventory").remove_stock[language]}
                                  </Button>
                                </div>
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
