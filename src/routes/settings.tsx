import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Banknote, Package, Globe, Bell, Moon, Sun, Monitor, Palette } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

export default function SettingsPage() {
  const { t, language, dir, toggleLanguage } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto p-6 space-y-5 max-w-6xl" dir={dir}>
      <h1 className="text-2xl font-black tracking-tight">{t("settings").title[language]}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Card className="border-2 shadow-md rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-extrabold">{t("settings").appearance[language]}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: "light", icon: Sun, label: t("settings").light[language] },
                  { mode: "dark", icon: Moon, label: t("settings").dark[language] },
                  { mode: "system", icon: Monitor, label: t("settings").system[language] },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setTheme(item.mode)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all hover:scale-105",
                      theme === item.mode
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        theme === item.mode ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold",
                        theme === item.mode ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-md rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-base font-extrabold">
                  {t("settings").language_region[language]}
                </h3>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex-1">
                  <Label htmlFor="arabic" className="text-sm font-bold cursor-pointer">
                    {t("settings").arabic[language]}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t("settings").arabic_desc[language]}
                  </p>
                </div>
                <Switch
                  id="arabic"
                  checked={language === "ar"}
                  onCheckedChange={toggleLanguage}
                  className="scale-100"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-md rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-base font-extrabold">
                  {t("settings").notifications[language]}
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    id: "sessionAlerts",
                    title: t("settings").session_alerts[language],
                    desc: t("settings").session_alerts_desc[language],
                  },
                  {
                    id: "paymentAlerts",
                    title: t("settings").payment_reminders[language],
                    desc: t("settings").payment_reminders_cash[language],
                  },
                  {
                    id: "stockAlerts",
                    title: t("settings").stock_alerts[language],
                    desc: t("settings").stock_alerts_desc[language],
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-muted/30"
                  >
                    <div className="flex-1">
                      <Label htmlFor={item.id} className="text-sm font-bold cursor-pointer">
                        {item.title}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Switch id={item.id} defaultChecked className="scale-100" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-2 shadow-md rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Banknote className="h-5 w-5 text-primary" />
                <h3 className="text-base font-extrabold">
                  {t("settings").currency_pricing[language]}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="hourlyRate"
                    className="text-sm font-extrabold text-muted-foreground uppercase tracking-wide"
                  >
                    {t("settings").default_hourly_rate[language]}
                  </Label>
                  <div className="relative">
                    <Input
                      id="hourlyRate"
                      type="number"
                      defaultValue="50"
                      className="h-11 text-base font-bold ps-12 rounded-xl bg-muted/50 border-2 focus-visible:ring-primary/30"
                    />
                    <div className="absolute top-0 start-0 bottom-0 flex items-center justify-center w-12 border-e-2 text-muted-foreground font-bold bg-muted/60 rounded-s-xl text-sm">
                      $
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="roomRate"
                    className="text-sm font-extrabold text-muted-foreground uppercase tracking-wide"
                  >
                    {t("settings").meeting_room_rate[language]}
                  </Label>
                  <div className="relative">
                    <Input
                      id="roomRate"
                      type="number"
                      defaultValue="100"
                      className="h-11 text-base font-bold ps-12 rounded-xl bg-muted/50 border-2 focus-visible:ring-primary/30"
                    />
                    <div className="absolute top-0 start-0 bottom-0 flex items-center justify-center w-12 border-e-2 text-muted-foreground font-bold bg-muted/60 rounded-s-xl text-sm">
                      $
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-md rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-base font-extrabold">
                  {t("settings").inventory_settings[language]}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="lowStockThreshold"
                    className="text-sm font-extrabold text-muted-foreground uppercase tracking-wide"
                  >
                    {t("settings").low_stock_threshold[language]}
                  </Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    defaultValue="5"
                    className="h-11 text-base font-bold rounded-xl bg-muted/50 border-2 focus-visible:ring-primary/30"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex-1">
                    <Label htmlFor="autoRestock" className="text-sm font-bold cursor-pointer">
                      {t("settings").auto_restock[language]}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t("settings").auto_restock_desc[language]}
                    </p>
                  </div>
                  <Switch id="autoRestock" defaultChecked className="scale-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
