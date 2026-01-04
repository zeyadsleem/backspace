import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CheckCircle, XCircle, Receipt, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useInvoices, useUpdateInvoice } from "@/hooks/use-invoices";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/formatters";

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
});

export default function InvoicesPage() {
  const { t, language, dir, lang } = useI18n();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "paid" | "unpaid">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const { data: invoices, isLoading, error } = useInvoices();
  const updateInvoice = useUpdateInvoice();

  const filteredInvoices = invoices?.filter((invoice) => {
    if (selectedStatus === "all") return true;
    return invoice.status === selectedStatus;
  });

  const stats = {
    total: invoices?.length ?? 0,
    paid: invoices?.filter((i) => i.status === "paid").length ?? 0,
    unpaid: invoices?.filter((i) => i.status === "unpaid").length ?? 0,
    totalAmount: invoices?.reduce((sum, i) => sum + i.amount, 0) ?? 0,
  };

  const handleMarkAsPaid = (id: string) => {
    updateInvoice.mutate(
      { id, data: { status: "paid", paidDate: new Date().toISOString() } },
      {
        onSuccess: () => {
          setSelectedInvoice(null);
        },
      },
    );
  };

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={t("invoices").title[language]}
        subtitle={t("invoices").subtitle[language]}
        action={
          <Button size="default">
            <Plus className="h-4 w-4" />
            {t("invoices").create[language]}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={lang("إجمالي الفواتير", "Total Invoices")}
          value={stats.total}
          icon={Receipt}
        />
        <StatCard
          title={lang("فواتير مدفوعة", "Paid Invoices")}
          value={stats.paid}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title={lang("فواتير غير مدفوعة", "Unpaid Invoices")}
          value={stats.unpaid}
          icon={XCircle}
          color="orange"
        />
        <StatCard
          title={lang("إجمالي المبلغ", "Total Amount")}
          value={`ج.م ${stats.totalAmount.toLocaleString()}`}
          icon={Receipt}
          color="blue"
        />
      </div>

      <Card className="rounded-lg border shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-extrabold">
              {t("invoices").all_invoices[language]}
            </CardTitle>
            <div className="flex gap-3">
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang("الكل", "All")}</SelectItem>
                  <SelectItem value="paid">{lang("مدفوعة", "Paid")}</SelectItem>
                  <SelectItem value="unpaid">{lang("غير مدفوعة", "Unpaid")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState type="table" count={5} />
          ) : error ? (
            <EmptyState
              icon={Receipt}
              title={lang("خطأ في تحميل البيانات", "Error loading data")}
            />
          ) : !filteredInvoices?.length ? (
            <EmptyState icon={Receipt} title={lang("لا توجد فواتير", "No invoices found")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {t("invoices").customer[language]}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {t("invoices").amount[language]}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {t("invoices").status[language]}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {t("invoices").due_date[language]}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-right"}>
                    {lang("إجراءات", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="text-sm font-bold py-3">
                      {invoice.customerName ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-sm font-bold">
                              {invoice.customerName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold">{invoice.customerName}</p>
                            {invoice.customerHumanId && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {invoice.customerHumanId}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        lang("عميل غير معروف", "Unknown")
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-bold py-3 text-primary">
                      ج.م {invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "secondary"}
                        className="px-2 py-0.5 text-[10px] font-bold"
                      >
                        {invoice.status === "paid" ? (
                          <>
                            <CheckCircle
                              className={cn("h-3 w-3", dir === "rtl" ? "ml-1" : "mr-1")}
                            />
                            {t("common").paid[language]}
                          </>
                        ) : (
                          <>
                            <XCircle className={cn("h-3 w-3", dir === "rtl" ? "ml-1" : "mr-1")} />
                            {t("common").unpaid[language]}
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium py-3">
                      {formatDate(invoice.dueDate, language)}
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-right"}>
                      <div className="flex items-center gap-2 justify-end">
                        {invoice.status === "unpaid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            {t("invoices").mark_as_paid[language]}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="sm:max-w-[425px] rounded-lg border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {t("invoices").mark_as_paid[language]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                {lang(
                  "هل أنت متأكد أنك تريد وضع علامة تم الدفع لهذه الفاتورة؟",
                  "Are you sure you want to mark this invoice as paid?",
                )}
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)} className="h-9">
                  {t("common").cancel[language]}
                </Button>
                <Button
                  size="default"
                  onClick={() => selectedInvoice && handleMarkAsPaid(selectedInvoice)}
                  disabled={updateInvoice.isPending}
                  className="h-9"
                >
                  {t("invoices").mark_as_paid[language]}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: "emerald" | "orange" | "blue";
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    emerald: "text-[var(--color-emerald)]",
    orange: "text-[var(--color-orange)]",
    blue: "text-[var(--color-blue)]",
  };

  return (
    <Card className="py-2">
      <CardHeader className="flex justify-between pb-1">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color && colorClasses[color], "text-muted-foreground")} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className={cn("text-2xl font-bold", color && colorClasses[color])}>{value}</div>
      </CardContent>
    </Card>
  );
}
