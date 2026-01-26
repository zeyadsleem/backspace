import { SettingsPage } from "@/components/settings";
import { useAppStore } from "@/stores/useAppStore";

export function SettingsPageWrapper() {
  const settings = useAppStore((state) => state.settings);
  const setTheme = useAppStore((state) => state.setTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return (
    <SettingsPage
      onUpdateAppearance={(appearance: {
        theme: "light" | "dark" | "system";
        language: "en" | "ar";
      }) => {
        setTheme(appearance.theme);
        setLanguage(appearance.language);
      }}
      settings={settings}
    />
  );
}
