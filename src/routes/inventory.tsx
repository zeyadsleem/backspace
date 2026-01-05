import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { InventoryManager } from "@/components/inventory/inventory-manager";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

export default function InventoryPage() {
  const { dir } = useI18n();

  return (
    <div className="container mx-auto p-8" dir={dir}>
      <InventoryManager />
    </div>
  );
}
