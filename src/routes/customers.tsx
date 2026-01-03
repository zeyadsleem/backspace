import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchInput } from "@/components/ui/search-input";
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
import { Plus, User, Users, Filter } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerActions } from "@/components/customers/customer-actions";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useCustomers } from "@/hooks/use-customers";
import { getInitials, formatDate, getCustomerTypeLabel } from "@/lib/formatters";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

export default function CustomersPage() {
  const { t, language, dir, lang } = useI18n();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "visitor" | "member">("all");

  const { data: customers, isLoading, error } = useCustomers();

  const filteredCustomers = customers?.filter((c) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.humanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    const matchesType = typeFilter === "all" || c.customerType === typeFilter;

    return matchesSearch && matchesType;
  });

  const stats = {
    total: customers?.length ?? 0,
    members: customers?.filter((c) => c.customerType === "member").length ?? 0,
    visitors: customers?.filter((c) => c.customerType === "visitor").length ?? 0,
    thisMonth:
      customers?.filter((c) => {
        const d = new Date(c.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length ?? 0,
  };

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={t("customers").title[language]}
        subtitle={t("customers").subtitle[language]}
        action={
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            {lang("إضافة عميل", "Add Customer")}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={lang("إجمالي العملاء", "Total Customers")}
          value={stats.total}
          icon={Users}
        />

        <StatCard title={lang("مشتركين", "Members")} value={stats.members} icon={User} />

        <StatCard title={lang("الزوار", "Visitors")} value={stats.visitors} icon={User} />

        <StatCard title={lang("هذا الشهر", "This Month")} value={stats.thisMonth} icon={Plus} />
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3 justify-between w-full">
            <CardTitle>{t("customers").all[language]}</CardTitle>

            <div className="flex gap-3">
              <SearchInput
                placeholder={lang("بحث باسم أو رقم العميل...", "Search by name or customer ID...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[320px]"
              />

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang("الكل", "All")}</SelectItem>
                  <SelectItem value="member">{lang("مشترك", "Member")}</SelectItem>
                  <SelectItem value="visitor">{lang("زائر", "Visitor")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <LoadingState type="table" count={5} />
          ) : error ? (
            <EmptyState icon={User} title={lang("خطأ في تحميل البيانات", "Error loading data")} />
          ) : !filteredCustomers?.length ? (
            <EmptyState icon={User} title={lang("لم يتم العثور على عملاء", "No customers found")} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("العميل", "Customer")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("النوع", "Type")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("الهاتف", "Phone")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("تاريخ الانضمام", "Joined")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-right"} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-left"}>
                      <Link
                        to="/customers/$id"
                        params={{ id: customer.id }}
                        className={`flex gap-3 ${dir === "rtl" ? "flex-row" : ""}`}
                      >
                        <Avatar>
                          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {customer.humanId}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-left"}>
                      <Badge
                        variant={customer.customerType === "visitor" ? "secondary" : "default"}
                      >
                        {getCustomerTypeLabel(customer.customerType, language)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`font-mono ${dir === "rtl" ? "text-right" : "text-left"}`}
                    >
                      {customer.phone}
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-left"}>
                      {formatDate(customer.createdAt, language)}
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-right"}>
                      <CustomerActions customer={customer} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CustomerForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        mode="create"
        defaultType="visitor"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
