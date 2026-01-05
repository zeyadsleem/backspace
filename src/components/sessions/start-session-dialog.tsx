import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, User, Monitor, DoorOpen, Check, Clock, Banknote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCustomers } from "@/hooks/use-customers";
import { useResources } from "@/hooks/use-resources";
import { useStartSession } from "@/hooks/use-sessions";
import { getInitials, getCustomerTypeLabel, formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartSessionDialog({ open, onOpenChange }: StartSessionDialogProps) {
  const { language, dir, lang } = useI18n();
  const [step, setStep] = useState<"customer" | "resource" | "confirm">("customer");
  const [customerSearch, setCustomerSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const { data: customers } = useCustomers();
  const { data: resources } = useResources();
  const startSession = useStartSession();

  const availableResources = useMemo(
    () => resources?.filter((r) => r.isAvailable) || [],
    [resources],
  );

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!customerSearch.trim()) return customers;
    const search = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.humanId.toLowerCase().includes(search) ||
        c.phone.includes(search),
    );
  }, [customers, customerSearch]);

  const filteredResources = useMemo(() => {
    if (!resourceSearch.trim()) return availableResources;
    const search = resourceSearch.toLowerCase();
    return availableResources.filter((r) => r.name.toLowerCase().includes(search));
  }, [availableResources, resourceSearch]);

  const selectedCustomer = customers?.find((c) => c.id === selectedCustomerId);
  const selectedResource = resources?.find((r) => r.id === selectedResourceId);

  const resetDialog = () => {
    setStep("customer");
    setCustomerSearch("");
    setResourceSearch("");
    setSelectedCustomerId(null);
    setSelectedResourceId(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetDialog();
    onOpenChange(newOpen);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setStep("resource");
  };

  const handleSelectResource = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setStep("confirm");
  };

  const handleBack = () => {
    if (step === "resource") {
      setStep("customer");
      setSelectedResourceId(null);
    } else if (step === "confirm") {
      setStep("resource");
    }
  };

  const handleStartSession = () => {
    if (!selectedCustomerId || !selectedResourceId) return;

    startSession.mutate(
      { customerId: selectedCustomerId, resourceId: selectedResourceId },
      {
        onSuccess: () => {
          handleOpenChange(false);
        },
      },
    );
  };

  const getResourceIcon = (type: string) => {
    return type === "room" ? DoorOpen : Monitor;
  };

  const getHourlyRate = (type: string) => {
    return type === "room" ? 150 : 50;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0" dir={dir}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-lg">
            {lang("بدء جلسة جديدة", "Start New Session")}
          </DialogTitle>
          <DialogDescription>
            {step === "customer" && lang("اختر العميل للجلسة", "Select a customer for the session")}
            {step === "resource" && lang("اختر المورد المتاح", "Select an available resource")}
            {step === "confirm" && lang("تأكيد بيانات الجلسة", "Confirm session details")}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            {["customer", "resource", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full flex-1 transition-colors",
                    step === s || (step === "resource" && i === 0) || (step === "confirm" && i <= 1)
                      ? "bg-primary"
                      : "bg-muted",
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Step 1: Select Customer */}
        {step === "customer" && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang(
                  "ابحث بالاسم أو الرقم أو الهاتف...",
                  "Search by name, ID, or phone...",
                )}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="ps-10"
              />
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {lang("لا يوجد عملاء", "No customers found")}
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleSelectCustomer(customer.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-start transition-colors",
                        "hover:bg-muted/80",
                        selectedCustomerId === customer.id &&
                          "bg-primary/10 border border-primary/20",
                      )}
                    >
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="text-sm font-medium">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{customer.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {customer.humanId}
                          </span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {getCustomerTypeLabel(customer.customerType, language)}
                          </Badge>
                        </div>
                      </div>
                      {selectedCustomerId === customer.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Step 2: Select Resource */}
        {step === "resource" && (
          <div className="p-4 space-y-4">
            {/* Selected customer summary */}
            {selectedCustomer && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(selectedCustomer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.humanId}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack} className="text-xs">
                  {lang("تغيير", "Change")}
                </Button>
              </div>
            )}

            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang("ابحث عن مورد...", "Search resources...")}
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="ps-10"
              />
            </div>

            <ScrollArea className="h-[250px]">
              <div className="space-y-1">
                {filteredResources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {lang("لا توجد موارد متاحة", "No available resources")}
                  </div>
                ) : (
                  filteredResources.map((resource) => {
                    const Icon = getResourceIcon(resource.resourceType);
                    const rate = getHourlyRate(resource.resourceType);
                    return (
                      <button
                        key={resource.id}
                        type="button"
                        onClick={() => handleSelectResource(resource.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-start transition-colors",
                          "hover:bg-muted/80",
                          selectedResourceId === resource.id &&
                            "bg-primary/10 border border-primary/20",
                        )}
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{resource.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {resource.resourceType === "room"
                                ? lang("غرفة", "Room")
                                : lang("مكتب", "Desk")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(rate, language)}/{lang("ساعة", "hr")}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-green-500/10 text-green-600"
                        >
                          {lang("متاح", "Available")}
                        </Badge>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && selectedCustomer && selectedResource && (
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              {/* Customer Card */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <User className="h-3.5 w-3.5" />
                  {lang("العميل", "Customer")}
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback>{getInitials(selectedCustomer.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCustomer.humanId}</p>
                  </div>
                </div>
              </div>

              {/* Resource Card */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  {selectedResource.resourceType === "room" ? (
                    <DoorOpen className="h-3.5 w-3.5" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5" />
                  )}
                  {lang("المورد", "Resource")}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedResource.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedResource.resourceType === "room"
                        ? lang("غرفة اجتماعات", "Meeting Room")
                        : lang("مكتب عمل", "Work Desk")}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {formatCurrency(getHourlyRate(selectedResource.resourceType), language)}/
                    {lang("ساعة", "hr")}
                  </Badge>
                </div>
              </div>

              {/* Session Info */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3.5 w-3.5" />
                  {lang("معلومات الجلسة", "Session Info")}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang("وقت البدء", "Start Time")}</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang("السعر", "Rate")}</span>
                    <span className="font-medium">
                      {formatCurrency(getHourlyRate(selectedResource.resourceType), language)}/
                      {lang("ساعة", "hr")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <DialogFooter className="p-4 gap-2 sm:gap-2">
          {step !== "customer" && (
            <Button variant="outline" onClick={handleBack} disabled={startSession.isPending}>
              {lang("رجوع", "Back")}
            </Button>
          )}
          {step === "confirm" && (
            <Button
              onClick={handleStartSession}
              disabled={!selectedCustomerId || !selectedResourceId || startSession.isPending}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              {startSession.isPending
                ? lang("جاري البدء...", "Starting...")
                : lang("بدء الجلسة", "Start Session")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
