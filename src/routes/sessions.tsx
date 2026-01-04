import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Coffee, Banknote, Plus, Receipt } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useActiveSessions } from "@/hooks/use-sessions";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDuration } from "@/lib/formatters";

export const Route = createFileRoute("/sessions")({
  component: SessionsPage,
});

export default function SessionsPage() {
  const { t, language, dir } = useI18n();
  const { data: activeSessions, isLoading, error } = useActiveSessions();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={t("sessions").title[language]}
        subtitle={t("sessions").subtitle[language]}
        action={
          <Button size="default">
            <Plus className="h-4 w-4" />
            {t("sessions").new[language]}
          </Button>
        }
      />

      <Card className="rounded-lg border shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-extrabold">
            {t("sessions").active_sessions[language]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState type="table" count={5} />
          ) : error ? (
            <EmptyState
              icon={Clock}
              title={language === "ar" ? "خطأ في تحميل البيانات" : "Error loading data"}
            />
          ) : !activeSessions?.length ? (
            <EmptyState
              icon={Clock}
              title={language === "ar" ? "لا توجد جلسات نشطة" : "No active sessions"}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("sessions").customer[language]}
                  </TableHead>
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "ar" ? "المورد" : "Resource"}
                  </TableHead>
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("sessions").started_at[language]}
                  </TableHead>
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("customers").duration[language]}
                  </TableHead>
                  <TableHead className="ltr:text-right rtl:text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {language === "ar" ? "إجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm font-bold">
                            {session.customerName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm">{session.customerName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {session.customerHumanId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{session.resourceName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium">
                      {new Date(session.startedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(session.startedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Drawer>
                        <DrawerTrigger>
                          <Button variant="outline" size="sm" className="font-semibold">
                            <Plus className="h-4 w-4" />
                            {t("sessions").end_session[language]}
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent dir={dir}>
                          <div className="mx-auto w-full max-w-lg">
                            <DrawerHeader className="ltr:text-left rtl:text-right">
                              <DrawerTitle className="text-lg font-bold">
                                {t("sessions").end_session_title[language]}
                              </DrawerTitle>
                            </DrawerHeader>
                            <div className="p-4 pt-0">
                              <ScrollArea className="h-[60vh] pr-4">
                                <div className="space-y-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10 border-2">
                                        <AvatarFallback className="text-sm">
                                          {session.customerName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-base font-bold">
                                          {session.customerName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {session.resourceName}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <Separator className="h-0.5" />

                                  <div className="space-y-3">
                                    <h3 className="text-base font-bold flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      {language === "ar" ? "رسوم الوقت" : "Time Charges"}
                                    </h3>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {language === "ar" ? "وقت البدء" : "Start Time"}
                                      </span>
                                      <span className="font-semibold">
                                        {new Date(session.startedAt).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {language === "ar" ? "المدة الحالية" : "Current Duration"}
                                      </span>
                                      <span className="font-semibold">
                                        {formatDuration(session.startedAt)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        {language === "ar" ? "السعر بالساعة" : "Rate Per Hour"}
                                      </span>
                                      <span className="font-semibold">ج.م 50.00 / hour</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed">
                                      <span>
                                        {language === "ar" ? "المجموع الفرعي" : "Subtotal"}
                                      </span>
                                      <span>ج.م 112.50</span>
                                    </div>
                                  </div>

                                  <Separator className="h-0.5" />

                                  <div className="space-y-3">
                                    <h3 className="text-base font-bold flex items-center gap-2">
                                      <Coffee className="h-4 w-4" />
                                      {t("sessions").consumptions[language]}
                                    </h3>
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                      {language === "ar"
                                        ? "لم يتم تسجيل أي استهلاكات"
                                        : "No consumptions recorded"}
                                    </div>
                                  </div>

                                  <Separator className="h-0.5" />

                                  <div className="flex justify-between text-lg font-bold bg-primary/5 p-3 rounded-lg border-2 border-primary/20">
                                    <span className="flex items-center gap-2">
                                      <Banknote className="h-5 w-5" />
                                      {language === "ar" ? "الإجمالي" : "Total"}
                                    </span>
                                    <span>ج.م 112.50</span>
                                  </div>

                                  <Button className="w-full text-sm h-9" size="default">
                                    <Receipt className="h-4 w-4" />
                                    {t("sessions").confirm_paid_cash[language]}
                                  </Button>
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
