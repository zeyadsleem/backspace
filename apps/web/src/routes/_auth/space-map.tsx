import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  SpaceMap,
  SpaceMapEmpty,
  SpaceMapError,
  SpaceMapLoading,
  SpaceMapRestricted,
} from "@/features/space-map/space-map";
import { hasPermission } from "@/features/staff-shell/permissions";
import { resolveStaffShellContext } from "@/features/staff-shell/shell-context";
import { trpc } from "@/utils/trpc";
import { PERMISSIONS } from "@backspace/api/permissions/constants";

export const Route = createFileRoute("/_auth/space-map")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const staffProfile = useQuery({
    ...trpc.staff.me.queryOptions(),
    retry: false,
  });
  const shellContext = resolveStaffShellContext(staffProfile.data);
  const branchId = shellContext.currentBranchId;
  const map = useQuery(trpc.spaces.getMap.queryOptions({ branchId }));
  const detail = useQuery({
    ...trpc.spaces.getDetail.queryOptions({ branchId, spaceId: selectedSpaceId ?? "" }),
    enabled: Boolean(selectedSpaceId),
  });

  if (!hasPermission(shellContext.permissions, PERMISSIONS.WORKSPACE_READ))
    return <SpaceMapRestricted />;
  if (map.isLoading) return <SpaceMapLoading />;
  if (map.error) return <SpaceMapError message={map.error.message} />;
  if (!map.data) return <SpaceMapError message="No space map data returned." />;
  if (map.data.groups.every((group) => group.spaces.length === 0)) {
    return <SpaceMapEmpty branchName={map.data.branch.name} />;
  }

  return (
    <SpaceMap
      overview={map.data}
      selectedSpaceDetail={detail.data ?? null}
      selectedSpaceId={selectedSpaceId}
      onSelectSpace={setSelectedSpaceId}
    />
  );
}
