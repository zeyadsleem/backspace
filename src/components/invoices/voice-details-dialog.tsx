import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, X, FileText, Printer, Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/tauri-api";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface InvoiceDetailsDialogProps {
  invoiceId: string;
  trigger: React.ReactNode;
}

export function InvoiceDetailsDialog({ invoiceId, trigger }: InvoiceDetailsDialogProps) {
  const { language, dir, lang } = useI18n();
  const [open, setOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => api.invoices.get(invoiceId),
    enabled: open,
  });

  const subtotal = invoice?.items?.reduce((sum, item) => sum + item.total, 0) || 0;
  const discountAmount = subtotal * 0.1;
  const total = subtotal - discountAmount;

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg border-2"
          dir={dir}
        >
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {lang("تفاصيل الفاتورة", "Invoice Details")}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {invoice ? `#${invoice.id.substring(0, 8).toUpperCase()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon-sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  {lang("جاري تحميل البيانات...", "Loading...")}
                </div>
              </div>
            ) : !invoice ? (
              <div className="flex items-center justify-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  {lang("لم يتم العثور على الفاتورة", "Invoice not found")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {lang("معلومات الفاتورة", "Invoice Information")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            {lang("العميل", "Customer")}
                          </p>
                          <p className="font-semibold text-sm mt-1">
                            {invoice.customerName || lang("غير معروف", "Unknown")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            {lang("تاريخ الإنشاء", "Created")}
                          </p>
                          <p className="font-semibold text-sm mt-1">
                            {formatDate(invoice.createdAt, language)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            {lang("تاريخ الاستحقاق", "Due Date")}
                          </p>
                          <p className="font-semibold text-sm mt-1">
                            {formatDate(invoice.dueDate, language)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            {lang("الحالة", "Status")}
                          </p>
                          <Badge
                            variant={invoice.status === "paid" ? "default" : "secondary"}
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 mt-1",
                              invoice.status === "paid" &&
                                "bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]",
                            )}
                          >
                            {invoice.status === "paid"
                              ? lang("مدفوعة", "Paid")
                              : lang("غير مدفوعة", "Unpaid")}
                          </Badge>
                        </div>
                      </div>
                      {invoice.paidDate && (
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            {lang("تاريخ الدفع", "Paid Date")}
                          </p>
                          <p className="font-semibold text-sm mt-1">
                            {formatDate(invoice.paidDate, language)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold">
                        {lang("العناصر", "Items")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              #
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              {lang("الوصف", "Description")}
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-right text-muted-foreground">
                              {lang("الكمية", "Quantity")}
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-right text-muted-foreground">
                              {lang("سعر الوحدة", "Unit Price")}
                            </TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-right text-muted-foreground">
                              {lang("الإجمالي", "Total")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoice.items?.map((item, index) => (
                            <TableRow
                              key={item.id}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <TableCell className="text-sm py-3">{index + 1}</TableCell>
                              <TableCell className="text-sm py-3">{item.description}</TableCell>
                              <TableCell className="text-sm py-3 text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-sm py-3 text-right">
                                {formatCurrency(item.unitPrice, language)}
                              </TableCell>
                              <TableCell className="text-sm font-bold text-primary text-right">
                                {formatCurrency(item.total, language)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="border-2 shadow-sm sticky top-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold">
                        {lang("ملخص الفاتورة", "Invoice Summary")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {lang("المجموع الفرعي", "Subtotal")}
                        </span>
                        <span className="font-semibold text-sm">
                          {formatCurrency(subtotal, language)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {lang("الخصم", "Discount")}
                        </span>
                        <span className="font-semibold text-sm text-destructive">
                          - {formatCurrency(discountAmount, language)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">{lang("الإجمالي", "Total")}</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(total, language)}
                        </span>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3 pt-3">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                            {lang("حالة الدفع", "Payment Status")}
                          </p>
                          <Select defaultValue={invoice.status}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">{lang("غير مدفوعة", "Unpaid")}</SelectItem>
                              <SelectItem value="paid">{lang("مدفوعة", "Paid")}</SelectItem>
                              <SelectItem value="partial">
                                {lang("مدفوعة جزئياً", "Partially Paid")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button className="w-full" variant="default" size="default">
                          {lang("حفظ التغييرات", "Save Changes")}
                        </Button>

                        <Button className="w-full" variant="outline" size="default">
                          <Printer className="h-4 w-4 mr-2" />
                          {lang("طباعة الفاتورة", "Print Invoice")}
                        </Button>

                        <Button className="w-full" variant="outline" size="default">
                          <Download className="h-4 w-4 mr-2" />
                          {lang("تحميل PDF", "Download PDF")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
