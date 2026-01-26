import { Building2, CreditCard, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import type { LanguageOption, ResourceType, Settings, ThemeOption } from "@/types";

interface SettingsPageProps {
  settings: Settings;
  onUpdateAppearance?: (appearance: { theme: ThemeOption; language: LanguageOption }) => void;
}

const themeIcons = { light: Sun, dark: Moon, system: Monitor };

export function SettingsPage({ settings, onUpdateAppearance }: SettingsPageProps) {
  const t = useAppStore((state) => state.t);
  const planTypes = useAppStore((state) => state.planTypes);
  const resources = useAppStore((state) => state.resources);
  const updatePlanPrice = useAppStore((state) => state.updatePlanPrice);
  const updateResourceTypePrice = useAppStore((state) => state.updateResourceTypePrice);
  const isRTL = useAppStore((state) => state.isRTL);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const resourceCategories: Array<{ id: ResourceType; label: string }> = [
    { id: "seat", label: t("seatType") },
    { id: "room", label: t("roomType") },
    { id: "desk", label: t("deskType") },
  ];

  const availableThemes = [
    { id: "light" as ThemeOption, label: t("light") },
    { id: "dark" as ThemeOption, label: t("dark") },
    { id: "system" as ThemeOption, label: t("system") },
  ];

  const availableLanguages = [
    { id: "en" as LanguageOption, nativeLabel: "English" },
    { id: "ar" as LanguageOption, nativeLabel: "العربية" },
  ];

  const handleCompanyUpdate = (field: keyof Settings["company"], value: string) => {
    updateSettings({
      company: {
        ...settings.company,
        [field]: value,
      },
    });
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden p-6">
      <div className="shrink-0">
        <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">{t("settings")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t("manageSettings")}</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scrollable Main Content */}
        <section className="space-y-6 overflow-y-auto pr-2 lg:col-span-2">
          {/* Company Info */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                  {t("companyInfo")}
                </h2>
                <p className="text-stone-500 text-xs dark:text-stone-400">
                  {t("appearsOnInvoices")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-medium text-sm text-stone-700 dark:text-stone-300">
                  {t("companyName")}
                </label>
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800"
                  defaultValue={settings.company.name}
                  onBlur={(e) => handleCompanyUpdate("name", e.target.value)}
                  type="text"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-sm text-stone-700 dark:text-stone-300">
                  {t("email")}
                </label>
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800"
                  defaultValue={settings.company.email}
                  onBlur={(e) => handleCompanyUpdate("email", e.target.value)}
                  type="email"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-sm text-stone-700 dark:text-stone-300">
                  {t("phone")}
                </label>
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800"
                  defaultValue={settings.company.phone}
                  onBlur={(e) => handleCompanyUpdate("phone", e.target.value)}
                  type="tel"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-medium text-sm text-stone-700 dark:text-stone-300">
                  {t("address")}
                </label>
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800"
                  defaultValue={settings.company.address}
                  onBlur={(e) => handleCompanyUpdate("address", e.target.value)}
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Pricing Control Center */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                  {t("pricingControl") || "Pricing Control Center"}
                </h2>
                <p className="text-stone-500 text-xs dark:text-stone-400">
                  {t("manageAllPrices") || "Centralized pricing for all services"}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Subscription Plans */}
              <div>
                <h3 className="mb-4 font-bold text-sm text-stone-400 uppercase tracking-wider">
                  {t("subscriptions")}
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {planTypes.map((plan) => (
                    <div key={plan.id}>
                      <label className="mb-1.5 block font-medium text-sm text-stone-700 dark:text-stone-300">
                        {isRTL ? plan.labelAr : plan.labelEn}
                      </label>
                      <div className="relative">
                        <input
                          className={`w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 ${isRTL ? "pl-10" : "pr-10"}`}
                          defaultValue={plan.price}
                          onBlur={(e) =>
                            updatePlanPrice(plan.id, Number.parseFloat(e.target.value))
                          }
                          type="number"
                        />
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 text-stone-500 text-xs ${isRTL ? "left-3" : "right-3"}`}
                        >
                          {t("egp")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Rates */}
              <div className="border-stone-100 border-t pt-8 dark:border-stone-800">
                <h3 className="mb-4 font-bold text-sm text-stone-400 uppercase tracking-wider">
                  {t("resources")} ({t("ratePerHour")})
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {resourceCategories.map((cat) => {
                    const firstOfKind = resources.find((r) => r.resourceType === cat.id);
                    return (
                      <div key={cat.id}>
                        <label className="mb-1.5 block font-medium text-sm text-stone-700 dark:text-stone-300">
                          {cat.label}
                        </label>
                        <div className="relative">
                          <input
                            className={`w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 ${isRTL ? "pl-10" : "pr-10"}`}
                            defaultValue={firstOfKind?.ratePerHour ?? 0}
                            onBlur={(e) =>
                              updateResourceTypePrice(cat.id, Number.parseFloat(e.target.value))
                            }
                            type="number"
                          />
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 text-stone-500 text-xs ${isRTL ? "left-3" : "right-3"}`}
                          >
                            {t("egp")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fixed Sidebar */}
        <section className="h-fit rounded-xl border border-stone-200 bg-white p-6 lg:col-span-1 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">{t("appearance")}</h2>
          </div>
          <div className="mb-6">
            <label className="mb-3 block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("theme")}
            </label>
            <div className="space-y-2">
              {availableThemes.map((theme) => {
                const Icon = themeIcons[theme.id];
                const isSelected = settings.appearance.theme === theme.id;
                return (
                  <button
                    className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 transition-all ${isSelected ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600"}`}
                    key={theme.id}
                    onClick={() =>
                      onUpdateAppearance?.({
                        ...settings.appearance,
                        theme: theme.id,
                      })
                    }
                  >
                    <Icon
                      className={`h-4 w-4 ${isSelected ? "text-amber-600 dark:text-amber-400" : "text-stone-500"}`}
                    />
                    <span
                      className={`font-medium text-sm ${isSelected ? "text-amber-700 dark:text-amber-300" : "text-stone-600 dark:text-stone-400"}`}
                    >
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-3 block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("language")}
            </label>
            <div className="space-y-2">
              {availableLanguages.map((lang) => {
                const isSelected = settings.appearance.language === lang.id;
                return (
                  <button
                    className={`flex w-full items-center justify-center rounded-lg border-2 p-3 transition-all ${isSelected ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600"}`}
                    key={lang.id}
                    onClick={() =>
                      onUpdateAppearance?.({
                        ...settings.appearance,
                        language: lang.id,
                      })
                    }
                  >
                    <span
                      className={`font-medium text-sm ${isSelected ? "text-amber-700 dark:text-amber-300" : "text-stone-600 dark:text-stone-400"}`}
                    >
                      {lang.nativeLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
