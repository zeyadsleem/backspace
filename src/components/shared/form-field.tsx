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
  field: any;
}

export function FormField({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  required = false,
  className,
  field,
}: FormFieldProps) {
  const InputComponent = type === "textarea" ? Textarea : Input;
  const inputProps = type === "textarea" ? { rows: 3 } : { type };

  return (
    <div className="space-y-2">
      <Label className="flex gap-2 items-center">
        {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <InputComponent
        {...inputProps}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className={cn(className)}
      />
    </div>
  );
}
