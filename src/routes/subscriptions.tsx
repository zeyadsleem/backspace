import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
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

  const subscriptionTypes = [
    {
      id: "weekly",
      name: lang("أسبوعي", "Weekly"),
      duration: lang("7 أيام", "7 days"),
      price: 300,
      hoursPerDay: 4,
      icon: CreditCard,
    },
    {
      id: "half-monthly",
      name: lang("نصف شهر", "Half Month"),
      duration: lang("15 يوم", "15 days"),
      price: 500,
      hoursPerDay: 5,
      icon: CreditCard,
    },
    {
      id: "monthly",
      name: lang("شهري", "Monthly"),
      duration: lang("30 يوم", "30 days"),
      price: 800,
      hoursPerDay: 6,
      icon: CreditCard,
    },
    {
      id: "quarterly",
      name: lang("ربع سنوي", "Quarterly"),
      duration: lang("90 يوم", "90 days"),
      price: 2000,
      hoursPerDay: 8,
      icon: CreditCard,
    },
    {
      id: "yearly",
      name: lang("سنوي", "Yearly"),
      duration: lang("365 يوم", "365 days"),
      price: 7000,
      hoursPerDay: 10,
      icon: CreditCard,
    },
  ];

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={t("subscriptions").title[language]}
        subtitle={t("subscriptions").subtitle[language]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {lang("أنواع الاشتراكات", "Subscription Types")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subscriptionTypes.map((type) => (
                  <Card
                    key={type.id}
                    className="hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] transition-all duration-200 border-2 cursor-pointer group"
                  >
                    <CardHeader className="space-y-2 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <type.icon className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5">
                          {type.duration}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold">{type.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-primary">
                          ج.م {type.price}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {lang("أقصى", "Max")} {type.hoursPerDay} {lang("ساعة/يوم", "hours/day")}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full h-9 font-bold"
                          onClick={() => {}}
                        >
                          {lang("عرض التفاصيل", "View Details")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-extrabold">
                {lang("الاشتراكات النشطة", "Active Subscriptions")}
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
                  title={lang("لا توجد اشتراكات نشطة", "No active subscriptions")}
                />
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <Card key={sub.id} className="border-2 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2">
                              <AvatarFallback className="text-sm font-bold">
                                {sub.customerName
                                  ? sub.customerName.substring(0, 2).toUpperCase()
                                  : "??"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="font-bold text-base">
                                {sub.customerName || lang("عميل غير معروف", "Unknown")}
                              </p>
                              <div className="flex items-center gap-2">
                                {sub.customerHumanId && (
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {sub.customerHumanId}
                                  </span>
                                )}
                                <Badge
                                  variant={sub.isActive ? "default" : "secondary"}
                                  className="text-[10px] font-bold px-2 py-0.5"
                                >
                                  {sub.planType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm text-muted-foreground">
                              {formatDate(sub.startDate, language)}
                            </p>
                            {sub.endDate && (
                              <p className="text-xs text-muted-foreground">
                                {lang("حتى", "Until")} {formatDate(sub.endDate, language)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-2 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-extrabold">
                {lang("إحصائيات الاشتراكات", "Subscription Stats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background rounded-lg border-2">
                <p className="text-3xl font-extrabold text-primary">
                  {subscriptions?.filter((s) => s.isActive).length || 0}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {lang("اشتراكات نشطة", "Active Subscriptions")}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg border-2">
                <p className="text-2xl font-bold">{subscriptions?.length || 0}</p>
                <p className="text-sm text-muted-foreground font-medium">
                  {lang("إجمالي الاشتراكات", "Total Subscriptions")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-extrabold">
                {lang("معلومات سريعة", "Quick Info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>
                  {lang("جميع الاشتراكات قابلة للتعديل", "All subscriptions are editable")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-4 w-4 text-orange-500" />
                <span>
                  {lang(
                    "الاشتراكات المنتهية تظهر في السجل",
                    "Expired subscriptions shown in history",
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
