import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { CheckInLoading, CheckInPage, CheckInRestricted } from "@/features/check-in/check-in";
import { hasPermission } from "@/features/staff-shell/permissions";
import { resolveStaffShellContext } from "@/features/staff-shell/shell-context";
import { trpc } from "@/utils/trpc";
import { PERMISSIONS } from "@backspace/api/permissions/constants";

export const Route = createFileRoute("/_auth/check-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const staffProfile = useQuery({
    ...trpc.staff.me.queryOptions(),
    retry: false,
  });
  const shellContext = resolveStaffShellContext(staffProfile.data);
  const branchId = shellContext.currentBranchId;
  const permissions = shellContext.permissions;

  const spaces = useQuery(trpc.spaces.getMap.queryOptions({ branchId }));

  const walkIn = useMutation(
    trpc.checkIn.walkIn.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );

  const member = useMutation(
    trpc.checkIn.member.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );

  const booking = useMutation(
    trpc.checkIn.booking.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );

  const hostedGuest = useMutation(
    trpc.checkIn.hostedGuest.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );

  const eventAttendee = useMutation(
    trpc.checkIn.eventAttendee.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );

  const hasAnyCheckInPermission =
    hasPermission(permissions, PERMISSIONS.VISIT_CREATE) ||
    hasPermission(permissions, PERMISSIONS.MEMBERSHIP_MANAGE) ||
    hasPermission(permissions, PERMISSIONS.BOOKING_CHECK_IN) ||
    hasPermission(permissions, PERMISSIONS.EVENT_MANAGE);

  if (staffProfile.isLoading) return <CheckInLoading />;
  if (!hasAnyCheckInPermission) return <CheckInRestricted />;

  return (
    <CheckInPage
      branchId={branchId}
      permissions={permissions}
      spacesData={spaces.data ?? null}
      mutations={{
        walkIn: {
          mutate: (input) => walkIn.mutate(input),
          state: {
            isPending: walkIn.isPending,
            data: walkIn.data,
            error: walkIn.error,
            reset: () => walkIn.reset(),
          },
        },
        member: {
          mutate: (input) => member.mutate(input),
          state: {
            isPending: member.isPending,
            data: member.data,
            error: member.error,
            reset: () => member.reset(),
          },
        },
        booking: {
          mutate: (input) => booking.mutate(input),
          state: {
            isPending: booking.isPending,
            data: booking.data,
            error: booking.error,
            reset: () => booking.reset(),
          },
        },
        hostedGuest: {
          mutate: (input) => hostedGuest.mutate(input),
          state: {
            isPending: hostedGuest.isPending,
            data: hostedGuest.data,
            error: hostedGuest.error,
            reset: () => hostedGuest.reset(),
          },
        },
        eventAttendee: {
          mutate: (input) => eventAttendee.mutate(input),
          state: {
            isPending: eventAttendee.isPending,
            data: eventAttendee.data,
            error: eventAttendee.error,
            reset: () => eventAttendee.reset(),
          },
        },
      }}
    />
  );
}
