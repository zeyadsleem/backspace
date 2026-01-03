import { useI18n } from "@/lib/i18n";

export function useLanguage() {
  const { language } = useI18n();
  return {
    isArabic: language === "ar",
    isEnglish: language === "en",
    language,
  };
}

export function useLangText(arText: string, enText: string) {
  const { language } = useI18n();
  return language === "ar" ? arText : enText;
}
