import * as React from "react";
import { useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Users, MapPin, Clock, Package, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { NavItem } from "@/components/shared/nav-item";
import { SidebarFooter } from "@/components/shared/sidebar-footer";

const mainNavItems = [
  { href: "/", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/customers", icon: Users, key: "customers" as const },
  { href: "/resources", icon: MapPin, key: "resources" as const },
  { href: "/sessions", icon: Clock, key: "sessions" as const },
];

const secondaryNavItems = [{ href: "/settings", icon: Settings, key: "settings" as const }];

function AppLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = React.useState(() => {
    return localStorage.getItem("sidebarExpanded") !== "false";
  });
  const location = useLocation();
  const { language, dir, t, toggleLanguage } = useI18n();

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem("sidebarExpanded", String(newState));
  };

  return (
    <div className="flex h-screen bg-muted/20">
      <aside
        className={cn(
          "relative flex flex-col bg-card h-screen transition-all duration-300 ease-in-out border-e z-20",
          isExpanded ? "w-64" : "w-20",
        )}
      >
        <div className="flex h-20 items-center px-3 overflow-hidden border-b/50">
          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-300 w-full",
              isExpanded
                ? "bg-muted/50 border border-border/40 rounded-lg p-2 px-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]"
                : "px-2 justify-center",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-md transition-all duration-300 shrink-0",
                isExpanded
                  ? "h-8 w-8 bg-primary text-primary-foreground shadow-sm"
                  : "h-11 w-11 bg-primary/10 text-primary",
              )}
            >
              <Package
                className={cn("transition-all duration-300", isExpanded ? "size-[18px]" : "size-6")}
              />
            </div>
            {isExpanded && (
              <span
                className={cn(
                  "text-base font-black tracking-tighter whitespace-nowrap transition-all duration-300 overflow-hidden",
                  isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0",
                )}
              >
                BACKSPACE
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <div className={cn("space-y-8", !isExpanded && "flex flex-col items-center")}>
            <div className="space-y-1 w-full">
              {isExpanded && (
                <p className="px-3 text-xs font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  {t("main").dashboard[language]}
                </p>
              )}
              <div
                className={cn(
                  "space-y-1 w-full",
                  !isExpanded && "flex flex-col items-center gap-1",
                )}
              >
                {mainNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavItem
                      key={item.key}
                      href={item.href}
                      icon={item.icon}
                      label={t("nav")[item.key][language]}
                      isActive={isActive}
                      isExpanded={isExpanded}
                    />
                  );
                })}
              </div>
            </div>

            <Separator className={cn("bg-border/50", !isExpanded && "w-8")} />

            <div className="space-y-1 w-full">
              {isExpanded && (
                <p className="px-3 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  {t("system")[language]}
                </p>
              )}
              <div
                className={cn(
                  "space-y-1 w-full",
                  !isExpanded && "flex flex-col items-center gap-1",
                )}
              >
                {secondaryNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavItem
                      key={item.key}
                      href={item.href}
                      icon={item.icon}
                      label={t("nav")[item.key][language]}
                      isActive={isActive}
                      isExpanded={isExpanded}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t p-3 space-y-1">
          <SidebarFooter
            isExpanded={isExpanded}
            dir={dir}
            onToggleLanguage={toggleLanguage}
            onToggleExpand={toggleExpanded}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}

export default AppLayout;
