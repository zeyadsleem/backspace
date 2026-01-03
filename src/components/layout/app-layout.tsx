import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  // Clock,
  Package,
  // CreditCard,
  // BarChart3,
  Settings,
  Menu,
  PanelLeft,
  Globe,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const mainNavItems = [
  { href: "/", icon: LayoutDashboard, key: "dashboard" as const },
  { href: "/customers", icon: Users, key: "customers" as const },
  // { href: "/sessions", icon: Clock, key: "sessions" as const },
  // { href: "/inventory", icon: Package, key: "inventory" as const },
  // { href: "/subscriptions", icon: CreditCard, key: "subscriptions" as const },
  // { href: "/reports", icon: BarChart3, key: "reports" as const },
];

const secondaryNavItems = [{ href: "/settings", icon: Settings, key: "settings" as const }];

function AppLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = React.useState(() => {
    return localStorage.getItem("sidebarExpanded") !== "false";
  });
  const location = useLocation();
  const { language, toggleLanguage, t, dir } = useI18n();

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
                ? "bg-muted/50 border border-border/40 rounded-2xl p-2 px-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]"
                : "px-2 justify-center",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-xl transition-all duration-300 shrink-0",
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
                <p className="px-3 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-2">
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
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  if (!isExpanded) {
                    return (
                      <Link
                        key={item.key}
                        to={item.href}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        title={t("nav")[item.key][language]}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.key}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-primary-foreground" : "text-muted-foreground/80",
                        )}
                      />
                      <span className="truncate">{t("nav")[item.key][language]}</span>
                    </Link>
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
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  if (!isExpanded) {
                    return (
                      <Link
                        key={item.key}
                        to={item.href}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        title={t("nav")[item.key][language]}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.key}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-primary-foreground" : "text-muted-foreground/80",
                        )}
                      />
                      <span className="truncate">{t("nav")[item.key][language]}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t p-3 space-y-1">
          {isExpanded ? (
            <>
              <button
                className="w-full flex items-center justify-start gap-3 px-3 py-2 hover:bg-muted transition-all rounded-lg text-muted-foreground font-semibold active:scale-95 text-start text-sm"
                onClick={toggleLanguage}
              >
                <Globe className="h-5 w-5 text-muted-foreground/80" />
                <span className="truncate">{language === "ar" ? "English" : "عربي"}</span>
              </button>
              <button
                className="w-full flex items-center justify-start gap-3 px-3 py-2 hover:bg-muted transition-all rounded-lg font-semibold text-muted-foreground active:scale-95 text-start text-sm"
                onClick={toggleExpanded}
              >
                <PanelLeft
                  className={cn(
                    "h-5 w-5 text-muted-foreground/80 transition-transform",
                    dir === "rtl" && "rotate-180",
                  )}
                />
                <span className="truncate">{language === "ar" ? "طي القائمة" : "Collapse"}</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90"
                onClick={toggleLanguage}
                title={language === "ar" ? "English" : "عربي"}
              >
                <Globe className="h-5 w-5" />
              </button>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90"
                onClick={toggleExpanded}
                title={language === "ar" ? "توسيع" : "Expand"}
              >
                <Menu className="h-5 w-5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}

export default AppLayout;
