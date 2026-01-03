import { createFileRoute } from "@tanstack/react-router";
import { Clock, Users, Banknote, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { StatCard } from "@/components/stat-card";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

export default function DashboardPage() {
  const { t, language, dir } = useI18n();

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <div>
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
          {t("dashboard").title[language]}
        </h1>
        <p className="text-base text-muted-foreground mt-1">{t("dashboard").subtitle[language]}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard").active_sessions[language]}
          value="12"
          subtitle={`/ ${t("dashboard").currently_active[language]}`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title={t("dashboard").available_seats[language]}
          value="18"
          subtitle={t("dashboard").total_seats[language]}
          icon={Users}
          color="purple"
        />
        <StatCard
          title={t("dashboard").todays_revenue[language]}
          value="4,875"
          subtitle={
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-(--color-emerald) animate-pulse" />
              {t("dashboard").from_yesterday[language]}
            </>
          }
          icon={Banknote}
          color="emerald"
        />
        <StatCard
          title={t("dashboard").low_stock_alerts[language]}
          value="3"
          subtitle={t("dashboard").items_need_restocking[language]}
          icon={AlertTriangle}
          color="orange"
        />
      </div>
    </div>
  );
}
