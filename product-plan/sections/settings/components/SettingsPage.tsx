import type { SettingsPageProps } from '../types'
import { Building2, Globe, Palette, Database, Sun, Moon, Monitor } from 'lucide-react'

export function SettingsPage({
  settings,
  availableTimezones,
  availableDateFormats,
  availableThemes,
  availableLanguages,
  onUpdateCompany,
  onUpdateRegional,
  onUpdateTax,
  onUpdateAppearance,
  onBackup,
  onRestore,
  onExport,
  onReset,
  language = 'en',
}: SettingsPageProps) {
  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {language === 'ar' ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {language === 'ar' ? 'إدارة إعدادات التطبيق' : 'Manage your application settings'}
        </p>
      </div>

      {/* Company Information */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              {language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {language === 'ar' ? 'تظهر على الفواتير' : 'Appears on invoices'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ar' ? 'اسم الشركة' : 'Company Name'}
            </label>
            <input
              type="text"
              defaultValue={settings.company.name}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800
                       border border-stone-200 dark:border-stone-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              defaultValue={settings.company.email}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800
                       border border-stone-200 dark:border-stone-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
            </label>
            <input
              type="tel"
              defaultValue={settings.company.phone}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800
                       border border-stone-200 dark:border-stone-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ar' ? 'العنوان' : 'Address'}
            </label>
            <input
              type="text"
              defaultValue={settings.company.address}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800
                       border border-stone-200 dark:border-stone-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={() => onUpdateCompany?.(settings.company)}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-amber-500 
                   hover:bg-amber-600 rounded-lg transition-colors"
        >
          {language === 'ar' ? 'حفظ' : 'Save Changes'}
        </button>
      </section>

      {/* Regional Settings */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">
            {language === 'ar' ? 'الإعدادات الإقليمية' : 'Regional Settings'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ar' ? 'المنطقة الزمنية' : 'Timezone'}
            </label>
            <select
              defaultValue={settings.regional.timezone}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800
                       border border-stone-200 dark:border-stone-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {availableTimezones.map((tz) => (
                <option key={tz.id} value={tz.id}>{tz.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ar' ? 'تنسيق التاريخ' : 'Date Format'}
            </label>
            <select
              defaultValue={settings.regional.dateFormat}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800
                       border border-stone-200 dark:border-stone-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {availableDateFormats.map((df) => (
                <option key={df.id} value={df.id}>{df.label} ({df.example})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {language === 'ar' ? 'نسبة الضريبة' : 'Tax Rate'} (%)
            </label>
            <input
              type="number"
              defaultValue={settings.tax.rate}
              min="0"
              max="100"
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800
                       border border-stone-200 dark:border-stone-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">
            {language === 'ar' ? 'المظهر' : 'Appearance'}
          </h2>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
            {language === 'ar' ? 'السمة' : 'Theme'}
          </label>
          <div className="flex gap-3">
            {availableThemes.map((theme) => {
              const Icon = themeIcons[theme.id]
              const isSelected = settings.appearance.theme === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdateAppearance?.({ ...settings.appearance, theme: theme.id })}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-400'}`}>
                    {language === 'ar' ? theme.labelAr : theme.labelEn}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
            {language === 'ar' ? 'اللغة' : 'Language'}
          </label>
          <div className="flex gap-3">
            {availableLanguages.map((lang) => {
              const isSelected = settings.appearance.language === lang.id
              return (
                <button
                  key={lang.id}
                  onClick={() => onUpdateAppearance?.({ ...settings.appearance, language: lang.id })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-400'}`}>
                    {lang.nativeLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">
            {language === 'ar' ? 'إدارة البيانات' : 'Data Management'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onBackup}
            className="px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300
                     bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 
                     dark:hover:bg-stone-700 transition-colors"
          >
            {language === 'ar' ? 'نسخ احتياطي' : 'Backup Database'}
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.db,.sqlite'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) onRestore?.(file)
              }
              input.click()
            }}
            className="px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300
                     bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 
                     dark:hover:bg-stone-700 transition-colors"
          >
            {language === 'ar' ? 'استعادة' : 'Restore Database'}
          </button>
          <button
            onClick={onExport}
            className="px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-300
                     bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 
                     dark:hover:bg-stone-700 transition-colors"
          >
            {language === 'ar' ? 'تصدير CSV' : 'Export to CSV'}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400
                     bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 
                     dark:hover:bg-red-900/30 transition-colors"
          >
            {language === 'ar' ? 'إعادة تعيين' : 'Reset Database'}
          </button>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mt-4">
          {language === 'ar' 
            ? 'تحذير: إعادة التعيين ستحذف جميع البيانات بشكل دائم'
            : 'Warning: Reset will permanently delete all data'}
        </p>
      </section>
    </div>
  )
}
