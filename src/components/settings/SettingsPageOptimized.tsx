import {
  Building2,
  Database,
  Download,
  Globe,
  Palette,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import { useState } from "react";
import {
  useLanguage,
  useSettings,
  useSettingsActions,
  useTheme,
  useThemeActions,
  useTranslation,
} from "@/stores/hooks";

export function SettingsPageOptimized() {
  const t = useTranslation();
  const settings = useSettings();
  const theme = useTheme();
  const language = useLanguage();
  const { updateSettings } = useSettingsActions();
  const { setTheme, setLanguage } = useThemeActions();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingsChange = (newSettings: Partial<typeof settings>) => {
    setLocalSettings({ ...localSettings, ...newSettings });
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">{t("settings")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t("manageSettings")}</p>
      </div>

      {/* Company Information */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
              {t("companyInfo")}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">{t("appearsOnInvoices")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("companyName")}
            </label>
            <input
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              onChange={(e) =>
                handleSettingsChange({
                  company: { ...localSettings.company, name: e.target.value },
                })
              }
              type="text"
              value={localSettings.company.name}
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("phone")}
            </label>
            <input
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              onChange={(e) =>
                handleSettingsChange({
                  company: { ...localSettings.company, phone: e.target.value },
                })
              }
              type="tel"
              value={localSettings.company.phone}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("address")}
            </label>
            <textarea
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              onChange={(e) =>
                handleSettingsChange({
                  company: {
                    ...localSettings.company,
                    address: e.target.value,
                  },
                })
              }
              rows={3}
              value={localSettings.company.address}
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
            <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
              {t("regionalSettings")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("currency")}
            </label>
            <input
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              onChange={(e) =>
                handleSettingsChange({
                  regional: {
                    ...localSettings.regional,
                    currency: e.target.value,
                  },
                })
              }
              type="text"
              value={localSettings.regional.currency}
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("taxRate")}
            </label>
            <input
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              max="100"
              min="0"
              onChange={(e) =>
                handleSettingsChange({
                  tax: {
                    ...localSettings.tax,
                    rate: Number.parseFloat(e.target.value) || 0,
                  },
                })
              }
              step="any"
              type="number"
              value={localSettings.tax.rate}
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
              {t("appearance")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("theme")}
            </label>
            <select
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
              value={theme}
            >
              <option value="light">{t("light")}</option>
              <option value="dark">{t("dark")}</option>
              <option value="system">{t("system")}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-sm text-stone-700 dark:text-stone-300">
              {t("language")}
            </label>
            <select
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-transparent focus:ring-2 focus:ring-amber-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
              onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
              value={language}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
            <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-100">
              {t("dataManagement")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30">
            <Download className="h-4 w-4" />
            {t("backupDatabase")}
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30">
            <Upload className="h-4 w-4" />
            {t("restoreDatabase")}
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30">
            <RotateCcw className="h-4 w-4" />
            {t("resetDatabase")}
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-amber-800 text-sm dark:text-amber-200">{t("resetWarning")}</p>
        </div>
      </div>

      {/* Save Actions */}
      {hasChanges && (
        <div className="sticky bottom-6 rounded-xl border border-stone-200 bg-white p-4 shadow-lg dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-600 dark:text-stone-400">{t("unsavedChanges")}</p>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 font-medium text-sm text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                onClick={handleReset}
              >
                {t("cancel")}
              </button>
              <button
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-amber-600"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
