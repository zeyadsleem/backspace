import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { Invoice } from "@/types";

interface PendingInvoicesProps {
  invoices: Invoice[];
  onViewCustomerDebt?: (customerId: string) => void;
}

export function PendingInvoices({ invoices, onViewCustomerDebt }: PendingInvoicesProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  const unpaidInvoices = invoices.filter((inv) => inv.status !== "paid");

  // Group invoices by customer
  const grouped = unpaidInvoices.reduce(
    (acc, invoice) => {
      if (!acc[invoice.customerId]) {
        acc[invoice.customerId] = {
          name: invoice.customerName,
          invoices: [],
        };
      }
      acc[invoice.customerId].invoices.push(invoice);
      return acc;
    },
    {} as Record<string, { name: string; invoices: Invoice[] }>
  );

  const sortedCustomerIds = Object.keys(grouped).sort((a, b) => {
    const totalA = grouped[a].invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
    const totalB = grouped[b].invoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
    return totalB - totalA;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-stone-200 border-b p-4 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            {t("unpaidInvoices")}
          </h3>
        </div>
        <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 font-semibold text-red-600 text-xs dark:border-red-900/30">
          {sortedCustomerIds.length} {t("customer")}
        </span>
      </div>

      {/* Content */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
        {unpaidInvoices.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center opacity-50">
            <p className="font-medium text-sm text-stone-500">{t("noInvoicesFound")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCustomerIds.map((customerId) => {
              const group = grouped[customerId];
              const totalDue = group.invoices.reduce(
                (sum, inv) => sum + (inv.total - inv.paidAmount),
                0
              );
              return (
                <button
                  className="group flex w-full items-center justify-between rounded-xl border border-stone-100 p-4 shadow-sm transition-all hover:border-red-100 hover:bg-red-50/30 dark:border-stone-800/50 dark:hover:bg-red-900/10"
                  key={customerId}
                  onClick={() => onViewCustomerDebt?.(customerId)}
                >
                  <div className="text-start">
                    <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
                      {group.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded border border-stone-200 bg-stone-100 px-1.5 py-0.5 font-medium text-stone-500 text-xs uppercase tracking-tight dark:border-stone-700 dark:bg-stone-800">
                        {group.invoices.length} {t("invoices")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-end">
                    <div>
                      <p className="font-mono font-semibold text-base text-red-600">
                        {totalDue.toLocaleString()}
                      </p>
                      <p className="font-medium text-stone-400 text-xs uppercase tracking-wider">
                        {t("totalDue")}
                      </p>
                    </div>
                    {isRTL ? (
                      <ChevronLeft className="h-4 w-4 text-stone-300 transition-colors group-hover:text-red-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-stone-300 transition-colors group-hover:text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
