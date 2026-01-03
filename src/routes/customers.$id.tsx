import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Phone,
  Mail,
  User,
  Clock,
  FileText,
  CreditCard,
  Edit,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CustomerForm } from "@/components/customers/customer-form";
import { EmptyState } from "@/components/shared/empty-state";
import { useCustomer } from "@/hooks/use-customers";
import { getInitials, formatDate, formatCurrency, getCustomerTypeLabel } from "@/lib/formatters";

export const Route = createFileRoute("/customers/$id")({
  component: CustomerProfilePage,
});

export default function CustomerProfilePage() {
  const { id } = Route.useParams();
  const { t, language, dir, lang } = useI18n();
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: customer, isLoading, error } = useCustomer(id);

  const mockSessions = [
    {
      id: "1",
      date: "2025-01-02",
      resource: "Seat A1",
      duration: "2h 15m",
      amount: 112.5,
    },
    {
      id: "2",
      date: "2025-01-01",
      resource: "Seat A2",
      duration: "3h 30m",
      amount: 175,
    },
  ];

  const mockInvoices = [
    {
      id: "1",
      date: "2025-01-02",
      amount: 112.5,
      status: "paid" as const,
    },
    {
      id: "2",
      date: "2025-01-01",
      amount: 175,
      status: "unpaid" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-8" dir={dir}>
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto p-8 text-center" dir={dir}>
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <EmptyState
          icon={User}
          title={lang("العميل غير موجود", "Customer not found")}
          action={
            <Link to="/customers">
              <Button variant="outline" className="mt-4">
                {lang("العودة للعملاء", "Back to Customers")}
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <div className="flex items-center gap-4">
        <Link to="/customers">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl">
            {dir === "rtl" ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Button>
        </Link>

        <div>
          <h1 className="text-xl font-bold">{t("customers").profile[language]}</h1>
          <p className="text-sm text-muted-foreground">
            {lang("تفاصيل العميل", "Customer details")}
          </p>
        </div>

        <div className="ml-auto">
          <Button size="sm" onClick={() => setShowEditForm(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {lang("تعديل", "Edit")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{lang("العميل", "Customer")}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.humanId}</p>
              <Badge className="mt-1">
                {getCustomerTypeLabel(customer.customerType, language)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang("الاتصال", "Contact")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Phone className="h-4 w-4" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex gap-2">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(customer.createdAt, language)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang("الإحصائيات", "Stats")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(1250, language)}</p>
            <p className="text-sm text-muted-foreground">{lang("إجمالي الإنفاق", "Total Spent")}</p>
          </CardContent>
        </Card>
      </div>

      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{lang("ملاحظات", "Notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="sessions">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="sessions">
            <Clock className="h-4 w-4 mr-2" />
            {lang("الجلسات", "Sessions")}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            {lang("الفواتير", "Invoices")}
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            {lang("الاشتراك", "Subscription")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang("التاريخ", "Date")}</TableHead>
                <TableHead>{lang("المورد", "Resource")}</TableHead>
                <TableHead>{lang("المدة", "Duration")}</TableHead>
                <TableHead>{lang("المبلغ", "Amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{formatDate(s.date, language)}</TableCell>
                  <TableCell>{s.resource}</TableCell>
                  <TableCell>{s.duration}</TableCell>
                  <TableCell>{formatCurrency(s.amount, language)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="invoices">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{lang("التاريخ", "Date")}</TableHead>
                <TableHead>{lang("المبلغ", "Amount")}</TableHead>
                <TableHead>{lang("الحالة", "Status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>#{i.id.padStart(4, "0")}</TableCell>
                  <TableCell>{formatDate(i.date, language)}</TableCell>
                  <TableCell>{formatCurrency(i.amount, language)}</TableCell>
                  <TableCell>
                    <Badge variant={i.status === "paid" ? "default" : "destructive"}>
                      {lang(
                        i.status === "paid" ? "مدفوعة" : "غير مدفوعة",
                        i.status === "paid" ? "Paid" : "Unpaid",
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="subscription">
          <EmptyState title={lang("لا يوجد اشتراك نشط", "No active subscription")} />
        </TabsContent>
      </Tabs>

      <CustomerForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        customer={customer}
        mode="edit"
      />
    </div>
  );
}
