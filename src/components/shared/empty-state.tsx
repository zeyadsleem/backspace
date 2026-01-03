import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />}
      <p className="text-lg font-semibold mb-2">{title}</p>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>}
      {action}
    </div>
  );
}
