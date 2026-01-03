import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
}

export function NavItem({ href, icon: Icon, label, isActive, isExpanded }: NavItemProps) {
  if (!isExpanded) {
    return (
      <Link
        to={href}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        title={label}
      >
        <Icon className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      to={href}
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
      <span className="truncate">{label}</span>
    </Link>
  );
}
