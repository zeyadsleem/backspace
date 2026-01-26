import { LogOut } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { RTLIcon } from "../ui/RTLIcon";

interface UserMenuProps {
  user?: { name: string; role?: string; avatarUrl?: string };
  collapsed?: boolean;
  onLogout?: () => void;
}

export function UserMenu({ user, collapsed = false, onLogout }: UserMenuProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className={`p-2 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}>
      {/* User Info */}
      <div
        className={`flex items-center gap-3 rounded-lg p-2 ${collapsed ? "justify-center" : ""}
        `}
      >
        {/* Avatar */}
        {user?.avatarUrl ? (
          <img alt={user.name} className="h-8 w-8 rounded-full object-cover" src={user.avatarUrl} />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <span className="font-semibold text-amber-700 text-xs dark:text-amber-300">
              {initials}
            </span>
          </div>
        )}

        {/* Name & Role */}
        {!collapsed && (
          <div className={`min-w-0 flex-1 ${isRTL ? "text-end" : "text-start"}`}>
            <p className="truncate font-medium text-sm text-stone-900 dark:text-stone-100">
              {user?.name || t("admin")}
            </p>
            {user?.role && (
              <p className="truncate text-stone-500 text-xs dark:text-stone-400">
                {user.role === "Manager" ? t("manager") : user.role}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-red-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-red-400 ${collapsed ? "w-full justify-center" : `w-full ${isRTL ? "flex-row-reverse" : ""}`}
        `}
        onClick={onLogout}
        title={collapsed ? t("logout") : undefined}
      >
        <RTLIcon>
          <LogOut className="h-4 w-4" />
        </RTLIcon>
        {!collapsed && <span>{t("logout")}</span>}
      </button>
    </div>
  );
}
