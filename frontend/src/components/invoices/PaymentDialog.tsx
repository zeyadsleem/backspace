import { CreditCard, Receipt, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { FormError, FormField, FormLabel, TextField } from "@/components/ui/form";
import { formatCurrency } from "@/lib/formatters";
import { useAppStore } from "@/stores/useAppStore";
import type { Invoice, PaymentMethod } from "@/types";

interface PaymentDialogProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onSubmit?: (data: {
    amount: number;
    method: PaymentMethod;
    date: string;
    notes?: string;
  }) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export function PaymentDialog({
  isOpen,
  invoice,
  onSubmit,
  onClose,
  isLoading,
}: PaymentDialogProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const remainingBalance = invoice ? invoice.total - invoice.paidAmount : 0; // In piasters

  const [formData, setFormData] = useState({
    amountEGP: 0,
    method: "cash" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (invoice && isOpen) {
      setFormData({
        amountEGP: (invoice.total - invoice.paidAmount) / 100,
        method: "cash",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
    }
  }, [invoice, isOpen]);

  if (!(isOpen && invoice)) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (formData.amountEGP <= 0) {
      newErrors.amount = t("amountMustBeGreater");
    } else if (formData.amountEGP * 100 > remainingBalance + 0.1) {
      newErrors.amount = t("amountCannotExceed", {
        amount: formatCurrency(remainingBalance),
      });
    }
    if (!formData.date) {
      newErrors.date = t("paymentDateRequired");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        amount: formData.amountEGP,
        method: formData.method,
        date: formData.date,
        notes: formData.notes,
      });
    }
  };

  return (
    <Modal
      className="overflow-hidden"
      isOpen={isOpen}
      maxWidth="md"
      onClose={onClose!}
      showCloseButton={false}
      title={
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-stone-900 dark:text-stone-100">
              {t("recordPayment")}
            </h2>
            <p className="font-mono text-stone-500 text-xs">#{invoice.invoiceNumber}</p>
          </div>
        </div>
      }
    >
      <form className="space-y-6 p-6" onSubmit={handleSubmit}>
        {/* Helper Card */}
        <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/50">
          <div>
            <p className="mb-1 font-medium text-stone-400 text-xs uppercase tracking-widest">
              {t("remainingBalance")}
            </p>
            <div className="flex items-baseline gap-1">
              <p className="font-bold text-stone-900 text-xl dark:text-stone-100">
                {formatCurrency(remainingBalance)}
              </p>
              <span className="font-medium text-stone-500 text-xs">{t("egp")}</span>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-2 dark:border-stone-700 dark:bg-stone-900">
            <Wallet className="h-5 w-5 text-stone-400" />
          </div>
        </div>

        <div className="space-y-4">
          <FormField>
            <div className="mb-2 flex items-center justify-between">
              <FormLabel className="mb-0">{t("paymentAmount")}</FormLabel>
              <button
                className="font-bold text-emerald-600 text-xs uppercase transition-colors hover:text-emerald-700"
                onClick={() => setFormData({ ...formData, amountEGP: remainingBalance / 100 })}
                type="button"
              >
                {t("payFullBalance")}
              </button>
            </div>
            <div className="relative">
              <input
                className={`h-14 w-full rounded-xl border border-stone-200 bg-white px-3 font-medium font-mono text-2xl outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-800 ${isRTL ? "pl-10" : "pr-10"}`}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amountEGP: Number.parseFloat(e.target.value) || 0,
                  })
                }
                step="any"
                type="number"
                value={formData.amountEGP}
              />
              <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-medium text-sm text-stone-400 uppercase ${isRTL ? "left-4" : "right-4"}`}
              >
                {t("egp")}
              </span>
            </div>
            <FormError>{errors.amount}</FormError>
          </FormField>

          <TextField
            id="paymentDate"
            label={t("paymentDate")}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            type="date"
            value={formData.date}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            disabled={isLoading}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t("cancel")}
          </Button>
          <Button
            className="flex-[2]"
            disabled={isLoading}
            isLoading={isLoading}
            type="submit"
            variant="success"
          >
            <CreditCard className="h-4 w-4" />
            <span>{t("confirmPayment")}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
