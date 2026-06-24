import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { resolveStaffShellContext } from "@/features/staff-shell/shell-context";
import {
  TodayDashboard,
  TodayDashboardError,
  TodayDashboardLoading,
} from "@/features/today-dashboard/today-dashboard";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const staffProfile = useQuery({
    ...trpc.staff.me.queryOptions(),
    retry: false,
  });
  const shellContext = resolveStaffShellContext(staffProfile.data);

  const todayOverview = useQuery(
    trpc.today.getOverview.queryOptions({ branchId: shellContext.currentBranchId }),
  );

  if (todayOverview.isLoading) {
    return <TodayDashboardLoading />;
  }

  if (todayOverview.error) {
    return <TodayDashboardError message={todayOverview.error.message} />;
  }

  if (!todayOverview.data) {
    return <TodayDashboardError message="No Today dashboard data returned." />;
  }

  return <TodayDashboard overview={todayOverview.data} />;
}
