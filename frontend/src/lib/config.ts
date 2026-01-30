// Application Configuration
export const APP_CONFIG = {
  name: "Backspace",
  version: "1.0.0",
  description: "Internet Cafe Management System",

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    timeout: 10_000,
  },

  // Database Configuration
  database: {
    name: "backspace_db",
    version: 1,
  },

  // UI Configuration
  ui: {
    defaultTheme: "system" as const,
    defaultLanguage: "en" as const,
    animationDuration: 200,
    debounceDelay: 300,
  },

  // Business Rules
  business: {
    currency: "EGP",
    currencySymbol: "ج.م",
    timezone: "Africa/Cairo",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",

    // Session Configuration
    session: {
      minDurationMinutes: 1,
      maxDurationHours: 24,
      defaultRatePerHour: 10,
    },

    // Inventory Configuration
    inventory: {
      defaultMinStock: 5,
      maxQuantity: 10_000,
      maxPrice: 1000,
    },

    // Customer Configuration
    customer: {
      maxNameLength: 50,
      maxNotesLength: 500,
      phoneRegex: /^(0|20)?1[0125]\d{8}$/,
    },

    // Invoice Configuration
    invoice: {
      dueDays: 7,
      maxDiscount: 100,
      taxRate: 0.14, // 14% VAT in Egypt
    },
  },

  // Feature Flags
  features: {
    darkMode: true,
    rtlSupport: true,
    multiLanguage: true,
    offlineMode: false,
    notifications: true,
    analytics: false,
  },

  // Storage Keys
  storage: {
    theme: "backspace-theme",
    language: "backspace-language",
    user: "backspace-user",
    settings: "backspace-settings",
  },

  // Validation Rules
  validation: {
    phone: {
      pattern: /^(0|20)?1[0125]\d{8}$/,
      message: "Invalid Egyptian phone number format",
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email format",
    },
  },
} as const;

// Environment-specific configuration
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

// Export commonly used values
export const { business, ui, features, storage, validation } = APP_CONFIG;
