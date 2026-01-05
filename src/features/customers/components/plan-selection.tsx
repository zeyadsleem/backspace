import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PLAN_TYPE_LABELS } from "@/lib/validation/schemas/subscription";

type PlanType = "weekly" | "half-monthly" | "monthly";

interface PlanSelectionProps {
  selectedPlan: PlanType | null;
  onPlanSelect: (plan: PlanType) => void;
  onCancel: () => void;
}

const PLAN_TYPES: PlanType[] = ["weekly", "half-monthly", "monthly"];

export function PlanSelection({ selectedPlan, onPlanSelect, onCancel }: PlanSelectionProps) {
  const { language, lang } = useI18n();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {PLAN_TYPES.map((planType) => (
            <Card
              key={planType}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                selectedPlan === planType ? "ring-2 ring-primary shadow-lg" : "hover:border-primary"
              }`}
              onClick={() => onPlanSelect(planType)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {
                      PLAN_TYPE_LABELS[planType]?.[
                        language as keyof (typeof PLAN_TYPE_LABELS)[typeof planType]
                      ]
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lang(
                      `${PLAN_TYPE_LABELS[planType]?.days} يوم`,
                      `${PLAN_TYPE_LABELS[planType]?.days} days`,
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <DialogFooter className="gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="ltr:mr-auto rtl:ml-auto"
        >
          {lang("إلغاء", "Cancel")}
        </Button>
      </DialogFooter>
    </div>
  );
}
