import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { Dashboard } from "@/components/dashboard";
import { CustomerDebtDialog } from "@/components/dashboard/CustomerDebtDialog";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { PaymentDialog } from "@/components/invoices/PaymentDialog";
import { StartSessionDialog } from "@/components/sessions/StartSessionDialog";
import { useAppStore } from "@/stores/useAppStore";
import type { CustomerType } from "@/types";

const customerTypes: CustomerType[] = ["visitor", "weekly", "half-monthly", "monthly"];

export function DashboardPage() {
  const navigate = useNavigate();
  const [showStartSessionDialog, setShowStartSessionDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [customerDebtId, setCustomerDebtId] = useState<string | null>(null);

  // Get data from store
  const {
    customers,
    resources,
    subscriptions,
    invoices,
    startSession,
    addCustomer,
    recordPayment,
    recordBulkPayment,
    t,
  } = useAppStore();

  const handleStartSession = (data: { customerId: string; resourceId: string }) => {
    startSession(data.customerId, data.resourceId);
    setShowStartSessionDialog(false);
  };

  const handleCreateCustomer = (data: {
    name: string;
    phone: string;
    email?: string;
    customerType?: CustomerType;
    notes?: string;
  }) => {
    addCustomer({
      ...data,
      balance: 0,
      email: data.email || null,
      notes: data.notes || "",
    });
    setShowNewCustomerDialog(false);
  };

  const viewInvoice = viewInvoiceId ? (invoices.find((i) => i.id === viewInvoiceId) ?? null) : null;
  const paymentInvoice = paymentInvoiceId
    ? (invoices.find((i) => i.id === paymentInvoiceId) ?? null)
    : null;

  const customerDebtInvoices = customerDebtId
    ? invoices.filter((i) => i.customerId === customerDebtId && i.status !== "paid")
    : [];
  const debtCustomer = customerDebtId ? customers.find((c) => c.id === customerDebtId) : null;

  return (
    <>
      <Dashboard
        onNavigateToSection={(section) => navigate(`/${section}`)}
        onNewCustomer={() => setShowNewCustomerDialog(true)}
        onStartSession={() => setShowStartSessionDialog(true)}
        onViewCustomerDebt={(customerId) => setCustomerDebtId(customerId)}
        onViewInventoryItem={(id) => navigate(`/inventory?highlight=${id}`)}
      />

      <StartSessionDialog
        customers={customers}
        isOpen={showStartSessionDialog}
        onClose={() => setShowStartSessionDialog(false)}
        onSubmit={handleStartSession}
        resources={resources}
        subscriptions={subscriptions}
      />

      <CustomerDialog
        customerTypes={customerTypes}
        isOpen={showNewCustomerDialog}
        onClose={() => setShowNewCustomerDialog(false)}
        onSubmit={handleCreateCustomer}
        title={t("newCustomer")}
      />

      <InvoiceDialog
        invoice={viewInvoice}
        isOpen={!!viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
        onRecordPayment={() => {
          setPaymentInvoiceId(viewInvoiceId);
          setViewInvoiceId(null);
        }}
      />

      <PaymentDialog
        invoice={paymentInvoice}
        isOpen={!!paymentInvoiceId}
        onClose={() => setPaymentInvoiceId(null)}
        onSubmit={(data) => {
          if (paymentInvoiceId) {
            recordPayment(paymentInvoiceId, data.amount, data.method, data.notes);
          }
          setPaymentInvoiceId(null);
        }}
      />

      <CustomerDebtDialog
        customerName={debtCustomer?.name || ""}
        invoices={customerDebtInvoices}
        isOpen={!!customerDebtId}
        onClose={() => setCustomerDebtId(null)}
        onGoToProfile={() => {
          if (customerDebtId) {
            navigate(`/customers/${customerDebtId}`);
          }
          setCustomerDebtId(null);
        }}
        onRecordBulkPayment={(ids, amount, notes) => recordBulkPayment(ids, amount, "cash", notes)}
      />
    </>
  );
}
