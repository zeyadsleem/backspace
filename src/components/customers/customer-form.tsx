import { useState } from "react";
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
import { User, Phone, Mail, FileText, Check } from "lucide-react";
import { FormField } from "@/components/shared/form-field";
import { CustomerSuccessDialog } from "./customer-success-dialog";
import { useCustomerForm } from "@/hooks/use-customer-form";
import { useI18n } from "@/lib/i18n";
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
  const { language, dir } = useI18n();
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"visitor" | "member">(
    (customer?.customerType as "visitor" | "member") || defaultType,
  );

  const { form, mutation } = useCustomerForm(
    customer,
    mode,
    mode === "create" ? setCreatedCustomer : undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {mode === "create"
              ? language === "ar"
                ? "إضافة عميل جديد"
                : "Add New Customer"
              : language === "ar"
                ? "تعديل بيانات العميل"
                : "Edit Customer"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" ? "أدخل بيانات العميل" : "Enter customer details"}
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
                {language === "ar" ? "زائر" : "Visitor"}
              </div>
            </TabsTrigger>
            <TabsTrigger value="member">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === "ar" ? "مشترك" : "Member"}
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
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <form.Field name="name">
                    {(field) => (
                      <FormField
                        label={language === "ar" ? "الاسم الكامل" : "Full Name"}
                        icon={User}
                        field={field}
                        required
                      />
                    )}
                  </form.Field>

                  <form.Field name="phone">
                    {(field) => (
                      <FormField
                        label={language === "ar" ? "رقم الهاتف" : "Phone Number"}
                        icon={Phone}
                        field={field}
                        required
                      />
                    )}
                  </form.Field>

                  <form.Field name="email">
                    {(field) => (
                      <FormField
                        label="Email"
                        icon={Mail}
                        type="email"
                        placeholder={language === "ar" ? "اختياري" : "Optional"}
                        field={field}
                      />
                    )}
                  </form.Field>

                  <form.Field name="notes">
                    {(field) => (
                      <FormField
                        label={language === "ar" ? "ملاحظات" : "Notes"}
                        icon={FileText}
                        type="textarea"
                        placeholder={
                          language === "ar" ? "أي ملاحظات إضافية..." : "Any additional notes..."
                        }
                        field={field}
                      />
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={mutation.isPending}
                  className="ltr:mr-auto rtl:ml-auto"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>

                <Button onClick={form.handleSubmit} disabled={mutation.isPending} className="gap-2">
                  {mutation.isPending ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  {language === "ar" ? "إنشاء الزائر" : "Create Visitor"}
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
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <form.Field name="name">
                    {(field) => (
                      <FormField
                        label={language === "ar" ? "الاسم الكامل" : "Full Name"}
                        icon={User}
                        field={field}
                        required
                      />
                    )}
                  </form.Field>

                  <form.Field name="phone">
                    {(field) => (
                      <FormField
                        label={language === "ar" ? "رقم الهاتف" : "Phone Number"}
                        icon={Phone}
                        field={field}
                        required
                      />
                    )}
                  </form.Field>

                  <form.Field name="email">
                    {(field) => (
                      <FormField
                        label="Email"
                        icon={Mail}
                        type="email"
                        placeholder={language === "ar" ? "اختياري" : "Optional"}
                        field={field}
                      />
                    )}
                  </form.Field>

                  <form.Field name="notes">
                    {(field) => (
                      <FormField
                        label={language === "ar" ? "ملاحظات" : "Notes"}
                        icon={FileText}
                        type="textarea"
                        placeholder={
                          language === "ar" ? "أي ملاحظات إضافية..." : "Any additional notes..."
                        }
                        field={field}
                      />
                    )}
                  </form.Field>
                </CardContent>
              </Card>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={mutation.isPending}
                  className="ltr:mr-auto rtl:ml-auto"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>

                <Button onClick={form.handleSubmit} disabled={mutation.isPending} className="gap-2">
                  {mutation.isPending ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  {language === "ar" ? "إنشاء المشترك" : "Create Member"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
