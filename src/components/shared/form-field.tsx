import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  icon?: LucideIcon;
  type?: "text" | "email" | "number" | "textarea";
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  field: any;
}

export function FormField({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  required = false,
  className,
  error,
  field,
}: FormFieldProps) {
  const InputComponent = type === "textarea" ? Textarea : Input;
  const inputProps = type === "textarea" ? { rows: 3 } : { type };
  const hasError = error || field.state.meta.errors?.length > 0;
  const errorMessage = error || field.state.meta.errors?.[0];

  return (
    <div className="space-y-2">
      <Label className="flex gap-2 items-center text-sm font-bold">
        {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <InputComponent
        {...inputProps}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        aria-invalid={hasError}
        className={cn("h-9", type === "textarea" && "h-auto", hasError && "border-destructive", className)}
      />
      {hasError && errorMessage && (
        <p className="text-xs text-destructive font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
