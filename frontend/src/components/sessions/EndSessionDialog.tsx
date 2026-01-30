import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Coffee,
  DollarSign,
  Receipt,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/shared";
import { Button, IconButton } from "@/components/ui/button";
import { formatCurrency, toPiasters } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import type { ActiveSession, InvoiceStatus, PaymentMethod } from "@/types";

interface EndSessionDialogProps {
  isOpen: boolean;
  session: ActiveSession | null;
  onClose: () => void;
  onRemoveItem?: (consumptionId: string) => void;
  onConfirm: (paymentData: {
    amount: number;
    method: PaymentMethod;
    date: string;
    notes?: string;
    status: InvoiceStatus;
  }) => void;
  isLoading?: boolean;
}

export function EndSessionDialog({
  isOpen,
  session,
  onClose,
  onRemoveItem,
  onConfirm,
  isLoading,
}: EndSessionDialogProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  // Calculate derived values directly (in piasters)
  let duration = 0;
  let sessionCost = 0;
  let amountToPay = 0;

  if (session && isOpen) {
    const start = new Date(session.startedAt);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - start.getTime()) / 60_000);
    duration = diffMins;

    // Match backend integer logic: (mins * rate) / 60
    sessionCost = session.isSubscribed ? 0 : Math.floor((diffMins * session.resourceRate) / 60);
    amountToPay = sessionCost + session.inventoryTotal;
  }

  const [userInputEGP, setUserInputEGP] = useState<number | null>(null);
  const [paymentMode, setPaymentMode] = useState<"pay-now" | "pay-later">("pay-now");
  const [notes, setNotes] = useState("");

  // Reset local state when dialog opens/closes or session changes
  useEffect(() => {
    if (isOpen) {
      setPaymentMode("pay-now");
      setUserInputEGP(null);
      setNotes("");
    }
  }, [isOpen]);

  const displayEGP = userInputEGP !== null ? userInputEGP : amountToPay / 100;

  if (!(isOpen && session)) {
    return null;
  }

  const totalAmount = sessionCost + session.inventoryTotal; // In piasters

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isPayNow = paymentMode === "pay-now";
    const finalStatus: InvoiceStatus = isPayNow ? "paid" : "unpaid";
    
    // Convert to piasters for backend
    const finalPaidAmount = isPayNow ? (userInputEGP !== null ? toPiasters(userInputEGP) : amountToPay) : 0;

    onConfirm({
      amount: finalPaidAmount,
      method: "cash",
      date: new Date().toISOString(),
      notes,
      status: finalStatus,
    });
  };

  return (
    <Modal
      className="overflow-hidden"
      isOpen={isOpen}
      maxWidth="3xl"
      onClose={onClose}
      showCloseButton={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-stone-100 border-b bg-stone-50/50 p-6 dark:border-stone-800 dark:bg-stone-900/50">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
              {t("checkout")}
            </h2>
            <p className="font-mono text-stone-500 text-xs">{session.customerName}</p>
          </div>
        </div>
        <IconButton
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          icon={<X className="h-5 w-5" />}
          label={t("close")}
          onClick={onClose}
          variant="ghost"
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* LEFT COLUMN: THE BILL */}
        <div className="flex flex-col border-stone-100 border-e bg-stone-50/30 lg:flex-[3] dark:border-stone-800 dark:bg-stone-900/30">
          <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
            <div className="space-y-6">
              {/* Session Cost */}
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center justify-between border-stone-100 border-b bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold text-xs uppercase tracking-wider">
                      {t("session")}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                    {formatCurrency(sessionCost)} {t("egp")}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 text-sm">
                  <div className="text-stone-600 dark:text-stone-400">
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      {session.resourceName}
                    </span>
                    <span className="mx-2 text-stone-300">|</span>
                    <span>
                      {duration} {t("minutes")}
                    </span>
                  </div>
                  <span className="text-stone-400 text-xs">
                    {formatCurrency(session.resourceRate)} {t("egpHr")}
                  </span>
                </div>
              </div>

              {/* Inventory Items */}
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
                <div className="flex items-center justify-between border-stone-100 border-b bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/50">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <Coffee className="h-4 w-4" />
                    <span className="font-semibold text-xs uppercase tracking-wider">
                      {t("orders")}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                    {formatCurrency(session.inventoryTotal)} {t("egp")}
                  </span>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-700">
                  {session.inventoryConsumptions.length === 0 ? (
                    <p className="p-4 text-center text-stone-400 text-xs italic">{t("noOrders")}</p>
                  ) : (
                    session.inventoryConsumptions.map((item) => (
                      <div
                        className="group flex items-center justify-between p-3 text-sm"
                        key={item.id}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-800 dark:text-stone-200">
                            {item.itemName}
                          </span>
                          <span className="text-stone-400 text-xs">x{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-stone-600 dark:text-stone-400">
                            {formatCurrency(item.quantity * item.price)}
                          </span>
                          {onRemoveItem && (
                            <IconButton
                              className="h-6 w-6 text-stone-300 opacity-0 transition-opacity hover:bg-transparent hover:text-red-500 group-hover:opacity-100"
                              icon={<X className="h-4 w-4" />}
                              label="remove"
                              onClick={() => onRemoveItem(item.id)}
                              variant="ghost"
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Bar */}
          <div className="border-stone-200 border-t bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
            <div className="flex items-end justify-between">
              <span className="mb-0.5 font-medium text-stone-500 text-xs uppercase tracking-widest">
                {t("totalDue")}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-medium text-stone-900 text-xl dark:text-stone-100">
                  {formatCurrency(totalAmount)}
                </span>
                <span className="font-normal text-stone-400 text-xs">{t("egp")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT ACTIONS */}
        <div className="flex w-full flex-col bg-white p-5 lg:flex-[2] dark:bg-stone-900">
          <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-3 block font-semibold text-stone-400 text-xs uppercase tracking-widest">
                {t("paymentMethod")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={cn(
                    "flex h-11 items-center justify-center gap-2 rounded-xl border transition-all",
                    paymentMode === "pay-now"
                      ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-700 ring-2 ring-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "border-stone-200 font-medium text-stone-600 hover:border-emerald-200 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                  )}
                  onClick={() => setPaymentMode("pay-now")}
                  type="button"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">{t("payNow")}</span>
                </button>

                <button
                  className={cn(
                    "flex h-11 items-center justify-center gap-2 rounded-xl border transition-all",
                    paymentMode === "pay-later"
                      ? "border-red-500 bg-red-50 font-semibold text-red-700 ring-2 ring-red-500/20 dark:bg-red-900/20 dark:text-red-400"
                      : "border-stone-200 font-medium text-stone-600 hover:border-red-200 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                  )}
                  onClick={() => setPaymentMode("pay-later")}
                  type="button"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">{t("addToDebt")}</span>
                </button>
              </div>
            </div>

            <div className="flex-1">
              {paymentMode === "pay-now" ? (
                <div className="animate-fade-in space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-stone-400 text-xs uppercase tracking-widest">
                      {t("amountReceived")}
                    </label>
                    <div className="relative">
                      <input
                        className={`h-14 w-full rounded-xl border border-stone-200 bg-white px-3 font-medium font-mono text-3xl outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-800 ${isRTL ? "pl-10" : "pr-10"}`}
                        onChange={(e) => setUserInputEGP(Number(e.target.value))}
                        step="any"
                        type="number"
                        value={displayEGP}
                      />
                      <span
                        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-medium text-sm text-stone-400 uppercase ${isRTL ? "left-4" : "right-4"}`}
                      >
                        {t("egp")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 text-stone-600 text-xs dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                    <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                    <p className="leading-relaxed">{t("cashPaymentDescription")}</p>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/20 dark:bg-red-900/10">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                      <p className="mb-1 font-bold text-red-700 text-sm dark:text-red-400">
                        {t("unpaidInvoice")}
                      </p>
                      <p className="text-red-600/80 text-xs leading-relaxed dark:text-red-400/80">
                        {t("addToDebtWarning", {
                          name: session.customerName,
                          amount: formatCurrency(totalAmount),
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="mb-2 block font-semibold text-stone-400 text-xs uppercase tracking-widest">
                  {t("notes")}
                </label>
                <textarea
                  className="h-20 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-800"
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("addPaymentNotes")}
                  value={notes}
                />
              </div>
            </div>

            <Button
              className={cn(
                "w-full shadow-lg",
                paymentMode === "pay-now"
                  ? "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700 dark:shadow-none"
                  : "bg-red-600 shadow-red-200 hover:bg-red-700 dark:shadow-none"
              )}
              disabled={isLoading}
              isLoading={isLoading}
              size="md"
              type="submit"
            >
              {!isLoading && (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  {paymentMode === "pay-now" ? t("confirmPayment") : t("confirmDebt")}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

