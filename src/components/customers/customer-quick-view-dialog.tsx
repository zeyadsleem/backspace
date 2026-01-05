import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Edit,
  Wallet,
  Hash,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/tauri-api";
import { formatDate, formatCurrency, getInitials, getCustomerTypeLabel } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";

interface CustomerQuickViewDialogProps {
  customerId: string;
  trigger: React.ReactNode;
}

function CustomerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
      <div className={`p-2 rounded-md ${highlight ? "bg-primary/10" : "bg-background"}`}>
        <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={`text-sm font-semibold truncate ${highlight ? "text-primary" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
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
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-full sm:max-w-2xl p-0">
          <ScrollArea className="h-full">
            <div className="p-6" dir={dir}>
              {isLoadingCustomer ? (
                <>
                  <SheetHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </SheetHeader>
                  <CustomerSkeleton />
                </>
              ) : !customer ? (
                <EmptyState icon={User} title={lang("العميل غير موجود", "Customer not found")} />
              ) : (
                <>
                  <SheetHeader className="pb-6 border-b">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2">
                          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <SheetTitle className="text-xl">{customer.name}</SheetTitle>
                          <SheetDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {customer.humanId}
                            </Badge>
                            <Badge variant="outline">
                              {getCustomerTypeLabel(customer.customerType, language)}
                            </Badge>
                          </SheetDescription>
                        </div>
                      </div>
                    </div>
                  </SheetHeader>

                  <Tabs defaultValue="overview" className="mt-6">
                    <TabsList className="w-full grid grid-cols-4 h-10">
                      <TabsTrigger value="overview" className="text-xs gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{lang("نظرة عامة", "Overview")}</span>
                      </TabsTrigger>
                      <TabsTrigger value="sessions" className="text-xs gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{lang("الجلسات", "Sessions")}</span>
                      </TabsTrigger>
                      <TabsTrigger value="invoices" className="text-xs gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{lang("الفواتير", "Invoices")}</span>
                      </TabsTrigger>
                      <TabsTrigger value="subscription" className="text-xs gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{lang("الاشتراك", "Subscription")}</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                      {/* Stats Grid */}
                      <div className="grid gap-3 grid-cols-2">
                        <StatItem
                          icon={Wallet}
                          label={lang("إجمالي المصروف", "Total Spent")}
                          value={formatCurrency(totalSpent, language)}
                          highlight
                        />
                        <StatItem
                          icon={Hash}
                          label={lang("عدد الجلسات", "Total Sessions")}
                          value={totalSessions}
                        />
                        <StatItem
                          icon={CreditCard}
                          label={lang("الاشتراك", "Subscription")}
                          value={
                            activeSubscription ? lang("نشط", "Active") : lang("غير نشط", "Inactive")
                          }
                        />
                        <StatItem
                          icon={Calendar}
                          label={lang("تاريخ التسجيل", "Joined")}
                          value={formatDate(customer.createdAt, language)}
                        />
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          {lang("معلومات الاتصال", "Contact Info")}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span dir="ltr">{customer.phone}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-3 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {customer.notes && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            {lang("ملاحظات", "Notes")}
                          </h4>
                          <p className="text-sm bg-muted/40 p-3 rounded-lg">{customer.notes}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="sessions" className="mt-6">
                      {!sessions || sessions.length === 0 ? (
                        <EmptyState
                          icon={Clock}
                          title={lang("لا توجد جلسات", "No sessions found")}
                        />
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="text-xs font-semibold">
                                  {lang("التاريخ", "Date")}
                                </TableHead>
                                <TableHead className="text-xs font-semibold">
                                  {lang("المورد", "Resource")}
                                </TableHead>
                                <TableHead className="text-xs font-semibold">
                                  {lang("المدة", "Duration")}
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-end">
                                  {lang("المبلغ", "Amount")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sessions.slice(0, 10).map((session) => (
                                <TableRow key={session.id}>
                                  <TableCell className="text-sm">
                                    {formatDate(session.startedAt, language)}
                                  </TableCell>
                                  <TableCell className="text-sm">{session.resourceName}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {session.durationMinutes
                                      ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m`
                                      : lang("جارية", "In Progress")}
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
                          {sessions.length > 10 && (
                            <div className="p-3 text-center border-t bg-muted/30">
                              <span className="text-xs text-muted-foreground">
                                {lang(
                                  `+${sessions.length - 10} جلسات أخرى`,
                                  `+${sessions.length - 10} more sessions`,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="invoices" className="mt-6">
                      {!invoices || invoices.length === 0 ? (
                        <EmptyState
                          icon={FileText}
                          title={lang("لا توجد فواتير", "No invoices found")}
                        />
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="text-xs font-semibold">#</TableHead>
                                <TableHead className="text-xs font-semibold">
                                  {lang("التاريخ", "Date")}
                                </TableHead>
                                <TableHead className="text-xs font-semibold">
                                  {lang("المبلغ", "Amount")}
                                </TableHead>
                                <TableHead className="text-xs font-semibold text-end">
                                  {lang("الحالة", "Status")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoices.slice(0, 10).map((invoice, index) => (
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
                                      className="text-xs"
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
                          {invoices.length > 10 && (
                            <div className="p-3 text-center border-t bg-muted/30">
                              <span className="text-xs text-muted-foreground">
                                {lang(
                                  `+${invoices.length - 10} فواتير أخرى`,
                                  `+${invoices.length - 10} more invoices`,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="subscription" className="mt-6">
                      {!activeSubscription ? (
                        <EmptyState
                          icon={CreditCard}
                          title={lang("لا يوجد اشتراك نشط", "No active subscription")}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {lang("نوع الاشتراك", "Plan Type")}
                              </p>
                              <p className="text-lg font-semibold">{activeSubscription.planType}</p>
                            </div>
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              {lang("نشط", "Active")}
                            </Badge>
                          </div>

                          <div className="grid gap-3 grid-cols-2">
                            <div className="p-3 bg-muted/40 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">
                                {lang("تاريخ البدء", "Start Date")}
                              </p>
                              <p className="text-sm font-medium">
                                {formatDate(activeSubscription.startDate, language)}
                              </p>
                            </div>
                            {activeSubscription.endDate && (
                              <div className="p-3 bg-muted/40 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {lang("تاريخ الانتهاء", "End Date")}
                                </p>
                                <p className="text-sm font-medium">
                                  {formatDate(activeSubscription.endDate, language)}
                                </p>
                              </div>
                            )}
                          </div>

                          {activeSubscription.hoursAllowance && (
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
                              <p className="text-xs text-muted-foreground mb-1">
                                {lang("الساعات المتبقية", "Hours Remaining")}
                              </p>
                              <p className="text-3xl font-bold text-primary">
                                {activeSubscription.hoursAllowance}
                                <span className="text-lg font-normal text-muted-foreground ms-1">
                                  {lang("ساعة", "hrs")}
                                </span>
                              </p>
                            </div>
                          )}

                          <Separator />

                          <Button variant="outline" className="w-full gap-2">
                            <Edit className="h-4 w-4" />
                            {lang("تعديل الاشتراك", "Edit Subscription")}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
