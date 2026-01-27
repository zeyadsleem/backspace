import { CreditCard, FileText, X } from "lucide-react";
import { Modal } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import type { Invoice, InvoiceStatus } from "@/types";

interface InvoiceDialogProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose?: () => void;
  onRecordPayment?: () => void;
}

const statusConfig: Record<Exclude<InvoiceStatus, "pending">, { color: string; bg: string }> = {
  paid: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  unpaid: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/20",
  },
  cancelled: {
    color: "text-stone-500 dark:text-stone-400",
    bg: "bg-stone-100 dark:bg-stone-800",
  },
};

export function InvoiceDialog({ isOpen, invoice, onClose, onRecordPayment }: InvoiceDialogProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  if (!(isOpen && invoice)) {
    return null;
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${t("egpCurrency")}`;
  const remainingAmount = invoice.total - invoice.paidAmount;
  const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.unpaid;

  return (
    <Modal
      className="flex max-h-[90vh] flex-col overflow-hidden"
      isOpen={isOpen}
      maxWidth="lg"
      onClose={onClose!}
      showCloseButton={false}
    >
      {/* Header - Simple */}
      <div className="flex items-center justify-between border-stone-100 border-b px-6 py-4 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          <span className="font-bold text-lg text-stone-900 dark:text-stone-100">
            {invoice.invoiceNumber}
          </span>
        </div>
        <button
          className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-bold text-stone-400 text-xs uppercase tracking-wide">
              {t("customer")}
            </p>
            <p className="font-semibold text-base text-stone-900 dark:text-stone-100">
              {invoice.customerName}
            </p>
          </div>
          <div className="space-y-1 text-end">
            <p className="font-bold text-stone-400 text-xs uppercase tracking-wide">
              {t("status")}
            </p>
            <div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-bold text-xs uppercase",
                  status.bg,
                  status.color
                )}
              >
                {t(invoice.status)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-stone-400 text-xs uppercase tracking-wide">{t("date")}</p>
            <p className="font-medium text-sm text-stone-600 dark:text-stone-400">
              {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div className="space-y-1 text-end">
            <p className="font-bold text-stone-400 text-xs uppercase tracking-wide">
              {t("dueDate")}
            </p>
            <p className="font-medium text-sm text-stone-600 dark:text-stone-400">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Items Table - Simplified */}
        <div className="overflow-hidden rounded-xl border border-stone-100 dark:border-stone-800">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 font-bold text-stone-500 text-xs uppercase dark:bg-stone-800/50">
              <tr>
                <th className="px-4 py-3 text-start">{t("description")}</th>
                <th className="px-4 py-3 text-end">{t("amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
              {invoice.lineItems.map((item, index) => (
                <tr key={`${item.description}-${index}`}>
                  <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-end font-medium font-mono">
                    {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary - Compact */}
        <div className="space-y-2 border-stone-100 border-t pt-4 dark:border-stone-800">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-stone-500">{t("total")}</span>
            <span className="font-bold font-mono text-lg text-stone-900 dark:text-stone-100">
              {formatCurrency(invoice.total)}
            </span>
          </div>
          <div className="flex justify-between font-medium text-emerald-600 text-sm">
            <span>{t("paid")}</span>
            <span className="font-mono">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          {remainingAmount > 0 && (
            <div className="mt-1 flex justify-between border-stone-200 border-t border-dashed pt-3 font-bold text-base text-red-600 dark:border-stone-700">
              <span>{t("balanceDue")}</span>
              <span className="font-mono">{formatCurrency(remainingAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {invoice.status !== "paid" && onRecordPayment && (
        <div className="border-stone-100 border-t bg-stone-50 px-6 py-4 dark:border-stone-800 dark:bg-stone-800/50">
          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-base text-white shadow-emerald-200 shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.98] dark:shadow-none"
            onClick={onRecordPayment}
            type="button"
          >
            <CreditCard className="h-5 w-5" />
            <span>{t("recordPayment")}</span>
          </button>
        </div>
      )}
    </Modal>
  );
}
