import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatEgyptianPhone } from "@/lib/validation/validators/egyptian-phone";

interface FormFieldProps {
  name: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: "text" | "email" | "textarea" | "tel";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
  phoneValidation?: {
    isValid: boolean;
    carrier: string | null;
    error: string | null;
  };
  onPhoneChange?: (value: string) => void;
}

export function FormField({
  name,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  required,
  rows,
  className,
  phoneValidation,
  onPhoneChange,
}: FormFieldProps) {
  const { control, watch } = useFormContext();
  const { language } = useI18n();
  const fieldValue = watch(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", className)}>
          <Label className="flex gap-2 items-center text-sm font-medium text-[var(--foreground)]">
            {Icon && <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />}
            {label}
            {required && <span className="text-[var(--destructive)]">*</span>}
          </Label>

          {type === "textarea" ? (
            <Textarea
              {...field}
              placeholder={placeholder}
              rows={rows || 3}
              aria-invalid={fieldState.invalid}
              className={cn("resize-none", fieldState.invalid && "border-[var(--destructive)]")}
            />
          ) : (
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className={cn("h-9", fieldState.invalid && "border-[var(--destructive)]")}
              onChange={(e) => {
                field.onChange(e);
                if (name === "phone" && onPhoneChange) {
                  onPhoneChange(e.target.value);
                }
              }}
            />
          )}

          {/* Phone validation feedback */}
          {name === "phone" && fieldValue && phoneValidation && (
            <div className="flex items-center gap-2 text-xs">
              {phoneValidation.isValid ? (
                <>
                  <Check className="h-3 w-3 text-[var(--color-emerald)]" />
                  <span className="text-[var(--color-emerald)]">
                    {formatEgyptianPhone(fieldValue)}
                  </span>
                  {phoneValidation.carrier && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {phoneValidation.carrier}
                    </Badge>
                  )}
                </>
              ) : phoneValidation.error ? (
                <>
                  <AlertCircle className="h-3 w-3 text-[var(--destructive)]" />
                  <span className="text-[var(--destructive)]">{phoneValidation.error}</span>
                </>
              ) : null}
            </div>
          )}

          {fieldState.error && (
            <p className="text-xs text-[var(--destructive)] font-medium">
              {language === "ar"
                ? fieldState.error.message?.split(" | ")[0] || fieldState.error.message
                : fieldState.error.message?.split(" | ")[1] || fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
