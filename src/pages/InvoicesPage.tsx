import { useState } from "react";
import { InvoiceDialog, InvoicesList, PaymentDialog } from "@/components/invoices";
import { useAppStore } from "@/stores/useAppStore";

export function InvoicesPage() {
  const invoices = useAppStore((state) => state.invoices);
  const recordPayment = useAppStore((state) => state.recordPayment);
  const [viewId, setViewId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const viewInvoice = viewId ? (invoices.find((i) => i.id === viewId) ?? null) : null;
  const paymentInvoice = paymentId ? (invoices.find((i) => i.id === paymentId) ?? null) : null;

  return (
    <>
      <InvoicesList
        invoices={invoices}
        onRecordPayment={(id) => setPaymentId(id)}
        onView={(id) => setViewId(id)}
      />
      <InvoiceDialog
        invoice={viewInvoice}
        isOpen={!!viewId}
        onClose={() => setViewId(null)}
        onRecordPayment={() => {
          setPaymentId(viewId);
          setViewId(null);
        }}
      />
      <PaymentDialog
        invoice={paymentInvoice}
        isOpen={!!paymentId}
        onClose={() => setPaymentId(null)}
        onSubmit={(data) => {
          if (paymentId) {
            recordPayment(paymentId, data.amount, data.method, data.notes);
          }
          setPaymentId(null);
        }}
      />
    </>
  );
}
