import type { Settings, ThemeOption, LanguageOption } from '@/types'
import { Building2, Palette, Sun, Moon, Monitor } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface SettingsPageProps {
  settings: Settings
  onUpdateAppearance?: (appearance: { theme: ThemeOption; language: LanguageOption }) => void
}

const themeIcons = { light: Sun, dark: Moon, system: Monitor }

export function SettingsPage({ settings, onUpdateAppearance }: SettingsPageProps) {
  const t = useAppStore((state) => state.t)
  
  const availableThemes = [
    { id: 'light' as ThemeOption, label: t('light') },
    { id: 'dark' as ThemeOption, label: t('dark') },
    { id: 'system' as ThemeOption, label: t('system') },
  ]
  
  const availableLanguages = [
    { id: 'en' as LanguageOption, nativeLabel: 'English' },
    { id: 'ar' as LanguageOption, nativeLabel: 'العربية' },
  ]

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('settings')}</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{t('manageSettings')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
            <div><h2 className="font-semibold text-stone-900 dark:text-stone-100">{t('companyInfo')}</h2><p className="text-xs text-stone-500 dark:text-stone-400">{t('appearsOnInvoices')}</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('companyName')}</label><input type="text" defaultValue={settings.company.name} className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" /></div>
            <div><label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('email')}</label><input type="email" defaultValue={settings.company.email} className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" /></div>
            <div><label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('phone')}</label><input type="tel" defaultValue={settings.company.phone} className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" /></div>
            <div><label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">{t('address')}</label><input type="text" defaultValue={settings.company.address} className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" /></div>
          </div>
        </section>

        <section className="lg:col-span-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">{t('appearance')}</h2>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">{t('theme')}</label>
            <div className="space-y-2">
              {availableThemes.map((theme) => {
                const Icon = themeIcons[theme.id]
                const isSelected = settings.appearance.theme === theme.id
                return (
                  <button key={theme.id} onClick={() => onUpdateAppearance?.({ ...settings.appearance, theme: theme.id })} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-400'}`}>{theme.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">{t('language')}</label>
            <div className="space-y-2">
              {availableLanguages.map((lang) => {
                const isSelected = settings.appearance.language === lang.id
                return (
                  <button key={lang.id} onClick={() => onUpdateAppearance?.({ ...settings.appearance, language: lang.id })} className={`w-full flex items-center justify-center p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'}`}>
                    <span className={`text-sm font-medium ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-400'}`}>{lang.nativeLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
