import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
    />
  );
}
