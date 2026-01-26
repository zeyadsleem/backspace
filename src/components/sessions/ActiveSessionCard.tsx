import { Clock, Monitor, PlusCircle, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import type { ActiveSession } from "@/types";

interface ActiveSessionCardProps {
  session: ActiveSession;
  onAddInventory?: () => void;
  onEndSession?: () => void;
}

export function ActiveSessionCard({
  session,
  onAddInventory,
  onEndSession,
}: ActiveSessionCardProps) {
  const t = useAppStore((state) => state.t);
  const [elapsedTime, setElapsedTime] = useState("");
  const [sessionCost, setSessionCost] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(session.startedAt);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60_000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      setElapsedTime(
        hours > 0
          ? `${hours}${t("hour").charAt(0)} ${mins}${t("minute").charAt(0)}`
          : `${mins}${t("minute").charAt(0)}`
      );

      if (!session.isSubscribed) {
        const cost = (diffMins / 60) * session.resourceRate;
        setSessionCost(Math.round(cost));
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt, session.resourceRate, session.isSubscribed, t]);

  const totalCost = sessionCost + session.inventoryTotal;
  const initials = session.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-stone-200 border-b-4 border-b-amber-500/10 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      {/* 1. Header: Customer & Live Time */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 font-medium text-stone-500 text-xs shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium text-base text-stone-900 leading-tight dark:text-stone-100">
              {session.customerName}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-stone-400">
              <Monitor className="h-4 w-4" />
              <span className="truncate font-medium text-xs uppercase tracking-wider">
                {session.resourceName}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 text-amber-700 shadow-sm dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
            <Clock className="h-4 w-4 animate-pulse" />
            <span className="font-medium font-mono text-xs">{elapsedTime}</span>
          </div>
          {session.isSubscribed && (
            <span className="font-semibold text-emerald-600 text-xs uppercase tracking-[0.1em] dark:text-emerald-400">
              {t("subscribed")}
            </span>
          )}
        </div>
      </div>

      {/* 2. Billing Breakdown: Centered & Clear */}
      <div className="flex-grow space-y-5 px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 border-stone-50 border-t pt-4 dark:border-stone-800">
          <div className="space-y-1 text-center">
            <p className="font-medium text-stone-400 text-xs uppercase tracking-widest">
              {t("session")}
            </p>
            <p
              className={`font-semibold text-base ${session.isSubscribed ? "text-emerald-600" : "text-stone-900 dark:text-stone-100"}`}
            >
              {session.isSubscribed ? t("covered") : `${sessionCost} ${t("egp")}`}
            </p>
          </div>
          <div className="space-y-1 border-stone-100 border-s text-center dark:border-stone-800">
            <p className="font-medium text-stone-400 text-xs uppercase tracking-widest">
              {t("inventoryLabel")}
            </p>
            <div className="flex flex-col items-center gap-0.5">
              <p className="font-semibold text-base text-stone-900 dark:text-stone-100">
                {session.inventoryTotal} {t("egp")}
              </p>
              {session.inventoryConsumptions.length > 0 && (
                <span className="font-medium text-amber-600 text-xs dark:text-amber-400">
                  {t("items", { count: session.inventoryConsumptions.length })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. The Total: Integrated Premium Box (#FFFBEB) */}
        <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-[#FFFBEB] px-4 py-3 shadow-sm dark:border-amber-900/20 dark:bg-amber-900/10">
          <span className="font-medium text-amber-800/70 text-xs uppercase tracking-widest dark:text-amber-400">
            {t("totalToPay")}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-amber-700 text-xl dark:text-amber-400">
              {totalCost}
            </span>
            <span className="font-medium text-amber-600/70 text-xs uppercase">
              {t("egpCurrency")}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Actions: Slim & Practical */}
      <div className="mt-auto grid grid-cols-2 gap-px border-stone-100 border-t bg-stone-100 dark:border-stone-800 dark:bg-stone-800">
        <button
          className="flex items-center justify-center gap-2 bg-white py-3 font-medium text-stone-600 text-xs transition-colors hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          onClick={onAddInventory}
        >
          <PlusCircle className="h-4 w-4 text-amber-500" />
          {t("addItem")}
        </button>
        <button
          className="flex items-center justify-center gap-2 bg-white py-3 font-medium text-stone-600 text-xs transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-red-900/10"
          onClick={onEndSession}
        >
          <Square className="h-4 w-4 fill-current" />
          {t("end")}
        </button>
      </div>
    </div>
  );
}
