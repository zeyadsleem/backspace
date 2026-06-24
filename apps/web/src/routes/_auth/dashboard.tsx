import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { StaffShellLanding } from "@/features/staff-shell/staff-shell";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  const privateData = useQuery(trpc.privateData.queryOptions());

  return (
    <div className="flex flex-col gap-5">
      <StaffShellLanding />
      <section className="mx-auto w-full max-w-6xl rounded-lg border bg-card p-4 text-sm">
        <p className="font-medium">Signed in as {session.data?.user.name}</p>
        {privateData.isLoading ? (
          <p className="text-muted-foreground">Loading protected API context...</p>
        ) : privateData.error ? (
          <p className="text-destructive">Error: {privateData.error.message}</p>
        ) : (
          <p className="text-muted-foreground">{privateData.data?.message}</p>
        )}
      </section>
    </div>
  );
}
