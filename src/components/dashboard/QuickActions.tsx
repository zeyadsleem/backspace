import { Play, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";

interface QuickActionsProps {
  onNewCustomer?: () => void;
  onStartSession?: () => void;
}

export function QuickActions({ onNewCustomer, onStartSession }: QuickActionsProps) {
  const t = useAppStore((state) => state.t);


  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onStartSession} size="md" variant="primary">
        <Play className="h-4 w-4" />
        {t("startSession")}
      </Button>
      <Button onClick={onNewCustomer} size="md" variant="outline">
        <UserPlus className="h-4 w-4" />
        {t("newCustomer")}
      </Button>
    </div>
  );
}
