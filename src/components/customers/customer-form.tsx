import { useState, useCallback } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, FileText, Check, AlertCircle, Calendar } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { CustomerSuccessDialog } from "./customer-success-dialog";
import { useCustomerForm } from "@/hooks/use-customer-form";
import { useI18n } from "@/lib/i18n";
import {
  validateEgyptianPhone,
  formatEgyptianPhone,
} from "@/lib/validation/validators/egyptian-phone";
import { PLAN_TYPE_LABELS } from "@/lib/validation/schemas/subscription";
import type { Customer } from "@/lib/tauri-api";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  mode?: "create" | "edit";
  defaultType?: "visitor" | "member";
}

type PlanType = "weekly" | "half-monthly" | "monthly";

export function CustomerForm({
  open,
  onOpenChange,
  customer,
  mode = "create",
  defaultType = "visitor",
}: CustomerFormProps) {
  const { language, dir, lang } = useI18n();
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"visitor" | "member">(
    (customer?.customerType as "visitor" | "member") || defaultType,
  );
  const [step, setStep] = useState<1 | 2>(mode === "edit" ? 2 : 1);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);

  const PLAN_TYPES: PlanType[] = ["weekly", "half-monthly", "monthly"];

  const { form, mutation } = useCustomerForm(
    customer,
    mode,
    mode === "create" ? setCreatedCustomer : undefined,
  );

  const handleTabChange = (tab: "visitor" | "member") => {
    setActiveTab(tab);
    form.setFieldValue("customerType", tab);
    if (tab === "visitor") {
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlanType(planType);
    form.setFieldValue("planType", planType);
    setStep(2);
  };

  const handleBack = () => {
    if (activeTab === "member") {
      setStep(1);
      setSelectedPlanType(null);
      form.setFieldValue("planType", undefined);
    }
  };

  const resetForm = () => {
    setStep(mode === "edit" ? 2 : 1);
    setSelectedPlanType(null);
    setActiveTab(customer?.customerType === "member" ? "member" : "visitor");
  };

  // Real-time validation states
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    carrier: string | null;
    error: string | null;
  }>({ isValid: true, carrier: null, error: null });

  // Real-time phone validation
  const handlePhoneChange = useCallback(
    (value: string, fieldOnChange: (value: string) => void) => {
      fieldOnChange(value);

      if (!value || value.trim() === "") {
        setPhoneValidation({ isValid: false, carrier: null, error: null });
        return;
      }

      const result = validateEgyptianPhone(value);
      setPhoneValidation({
        isValid: result.isValid,
        carrier: result.carrier,
        error: result.isValid
          ? null
          : (language === "ar" ? result.error?.split("|")[0] : result.error?.split("|")[1]) ||
            result.error,
      });
    },
    [language],
  );

  const isFormValid = phoneValidation.isValid;

  if (createdCustomer) {
    return (
      <CustomerSuccessDialog
        customer={createdCustomer}
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedCustomer(null);
            resetForm();
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
        <form.Field name="name">
          {(field) => (
            <FormField
              label={lang("الاسم الكامل", "Full Name")}
              icon={User}
              field={field}
              required
              placeholder={lang("أدخل اسم العميل", "Enter customer name")}
            />
          )}
        </form.Field>

        {/* Phone Field with Real-time Validation */}
        <form.Field name="phone">
          {(field) => (
            <div className="space-y-2">
              <FormField
                label={lang("رقم الهاتف", "Phone Number")}
                icon={Phone}
                field={{
                  ...field,
                  handleChange: (value: string) => handlePhoneChange(value, field.handleChange),
                }}
                required
                placeholder={lang("01012345678", "01012345678")}
              />
              {/* Phone validation feedback */}
              {field.state.value && (
                <div className="flex items-center gap-2 text-xs">
                  {phoneValidation.isValid ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600">
                        {formatEgyptianPhone(field.state.value)}
                      </span>
                      {phoneValidation.carrier && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {phoneValidation.carrier}
                        </Badge>
                      )}
                    </>
                  ) : phoneValidation.error ? (
                    <>
                      <AlertCircle className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">{phoneValidation.error}</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Email Field */}
        <form.Field name="email">
          {(field) => (
            <FormField
              label={lang("البريد الإلكتروني", "Email")}
              icon={Mail}
              type="email"
              placeholder={lang("اختياري", "Optional")}
              field={field}
            />
          )}
        </form.Field>

        {/* Notes Field */}
        <form.Field name="notes">
          {(field) => (
            <FormField
              label={lang("ملاحظات", "Notes")}
              icon={FileText}
              type="textarea"
              placeholder={lang("أي ملاحظات إضافية...", "Any additional notes...")}
              field={field}
            />
          )}
        </form.Field>
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-2xl" dir={dir}>
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

          <TabsContent value="visitor" className="mt-6">
            {step === 2 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
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
                    {lang("إنشاء الزائر", "Create Visitor")}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>

          <TabsContent value="member" className="mt-6">
            {step === 1 && mode === "create" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PLAN_TYPES.map((planType) => (
                    <Card
                      key={planType}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedPlanType === planType
                          ? "ring-2 ring-primary shadow-lg"
                          : "hover:border-primary"
                      }`}
                      onClick={() => handlePlanSelect(planType)}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {
                              PLAN_TYPE_LABELS[planType]?.[
                                language as keyof (typeof PLAN_TYPE_LABELS)[typeof planType]
                              ]
                            }
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

                <DialogFooter className="gap-2">
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
              step === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  {selectedPlanType && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {lang(
                          `نوع الاشتراك: ${PLAN_TYPE_LABELS[selectedPlanType]?.[language as keyof (typeof PLAN_TYPE_LABELS)[typeof selectedPlanType]]}`,
                          `Subscription: ${PLAN_TYPE_LABELS[selectedPlanType]?.[language as keyof (typeof PLAN_TYPE_LABELS)[typeof selectedPlanType]]}`,
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
                        onClick={handleBack}
                        disabled={mutation.isPending}
                      >
                        {lang("رجوع", "Back")}
                      </Button>
                    )}
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
                      {lang("إنشاء المشترك", "Create Member")}
                    </Button>
                  </DialogFooter>
                </form>
              )
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
