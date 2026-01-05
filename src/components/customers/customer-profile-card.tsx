import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  Wallet,
  Hash,
  FileText,
  MoreVertical,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/tauri-api";
import { formatDate, formatCurrency, getInitials, getCustomerTypeLabel } from "@/lib/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CustomerProfileCardProps {
  customerId: string;
  onEdit?: () => void;
  className?: string;
}

export function CustomerProfileCard({ customerId, onEdit, className }: CustomerProfileCardProps) {
  const { language, lang } = useI18n();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => api.customers.get(customerId),
  });

  const { data: sessions } = useQuery({
    queryKey: ["customer-sessions", customerId],
    queryFn: () =>
      api.sessions.list().then((s) => s.filter((session) => session.customerId === customerId)),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["customer-subscriptions", customerId],
    queryFn: () =>
      api.subscriptions.list().then((subs) => subs.filter((sub) => sub.customerId === customerId)),
  });

  const totalSpent = sessions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
  const totalSessions = sessions?.length || 0;
  const activeSubscription = subscriptions?.find((s) => s.isActive);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(lang(`تم نسخ ${label}`, `${label} copied`));
  };

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-0">
          <div className="flex items-center gap-4 pb-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {lang("العميل غير موجود", "Customer not found")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header with gradient background */}
      <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pb-0 relative">
        <div className="absolute top-4 end-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 me-2" />
                {lang("تعديل", "Edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copyToClipboard(customer.phone, lang("الرقم", "Phone"))}
              >
                <Copy className="h-4 w-4 me-2" />
                {lang("نسخ الرقم", "Copy Phone")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 me-2" />
                {lang("عرض التفاصيل", "View Details")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center text-center pb-6">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg mb-4">
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold">{customer.name}</h2>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="font-mono text-xs">
              {customer.humanId}
            </Badge>
            <Badge
              variant={customer.customerType === "member" ? "default" : "secondary"}
              className="text-xs"
            >
              {getCustomerTypeLabel(customer.customerType, language)}
            </Badge>
            {activeSubscription && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                {lang("مشترك نشط", "Active")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                {lang("إجمالي المصروف", "Total Spent")}
              </span>
            </div>
            <p className="text-xl font-bold text-primary">{formatCurrency(totalSpent, language)}</p>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {lang("عدد الجلسات", "Sessions")}
              </span>
            </div>
            <p className="text-xl font-bold">{totalSessions}</p>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {lang("الاشتراك", "Subscription")}
              </span>
            </div>
            <p className="text-sm font-semibold">
              {activeSubscription ? activeSubscription.planType : lang("غير مشترك", "None")}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {lang("تاريخ التسجيل", "Joined")}
              </span>
            </div>
            <p className="text-sm font-semibold">{formatDate(customer.createdAt, language)}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            {lang("معلومات الاتصال", "Contact Info")}
          </h4>

          <div className="space-y-2">
            <button
              onClick={() => copyToClipboard(customer.phone, lang("الرقم", "Phone"))}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-start"
            >
              <div className="p-2 rounded-md bg-background">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{lang("رقم الهاتف", "Phone")}</p>
                <p className="text-sm font-medium" dir="ltr">
                  {customer.phone}
                </p>
              </div>
              <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </button>

            {customer.email && (
              <button
                onClick={() => copyToClipboard(customer.email!, lang("البريد", "Email"))}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-start"
              >
                <div className="p-2 rounded-md bg-background">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {lang("البريد الإلكتروني", "Email")}
                  </p>
                  <p className="text-sm font-medium truncate">{customer.email}</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Notes */}
        {customer.notes && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {lang("ملاحظات", "Notes")}
            </h4>
            <p className="text-sm bg-muted/30 p-3 rounded-lg">{customer.notes}</p>
          </div>
        )}

        {/* Active Subscription Details */}
        {activeSubscription && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {lang("تفاصيل الاشتراك", "Subscription Details")}
            </h4>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{activeSubscription.planType}</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {lang("نشط", "Active")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{lang("البداية", "Start")}</p>
                  <p className="font-medium">
                    {formatDate(activeSubscription.startDate, language)}
                  </p>
                </div>
                {activeSubscription.endDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">{lang("النهاية", "End")}</p>
                    <p className="font-medium">
                      {formatDate(activeSubscription.endDate, language)}
                    </p>
                  </div>
                )}
              </div>

              {activeSubscription.hoursAllowance && (
                <div className="mt-3 pt-3 border-t border-emerald-500/20 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {lang("الساعات المتبقية", "Hours Left")}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {activeSubscription.hoursAllowance}
                    <span className="text-sm font-normal text-muted-foreground ms-1">
                      {lang("ساعة", "hrs")}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={onEdit}>
            <Edit className="h-4 w-4" />
            {lang("تعديل", "Edit")}
          </Button>
          <Button variant="default" className="flex-1 gap-2">
            <Clock className="h-4 w-4" />
            {lang("بدء جلسة", "Start Session")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
