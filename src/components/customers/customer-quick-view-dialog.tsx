import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, Calendar, Clock, FileText, CreditCard, X, Edit } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/tauri-api";
import { formatDate, formatCurrency, getInitials, getCustomerTypeLabel } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";

interface CustomerQuickViewDialogProps {
  customerId: string;
  trigger: React.ReactNode;
}

export function CustomerQuickViewDialog({ customerId, trigger }: CustomerQuickViewDialogProps) {
  const { language, dir, lang } = useI18n();
  const [open, setOpen] = useState(false);

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => api.customers.get(customerId),
    enabled: open,
  });

  const { data: sessions } = useQuery({
    queryKey: ["customer-sessions", customerId],
    queryFn: () =>
      api.sessions.list().then((s) => s.filter((session) => session.customerId === customerId)),
    enabled: open,
  });

  const { data: invoices } = useQuery({
    queryKey: ["customer-invoices", customerId],
    queryFn: () =>
      api.invoices.list().then((inv) => inv.filter((invoice) => invoice.customerId === customerId)),
    enabled: open,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["customer-subscriptions", customerId],
    queryFn: () =>
      api.subscriptions.list().then((subs) => subs.filter((sub) => sub.customerId === customerId)),
    enabled: open,
  });

  const totalSpent = sessions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
  const totalSessions = sessions?.length || 0;
  const activeSubscription = subscriptions?.find((s) => s.isActive);

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
              <div className="flex items-center gap-4">
                {isLoadingCustomer ? (
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">...</AvatarFallback>
                  </Avatar>
                ) : customer ? (
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                ) : null}
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {customer?.name || lang("جاري التحميل...", "Loading...")}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground font-mono">
                    {customer?.humanId || ""}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {isLoadingCustomer ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  {lang("جاري تحميل بيانات العميل...", "Loading customer data...")}
                </div>
              </div>
            ) : !customer ? (
              <EmptyState icon={User} title={lang("العميل غير موجود", "Customer not found")} />
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50 border rounded-lg">
                  <TabsTrigger value="overview" className="rounded-md">
                    <User className="h-4 w-4 mr-2" />
                    {lang("نظرة عامة", "Overview")}
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="rounded-md">
                    <Clock className="h-4 w-4 mr-2" />
                    {lang("الجلسات", "Sessions")}
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="rounded-md">
                    <FileText className="h-4 w-4 mr-2" />
                    {lang("الفواتير", "Invoices")}
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="rounded-md">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {lang("الاشتراك", "Subscription")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-extrabold">
                          {lang("العميل", "Customer")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{customer.name}</p>
                            <Badge className="mt-1 text-xs">
                              {getCustomerTypeLabel(customer.customerType, language)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-extrabold">
                          {lang("الاتصال", "Contact")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{customer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(customer.createdAt, language)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-extrabold">
                          {lang("الإحصائيات", "Stats")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(totalSpent, language)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lang("إجمالي المصروف", "Total Spent")}
                        </p>
                        <Separator className="my-3" />
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {lang("عدد الجلسات", "Total Sessions")}
                            </span>
                            <span className="font-semibold">{totalSessions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {lang("الاشتراك", "Subscription")}
                            </span>
                            <span className="font-semibold">
                              {activeSubscription
                                ? lang("نشط", "Active")
                                : lang("غير نشط", "Inactive")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {customer.notes && (
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-extrabold">
                          {lang("ملاحظات", "Notes")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{customer.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="sessions" className="mt-6">
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-extrabold">
                        {lang("تاريخ الجلسات", "Sessions History")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!sessions || sessions.length === 0 ? (
                        <EmptyState
                          icon={Clock}
                          title={lang("لا توجد جلسات", "No sessions found")}
                        />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {lang("التاريخ", "Date")}
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {lang("المورد", "Resource")}
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {lang("المدة", "Duration")}
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">
                                {lang("المبلغ", "Amount")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sessions.map((session) => (
                              <TableRow
                                key={session.id}
                                className="border-b transition-colors hover:bg-muted/50"
                              >
                                <TableCell className="text-sm font-medium">
                                  {formatDate(session.startedAt, language)}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {session.resourceName}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {session.durationMinutes
                                    ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m`
                                    : lang("جارية", "In Progress")}
                                </TableCell>
                                <TableCell className="text-sm font-bold text-primary text-right">
                                  {session.amount ? formatCurrency(session.amount, language) : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="invoices" className="mt-6">
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-extrabold">
                        {lang("الفواتير", "Invoices")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!invoices || invoices.length === 0 ? (
                        <EmptyState
                          icon={FileText}
                          title={lang("لا توجد فواتير", "No invoices found")}
                        />
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                #
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {lang("التاريخ", "Date")}
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {lang("المبلغ", "Amount")}
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">
                                {lang("الحالة", "Status")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoices.map((invoice, index) => (
                              <TableRow
                                key={invoice.id}
                                className="border-b transition-colors hover:bg-muted/50"
                              >
                                <TableCell className="text-sm font-medium">
                                  #{String(index + 1).padStart(4, "0")}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {formatDate(invoice.createdAt, language)}
                                </TableCell>
                                <TableCell className="text-sm font-bold text-primary">
                                  {formatCurrency(invoice.amount, language)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={invoice.status === "paid" ? "default" : "secondary"}
                                    className="text-[10px] font-bold px-2 py-0.5"
                                  >
                                    {invoice.status === "paid"
                                      ? lang("مدفوعة", "Paid")
                                      : lang("غير مدفوعة", "Unpaid")}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subscription" className="mt-6">
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-extrabold">
                        {lang("الاشتراك", "Subscription")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!activeSubscription ? (
                        <EmptyState
                          icon={CreditCard}
                          title={lang("لا يوجد اشتراك نشط", "No active subscription")}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                            <div>
                              <p className="text-sm font-semibold text-muted-foreground">
                                {lang("النوع", "Type")}
                              </p>
                              <p className="text-lg font-bold">{activeSubscription.planType}</p>
                            </div>
                            <Badge className="text-sm font-bold px-3 py-1">
                              {lang("نشط", "Active")}
                            </Badge>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 bg-muted/30 rounded-lg border">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                {lang("تاريخ البدء", "Start Date")}
                              </p>
                              <p className="text-lg font-semibold mt-1">
                                {formatDate(activeSubscription.startDate, language)}
                              </p>
                            </div>

                            {activeSubscription.endDate && (
                              <div className="p-4 bg-muted/30 rounded-lg border">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                  {lang("تاريخ الانتهاء", "End Date")}
                                </p>
                                <p className="text-lg font-semibold mt-1">
                                  {formatDate(activeSubscription.endDate, language)}
                                </p>
                              </div>
                            )}
                          </div>

                          {activeSubscription.hoursAllowance && (
                            <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                {lang("الساعات المتبقية", "Hours Remaining")}
                              </p>
                              <p className="text-2xl font-bold text-primary mt-1">
                                {activeSubscription.hoursAllowance}h
                              </p>
                            </div>
                          )}

                          <Button variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            {lang("تعديل الاشتراك", "Edit Subscription")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
