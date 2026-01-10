// =============================================================================
// Data Types
// =============================================================================

export type ThemeOption = 'light' | 'dark' | 'system'
export type LanguageOption = 'en' | 'ar'

export interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
}

export interface RegionalSettings {
  currency: string
  currencySymbol: string
  timezone: string
  dateFormat: string
}

export interface TaxSettings {
  enabled: boolean
  rate: number
}

export interface AppearanceSettings {
  theme: ThemeOption
  language: LanguageOption
}

export interface Settings {
  company: CompanySettings
  regional: RegionalSettings
  tax: TaxSettings
  appearance: AppearanceSettings
}

export interface TimezoneOption {
  id: string
  label: string
}

export interface DateFormatOption {
  id: string
  label: string
  example: string
}

export interface ThemeOptionItem {
  id: ThemeOption
  labelEn: string
  labelAr: string
}

export interface LanguageOptionItem {
  id: LanguageOption
  label: string
  nativeLabel: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface SettingsPageProps {
  /** Current settings */
  settings: Settings
  /** Available timezone options */
  availableTimezones: TimezoneOption[]
  /** Available date format options */
  availableDateFormats: DateFormatOption[]
  /** Available theme options */
  availableThemes: ThemeOptionItem[]
  /** Available language options */
  availableLanguages: LanguageOptionItem[]
  /** Called when company settings are updated */
  onUpdateCompany?: (data: CompanySettings) => void
  /** Called when regional settings are updated */
  onUpdateRegional?: (data: RegionalSettings) => void
  /** Called when tax settings are updated */
  onUpdateTax?: (data: TaxSettings) => void
  /** Called when appearance settings are updated */
  onUpdateAppearance?: (data: AppearanceSettings) => void
  /** Called when user clicks backup */
  onBackup?: () => void
  /** Called when user clicks restore */
  onRestore?: (file: File) => void
  /** Called when user clicks export */
  onExport?: () => void
  /** Called when user clicks reset (requires confirmation) */
  onReset?: () => void
  /** Current language for labels */
  language?: LanguageOption
}

export interface CompanySettingsFormProps {
  /** Current company settings */
  settings: CompanySettings
  /** Called when settings are saved */
  onSave?: (data: CompanySettings) => void
  /** Whether the form is in a loading state */
  isLoading?: boolean
}

export interface RegionalSettingsFormProps {
  /** Current regional settings */
  settings: RegionalSettings
  /** Available timezone options */
  timezones: TimezoneOption[]
  /** Available date format options */
  dateFormats: DateFormatOption[]
  /** Called when settings are saved */
  onSave?: (data: RegionalSettings) => void
  /** Whether the form is in a loading state */
  isLoading?: boolean
}

export interface AppearanceSettingsFormProps {
  /** Current appearance settings */
  settings: AppearanceSettings
  /** Available theme options */
  themes: ThemeOptionItem[]
  /** Available language options */
  languages: LanguageOptionItem[]
  /** Called when settings are saved */
  onSave?: (data: AppearanceSettings) => void
  /** Current language for labels */
  language?: LanguageOption
}

export interface DataManagementProps {
  /** Called when user clicks backup */
  onBackup?: () => void
  /** Called when user selects a file to restore */
  onRestore?: (file: File) => void
  /** Called when user clicks export */
  onExport?: () => void
  /** Called when user confirms reset */
  onReset?: () => void
  /** Whether any operation is in progress */
  isLoading?: boolean
  /** Current language for labels */
  language?: LanguageOption
}
