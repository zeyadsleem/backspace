import { CreditCard, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/stores/hooks";
import { useAppStore } from "@/stores/useAppStore";
import type { Invoice, InvoiceStatus } from "@/types";

interface InvoiceRowProps {
  invoice: Invoice;
  onView?: () => void;
  onRecordPayment?: () => void;
}

const statusConfig: Record<Exclude<InvoiceStatus, "pending">, { color: string; bg: string }> = {
  paid: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  unpaid: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  cancelled: {
    color: "text-stone-500 dark:text-stone-400",
    bg: "bg-stone-100 dark:bg-stone-800",
  },
};

export function InvoiceRow({ invoice, onView, onRecordPayment }: InvoiceRowProps) {
  const t = useTranslation();
  const isRTL = useAppStore((state) => state.isRTL);
  const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.unpaid;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} ${t("egpCurrency")}`;

  return (
    <div className="grid grid-cols-1 gap-2 px-4 py-3 text-start transition-colors hover:bg-stone-50 md:grid-cols-12 md:gap-4 dark:hover:bg-stone-800/50">
      <div className="col-span-1 flex items-center md:col-span-2">
        <span className="font-medium font-mono text-sm text-stone-500 uppercase tracking-tight dark:text-stone-400">
          {invoice.invoiceNumber}
        </span>
      </div>

      <div className="col-span-1 flex items-center md:col-span-3">
        <div className="text-start">
          <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
            {invoice.customerName}
          </p>
          <p className="text-stone-500 text-xs dark:text-stone-400">{invoice.customerPhone}</p>
        </div>
      </div>

      <div className="col-span-1 flex items-center md:col-span-2 md:justify-center">
        <div className="text-start md:text-center">
          <p className="font-medium font-mono text-sm text-stone-900 dark:text-stone-100">
            {formatCurrency(invoice.total)}
          </p>
          {invoice.status === "unpaid" && invoice.paidAmount > 0 && (
            <p className="font-medium font-mono text-amber-600 text-xs uppercase dark:text-amber-400">
              {formatCurrency(invoice.total - invoice.paidAmount)} {t("remaining")}
            </p>
          )}
        </div>
      </div>

      <div className="col-span-1 flex items-center md:col-span-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-medium text-xs uppercase tracking-wider",
            config.bg,
            config.color
          )}
        >
          {t(invoice.status)}
        </span>
      </div>

      <div className="col-span-1 flex items-center md:col-span-1">
        <span className="font-medium text-sm text-stone-600 dark:text-stone-400">
          {formatDate(invoice.dueDate)}
        </span>
      </div>

      <div className="col-span-1 flex items-center justify-end gap-1 md:col-span-2">
        <button
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          onClick={onView}
          title={t("viewInvoice")}
          type="button"
        >
          <Eye className="h-4 w-4" />
        </button>
        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
          <button
            className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            onClick={onRecordPayment}
            title={t("recordPayment")}
            type="button"
          >
            <CreditCard className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
