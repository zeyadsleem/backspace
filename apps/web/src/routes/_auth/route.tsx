import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { StaffShell } from "@/features/staff-shell/staff-shell";
import { resolveStaffShellContext } from "@/features/staff-shell/shell-context";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
      });
    }
    return { session };
  },
});

function AuthLayout() {
  const queryClient = useQueryClient();
  const { session } = Route.useRouteContext();
  const staffProfile = useQuery({
    ...trpc.staff.me.queryOptions(),
    retry: false,
  });
  const shellContext = resolveStaffShellContext(staffProfile.data);
  const branchId = shellContext.currentBranchId;
  const shiftCurrent = useQuery({
    ...trpc.shifts.current.queryOptions({ branchId }),
    enabled: Boolean(staffProfile.data),
  });
  const shiftQueryOptions = trpc.shifts.current.queryOptions({ branchId });
  const openShift = useMutation(
    trpc.shifts.open.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(shiftQueryOptions),
    }),
  );
  const closeShift = useMutation(
    trpc.shifts.close.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(shiftQueryOptions),
    }),
  );

  return (
    <StaffShell
      staffProfile={staffProfile.data}
      userName={session.data?.user.name}
      isShiftLoading={shiftCurrent.isLoading}
      shiftSummary={shiftCurrent.data ?? null}
      shiftActionState={{
        isPending: openShift.isPending || closeShift.isPending,
        error:
          (openShift.error as { message: string } | null)?.message ??
          (closeShift.error as { message: string } | null)?.message ??
          null,
      }}
      onOpenShift={() => openShift.mutate({ branchId })}
      onCloseShift={(actualCashCents) =>
        closeShift.mutate({
          branchId,
          shiftId: shiftCurrent.data?.shift?.id ?? "",
          actualCashCents,
        })
      }
    >
      <Outlet />
    </StaffShell>
  );
}
