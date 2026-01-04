import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/formatters";

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
});

export default function SubscriptionsPage() {
  const { t, language, dir, lang } = useI18n();
  const { data: subscriptions, isLoading, error } = useSubscriptions();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={t("subscriptions").title[language]}
        subtitle={t("subscriptions").subtitle[language]}
        action={
          <Button size="default">
            <Plus className="h-4 w-4" />
            {t("subscriptions").create[language]}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-extrabold">
              {t("subscriptions").subscription_types[language]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState type="table" count={5} />
            ) : error ? (
              <EmptyState
                icon={CreditCard}
                title={lang("خطأ في تحميل البيانات", "Error loading data")}
              />
            ) : !subscriptions?.length ? (
              <EmptyState
                icon={CreditCard}
                title={lang("لا توجد اشتراكات", "No subscriptions found")}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                      {lang("العميل", "Customer")}
                    </TableHead>
                    <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                      {lang("النوع", "Type")}
                    </TableHead>
                    <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                      {lang("تاريخ البدء", "Start Date")}
                    </TableHead>
                    <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                      {lang("تاريخ الانتهاء", "End Date")}
                    </TableHead>
                    <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                      {lang("الحالة", "Status")}
                    </TableHead>
                    <TableHead className={dir === "rtl" ? "text-right" : "text-right"} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="border-b transition-colors hover:bg-muted/50">
                      <TableCell className="text-sm font-bold py-3">
                        {sub.customerName ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-sm font-bold">
                                {sub.customerName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold">{sub.customerName}</p>
                              {sub.customerHumanId && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {sub.customerHumanId}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          lang("عميل غير معروف", "Unknown")
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium py-3 text-muted-foreground">
                        {sub.planType}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium py-3">
                        {formatDate(sub.startDate, language)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium py-3">
                        {sub.endDate ? formatDate(sub.endDate, language) : "-"}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant={sub.isActive ? "default" : "secondary"}
                          className="px-2 py-0.5 text-[10px] font-bold"
                        >
                          {sub.isActive ? (
                            <>
                              <CheckCircle
                                className={cn("h-3 w-3", dir === "rtl" ? "ml-1" : "mr-1")}
                              />
                              {language === "ar" ? "نشط" : "Active"}
                            </>
                          ) : (
                            <>
                              <XCircle className={cn("h-3 w-3", dir === "rtl" ? "ml-1" : "mr-1")} />
                              {language === "ar" ? "غير نشط" : "Inactive"}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className={dir === "rtl" ? "text-right" : "text-right"}>
                        <Button variant="outline" size="sm">
                          <CreditCard className="h-4 w-4" />
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
    </div>
  );
}
