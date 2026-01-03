export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(
  dateValue: string | number | Date,
  language: "ar" | "en",
  options?: Intl.DateTimeFormatOptions,
) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };
  return new Date(dateValue).toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    defaultOptions,
  );
}

export function formatDateTime(
  dateValue: string | number | Date,
  language: "ar" | "en",
  options?: Intl.DateTimeFormatOptions,
) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };
  return new Date(dateValue).toLocaleString(language === "ar" ? "ar-EG" : "en-US", defaultOptions);
}

export function formatCurrency(amount: number, language: "ar" | "en") {
  return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
}

export function getCustomerTypeLabel(type: string, language: "ar" | "en") {
  const labels: Record<string, { ar: string; en: string }> = {
    member: { ar: "مشترك", en: "Member" },
    visitor: { ar: "زائر", en: "Visitor" },
  };
  return labels[type]?.[language] || type;
}

export function getStatusLabel(status: string, language: "ar" | "en") {
  const labels: Record<string, { ar: string; en: string }> = {
    active: { ar: "نشط", en: "Active" },
    inactive: { ar: "غير نشط", en: "Inactive" },
    paid: { ar: "مدفوعة", en: "Paid" },
    unpaid: { ar: "غير مدفوعة", en: "Unpaid" },
    open: { ar: "مفتوحة", en: "Open" },
    closed: { ar: "مغلقة", en: "Closed" },
  };
  return labels[status]?.[language] || status;
}

export function getMovementTypeLabel(type: string, language: "ar" | "en") {
  const labels: Record<string, { ar: string; en: string }> = {
    add: { ar: "إضافة", en: "Add" },
    remove: { ar: "سحب", en: "Remove" },
    adjust: { ar: "تعديل", en: "Adjust" },
  };
  return labels[type]?.[language] || type;
}

export function getSubscriptionStatusLabel(status: string, language: "ar" | "en") {
  const labels: Record<string, { ar: string; en: string }> = {
    active: { ar: "نشط", en: "Active" },
    inactive: { ar: "غير نشط", en: "Inactive" },
    expired: { ar: "منتهي", en: "Expired" },
  };
  return labels[status]?.[language] || status;
}
