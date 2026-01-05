import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, FileText, Check, AlertCircle, Calendar } from "lucide-react";
import { CustomerSuccessDialog } from "./customer-success-dialog";
import { useI18n } from "@/lib/i18n";
import {
  validateEgyptianPhone,
  formatEgyptianPhone,
  normalizePhone,
} from "@/lib/validation/validators/egyptian-phone";
import { validateEmail } from "@/lib/validation/validators/email";
import { PLAN_TYPE_LABELS } from "@/lib/validation/schemas/subscription";
import { api, type Customer, type CreateCustomer } from "@/lib/tauri-api";
import { cn } from "@/lib/utils";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  mode?: "create" | "edit";
  defaultType?: "visitor" | "member";
}

type PlanType = "weekly" | "half-monthly" | "monthly";

// Form validation schema - بدون phone validation في الـ schema
const customerFormSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters")
    .max(100, "الاسم طويل جداً | Name is too long")
    .refine((val) => val.trim().length >= 2, {
      message: "الاسم يجب أن يكون حرفين على الأقل | Name must be at least 2 characters",
    }),
  phone: z.string().min(1, "رقم الهاتف مطلوب | Phone number is required"),
  email: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return validateEmail(val).isValid;
      },
      { message: "صيغة البريد الإلكتروني غير صالحة | Invalid email format" },
    ),
  customerType: z.enum(["visitor", "member"]),
  planType: z.enum(["weekly", "half-monthly", "monthly"]).optional(),
  notes: z.string().max(1000, "الملاحظات طويلة جداً | Notes are too long").optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export function CustomerForm({
  open,
  onOpenChange,
  customer,
  mode = "create",
  defaultType = "visitor",
}: CustomerFormProps) {
  const { language, dir, lang } = useI18n();
  const queryClient = useQueryClient();
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"visitor" | "member">(
    (customer?.customerType as "visitor" | "member") || defaultType,
  );
  const [step, setStep] = useState<1 | 2>(mode === "edit" ? 2 : defaultType === "visitor" ? 2 : 1);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);

  // Phone validation state - منفصل عن الفورم
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    carrier: string | null;
    formatted: string | null;
  }>({ isValid: false, carrier: null, formatted: null });

  const PLAN_TYPES: PlanType[] = ["weekly", "half-monthly", "monthly"];

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      customerType: (customer?.customerType as "visitor" | "member") ?? defaultType,
      planType: undefined,
      notes: customer?.notes ?? "",
    },
    mode: "onBlur", // تغيير من onChange إلى onBlur لتقليل الـ re-renders
  });

  // Watch phone value للـ validation
  const phoneValue = form.watch("phone");

  // Phone validation effect
  useEffect(() => {
    if (!phoneValue || phoneValue.trim() === "") {
      setPhoneValidation({ isValid: false, carrier: null, formatted: null });
      return;
    }

    const result = validateEgyptianPhone(phoneValue);
    setPhoneValidation({
      isValid: result.isValid,
      carrier: result.carrier,
      formatted: result.isValid ? formatEgyptianPhone(phoneValue) : null,
    });
  }, [phoneValue]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: customer?.name ?? "",
        phone: customer?.phone ?? "",
        email: customer?.email ?? "",
        customerType: (customer?.customerType as "visitor" | "member") ?? defaultType,
        planType: undefined,
        notes: customer?.notes ?? "",
      });
      setActiveTab((customer?.customerType as "visitor" | "member") || defaultType);
      setStep(mode === "edit" ? 2 : defaultType === "visitor" ? 2 : 1);
      setSelectedPlanType(null);
    }
  }, [open, customer, defaultType, mode, form]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const phoneResult = validateEgyptianPhone(data.phone);
      const normalizedPhone = phoneResult.normalized || normalizePhone(data.phone);

      const createData: CreateCustomer = {
        name: data.name.trim(),
        phone: normalizedPhone,
        email: data.email?.trim() || undefined,
        customerType: data.customerType,
        planType: data.planType,
        notes: data.notes?.trim() || undefined,
      };

      if (mode === "create") {
        return api.customers.create(createData);
      } else {
        return api.customers.update(customer!.id, createData);
      }
    },
    onSuccess: async (result) => {
      toast.success(
        mode === "create"
          ? lang("تم إنشاء العميل بنجاح", "Customer created successfully")
          : lang("تم تحديث العميل بنجاح", "Customer updated successfully"),
      );

      await queryClient.invalidateQueries({ queryKey: ["customers"] });

      if (mode === "create") {
        setCreatedCustomer(result);
      } else {
        onOpenChange(false);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(lang(`حدث خطأ: ${message}`, message));
    },
  });

  const handleTabChange = (tab: "visitor" | "member") => {
    setActiveTab(tab);
    form.setValue("customerType", tab);
    if (tab === "member") {
      setStep(1);
      form.setValue("planType", undefined);
    }
  };

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlanType(planType);
    form.setValue("planType", planType);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedPlanType(null);
    form.setValue("planType", undefined);
  };

  const onSubmit = (data: CustomerFormData) => {
    // التحقق من صحة رقم الهاتف قبل الإرسال
    if (!phoneValidation.isValid) {
      form.setError("phone", {
        message: lang("رقم هاتف مصري غير صالح", "Invalid Egyptian phone number"),
      });
      return;
    }
    mutation.mutate(data);
  };

  const isFormValid = form.formState.isValid && phoneValidation.isValid;

  if (createdCustomer) {
    return (
      <CustomerSuccessDialog
        customer={createdCustomer}
        open={true}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setCreatedCustomer(null);
            onOpenChange(false);
          }
        }}
      />
    );
  }

  const renderFormContent = () => (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label className="flex gap-2 items-center text-sm font-bold">
            <User className="h-4 w-4 text-muted-foreground" />
            {lang("الاسم الكامل", "Full Name")}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            {...form.register("name")}
            placeholder={lang("أدخل اسم العميل", "Enter customer name")}
            className={cn("h-9", form.formState.errors.name && "border-destructive")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive font-medium">
              {language === "ar"
                ? form.formState.errors.name.message?.split(" | ")[0]
                : form.formState.errors.name.message?.split(" | ")[1] ||
                  form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label className="flex gap-2 items-center text-sm font-bold">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {lang("رقم الهاتف", "Phone Number")}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            {...form.register("phone")}
            type="tel"
            inputMode="numeric"
            placeholder="01012345678"
            className={cn(
              "h-9",
              (form.formState.errors.phone || (phoneValue && !phoneValidation.isValid)) &&
                "border-destructive",
            )}
          />

          {/* Phone validation feedback */}
          {phoneValue && (
            <div className="flex items-center gap-2 text-xs">
              {phoneValidation.isValid ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600">{phoneValidation.formatted}</span>
                  {phoneValidation.carrier && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {phoneValidation.carrier}
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <span className="text-destructive">
                    {lang(
                      "رقم هاتف مصري غير صالح (010, 011, 012, 015)",
                      "Invalid Egyptian phone (010, 011, 012, 015)",
                    )}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label className="flex gap-2 items-center text-sm font-bold">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {lang("البريد الإلكتروني", "Email")}
          </Label>
          <Input
            {...form.register("email")}
            type="email"
            placeholder={lang("اختياري", "Optional")}
            className={cn("h-9", form.formState.errors.email && "border-destructive")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive font-medium">
              {language === "ar"
                ? form.formState.errors.email.message?.split(" | ")[0]
                : form.formState.errors.email.message?.split(" | ")[1] ||
                  form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <Label className="flex gap-2 items-center text-sm font-bold">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {lang("ملاحظات", "Notes")}
          </Label>
          <Textarea
            {...form.register("notes")}
            placeholder={lang("أي ملاحظات إضافية...", "Any additional notes...")}
            rows={3}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl min-h-[580px]" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {mode === "create"
              ? lang("إضافة عميل جديد", "Add New Customer")
              : lang("تعديل بيانات العميل", "Edit Customer")}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && activeTab === "member"
              ? lang("اختر نوع الاشتراك", "Select subscription type")
              : lang("أدخل بيانات العميل", "Enter customer details")}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => handleTabChange(v as "visitor" | "member")}
          className="w-full"
        >
          {mode === "create" && (
            <TabsList className="gap-1 bg-muted p-1 rounded-lg">
              <TabsTrigger value="visitor">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {lang("زائر", "Visitor")}
                </div>
              </TabsTrigger>
              <TabsTrigger value="member">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {lang("مشترك", "Member")}
                </div>
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="visitor" className="mt-6 min-h-[400px]">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderFormContent()}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={mutation.isPending}
                  className="ltr:mr-auto rtl:ml-auto"
                >
                  {lang("إلغاء", "Cancel")}
                </Button>

                <Button
                  type="submit"
                  disabled={mutation.isPending || !isFormValid}
                  className="gap-2"
                >
                  {mutation.isPending ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {mode === "create"
                    ? lang("إنشاء الزائر", "Create Visitor")
                    : lang("تحديث الزائر", "Update Visitor")}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="member" className="mt-6 min-h-[400px]">
            {step === 1 && mode === "create" ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                    {PLAN_TYPES.map((planType) => (
                      <Card
                        key={planType}
                        className={cn(
                          "cursor-pointer hover:shadow-lg transition-all",
                          selectedPlanType === planType
                            ? "ring-2 ring-primary shadow-lg"
                            : "hover:border-primary",
                        )}
                        onClick={() => handlePlanSelect(planType)}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {PLAN_TYPE_LABELS[planType]?.[language as "ar" | "en"]}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {lang(
                                `${PLAN_TYPE_LABELS[planType]?.days} يوم`,
                                `${PLAN_TYPE_LABELS[planType]?.days} days`,
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <DialogFooter className="gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="ltr:mr-auto rtl:ml-auto"
                  >
                    {lang("إلغاء", "Cancel")}
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {selectedPlanType && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {lang(
                        `نوع الاشتراك: ${PLAN_TYPE_LABELS[selectedPlanType]?.[language as "ar" | "en"]}`,
                        `Subscription: ${PLAN_TYPE_LABELS[selectedPlanType]?.[language as "ar" | "en"]}`,
                      )}
                    </span>
                  </div>
                )}

                {renderFormContent()}

                <DialogFooter className="gap-2">
                  {mode === "create" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={mutation.isPending}
                      className="ltr:mr-auto rtl:ml-auto"
                    >
                      {lang("إلغاء", "Cancel")}
                    </Button>
                  )}

                  {mode === "create" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={mutation.isPending}
                    >
                      {lang("رجوع", "Back")}
                    </Button>
                  )}

                  <Button
                    type="submit"
                    disabled={mutation.isPending || !isFormValid}
                    className="gap-2"
                  >
                    {mutation.isPending ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {mode === "create"
                      ? lang("إنشاء المشترك", "Create Member")
                      : lang("تحديث المشترك", "Update Member")}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
