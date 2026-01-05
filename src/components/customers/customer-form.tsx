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
import { User, Phone, Mail, FileText, Check, AlertCircle } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { CustomerSuccessDialog } from "./customer-success-dialog";
import { useCustomerForm } from "@/hooks/use-customer-form";
import { useI18n } from "@/lib/i18n";
import {
  validateEgyptianPhone,
  formatEgyptianPhone,
} from "@/lib/validation/validators/egyptian-phone";
import type { Customer } from "@/lib/tauri-api";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  mode?: "create" | "edit";
  defaultType?: "visitor" | "member";
}

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

  // Real-time validation states
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean;
    carrier: string | null;
    error: string | null;
  }>({ isValid: true, carrier: null, error: null });

  const { form, mutation } = useCustomerForm(
    customer,
    mode,
    mode === "create" ? setCreatedCustomer : undefined,
  );

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

  if (createdCustomer) {
    return (
      <CustomerSuccessDialog
        customer={createdCustomer}
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedCustomer(null);
            onOpenChange(false);
          }
        }}
      />
    );
  }

  const handleTabChange = (tab: "visitor" | "member") => {
    setActiveTab(tab);
    form.setFieldValue("customerType", tab);
  };

  const isFormValid = phoneValidation.isValid;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {mode === "create"
              ? lang("إضافة عميل جديد", "Add New Customer")
              : lang("تعديل بيانات العميل", "Edit Customer")}
          </DialogTitle>
          <DialogDescription>
            {lang("أدخل بيانات العميل", "Enter customer details")}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => handleTabChange(v as "visitor" | "member")}
          className="w-full"
        >
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

          <TabsContent value="visitor" className="mt-6">
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
          </TabsContent>

          <TabsContent value="member" className="mt-6">
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
                  {lang("إنشاء المشترك", "Create Member")}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
