import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { BookingsPage, BookingsPageError, BookingsPageLoading } from "@/features/bookings/bookings";
import { hasPermission } from "@/features/staff-shell/permissions";
import { resolveStaffShellContext } from "@/features/staff-shell/shell-context";
import { trpc } from "@/utils/trpc";
import { PERMISSIONS } from "@backspace/api/permissions/constants";

export const Route = createFileRoute("/_auth/calendar")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const staffProfile = useQuery({
    ...trpc.staff.me.queryOptions(),
    retry: false,
  });
  const shellContext = resolveStaffShellContext(staffProfile.data);
  const branchId = shellContext.currentBranchId;
  const permissions = shellContext.permissions;
  const canReadBookings = hasPermission(permissions, PERMISSIONS.BOOKING_READ);
  const canCheckInBookings = hasPermission(permissions, PERMISSIONS.BOOKING_CHECK_IN);
  const canWriteBookings = hasPermission(permissions, PERMISSIONS.BOOKING_CREATE);

  const queueOptions = trpc.bookings.queue.queryOptions({ branchId });
  const queue = useQuery({ ...queueOptions, enabled: canReadBookings });

  const checkIn = useMutation(
    trpc.checkIn.booking.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(queueOptions);
        toast.success("Booking checked in");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const cancel = useMutation(
    trpc.bookings.cancel.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(queueOptions);
        toast.success("Booking cancelled");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const noShow = useMutation(
    trpc.bookings.markNoShow.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(queueOptions);
        toast.success("Booking marked no-show");
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  if (staffProfile.isLoading || queue.isLoading) return <BookingsPageLoading />;
  if (!canReadBookings) return <BookingsPageError message="Requires booking:read permission" />;
  if (queue.error) return <BookingsPageError message={queue.error.message} />;
  if (!queue.data) return <BookingsPageLoading />;

  return (
    <BookingsPage
      actionState={{
        pendingId: null,
        errorMessage: checkIn.error?.message ?? cancel.error?.message ?? noShow.error?.message,
      }}
      canCheckInBookings={canCheckInBookings}
      canWriteBookings={canWriteBookings}
      queue={queue.data}
      onCancel={(bookingId) => cancel.mutate({ branchId, bookingId })}
      onCheckIn={(bookingId) => checkIn.mutate({ branchId, bookingId })}
      onMarkNoShow={(bookingId) => noShow.mutate({ branchId, bookingId })}
    />
  );
}
