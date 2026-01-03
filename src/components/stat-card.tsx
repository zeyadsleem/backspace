import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ElementType;
  badge?: string;
  color?: "blue" | "purple" | "emerald" | "orange" | "amber";
  className?: string;
}

const colorStyles = {
  blue: {
    bg: "bg-[var(--color-blue-bg)]",
    text: "text-[var(--color-blue)]",
    border: "border-[var(--color-blue-border)]",
    badgeBg: "bg-[var(--color-blue-bg)]",
    glow: "bg-[var(--color-blue-bg)] hover:bg-[var(--color-blue)]/20",
  },
  purple: {
    bg: "bg-[var(--color-purple-bg)]",
    text: "text-[var(--color-purple)]",
    border: "border-[var(--color-purple-border)]",
    badgeBg: "bg-[var(--color-purple-bg)]",
    glow: "bg-[var(--color-purple-bg)] hover:bg-[var(--color-purple)]/20",
  },
  emerald: {
    bg: "bg-[var(--color-emerald-bg)]",
    text: "text-[var(--color-emerald)]",
    border: "border-[var(--color-emerald-border)]",
    badgeBg: "bg-[var(--color-emerald-bg)]",
    glow: "bg-[var(--color-emerald-bg)] hover:bg-[var(--color-emerald)]/20",
  },
  orange: {
    bg: "bg-[var(--color-orange-bg)]",
    text: "text-[var(--color-orange)]",
    border: "border-[var(--color-orange-border)]",
    badgeBg: "bg-[var(--color-orange-bg)]",
    glow: "bg-[var(--color-orange-bg)] hover:bg-[var(--color-orange)]/20",
  },
  amber: {
    bg: "bg-[var(--color-amber-bg)]",
    text: "text-[var(--color-amber)]",
    border: "border-[var(--color-amber-border)]",
    badgeBg: "bg-[var(--color-amber-bg)]",
    glow: "bg-[var(--color-amber-bg)] hover:bg-[var(--color-amber)]/20",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  color = "blue",
  className,
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border-2 bg-background p-6 hover:shadow-xl transition-all duration-300 flex items-center gap-4",
        className,
      )}
    >
      <div
        className={cn(
          "absolute top-0 end-0 h-16 w-16 translate-x-4 rtl:-translate-x-4 -translate-y-4 rounded-full blur-xl transition-all",
          styles.glow,
        )}
      />
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
          styles.bg,
          styles.text,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5 z-10">
        <h3 className="text-[13px] font-extrabold text-foreground/80 uppercase tracking-wider truncate">
          {title}
        </h3>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl font-black tracking-tighter">{value}</span>
          {subtitle && (
            <span
              className={cn(
                "text-[11px] font-bold truncate flex items-center gap-1",
                color === "emerald" ? "text-[var(--color-emerald)]" : "text-muted-foreground/60",
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {badge && (
        <Badge
          variant="outline"
          className={cn(
            "hidden xl:flex absolute top-4 end-4 text-[9px] font-black uppercase tracking-widest px-2 py-0 z-10",
            styles.text,
            styles.border,
            styles.badgeBg,
          )}
        >
          {badge}
        </Badge>
      )}
    </div>
  );
}
