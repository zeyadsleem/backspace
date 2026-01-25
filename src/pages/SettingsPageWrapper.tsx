import { useAppStore } from '@/stores/useAppStore'
import { SettingsPage } from '@/components/settings'

export function SettingsPageWrapper() {
  const settings = useAppStore((state) => state.settings)
  const setTheme = useAppStore((state) => state.setTheme)
  const setLanguage = useAppStore((state) => state.setLanguage)

  return (
    <SettingsPage
      settings={settings}
      onUpdateAppearance={(appearance: { theme: 'light' | 'dark' | 'system', language: 'en' | 'ar' }) => {
        setTheme(appearance.theme)
        setLanguage(appearance.language)
      }}
    />
  )
}
