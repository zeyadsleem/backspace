import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Coffee, Banknote, Plus, Receipt } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useActiveSessions, useStartSession, useEndSession } from "@/hooks/use-sessions";
import { useCustomers } from "@/hooks/use-customers";
import { useResources } from "@/hooks/use-resources";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CustomerQuickViewDialog } from "@/components/customers/customer-quick-view-dialog";
import { formatDuration } from "@/lib/formatters";

export const Route = createFileRoute("/sessions")({
  component: SessionsPage,
});

export default function SessionsPage() {
  const { t, language, dir, lang } = useI18n();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedResource, setSelectedResource] = useState("");
  const { data: activeSessions, isLoading, error } = useActiveSessions();
  const { data: customers } = useCustomers();
  const { data: resources } = useResources();
  const startSession = useStartSession();
  const endSession = useEndSession();

  const availableResources = resources?.filter((r) => r.isAvailable) || [];

  const handleStartSession = () => {
    if (!selectedCustomer || !selectedResource) return;

    startSession.mutate(
      {
        customerId: selectedCustomer,
        resourceId: selectedResource,
      },
      {
        onSuccess: () => {
          setShowStartDialog(false);
          setSelectedCustomer("");
          setSelectedResource("");
        },
      },
    );
  };

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={t("sessions").title[language]}
        subtitle={t("sessions").subtitle[language]}
        action={
          <Button size="default" onClick={() => setShowStartDialog(true)}>
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
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {t("sessions").customer[language]}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {language === "ar" ? "المورد" : "Resource"}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {t("sessions").started_at[language]}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {t("customers").duration[language]}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-left" : "text-right"}>
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
                      <CustomerQuickViewDialog
                        customerId={session.customerId}
                        trigger={
                          <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md">
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
                        }
                      />
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
                    <TableCell className={dir === "rtl" ? "text-left" : "text-right"}>
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
                                      <span className="font-semibold">
                                        ج.م {session.resourceType === "room" ? "150.00" : "50.00"} /
                                        hour
                                      </span>
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
                                    <span>ج.م {calculateAmount(session.startedAt)}</span>
                                  </div>

                                  <Button
                                    className="w-full text-sm h-9"
                                    size="default"
                                    onClick={() => endSession.mutate(session.id)}
                                  >
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

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-lg border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {lang("بدء جلسة جديدة", "Start New Session")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">{lang("العميل", "Customer")}</label>
              <Select value={selectedCustomer} onValueChange={(v) => v && setSelectedCustomer(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue>
                    {selectedCustomer
                      ? customers?.find((c) => c.id === selectedCustomer)?.name
                      : lang("اختر العميل", "Select customer")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.humanId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">{lang("المورد", "Resource")}</label>
              <Select value={selectedResource} onValueChange={(v) => v && setSelectedResource(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue>
                    {selectedResource
                      ? resources?.find((r) => r.id === selectedResource)?.name
                      : lang("اختر المورد", "Select resource")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableResources.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {lang("لا توجد موارد متاحة", "No available resources")}
                    </div>
                  ) : (
                    availableResources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} ({lang("متاح", "Available")})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full h-9 font-bold"
              size="default"
              onClick={handleStartSession}
              disabled={!selectedCustomer || !selectedResource || startSession.isPending}
            >
              {lang("بدء الجلسة", "Start Session")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function calculateAmount(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const hours = (now - start) / (1000 * 60 * 60);
  const amount = Math.ceil(hours * 50);
  return amount.toFixed(2);
}
