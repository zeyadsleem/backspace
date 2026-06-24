import { Link } from "@tanstack/react-router";
import { Bell, ChevronDown, Command, LogOut, Search, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import UserMenu from "@/components/user-menu";
import { Button } from "@backspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@backspace/ui/components/card";
import { Input } from "@backspace/ui/components/input";
import { cn } from "@backspace/ui/lib/utils";

import { PermissionGate } from "./permissions";
import {
  getActiveShiftLabel,
  getCurrentBranch,
  resolveStaffShellContext,
  staffShellBranches,
  staffShellContext,
} from "./shell-context";
import type { StaffShellContext, StaffShellProfile } from "./shell-context";
import { getVisibleNavigationGroups } from "./staff-navigation";
import { staffQuickActions } from "./staff-quick-actions";

export function StaffShell({
  children,
  staffProfile,
  userName,
}: {
  children: ReactNode;
  staffProfile?: StaffShellProfile | null;
  userName?: string | null;
}) {
  const context = resolveStaffShellContext(staffProfile);

  return (
    <div className="grid min-h-svh bg-background text-foreground md:grid-cols-[17rem_1fr]">
      <StaffSidebar permissions={context.permissions} />
      <div className="grid min-w-0 grid-rows-[auto_1fr]">
        <StaffTopbar context={context} userName={userName} />
        <main className="min-w-0 bg-muted/20 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function StaffSidebar({ permissions }: { permissions: StaffShellContext["permissions"] }) {
  const visibleGroups = getVisibleNavigationGroups(permissions);

  return (
    <aside className="hidden border-r bg-card/60 md:flex md:flex-col">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Backspace Ops</p>
            <p className="text-xs text-muted-foreground">Staff console</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <div className="flex flex-col gap-2" key={group.label}>
            <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <span
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                      item.disabled
                        ? "cursor-not-allowed text-muted-foreground/70"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                    {item.disabled ? (
                      <span className="ml-auto rounded-sm border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    ) : null}
                  </span>
                );

                return item.disabled ? (
                  <button className="text-left" disabled key={item.href} type="button">
                    {content}
                  </button>
                ) : (
                  <Link key={item.href} to={item.href}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function StaffTopbar({
  context,
  userName,
}: {
  context: StaffShellContext;
  userName?: string | null;
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <BranchSelector context={context} />
          <ShiftStatusBadge context={context} />
          <div className="hidden items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground md:flex md:min-w-64 lg:min-w-80">
            <Search aria-hidden="true" />
            <Input
              aria-label="Global search"
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder="Search people, bookings, visits"
              readOnly
            />
            <span className="rounded-sm border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide">
              /
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <QuickActions permissions={context.permissions} />
          <Button aria-label="Notifications" size="icon" variant="outline">
            <Bell aria-hidden="true" />
          </Button>
          <div className="hidden min-w-0 text-right text-xs md:block">
            <p className="truncate font-medium text-foreground">
              {context.displayName ?? userName ?? "Staff user"}
            </p>
            <p className="text-muted-foreground">{context.role}</p>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function BranchSelector({ context }: { context: StaffShellContext }) {
  const currentBranch = getCurrentBranch(context.currentBranchId);

  return (
    <Button className="justify-between gap-3" variant="outline">
      <span className="flex flex-col items-start leading-tight">
        <span className="text-xs text-muted-foreground">Branch</span>
        <span>{currentBranch.name}</span>
      </span>
      <ChevronDown aria-hidden="true" />
      <span className="sr-only">
        Available branches: {staffShellBranches.map((branch) => branch.name).join(", ")}
      </span>
    </Button>
  );
}

function ShiftStatusBadge({ context }: { context: StaffShellContext }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
      <span className="size-2 rounded-full bg-primary" />
      <span>{getActiveShiftLabel(context.activeShift)}</span>
    </div>
  );
}

function QuickActions({ permissions }: { permissions: StaffShellContext["permissions"] }) {
  return (
    <div className="flex items-center gap-2">
      <Button className="md:hidden" size="icon" variant="outline">
        <Command aria-hidden="true" />
        <span className="sr-only">Quick actions</span>
      </Button>
      <div className="hidden items-center gap-2 md:flex">
        {staffQuickActions.map((action) => (
          <PermissionGate
            fallback={null}
            key={action.label}
            permissions={permissions}
            required={action.requiredPermission}
          >
            <Button
              disabled={action.disabled}
              size="sm"
              title={action.description}
              variant="outline"
            >
              {action.label}
            </Button>
          </PermissionGate>
        ))}
      </div>
    </div>
  );
}

export function StaffShellLanding() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Today</p>
        <h1 className="text-2xl font-semibold tracking-tight">Staff operations shell</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Navigation, branch context, shift status, search, quick actions, and permission-gated
          controls are ready for the operational workflows that follow.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Branch context</CardTitle>
            <CardDescription>Selectors use the current seed scenario names.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {getCurrentBranch(staffShellContext.currentBranchId).name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shift state</CardTitle>
            <CardDescription>Visible without starting checkout or cash workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {getActiveShiftLabel(staffShellContext.activeShift)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              UI gates mirror the existing server-side permission names.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm">
            <LogOut aria-hidden="true" />
            <span>Server checks remain authoritative through tRPC procedures.</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
