import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { MainNav } from "./MainNav";

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface AppShellProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  settingsItem: NavigationItem;
  onNavigate?: (href: string) => void;
  isRTL?: boolean;
}

export function AppShell({
  children,
  navigationItems,
  settingsItem,
  onNavigate,
  isRTL = false,
}: AppShellProps) {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className={`h-screen overflow-hidden bg-stone-50 dark:bg-stone-950 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Mobile Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center border-stone-200 border-b bg-white px-4 lg:hidden dark:border-stone-800 dark:bg-stone-900">
        <button
          className="rounded-md p-2 hover:bg-stone-100 dark:hover:bg-stone-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className={`font-bold text-lg ${isRTL ? "mr-3" : "ml-3"}`}>Backspace</span>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col border-stone-200 bg-white transition-all duration-300 dark:border-stone-800 dark:bg-stone-900 ${isRTL ? "right-0 border-l" : "left-0 border-r"}
          ${mobileMenuOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarCollapsed ? "w-16" : "w-60"}
        `}
      >
        {/* Logo */}
        <div
          className={`flex h-14 items-center border-stone-200 border-b dark:border-stone-800 ${sidebarCollapsed ? "justify-center px-2" : "px-4"}`}
        >
          {sidebarCollapsed ? (
            <span className="font-bold text-amber-600 text-xl">B</span>
          ) : (
            <span className="font-bold text-xl">Backspace</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <MainNav
            collapsed={sidebarCollapsed}
            items={navigationItems}
            onNavigate={(href) => {
              onNavigate?.(href);
              setMobileMenuOpen(false);
            }}
          />
        </nav>

        {/* Settings Section */}
        <div className="border-stone-200 border-t p-2 dark:border-stone-800">
          <MainNav
            collapsed={sidebarCollapsed}
            items={[settingsItem]}
            onNavigate={(href) => {
              onNavigate?.(href);
              setMobileMenuOpen(false);
            }}
          />
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          className={`absolute top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white transition-colors hover:bg-stone-100 lg:flex dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800 ${isRTL ? "-left-3" : "-right-3"}
          `}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            isRTL ? (
              <ChevronLeft className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : isRTL ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={`flex h-screen flex-col pt-14 transition-all duration-300 lg:pt-0 ${isRTL ? (sidebarCollapsed ? "lg:mr-16" : "lg:mr-60") : sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"}
        `}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
