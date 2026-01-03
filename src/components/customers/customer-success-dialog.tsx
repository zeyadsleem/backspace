import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, User, Phone, Mail, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Customer } from "@/lib/tauri-api";
import { getCustomerTypeLabel } from "@/lib/formatters";

interface CustomerSuccessDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerSuccessDialog({
  customer,
  open,
  onOpenChange,
}: CustomerSuccessDialogProps) {
  const { language, dir } = useI18n();

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
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "رقم العميل" : "Customer ID"}
                  </p>
                  <p className="text-2xl font-bold">{customer.humanId}</p>
                </div>
                <Badge>{getCustomerTypeLabel(customer.customerType, language)}</Badge>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "الاسم" : "Name"}
                    </p>
                    <p className="font-semibold">{customer.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "الهاتف" : "Phone"}
                    </p>
                    <p className="font-semibold">{customer.phone}</p>
                  </div>
                </div>

                {customer.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{customer.email}</p>
                    </div>
                  </div>
                )}

                {customer.notes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "ملاحظات" : "Notes"}
                      </p>
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
