import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  Wallet,
  Hash,
  FileText,
  Copy,
  Play,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/tauri-api";
import { formatDate, formatCurrency, getInitials, getCustomerTypeLabel } from "@/lib/formatters";
import { getPlanTypeLabel, type PlanType } from "@/lib/validation/schemas/subscription";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { CustomerForm } from "./customer-form";

interface CustomerViewDialogProps {
  customerId: string;
  trigger: React.ReactNode;
}

export function CustomerViewDialog({ customerId, trigger }: CustomerViewDialogProps) {
  const { language, dir, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: customer, isLoading } = useQuery({
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(lang("تم النسخ", "Copied"));
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0" dir={dir}>
          {isLoading ? (
            <div className="p-6 space-y-6 flex-1">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
              </div>
            </div>
          ) : !customer ? (
            <div className="p-6 flex-1">
              <EmptyState icon={User} title={lang("العميل غير موجود", "Customer not found")} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <DialogHeader className="p-0">
                      <DialogTitle className="text-xl font-bold">{customer.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {customer.humanId}
                      </Badge>
                      <Badge variant={customer.customerType === "member" ? "default" : "secondary"}>
                        {getCustomerTypeLabel(customer.customerType, language)}
                      </Badge>
                      {activeSubscription && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          {lang("مشترك نشط", "Active")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="me-8"
                    onClick={() => setShowEditForm(true)}
                  >
                    <Edit className="h-4 w-4 me-1" />
                    {lang("تعديل", "Edit")}
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 mt-6">
                  <div className="text-center p-3 rounded-lg bg-background/50 backdrop-blur">
                    <Wallet className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(totalSpent, language)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{lang("المصروف", "Spent")}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50 backdrop-blur">
                    <Hash className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">{totalSessions}</p>
                    <p className="text-[10px] text-muted-foreground">{lang("جلسة", "Sessions")}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50 backdrop-blur">
                    <CreditCard className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm font-bold truncate">
                      {activeSubscription
                        ? getPlanTypeLabel(activeSubscription.planType as PlanType, language)
                        : "-"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{lang("الاشتراك", "Plan")}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50 backdrop-blur">
                    <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm font-bold">{formatDate(customer.createdAt, language)}</p>
                    <p className="text-[10px] text-muted-foreground">{lang("التسجيل", "Joined")}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-0 flex-1 overflow-y-auto">
                <Tabs defaultValue="info" className="w-full h-full flex flex-col">
                  <TabsList className="w-full grid grid-cols-3 mb-4 flex-shrink-0">
                    <TabsTrigger value="info" className="gap-1.5">
                      <User className="h-4 w-4" />
                      {lang("المعلومات", "Info")}
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="gap-1.5">
                      <Clock className="h-4 w-4" />
                      {lang("الجلسات", "Sessions")}
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="gap-1.5">
                      <FileText className="h-4 w-4" />
                      {lang("الفواتير", "Invoices")}
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 min-h-[350px]">
                    <TabsContent value="info" className="space-y-4 mt-0 h-full">
                      {/* Contact Info */}
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            {lang("معلومات الاتصال", "Contact Info")}
                          </h4>

                          <div
                            onClick={() => copyToClipboard(customer.phone)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                          >
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground">
                                {lang("رقم الهاتف", "Phone")}
                              </p>
                              <p className="font-medium" dir="ltr">
                                {customer.phone}
                              </p>
                            </div>
                            <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {customer.email && (
                            <div
                              onClick={() => copyToClipboard(customer.email!)}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                            >
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">
                                  {lang("البريد الإلكتروني", "Email")}
                                </p>
                                <p className="font-medium truncate">{customer.email}</p>
                              </div>
                              <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Notes */}
                      {customer.notes && (
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                              {lang("ملاحظات", "Notes")}
                            </h4>
                            <p className="text-sm">{customer.notes}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Subscription */}
                      {activeSubscription && (
                        <Card className="border-emerald-500/20 bg-emerald-500/5">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold">
                                {lang("الاشتراك النشط", "Active Subscription")}
                              </h4>
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                {getPlanTypeLabel(
                                  activeSubscription.planType as PlanType,
                                  language,
                                )}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {lang("البداية", "Start")}
                                </p>
                                <p className="font-medium">
                                  {formatDate(activeSubscription.startDate, language)}
                                </p>
                              </div>
                              {activeSubscription.endDate && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    {lang("النهاية", "End")}
                                  </p>
                                  <p className="font-medium">
                                    {formatDate(activeSubscription.endDate, language)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {activeSubscription.hoursAllowance && (
                              <div className="mt-3 pt-3 border-t border-emerald-500/20 text-center">
                                <p className="text-3xl font-bold text-emerald-600">
                                  {activeSubscription.hoursAllowance}
                                  <span className="text-sm font-normal text-muted-foreground ms-1">
                                    {lang("ساعة متبقية", "hrs left")}
                                  </span>
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Quick Action */}
                      <Button className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        {lang("بدء جلسة جديدة", "Start New Session")}
                      </Button>
                    </TabsContent>

                    <TabsContent value="sessions" className="mt-0 h-full">
                      {!sessions || sessions.length === 0 ? (
                        <EmptyState icon={Clock} title={lang("لا توجد جلسات", "No sessions")} />
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="text-xs">{lang("التاريخ", "Date")}</TableHead>
                                <TableHead className="text-xs">
                                  {lang("المورد", "Resource")}
                                </TableHead>
                                <TableHead className="text-xs">
                                  {lang("المدة", "Duration")}
                                </TableHead>
                                <TableHead className="text-xs text-end">
                                  {lang("المبلغ", "Amount")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sessions.slice(0, 8).map((session) => (
                                <TableRow key={session.id}>
                                  <TableCell className="text-sm">
                                    {formatDate(session.startedAt, language)}
                                  </TableCell>
                                  <TableCell className="text-sm">{session.resourceName}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {session.durationMinutes
                                      ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m`
                                      : lang("جارية", "Active")}
                                  </TableCell>
                                  <TableCell className="text-sm font-medium text-end">
                                    {session.amount
                                      ? formatCurrency(session.amount, language)
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {sessions.length > 8 && (
                            <div className="p-2 text-center border-t bg-muted/30">
                              <span className="text-xs text-muted-foreground">
                                {lang(
                                  `+${sessions.length - 8} جلسات أخرى`,
                                  `+${sessions.length - 8} more`,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="invoices" className="mt-0 h-full">
                      {!invoices || invoices.length === 0 ? (
                        <EmptyState icon={FileText} title={lang("لا توجد فواتير", "No invoices")} />
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="text-xs">#</TableHead>
                                <TableHead className="text-xs">{lang("التاريخ", "Date")}</TableHead>
                                <TableHead className="text-xs">
                                  {lang("المبلغ", "Amount")}
                                </TableHead>
                                <TableHead className="text-xs text-end">
                                  {lang("الحالة", "Status")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoices.slice(0, 8).map((invoice, index) => (
                                <TableRow key={invoice.id}>
                                  <TableCell className="text-sm font-mono text-muted-foreground">
                                    #{String(index + 1).padStart(4, "0")}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {formatDate(invoice.createdAt, language)}
                                  </TableCell>
                                  <TableCell className="text-sm font-medium">
                                    {formatCurrency(invoice.amount, language)}
                                  </TableCell>
                                  <TableCell className="text-end">
                                    <Badge
                                      variant={invoice.status === "paid" ? "default" : "secondary"}
                                    >
                                      {invoice.status === "paid"
                                        ? lang("مدفوعة", "Paid")
                                        : lang("معلقة", "Pending")}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {invoices.length > 8 && (
                            <div className="p-2 text-center border-t bg-muted/30">
                              <span className="text-xs text-muted-foreground">
                                {lang(
                                  `+${invoices.length - 8} فواتير أخرى`,
                                  `+${invoices.length - 8} more`,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {customer && (
        <CustomerForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          customer={customer}
          mode="edit"
        />
      )}
    </>
  );
}
