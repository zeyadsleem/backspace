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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, Mail, FileText } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

const customerSchema = z.object({
  humanId: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  email: z.string().email().optional().or(z.literal("")),
  type: z.enum(["visitor", "member"]),
  notes: z.string().max(500).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Customer {
  id: string;
  humanId: string;
  name: string;
  phone: string;
  email?: string;
  type: "visitor" | "member";
  notes?: string;
}

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  mode?: "create" | "edit";
}

export function CustomerForm({ open, onOpenChange, customer, mode = "create" }: CustomerFormProps) {
  const { language, dir } = useI18n();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const res = await fetch(
        mode === "create" ? "/api/customers" : `/api/customers/${customer!.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) throw new Error("Request failed");
    },
    onSuccess: async () => {
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

      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error(language === "ar" ? "حدث خطأ" : "An error occurred");
    },
  });

  const form = useForm({
    defaultValues: {
      humanId: customer?.humanId ?? "",
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      type: customer?.type ?? "visitor",
      notes: customer?.notes ?? "",
    },
    onSubmit: ({ value }) => mutation.mutate(value),
  });

  const generateHumanId = () => {
    const prefix = form.getFieldValue("type") === "member" ? "M" : "C";
    const num = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    form.setFieldValue("humanId", `${prefix}-${num}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === "create"
              ? language === "ar"
                ? "إضافة عميل جديد"
                : "Add New Customer"
              : language === "ar"
                ? "تعديل العميل"
                : "Edit Customer"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" ? "أدخل بيانات العميل" : "Enter customer details"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Human ID */}
          <form.Field name="humanId">
            {(f) => (
              <div className="space-y-2">
                <Label>Customer ID *</Label>
                <div className="flex gap-2">
                  <Input value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={generateHumanId}>
                    {language === "ar" ? "توليد" : "Generate"}
                  </Button>
                </div>
              </div>
            )}
          </form.Field>

          {/* Name */}
          <form.Field name="name">
            {(f) => (
              <div className="space-y-2">
                <Label>{language === "ar" ? "الاسم" : "Name"} *</Label>
                <Input value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
              </div>
            )}
          </form.Field>

          {/* Phone */}
          <form.Field name="phone">
            {(f) => (
              <div className="space-y-2">
                <Label className="flex gap-2">
                  <Phone className="h-4 w-4" />
                  {language === "ar" ? "الهاتف" : "Phone"} *
                </Label>
                <Input value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
              </div>
            )}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(f) => (
              <div className="space-y-2">
                <Label className="flex gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {/* Type */}
          <form.Field name="type">
            {(f) => (
              <div className="space-y-2">
                <Label>{language === "ar" ? "النوع" : "Type"} *</Label>
                <Select
                  value={f.state.value}
                  onValueChange={(v) => f.handleChange(v as "visitor" | "member")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitor">
                      <Badge variant="secondary">{language === "ar" ? "زائر" : "Visitor"}</Badge>
                    </SelectItem>
                    <SelectItem value="member">
                      <Badge>{language === "ar" ? "عضو" : "Member"}</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          {/* Notes */}
          <form.Field name="notes">
            {(f) => (
              <div className="space-y-2">
                <Label className="flex gap-2">
                  <FileText className="h-4 w-4" />
                  {language === "ar" ? "ملاحظات" : "Notes"}
                </Label>
                <Textarea
                  rows={3}
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>

          <Button onClick={form.handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {language === "ar"
              ? mode === "create"
                ? "إنشاء"
                : "حفظ"
              : mode === "create"
                ? "Create"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
