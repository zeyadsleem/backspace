import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { StaffShell } from "@/features/staff-shell/staff-shell";
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
  const { session } = Route.useRouteContext();
  const staffProfile = useQuery({
    ...trpc.staff.me.queryOptions(),
    retry: false,
  });

  return (
    <StaffShell staffProfile={staffProfile.data} userName={session.data?.user.name}>
      <Outlet />
    </StaffShell>
  );
}
