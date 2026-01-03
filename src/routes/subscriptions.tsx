import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
});

const mockSubscriptionTypes = [
  { id: "1", name: "Day Pass", durationDays: 1, price: 150, maxHoursPerDay: 8, isActive: true },
  {
    id: "2",
    name: "Monthly Pass",
    durationDays: 30,
    price: 2500,
    maxHoursPerDay: 8,
    isActive: true,
  },
  {
    id: "3",
    name: "Unlimited",
    durationDays: 30,
    price: 4000,
    maxHoursPerDay: null,
    isActive: true,
  },
  { id: "4", name: "Weekly Pass", durationDays: 7, price: 800, maxHoursPerDay: 8, isActive: false },
];

const mockActiveSubscriptions = [
  {
    id: "1",
    customerName: "Ahmed Ali",
    type: "Monthly Pass",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "active",
  },
  {
    id: "2",
    customerName: "Sarah Johnson",
    type: "Day Pass",
    startDate: "2025-01-02",
    endDate: "2025-01-02",
    status: "active",
  },
  {
    id: "3",
    customerName: "Mohamed Hassan",
    type: "Unlimited",
    startDate: "2024-12-15",
    endDate: "2025-01-14",
    status: "active",
  },
];

export default function SubscriptionsPage() {
  const { t, language, dir } = useI18n();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
            {t("subscriptions").title[language]}
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {t("subscriptions").subtitle[language]}
          </p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button
              size="default"
              className="font-bold px-6 shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              {t("subscriptions").create_type[language]}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-lg border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {t("subscriptions").create_type_title[language]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-bold">
                  {t("subscriptions").name[language]}
                </Label>
                <Input
                  id="name"
                  placeholder={language === "ar" ? "باقة شهرية" : "Monthly Pass"}
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="duration" className="text-sm font-bold">
                    {t("subscriptions").duration_days[language]}
                  </Label>
                  <Input id="duration" type="number" placeholder="30" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-sm font-bold">
                    {t("subscriptions").price[language]}
                  </Label>
                  <Input id="price" type="number" placeholder="2500" className="h-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxHours" className="text-sm font-bold">
                  {t("subscriptions").max_hours_per_day[language]}
                </Label>
                <Input id="maxHours" type="number" placeholder="8" className="h-9" />
              </div>
              <Button className="w-full h-9 font-bold rounded-md shadow-sm mt-2">
                {t("subscriptions").create[language]}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-extrabold">
              {t("subscriptions").subscription_types[language]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("subscriptions").name[language]}
                  </TableHead>
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("subscriptions").duration_days[language]}
                  </TableHead>
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("subscriptions").price[language]}
                  </TableHead>
                  <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("common").status[language]}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubscriptionTypes.map((type) => (
                  <TableRow key={type.id} className="border-b transition-colors hover:bg-muted/50">
                    <TableCell className="text-sm font-bold py-3">{type.name}</TableCell>
                    <TableCell className="text-sm font-medium py-3 text-muted-foreground">
                      {type.durationDays} {language === "ar" ? "يوم" : "days"}
                    </TableCell>
                    <TableCell className="text-sm font-bold py-3 text-primary">
                      ج.م {type.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant={type.isActive ? "default" : "secondary"}
                        className="px-2 py-0.5 font-bold text-[10px]"
                      >
                        {type.isActive ? (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b">
            <CardTitle className="text-sm font-extrabold">
              {t("subscriptions").active_subscriptions[language]}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <SearchInput placeholder={t("common").search[language]} />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {language === "ar" ? "العميل" : "Customer"}
                    </TableHead>
                    <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t("subscriptions").type[language]}
                    </TableHead>
                    <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t("subscriptions").valid_until[language]}
                    </TableHead>
                    <TableHead className="ltr:text-left rtl:text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t("common").status[language]}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActiveSubscriptions.map((sub) => (
                    <TableRow key={sub.id} className="border-b transition-colors hover:bg-muted/50">
                      <TableCell className="text-sm font-bold py-3">{sub.customerName}</TableCell>
                      <TableCell className="text-sm font-medium py-3 text-muted-foreground">
                        {sub.type}
                      </TableCell>
                      <TableCell className="text-sm font-medium tracking-tight py-3 text-muted-foreground">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant={sub.status === "active" ? "default" : "secondary"}
                          className="font-bold px-2 py-0.5 text-[10px]"
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
