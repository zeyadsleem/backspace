import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import type { CheckoutState } from "@/features/live-visits/checkout-panel";
import type { AddChargeInput, AddChargeState } from "@/features/live-visits/live-visits";
import { LiveVisits, LiveVisitsError, LiveVisitsLoading } from "@/features/live-visits/live-visits";
import { resolveStaffShellContext } from "@/features/staff-shell/shell-context";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/live")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [showCheckoutView, setShowCheckoutView] = useState(false);
  const [selectedCheckoutMethod, setSelectedCheckoutMethod] = useState("");
  const staffProfile = useQuery({
    ...trpc.staff.me.queryOptions(),
    retry: false,
  });
  const shellContext = resolveStaffShellContext(staffProfile.data);
  const branchId = shellContext.currentBranchId;
  const liveVisits = useQuery(trpc.visits.listLive.queryOptions({ branchId }));
  const visitDetail = useQuery({
    ...trpc.visits.getDetail.queryOptions({ branchId, visitId: selectedVisitId ?? "" }),
    enabled: Boolean(selectedVisitId),
  });

  const checkoutPreview = useQuery({
    ...trpc.checkout.preview.queryOptions({
      branchId,
      visitId: selectedVisitId ?? "",
    }),
    enabled: Boolean(selectedVisitId && showCheckoutView),
  });
  const currentShift = useQuery({
    ...trpc.shifts.current.queryOptions({ branchId }),
    enabled: Boolean(staffProfile.data),
  });

  const checkoutFinalize = useMutation(
    trpc.checkout.finalize.mutationOptions({
      onSuccess: () => {
        if (selectedVisitId) {
          queryClient.invalidateQueries(
            trpc.visits.getDetail.queryOptions({ branchId, visitId: selectedVisitId }),
          );
        }
        queryClient.invalidateQueries(trpc.shifts.current.queryOptions({ branchId }));
      },
    }),
  );

  const addCharge = useMutation(
    trpc.charges.add.mutationOptions({
      onSuccess: () => {
        if (selectedVisitId) {
          queryClient.invalidateQueries(
            trpc.visits.getDetail.queryOptions({ branchId, visitId: selectedVisitId }),
          );
        }
      },
    }),
  );

  const addChargeState: AddChargeState = {
    isPending: addCharge.isPending,
    data: addCharge.data ?? null,
    error: (addCharge.error as { message: string } | null) ?? null,
    reset: () => addCharge.reset(),
  };

  const checkoutState: CheckoutState = {
    preview: checkoutPreview.data ?? null,
    isPreviewLoading: checkoutPreview.isLoading,
    previewError: (checkoutPreview.error as { message: string } | null)?.message ?? null,
    isFinalizing: checkoutFinalize.isPending,
    finalizeError: (checkoutFinalize.error as { message: string } | null)?.message ?? null,
    finalizeResult: checkoutFinalize.data ?? null,
  };

  function handleAddCharge(input: AddChargeInput) {
    addCharge.mutate({
      branchId: input.branchId,
      targetType: input.targetType,
      targetId: input.targetId,
      type: input.type,
      label: input.label,
      quantity: input.quantity,
      amountCents: input.amountCents,
      currency: input.currency,
      billingResponsibility: input.billingResponsibility,
      reason: input.reason,
    });
  }

  function handleFinalizeCheckout() {
    if (!selectedVisitId) return;
    const preview = checkoutPreview.data;
    if (!preview) return;
    const needsPayment = preview.responsibilityGroups.filter(
      (g) => g.outcome === "payable" || g.outcome === "host_account",
    );
    if (needsPayment.length > 0 && !selectedCheckoutMethod) return;
    if (selectedCheckoutMethod === "cash" && currentShift.data?.status !== "open") return;
    const payments = needsPayment.map((g) => ({
      responsibility: g.responsibility,
      method: (selectedCheckoutMethod || "cash") as
        | "cash"
        | "card_terminal"
        | "wallet"
        | "bank_transfer"
        | "instapay"
        | "pay_later"
        | "host_account"
        | "included"
        | "complimentary",
      amountCents: g.totalCents,
    }));
    checkoutFinalize.mutate({
      branchId,
      visitId: selectedVisitId,
      payments: payments.length > 0 ? payments : undefined,
    });
  }

  function handleOpenCheckout() {
    setShowCheckoutView(true);
    setSelectedCheckoutMethod("");
  }

  function handleCloseCheckout() {
    setShowCheckoutView(false);
    setSelectedCheckoutMethod("");
    checkoutFinalize.reset();
  }

  if (liveVisits.isLoading) return <LiveVisitsLoading />;
  if (liveVisits.error) return <LiveVisitsError message={liveVisits.error.message} />;
  if (!liveVisits.data) return <LiveVisitsError message="No live visits data returned." />;

  return (
    <LiveVisits
      overview={liveVisits.data}
      selectedVisitId={selectedVisitId}
      selectedVisitDetail={visitDetail.data ?? null}
      onSelectVisit={setSelectedVisitId}
      onAddCharge={handleAddCharge}
      addChargeState={addChargeState}
      showCheckoutView={showCheckoutView}
      checkoutState={checkoutState}
      checkoutMethod={selectedCheckoutMethod}
      onSelectCheckoutMethod={setSelectedCheckoutMethod}
      onOpenCheckout={handleOpenCheckout}
      onCloseCheckout={handleCloseCheckout}
      onFinalizeCheckout={handleFinalizeCheckout}
      cashControl={
        currentShift.data
          ? {
              status: currentShift.data.status,
              shiftId: currentShift.data.shift?.id,
              expectedCashCents: currentShift.data.expectedCashCents,
              cashPaymentCount: currentShift.data.cashPaymentCount,
            }
          : null
      }
    />
  );
}
