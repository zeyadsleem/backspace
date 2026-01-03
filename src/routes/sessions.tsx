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

export const Route = createFileRoute("/sessions")({
  component: SessionsPage,
});

const mockActiveSessions = [
  {
    id: "1",
    customerName: "Ahmed Ali",
    customerInitials: "AA",
    resource: "Seat A1",
    startedAt: "2025-01-02T10:30:00",
    duration: "2h 15m",
  },
  {
    id: "2",
    customerName: "Sarah Johnson",
    customerInitials: "SJ",
    resource: "Seat A3",
    startedAt: "2025-01-02T11:00:00",
    duration: "1h 45m",
  },
  {
    id: "3",
    customerName: "Mohamed Hassan",
    customerInitials: "MH",
    resource: "Meeting Room 1",
    startedAt: "2025-01-02T09:15:00",
    duration: "3h 30m",
  },
];

const mockInvoiceItems = [
  { id: "1", name: "Espresso", quantity: 2, price: 25 },
  { id: "2", name: "Sandwich", quantity: 1, price: 60 },
];

export default function SessionsPage() {
  const { t, language, dir } = useI18n();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
            {t("sessions").title[language]}
          </h1>
          <p className="text-base text-muted-foreground mt-1">{t("sessions").subtitle[language]}</p>
        </div>
        <Button size="default">
          <Plus className="h-4 w-4" />
          {t("sessions").new[language]}
        </Button>
      </div>

      <Card className="rounded-lg border shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-extrabold">
            {t("sessions").active_sessions[language]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("sessions").customer[language]}
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("customers").resource[language]}
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("sessions").started_at[language]}
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("customers").duration[language]}
                </TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("common").actions[language]}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockActiveSessions.map((session) => (
                <TableRow key={session.id} className="border-b transition-colors hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm font-bold">
                          {session.customerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-sm">{session.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{session.resource}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">
                    {new Date(session.startedAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {session.duration}
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
                          <DrawerHeader className="text-left">
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
                                        {session.customerInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-base font-bold">{session.customerName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {session.resource}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <Separator className="h-0.5" />

                                <div className="space-y-3">
                                  <h3 className="text-base font-bold flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {t("sessions").time_charges[language]}
                                  </h3>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {t("customers").duration[language]}
                                    </span>
                                    <span className="font-semibold">{session.duration}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {t("sessions").rate_per_hour[language]}
                                    </span>
                                    <span className="font-semibold">ج.م 50.00 / hour</span>
                                  </div>
                                  <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed">
                                    <span>{t("sessions").subtotal[language]}</span>
                                    <span>ج.م 112.50</span>
                                  </div>
                                </div>

                                <Separator className="h-0.5" />

                                <div className="space-y-3">
                                  <h3 className="text-base font-bold flex items-center gap-2">
                                    <Coffee className="h-4 w-4" />
                                    {t("sessions").consumptions[language]}
                                  </h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-sm font-semibold">
                                          {t("inventory").item[language]}
                                        </TableHead>
                                        <TableHead className="text-sm font-semibold">
                                          {language === "ar" ? "الكمية" : "Qty"}
                                        </TableHead>
                                        <TableHead className="text-right text-sm font-semibold">
                                          {t("customers").amount[language]}
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {mockInvoiceItems.map((item) => (
                                        <TableRow
                                          key={item.id}
                                          className="border-b transition-colors hover:bg-muted/50"
                                        >
                                          <TableCell className="text-sm">{item.name}</TableCell>
                                          <TableCell className="text-sm">{item.quantity}</TableCell>
                                          <TableCell className="text-right text-sm">
                                            ج.م {(item.price * item.quantity).toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                  <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed">
                                    <span>{t("sessions").consumption_total[language]}</span>
                                    <span>ج.م 110.00</span>
                                  </div>
                                </div>

                                <Separator className="h-0.5" />

                                <div className="flex justify-between text-lg font-bold bg-primary/5 p-3 rounded-lg border-2 border-primary/20">
                                  <span className="flex items-center gap-2">
                                    <Banknote className="h-5 w-5" />
                                    {t("sessions").total[language]}
                                  </span>
                                  <span>ج.م 222.50</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
