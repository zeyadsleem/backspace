import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { StaffShell } from "@/features/staff-shell/staff-shell";
import { authClient } from "@/lib/auth-client";

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

  return (
    <StaffShell userName={session.data?.user.name}>
      <Outlet />
    </StaffShell>
  );
}
