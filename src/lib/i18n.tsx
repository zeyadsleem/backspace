import React, { createContext, useContext, useState, useCallback } from "react";

export type Language = "ar" | "en";

export interface Translations {
  nav: {
    dashboard: { ar: string; en: string; desc: { ar: string; en: string } };
    customers: { ar: string; en: string; desc: { ar: string; en: string } };
    resources: { ar: string; en: string; desc: { ar: string; en: string } };
    sessions: { ar: string; en: string; desc: { ar: string; en: string } };
    inventory: { ar: string; en: string; desc: { ar: string; en: string } };
    subscriptions: { ar: string; en: string; desc: { ar: string; en: string } };
    settings: { ar: string; en: string; desc: { ar: string; en: string } };
  };
  main: {
    dashboard: { ar: string; en: string };
  };
  system: {
    ar: string;
    en: string;
  };
  common: {
    search: { ar: string; en: string };
    add: { ar: string; en: string };
    edit: { ar: string; en: string };
    delete: { ar: string; en: string };
    save: { ar: string; en: string };
    cancel: { ar: string; en: string };
    confirm: { ar: string; en: string };
    view: { ar: string; en: string };
    actions: { ar: string; en: string };
    status: { ar: string; en: string };
    active: { ar: string; en: string };
    inactive: { ar: string; en: string };
    paid: { ar: string; en: string };
    unpaid: { ar: string; en: string };
    closed: { ar: string; en: string };
    open: { ar: string; en: string };
  };
  customers: {
    title: { ar: string; en: string };
    subtitle: { ar: string; en: string };
    create: { ar: string; en: string };
    all: { ar: string; en: string };
    profile: { ar: string; en: string };
    overview: { ar: string; en: string };
    sessions: { ar: string; en: string };
    subscription: { ar: string; en: string };
    member_since: { ar: string; en: string };
    this_month: { ar: string; en: string };
    total_sessions: { ar: string; en: string };
    total_spent: { ar: string; en: string };
    outstanding: { ar: string; en: string };
    unpaid_invoice: { ar: string; en: string };
    date: { ar: string; en: string };
    resource: { ar: string; en: string };
    duration: { ar: string; en: string };
    amount: { ar: string; en: string };
    renew_subscription: { ar: string; en: string };
  };
  sessions: {
    title: { ar: string; en: string };
    subtitle: { ar: string; en: string };
    new: { ar: string; en: string };
    active_sessions: { ar: string; en: string };
    customer: { ar: string; en: string };
    started_at: { ar: string; en: string };
    end_session: { ar: string; en: string };
    end_session_title: { ar: string; en: string };
    time_charges: { ar: string; en: string };
    rate_per_hour: { ar: string; en: string };
    subtotal: { ar: string; en: string };
    consumptions: { ar: string; en: string };
    consumption_total: { ar: string; en: string };
    total: { ar: string; en: string };
    confirm_paid_cash: { ar: string; en: string };
  };
  inventory: {
    title: { ar: string; en: string };
    subtitle: { ar: string; en: string };
    add_item: { ar: string; en: string };
    stock_items: { ar: string; en: string };
    search_items: { ar: string; en: string };
    item: { ar: string; en: string };
    sku: { ar: string; en: string };
    category: { ar: string; en: string };
    quantity: { ar: string; en: string };
    unit_price: { ar: string; en: string };
    history: { ar: string; en: string };
    movement_history: { ar: string; en: string };
    current_stock: { ar: string; en: string };
    type: { ar: string; en: string };
    reason: { ar: string; en: string };
    add_stock: { ar: string; en: string };
    remove_stock: { ar: string; en: string };
  };
  subscriptions: {
    title: { ar: string; en: string };
    subtitle: { ar: string; en: string };
    create_type: { ar: string; en: string };
    create_type_title: { ar: string; en: string };
    subscription_types: { ar: string; en: string };
    active_subscriptions: { ar: string; en: string };
    name: { ar: string; en: string };
    duration_days: { ar: string; en: string };
    price: { ar: string; en: string };
    max_hours_per_day: { ar: string; en: string };
    create: { ar: string; en: string };
    valid_until: { ar: string; en: string };
    current_subscription: { ar: string; en: string };
    type: { ar: string; en: string };
  };
  settings: {
    title: { ar: string; en: string };
    subtitle: { ar: string; en: string };
    appearance: { ar: string; en: string };
    appearance_desc: { ar: string; en: string };
    theme: { ar: string; en: string };
    light: { ar: string; en: string };
    dark: { ar: string; en: string };
    system: { ar: string; en: string };
    currency_pricing: { ar: string; en: string };
    working_hours: { ar: string; en: string };
    inventory_settings: { ar: string; en: string };
    language_region: { ar: string; en: string };
    notifications: { ar: string; en: string };
    currency: { ar: string; en: string };
    default_hourly_rate: { ar: string; en: string };
    meeting_room_rate: { ar: string; en: string };
    open_time: { ar: string; en: string };
    close_time: { ar: string; en: string };
    working_days: { ar: string; en: string };
    low_stock_threshold: { ar: string; en: string };
    auto_restock: { ar: string; en: string };
    auto_restock_desc: { ar: string; en: string };
    arabic: { ar: string; en: string };
    arabic_desc: { ar: string; en: string };
    session_alerts: { ar: string; en: string };
    session_alerts_desc: { ar: string; en: string };
    payment_reminders: { ar: string; en: string };
    payment_reminders_cash: { ar: string; en: string };
    stock_alerts: { ar: string; en: string };
    stock_alerts_desc: { ar: string; en: string };
    save_changes: { ar: string; en: string };
    reset_defaults: { ar: string; en: string };
  };
  dashboard: {
    title: { ar: string; en: string };
    subtitle: { ar: string; en: string };
    active_sessions: { ar: string; en: string };
    currently_active: { ar: string; en: string };
    available_seats: { ar: string; en: string };
    total_seats: { ar: string; en: string };
    todays_revenue: { ar: string; en: string };
    from_yesterday: { ar: string; en: string };
    low_stock_alerts: { ar: string; en: string };
    items_need_restocking: { ar: string; en: string };
    recent_activity: { ar: string; en: string };
    occupied_resources: { ar: string; en: string };
  };
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: <K extends keyof Translations>(key: K) => Translations[K];
  dir: "ltr" | "rtl";
  lang: (ar: string, en: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("language") as Language) || "ar";
    }
    return "ar";
  });

  const setLanguage = useCallback((_lang: Language) => {
    setLanguageState(_lang);
    localStorage.setItem("language", _lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const newLang = prev === "ar" ? "en" : "ar";
      localStorage.setItem("language", newLang);
      return newLang;
    });
  }, []);

  const t = useCallback(
    <K extends keyof Translations>(key: K): Translations[K] => {
      const translations = getTranslations(language);
      return translations[key];
    },
    [language],
  );

  const dir = language === "ar" ? "rtl" : "ltr";

  const lang = (ar: string, en: string) => (language === "ar" ? ar : en);

  React.useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t, dir, lang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

function getTranslations(_language: Language): Translations {
  return {
    nav: {
      dashboard: {
        ar: "لوحة التحكم",
        en: "Dashboard",
        desc: { ar: "نظرة عامة على مساحة العمل المشتركة", en: "Overview of your workspace" },
      },
      customers: {
        ar: "العملاء",
        en: "Customers",
        desc: { ar: "إدارة العملاء والاشتراكات", en: "Manage customers and subscriptions" },
      },
      resources: {
        ar: "الموارد",
        en: "Resources",
        desc: { ar: "إدارة المقاعد والمكاتب والغرف", en: "Manage seats, desks and rooms" },
      },
      sessions: {
        ar: "الجلسات",
        en: "Sessions",
        desc: { ar: "إدارة الجلسات النشطة والفواتير", en: "Manage active sessions and billing" },
      },
      inventory: {
        ar: "المخزون",
        en: "Inventory",
        desc: { ar: "إدارة المنتجات ومستويات المخزون", en: "Manage products and stock levels" },
      },
      subscriptions: {
        ar: "الاشتراكات",
        en: "Subscriptions",
        desc: { ar: "إدارة خطط الاشتراك والتعيينات", en: "Manage subscription plans" },
      },
      settings: {
        ar: "الإعدادات",
        en: "Settings",
        desc: { ar: "إعداد مساحة العمل", en: "Configure your workspace" },
      },
    },
    main: {
      dashboard: { ar: "الرئيسية", en: "Main" },
    },
    system: {
      ar: "النظام",
      en: "System",
    },
    common: {
      search: { ar: "بحث...", en: "Search..." },
      add: { ar: "إضافة", en: "Add" },
      edit: { ar: "تعديل", en: "Edit" },
      delete: { ar: "حذف", en: "Delete" },
      save: { ar: "حفظ التغييرات", en: "Save Changes" },
      cancel: { ar: "إلغاء", en: "Cancel" },
      confirm: { ar: "تأكيد", en: "Confirm" },
      view: { ar: "عرض", en: "View" },
      actions: { ar: "الإجراءات", en: "Actions" },
      status: { ar: "الحالة", en: "Status" },
      active: { ar: "نشط", en: "Active" },
      inactive: { ar: "غير نشط", en: "Inactive" },
      paid: { ar: "مدفوعة", en: "Paid" },
      unpaid: { ar: "غير مدفوعة", en: "Unpaid" },
      closed: { ar: "مغلقة", en: "Closed" },
      open: { ar: "مفتوحة", en: "Open" },
    },
    customers: {
      title: { ar: "العملاء", en: "Customers" },
      subtitle: { ar: "إدارة العملاء والاشتراكات", en: "Manage customers and subscriptions" },
      create: { ar: "إنشاء عميل", en: "Create Customer" },
      all: { ar: "جميع العملاء", en: "All Customers" },
      profile: { ar: "ملف العميل", en: "Customer Profile" },
      overview: { ar: "نظرة عامة", en: "Overview" },
      sessions: { ar: "الجلسات", en: "Sessions" },
      subscription: { ar: "الاشتراك", en: "Subscription" },
      member_since: { ar: "عميل منذ", en: "Member since" },
      this_month: { ar: "هذا الشهر", en: "This month" },
      total_sessions: { ar: "إجمالي الجلسات", en: "Total Sessions" },
      total_spent: { ar: "إجمالي المصروف", en: "Total Spent" },
      outstanding: { ar: "المستحقات", en: "Outstanding" },
      unpaid_invoice: { ar: "فاتورة غير مدفوعة", en: "unpaid invoice" },
      date: { ar: "التاريخ", en: "Date" },
      resource: { ar: "المورد", en: "Resource" },
      duration: { ar: "المدة", en: "Duration" },
      amount: { ar: "المبلغ", en: "Amount" },
      renew_subscription: { ar: "تجديد الاشتراك", en: "Renew Subscription" },
    },
    sessions: {
      title: { ar: "الجلسات", en: "Sessions" },
      subtitle: { ar: "إدارة الجلسات النشطة والفواتير", en: "Manage active sessions and billing" },
      new: { ar: "جلسة جديدة", en: "New Session" },
      active_sessions: { ar: "الجلسات النشطة", en: "Active Sessions" },
      customer: { ar: "العميل", en: "Customer" },
      started_at: { ar: "بدأت في", en: "Started At" },
      end_session: { ar: "إنهاء الجلسة", en: "End Session" },
      end_session_title: { ar: "إنهاء الجلسة", en: "End Session" },
      time_charges: { ar: "رسوم الوقت", en: "Time Charges" },
      rate_per_hour: { ar: "معدل الساعة", en: "Rate per hour" },
      subtotal: { ar: "المجموع الفرعي", en: "Subtotal" },
      consumptions: { ar: "الاستهلاكات", en: "Consumptions" },
      consumption_total: { ar: "إجمالي الاستهلاك", en: "Consumption Total" },
      total: { ar: "الإجمالي", en: "Total" },
      confirm_paid_cash: {
        ar: "تأكيد ووضع علامة تم الدفع (كاش)",
        en: "Confirm & Mark as Paid (Cash)",
      },
    },
    inventory: {
      title: { ar: "المخزون", en: "Inventory" },
      subtitle: { ar: "إدارة المنتجات ومستويات المخزون", en: "Manage products and stock levels" },
      add_item: { ar: "إضافة عنصر", en: "Add Item" },
      stock_items: { ar: "عناصر المخزون", en: "Stock Items" },
      search_items: { ar: "بحث العناصر...", en: "Search items..." },
      item: { ar: "العنصر", en: "Item" },
      sku: { ar: "SKU", en: "SKU" },
      category: { ar: "التصنيف", en: "Category" },
      quantity: { ar: "الكمية", en: "Quantity" },
      unit_price: { ar: "سعر الوحدة", en: "Unit Price" },
      history: { ar: "السجل", en: "History" },
      movement_history: { ar: "سجل الحركات", en: "Movement History" },
      current_stock: { ar: "المخزون الحالي", en: "Current Stock" },
      type: { ar: "النوع", en: "Type" },
      reason: { ar: "السبب", en: "Reason" },
      add_stock: { ar: "إضافة مخزون", en: "Add Stock" },
      remove_stock: { ar: "سحب مخزون", en: "Remove Stock" },
    },
    subscriptions: {
      title: { ar: "الاشتراكات", en: "Subscriptions" },
      subtitle: {
        ar: "إدارة خطط الاشتراك والتعيينات",
        en: "Manage subscription plans and assignments",
      },
      create_type: { ar: "إنشاء نوع اشتراك", en: "Create Subscription Type" },
      create_type_title: { ar: "إنشاء نوع اشتراك", en: "Create Subscription Type" },
      subscription_types: { ar: "أنواع الاشتراكات", en: "Subscription Types" },
      active_subscriptions: { ar: "الاشتراكات النشطة", en: "Active Subscriptions" },
      name: { ar: "الاسم", en: "Name" },
      duration_days: { ar: "المدة (أيام)", en: "Duration (Days)" },
      price: { ar: "السعر", en: "Price" },
      max_hours_per_day: { ar: "أقصى ساعات في اليوم", en: "Max Hours per Day" },
      create: { ar: "إنشاء", en: "Create" },
      valid_until: { ar: "صالح حتى", en: "Valid Until" },
      current_subscription: { ar: "الاشتراك الحالي", en: "Current Subscription" },
      type: { ar: "النوع", en: "Type" },
    },
    settings: {
      title: { ar: "الإعدادات", en: "Settings" },
      subtitle: { ar: "إعداد مساحة العمل", en: "Configure your workspace" },
      currency_pricing: { ar: "العملة والأسعار", en: "Currency & Pricing" },
      working_hours: { ar: "ساعات العمل", en: "Working Hours" },
      inventory_settings: { ar: "إعدادات المخزون", en: "Inventory Settings" },
      language_region: { ar: "اللغة والمنطقة", en: "Language & Region" },
      notifications: { ar: "الإشعارات", en: "Notifications" },
      currency: { ar: "العملة", en: "Currency" },
      default_hourly_rate: { ar: "معدل الساعة الافتراضي (ج.م)", en: "Default Hourly Rate (EGP)" },
      meeting_room_rate: {
        ar: "معدل غرفة الاجتماعات (لكل ساعة - ج.م)",
        en: "Meeting Room Rate (per hour - EGP)",
      },
      open_time: { ar: "وقت الفتح", en: "Open Time" },
      close_time: { ar: "وقت الإغلاق", en: "Close Time" },
      working_days: { ar: "أيام العمل", en: "Working Days" },
      low_stock_threshold: { ar: "حد المخزون المنخفض", en: "Low Stock Threshold" },
      auto_restock: { ar: "إشعارات إعادة التخزين التلقائي", en: "Auto-restock Notifications" },
      auto_restock_desc: {
        ar: "إشعار عند انخفاض العناصر عن الحد",
        en: "Get notified when items fall below threshold",
      },
      arabic: { ar: "العربية (Arabic)", en: "Arabic (عربي)" },
      arabic_desc: {
        ar: "التبديل إلى اللغة العربية والتخطيط RTL",
        en: "Switch to Arabic language and RTL layout",
      },
      session_alerts: { ar: "تنبيهات الجلسات", en: "Session Alerts" },
      session_alerts_desc: {
        ar: "إشعار عند تجاوز الجلسات مدة معينة",
        en: "Notify when sessions exceed certain duration",
      },
      payment_reminders: { ar: "تذكيرات الدفع", en: "Payment Reminders" },
      payment_reminders_cash: {
        ar: "تذكير العملاء بالمدفوعات المستحقة (دفع كاش فقط)",
        en: "Remind customers of outstanding payments (Cash payments only)",
      },
      stock_alerts: { ar: "تنبيهات المخزون", en: "Stock Alerts" },
      stock_alerts_desc: {
        ar: "تنبيه عند انخفاض المخزون",
        en: "Alert when inventory is running low",
      },
      save_changes: { ar: "حفظ التغييرات", en: "Save Changes" },
      reset_defaults: { ar: "إعادة التعيينات الافتراضية", en: "Reset to Defaults" },
      appearance: { ar: "المظهر", en: "Appearance" },
      appearance_desc: { ar: "تخصيص مظهر التطبيق", en: "Customize app appearance" },
      theme: { ar: "السمة", en: "Theme" },
      light: { ar: "فاتح", en: "Light" },
      dark: { ar: "داكن", en: "Dark" },
      system: { ar: "النظام", en: "System" },
    },
    dashboard: {
      title: { ar: "لوحة التحكم", en: "Dashboard" },
      subtitle: {
        ar: "نظرة عامة على مساحة العمل المشتركة",
        en: "Overview of your coworking space",
      },
      active_sessions: { ar: "جلسات نشطة", en: "Active Sessions" },
      currently_active: { ar: "نشط حالياً", en: "Currently active" },
      available_seats: { ar: "مقاعد متاحة", en: "Available Seats" },
      total_seats: { ar: "إجمالي المقاعد", en: "total seats" },
      todays_revenue: { ar: "إيرادات اليوم", en: "Today's Revenue" },
      from_yesterday: { ar: "+15% من أمس", en: "+15% from yesterday" },
      low_stock_alerts: { ar: "تنبيهات المخزون المنخفض", en: "Low Stock Alerts" },
      items_need_restocking: { ar: "عناصر تحت إعادة التخزين", en: "Items need restocking" },
      recent_activity: { ar: "النشاط الأخير", en: "Recent Activity" },
      occupied_resources: { ar: "الموارد المشغولة", en: "Occupied Resources" },
    },
  };
}
