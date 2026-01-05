/**
 * تنسيق العملة حسب اللغة
 */
export function formatCurrency(amount: number, locale: string = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * تنسيق الرقم بدون رمز العملة
 */
export function formatNumber(amount: number, locale: string = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * تحويل النص إلى رقم مع التعامل مع الأرقام العربية
 */
export function parseNumber(value: string): number {
  // تحويل الأرقام العربية إلى إنجليزية
  const arabicNumbers = "٠١٢٣٤٥٦٧٨٩";
  const englishNumbers = "0123456789";

  let normalizedValue = value;
  for (let i = 0; i < arabicNumbers.length; i++) {
    normalizedValue = normalizedValue.replace(new RegExp(arabicNumbers[i], "g"), englishNumbers[i]);
  }

  return parseFloat(normalizedValue) || 0;
}
