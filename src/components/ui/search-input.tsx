import * as React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface SearchInputProps extends React.ComponentProps<typeof Input> {
  iconClassName?: string;
  showSwitch?: boolean;
  switchLabel?: string;
  onSwitchChange?: (checked: boolean) => void;
}

export function SearchInput({
  className,
  iconClassName,
  showSwitch = false,
  switchLabel,
  onSwitchChange,
  ...props
}: SearchInputProps) {
  const [switchChecked, setSwitchChecked] = React.useState(false);

  const handleSwitchChange = (checked: boolean) => {
    setSwitchChecked(checked);
    onSwitchChange?.(checked);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
              "ltr:left-3 rtl:right-3",
              iconClassName,
            )}
          />
          <Input
            {...props}
            className={cn("h-9 border font-medium text-sm", "ltr:pl-10 rtl:pr-10", className)}
          />
        </div>
        {showSwitch && (
          <div className="flex items-center gap-2 shrink-0">
            <Switch checked={switchChecked} onCheckedChange={handleSwitchChange} />
            {switchLabel && (
              <Label className="text-sm font-medium whitespace-nowrap">{switchLabel}</Label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
