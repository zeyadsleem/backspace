import type { ReactNode } from "react";
import { useAppStore } from "@/stores/useAppStore";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  htmlFor,
}: FormFieldProps) {
  const isRTL = useAppStore((state) => state.isRTL);

  return (
    <div className="space-y-1.5">
      <label
        className={`block font-medium text-sm text-stone-700 dark:text-stone-300 ${isRTL ? "text-end" : ""}`}
        htmlFor={htmlFor}
      >
        {label}
        {required && <span className={`text-red-500 ${isRTL ? "me-1" : "ms-1"}`}>*</span>}
      </label>
      {children}
      {error && (
        <p className={`text-red-600 text-sm dark:text-red-400 ${isRTL ? "text-end" : ""}`}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className={`text-sm text-stone-500 dark:text-stone-400 ${isRTL ? "text-end" : ""}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
