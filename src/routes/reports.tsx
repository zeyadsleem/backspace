import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, TrendingUp, Users, Banknote, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { StatCard } from "@/components/stat-card";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

const mockRevenueData = [
  { period: "Today", revenue: 4875, sessions: 12, customers: 8 },
  { period: "This Week", revenue: 24375, sessions: 68, customers: 42 },
  { period: "This Month", revenue: 97500, sessions: 312, customers: 185 },
];

const mockTopCustomers = [
  { rank: 1, name: "Ahmed Ali", totalSpent: 6250, sessions: 25 },
  { rank: 2, name: "Sarah Johnson", totalSpent: 4900, sessions: 18 },
  { rank: 3, name: "Mohamed Hassan", totalSpent: 4375, sessions: 15 },
  { rank: 4, name: "Fatima Ahmed", totalSpent: 3600, sessions: 12 },
  { rank: 5, name: "Omar Ibrahim", totalSpent: 3250, sessions: 11 },
];

export default function ReportsPage() {
  const { t, language, dir } = useI18n();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
            {t("reports").title[language]}
          </h1>
          <p className="text-base text-muted-foreground mt-1">{t("reports").subtitle[language]}</p>
        </div>
        <Button variant="outline" size="default" className="font-bold">
          <Download className="h-4 w-4" />
          {t("reports").export_report[language]}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-10 p-1 bg-muted/50 border rounded-lg">
          <TabsTrigger
            value="overview"
            className="px-4 font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
          >
            {t("reports").overview[language]}
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="px-4 font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
          >
            {t("reports").revenue[language]}
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="px-4 font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
          >
            {t("reports").customers[language]}
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="px-4 font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
          >
            {t("reports").usage[language]}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("reports").total_revenue[language]}
              value="97,500"
              subtitle={language === "ar" ? "هذا الشهر" : "This Month"}
              icon={Banknote}
              badge={t("reports").revenue[language]}
              color="emerald"
            />
            <StatCard
              title={t("reports").total_sessions[language]}
              value="312"
              subtitle={language === "ar" ? "هذا الشهر" : "This Month"}
              icon={Clock}
              badge={t("nav").sessions[language]}
              color="blue"
            />
            <StatCard
              title={t("reports").active_customers[language]}
              value="185"
              subtitle={language === "ar" ? "هذا الشهر" : "This Month"}
              icon={Users}
              badge={t("nav").customers[language]}
              color="purple"
            />
            <StatCard
              title={t("reports").average_session[language]}
              value="312.50"
              subtitle={t("reports").per_session[language]}
              icon={Clock}
              badge={language === "ar" ? "الإنتاجية" : "Productivity"}
              color="amber"
            />
          </div>

          <Card className="rounded-xl border-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {t("reports").revenue_by_period[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {t("reports").period[language]}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {t("reports").revenue[language]}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {t("reports").session_count[language]}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {t("reports").customer_count[language]}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {t("reports").avg_per_session[language]}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRevenueData.map((data) => (
                    <TableRow
                      key={data.period}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="text-sm font-bold py-3">{data.period}</TableCell>
                      <TableCell className="text-sm font-bold text-primary py-3">
                        ج.م {data.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium py-3">{data.sessions}</TableCell>
                      <TableCell className="text-sm font-medium py-3">{data.customers}</TableCell>
                      <TableCell className="text-sm font-bold py-3">
                        ج.م {(data.revenue / data.sessions).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 outline-none">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold">
                {t("reports").revenue_trends[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-80 border-2 border-dashed rounded-2xl bg-muted/20">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
                  <p className="text-xl font-bold text-muted-foreground">
                    {language === "ar"
                      ? "سيتم عرض المخطط هنا"
                      : "Revenue chart will be displayed here"}
                  </p>
                  <p className="text-base text-muted-foreground/60 mt-2">
                    {language === "ar" ? "اتصل بمصدر البيانات" : "Connect to your data source"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 outline-none">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold">
                {t("reports").top_customers[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest w-[80px]">
                      {t("reports").rank[language]}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {language === "ar" ? "العميل" : "Customer"}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {t("reports").total_spent[language]}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest">
                      {t("reports").session_count[language]}
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-widest text-right">
                      {t("reports").avg_per_session[language]}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTopCustomers.map((customer) => (
                    <TableRow
                      key={customer.rank}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="py-3">
                        <Badge variant="secondary" className="px-2 py-0.5 font-bold text-[10px]">
                          #{customer.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-bold py-3">{customer.name}</TableCell>
                      <TableCell className="text-sm font-bold py-3">
                        ج.م {customer.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium py-3">
                        {customer.sessions}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-right py-3">
                        ج.م {(customer.totalSpent / customer.sessions).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6 outline-none">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold">
                {t("reports").resource_utilization[language]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 p-4">
                {[
                  { name: language === "ar" ? "منطقة المقاعد" : "Seat Area", usage: 75, total: 30 },
                  {
                    name: language === "ar" ? "غرف الاجتماعات" : "Meeting Rooms",
                    usage: 60,
                    total: 5,
                  },
                  {
                    name: language === "ar" ? "أكشاك الهاتف" : "Phone Booths",
                    usage: 90,
                    total: 3,
                  },
                ].map((resource) => (
                  <div key={resource.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{resource.name}</span>
                      <span className="text-[12px] font-bold text-primary">
                        {resource.usage}% {t("reports").utilization_percent[language]}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden border">
                      <div
                        className="h-full bg-primary transition-all shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                        style={{ width: `${resource.usage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
