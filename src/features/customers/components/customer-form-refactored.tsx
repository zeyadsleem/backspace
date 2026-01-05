import { useState } from "react";
import { FormProvider } from "react-hook-form";
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
import { User, Phone, Mail, FileText, Check, Calendar } from "lucide-react";
import { FormField } from "@/shared/components/ui/form-field";
import { PlanSelection } from "./plan-selection";
import { CustomerSuccessDialog } from "./customer-success-dialog";
import { useI18n } from "@/lib/i18n";
import { useCustomerForm } from "../hooks/use-customer-form";
import { usePhoneValidation } from "../hooks/use-phone-validation";
import { PLAN_TYPE_LABELS } from "@/lib/validation/schemas/subscription";
import { type Customer } from "@/lib/tauri-api";

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
  const [step, setStep] = useState<1 | 2>(mode === "edit" ? 2 : defaultType === "visitor" ? 2 : 1);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);

  const { form, mutation } = useCustomerForm(customer, mode, defaultType, (result) => {
    if (mode === "create") {
      setCreatedCustomer(result);
    } else {
      resetForm();
      onOpenChange(false);
    }
  });

  const { validation: phoneValidation, validatePhone } = usePhoneValidation(language);

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
    if (activeTab === "member") {
      setStep(1);
      setSelectedPlanType(null);
      form.setValue("planType", undefined);
    }
  };

  const resetForm = () => {
    setStep(mode === "edit" ? 2 : 1);
    setSelectedPlanType(null);
    setActiveTab((customer?.customerType as "visitor" | "member") || defaultType);
    form.reset();
  };

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  const isFormValid = form.formState.isValid && phoneValidation.isValid;

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
        <FormField
          name="name"
          label={lang("الاسم الكامل", "Full Name")}
          icon={User}
          required
          placeholder={lang("أدخل اسم العميل", "Enter customer name")}
        />

        <FormField
          name="phone"
          label={lang("رقم الهاتف", "Phone Number")}
          icon={Phone}
          type="tel"
          required
          placeholder="01012345678"
          phoneValidation={phoneValidation}
          onPhoneChange={validatePhone}
        />

        <FormField
          name="email"
          label={lang("البريد الإلكتروني", "Email")}
          icon={Mail}
          type="email"
          placeholder={lang("اختياري", "Optional")}
        />

        <FormField
          name="notes"
          label={lang("ملاحظات", "Notes")}
          icon={FileText}
          type="textarea"
          placeholder={lang("أي ملاحظات إضافية...", "Any additional notes...")}
        />
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

        <FormProvider {...form}>
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
              <form onSubmit={onSubmit} className="space-y-4">
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
                <PlanSelection
                  selectedPlan={selectedPlanType}
                  onPlanSelect={handlePlanSelect}
                  onCancel={() => onOpenChange(false)}
                />
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  {selectedPlanType && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {lang(
                          `نوع الاشتراك: ${
                            PLAN_TYPE_LABELS[selectedPlanType]?.[
                              language as keyof (typeof PLAN_TYPE_LABELS)[typeof selectedPlanType]
                            ]
                          }`,
                          `Subscription: ${
                            PLAN_TYPE_LABELS[selectedPlanType]?.[
                              language as keyof (typeof PLAN_TYPE_LABELS)[typeof selectedPlanType]
                            ]
                          }`,
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
