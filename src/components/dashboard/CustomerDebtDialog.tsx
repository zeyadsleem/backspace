import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Receipt,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import type { Invoice } from "@/types";

interface CustomerDebtDialogProps {
  isOpen: boolean;
  customerName: string;
  invoices: Invoice[];
  onClose: () => void;
  onRecordBulkPayment: (invoiceIds: string[], totalAmount: number, notes: string) => void;
  onGoToProfile: () => void;
}

export function CustomerDebtDialog({
  isOpen,
  customerName,
  invoices,
  onClose,
  onRecordBulkPayment,
  onGoToProfile,
}: CustomerDebtDialogProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) {
    return null;
  }

  const totalDebt = invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });

  const handlePayAll = async () => {
    setIsProcessing(true);
    const ids = invoices.map((i) => i.id);
    await onRecordBulkPayment(ids, totalDebt, paymentNotes);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-stone-900 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-stone-100 border-b bg-stone-50/50 p-6 dark:border-stone-800 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {customerName}
              </h2>
              <p className="font-bold text-stone-500 text-xs uppercase tracking-wider">
                {t("unpaidInvoices")}
              </p>
            </div>
          </div>
          <button
            className="rounded-lg p-2 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* RIGHT PANEL: INVOICES LIST */}
          <div className="flex flex-[1.6] flex-col overflow-hidden border-stone-100 border-e bg-stone-50/30 dark:border-stone-800 dark:bg-stone-900/30">
            <div className="flex items-center justify-between border-stone-100 border-b bg-white/50 p-3 px-4 dark:border-stone-800 dark:bg-stone-800/50">
              <span className="font-bold text-stone-400 text-xs uppercase tracking-widest">
                {t("invoiceList")}
              </span>
              <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 font-bold text-red-600 text-xs">
                {invoices.length} {t("invoices")}
              </span>
            </div>

            <div className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto p-3">
              {sortedInvoices.map((invoice) => {
                const isExpanded = expandedInvoiceId === invoice.id;
                const balance = invoice.total - invoice.paidAmount;
                return (
                  <div
                    className={cn(
                      "overflow-hidden rounded-xl border transition-all",
                      isExpanded
                        ? "border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-stone-800"
                        : "border-stone-200 bg-white/80 hover:bg-white dark:border-stone-800 dark:bg-stone-900/80"
                    )}
                    key={invoice.id}
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between p-2.5 transition-colors"
                      onClick={() => setExpandedInvoiceId(isExpanded ? null : invoice.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                            isExpanded
                              ? "border-red-100 bg-red-50 text-red-600"
                              : "border-stone-100 bg-stone-50 text-stone-400 dark:border-stone-700 dark:bg-stone-800"
                          )}
                        >
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-xs dark:text-stone-100">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="font-medium text-stone-500 text-xs">
                            {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-end">
                          <p className="font-bold text-stone-900 text-xs dark:text-stone-100">
                            {balance.toLocaleString()}{" "}
                            <span className="font-medium text-stone-400 text-xs">{t("egp")}</span>
                          </p>
                          {invoice.paidAmount > 0 && (
                            <p className="font-bold text-emerald-600 text-xs uppercase">
                              {t("partial")}
                            </p>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="animate-fade-in border-stone-50 border-t px-3 pt-1 pb-3 dark:border-stone-700/50">
                        <div className="rounded-lg bg-stone-50/50 p-2 dark:bg-stone-900/50">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-stone-100 border-b font-bold text-stone-400 uppercase tracking-wider dark:border-stone-700/50">
                                <th className="px-1 py-1 text-start">{t("description")}</th>
                                <th className="px-1 py-1 text-end">{t("amount")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-700/30">
                              {invoice.lineItems.map((item) => (
                                <tr
                                  className="text-stone-600 dark:text-stone-300"
                                  key={item.description}
                                >
                                  <td className="px-1 py-1.5 font-medium">{item.description}</td>
                                  <td className="px-1 py-1.5 text-end font-bold font-mono">
                                    {item.amount.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEFT PANEL: PAYMENT SUMMARY */}
          <div className="flex flex-1 flex-col overflow-y-auto bg-white p-5 dark:bg-stone-900">
            <div className="flex flex-1 flex-col gap-6">
              <div className="space-y-3">
                <div className="block font-bold text-stone-400 text-xs uppercase tracking-widest">
                  {t("paymentSummary")}
                </div>
                <div className="flex flex-col items-center gap-1 rounded-2xl border border-red-100 bg-red-50 p-4 text-center dark:border-red-900/20 dark:bg-red-900/10">
                  <span className="font-bold text-red-600/70 text-xs uppercase tracking-widest">
                    {t("totalAmountToPay")}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-medium text-3xl text-red-700 dark:text-red-400">
                      {totalDebt.toLocaleString()}
                    </span>
                    <span className="font-medium text-red-600/70 text-xs">{t("egp")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 block font-bold text-stone-400 text-xs uppercase tracking-widest">
                    {t("paymentMethod")}
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400">
                    <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-800">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">{t("cash")}</p>
                      <p className="font-bold text-xs uppercase opacity-70">
                        {t("onlyCashAccepted")}
                      </p>
                    </div>
                    <CheckCircle2 className="ms-auto h-4 w-4 text-emerald-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block font-bold text-stone-400 text-xs uppercase tracking-widest"
                    htmlFor="payment-notes"
                  >
                    {t("notes")}
                  </label>
                  <textarea
                    className="h-20 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs outline-none transition-all focus:ring-2 focus:ring-emerald-500/10 dark:border-stone-700 dark:bg-stone-800"
                    id="payment-notes"
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder={t("addPaymentNotes")}
                    value={paymentNotes}
                  />
                </div>
              </div>

              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-bold text-base text-white shadow-emerald-600/10 shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                disabled={isProcessing || totalDebt <= 0}
                onClick={handlePayAll}
                type="button"
              >
                {isProcessing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>{t("payAllInvoices")}</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 border-stone-100 border-t pt-4 dark:border-stone-800">
              <button
                className="w-full py-1 font-bold text-stone-400 text-xs uppercase tracking-widest transition-colors hover:text-stone-600 dark:hover:text-stone-200"
                onClick={onGoToProfile}
                type="button"
              >
                {t("viewCustomerProfile")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
