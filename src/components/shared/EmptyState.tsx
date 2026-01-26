import {
  Clock,
  CreditCard,
  FileText,
  Inbox,
  Monitor,
  Package,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateIcon =
  | "users"
  | "resources"
  | "sessions"
  | "inventory"
  | "invoices"
  | "subscriptions"
  | "search"
  | "default";

export interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  className?: string;
}

const iconMap: Record<EmptyStateIcon, React.ComponentType<{ className?: string }>> = {
  users: Users,
  resources: Monitor,
  sessions: Clock,
  inventory: Package,
  invoices: FileText,
  subscriptions: CreditCard,
  search: Search,
  default: Inbox,
};

export function EmptyState({
  icon = "default",
  title,
  description,
  actionText,
  actionIcon = <Plus className="h-4 w-4" />,
  onAction,
  className,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <IconComponent className="h-8 w-8 text-stone-400 dark:text-stone-500" />
      </div>
      <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-stone-600 dark:text-stone-400">{description}</p>
      )}
      {actionText && onAction && (
        <Button className="mt-6" onClick={onAction} size="md" variant="primary">
          {actionIcon}
          {actionText}
        </Button>
      )}
    </div>
  );
}
