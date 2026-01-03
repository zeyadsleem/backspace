import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, Phone, Mail, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { api, type Customer, type CreateCustomer } from "@/lib/tauri-api";
import { useState } from "react";
import { cn } from "@/lib/utils";

const customerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional().or(z.literal("")),
  customerType: z.enum(["visitor", "member"]),
  notes: z.string().max(1000).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  mode?: "create" | "edit";
  defaultType?: "visitor" | "member";
  onSuccess?: (customer: Customer) => void;
}

export function CustomerForm({ open, onOpenChange, customer, mode = "create", defaultType = "visitor", onSuccess }: CustomerFormProps) {
  const { language, dir } = useI18n();
  const queryClient = useQueryClient();
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"visitor" | "member">(defaultType);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const createData: CreateCustomer = {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        customerType: data.customerType,
        notes: data.notes || undefined,
      };

      if (mode === "create") {
        return api.customers.create(createData);
      } else {
        return api.customers.update(customer!.id, {
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          customerType: data.customerType,
          notes: data.notes || undefined,
        });
      }
    },
    onSuccess: async (result) => {
      toast.success(
        language === "ar"
          ? mode === "create"
            ? "تم إنشاء العميل بنجاح"
            : "تم تحديث العميل بنجاح"
          : mode === "create"
            ? "Customer created successfully"
            : "Customer updated successfully",
      );

      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        exact: false,
      });

      if (mode === "create") {
        setCreatedCustomer(result);
        onSuccess?.(result);
      } else {
        onOpenChange(false);
      }

      form.reset();
    },
    onError: () => {
      toast.error(language === "ar" ? "حدث خطأ" : "An error occurred");
    },
  });

  const form = useForm({
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      customerType: activeTab,
      notes: customer?.notes ?? "",
    },
    onSubmit: ({ value }) => mutation.mutate(value),
  });

  const handleTabChange = (tab: "visitor" | "member") => {
    setActiveTab(tab);
    form.setFieldValue("customerType", tab);
  };

  if (createdCustomer) {
    return <CustomerSuccessDialog customer={createdCustomer} open={true} onOpenChange={(open) => {
      if (!open) {
        setCreatedCustomer(null);
        onOpenChange(false);
      }
    }} />;
  }

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

        <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as "visitor" | "member")} className="w-full">
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
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <User className="h-4 w-4 flex-shrink-0" />
                          {language === "ar" ? "الاسم الكامل" : "Full Name"} *
                        </Label>
                        <Input value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="phone">
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          {language === "ar" ? "رقم الهاتف" : "Phone Number"} *
                        </Label>
                        <Input value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="email">
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value)}
                          placeholder={language === "ar" ? "اختياري" : "Optional"}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="notes">
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          {language === "ar" ? "ملاحظات" : "Notes"}
                        </Label>
                        <Textarea
                          rows={3}
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value)}
                          placeholder={language === "ar" ? "أي ملاحظات إضافية..." : "Any additional notes..."}
                        />
                      </div>
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
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Check className="h-4 w-4" />
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
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <User className="h-4 w-4 flex-shrink-0" />
                          {language === "ar" ? "الاسم الكامل" : "Full Name"} *
                        </Label>
                        <Input value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="phone">
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          {language === "ar" ? "رقم الهاتف" : "Phone Number"} *
                        </Label>
                        <Input value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="email">
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value)}
                          placeholder={language === "ar" ? "اختياري" : "Optional"}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="notes">
                    {(f) => (
                      <div className="space-y-2">
                        <Label className={cn("flex gap-2 items-center", )}>
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          {language === "ar" ? "ملاحظات" : "Notes"}
                        </Label>
                        <Textarea
                          rows={3}
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value)}
                          placeholder={language === "ar" ? "أي ملاحظات إضافية..." : "Any additional notes..."}
                        />
                      </div>
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
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Check className="h-4 w-4" />
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

function CustomerSuccessDialog({ customer, open, onOpenChange }: { customer: Customer; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { language, dir } = useI18n();

  const getCustomerTypeLabel = (type: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      member: { ar: "مشترك", en: "Member" },
      visitor: { ar: "زائر", en: "Visitor" },
    };
    return labels[type]?.[language === "ar" ? "ar" : "en"] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-green-600 dark:text-green-400">
            <Check className="h-5 w-5" />
            {language === "ar" ? "تم إنشاء العميل بنجاح!" : "Customer Created Successfully!"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" ? "بيانات العميل الجديدة" : "New Customer Details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center pb-2">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <Card className="border-2">
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "رقم العميل" : "Customer ID"}</p>
                  <p className="text-2xl font-bold">{customer.humanId}</p>
                </div>
                <Badge>{getCustomerTypeLabel(customer.customerType)}</Badge>
              </div>

              <div className="space-y-2 pt-2">
                <div className={cn("flex items-start gap-2", )}>
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "الاسم" : "Name"}</p>
                    <p className="font-semibold">{customer.name}</p>
                  </div>
                </div>

                <div className={cn("flex items-start gap-2", )}>
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "الهاتف" : "Phone"}</p>
                    <p className="font-semibold">{customer.phone}</p>
                  </div>
                </div>

                {customer.email && (
                  <div className={cn("flex items-start gap-2", )}>
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{customer.email}</p>
                    </div>
                  </div>
                )}

                {customer.notes && (
                  <div className={cn("flex items-start gap-2", )}>
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">{language === "ar" ? "ملاحظات" : "Notes"}</p>
                      <p className="font-semibold">{customer.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="w-full">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            {language === "ar" ? "تم" : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
