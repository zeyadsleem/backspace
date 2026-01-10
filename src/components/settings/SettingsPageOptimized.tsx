import { useState } from 'react'
import { 
  useSettings, 
  useSettingsActions, 
  useTheme, 
  useLanguage, 
  useThemeActions, 
  useTranslation 
} from '@/stores/hooks'
import { 
  Building2, 
  Globe, 
  Palette, 
  Database, 
  Download, 
  Upload, 
  RotateCcw,
  Save
} from 'lucide-react'

export function SettingsPageOptimized() {
  const t = useTranslation()
  const settings = useSettings()
  const theme = useTheme()
  const language = useLanguage()
  const { updateSettings } = useSettingsActions()
  const { setTheme, setLanguage } = useThemeActions()
  
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingsChange = (newSettings: any) => {
    setLocalSettings({ ...localSettings, ...newSettings })
    setHasChanges(true)
  }

  const handleSave = () => {
    updateSettings(localSettings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('settings')}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('manageSettings')}</p>
      </div>

      {/* Company Information */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('companyInfo')}</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">{t('appearsOnInvoices')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('companyName')}
            </label>
            <input
              type="text"
              value={localSettings.company.name}
              onChange={(e) => handleSettingsChange({
                company: { ...localSettings.company, name: e.target.value }
              })}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('phone')}
            </label>
            <input
              type="tel"
              value={localSettings.company.phone}
              onChange={(e) => handleSettingsChange({
                company: { ...localSettings.company, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('address')}
            </label>
            <textarea
              value={localSettings.company.address}
              onChange={(e) => handleSettingsChange({
                company: { ...localSettings.company, address: e.target.value }
              })}
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('regionalSettings')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('currency')}
            </label>
            <input
              type="text"
              value={localSettings.regional.currency}
              onChange={(e) => handleSettingsChange({
                regional: { ...localSettings.regional, currency: e.target.value }
              })}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('taxRate')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={localSettings.tax.rate}
              onChange={(e) => handleSettingsChange({
                tax: { ...localSettings.tax, rate: parseFloat(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('appearance')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('theme')}
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
              <option value="system">{t('system')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('dataManagement')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Download className="h-4 w-4" />
            {t('backupDatabase')}
          </button>

          <button className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Upload className="h-4 w-4" />
            {t('restoreDatabase')}
          </button>

          <button className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <RotateCcw className="h-4 w-4" />
            {t('resetDatabase')}
          </button>
        </div>

        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">{t('resetWarning')}</p>
        </div>
      </div>

      {/* Save Actions */}
      {hasChanges && (
        <div className="sticky bottom-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t('unsavedChanges')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}