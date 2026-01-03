import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe, PanelLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  isExpanded: boolean;
  dir: "ltr" | "rtl";
  onToggleLanguage: () => void;
  onToggleExpand: () => void;
}

export function SidebarFooter({
  isExpanded,
  dir,
  onToggleLanguage,
  onToggleExpand,
}: SidebarFooterProps) {
  const { language } = useI18n();

  if (isExpanded) {
    return (
      <>
        <Button
          className="w-full flex items-center justify-start gap-3 px-3 py-2 hover:bg-muted transition-all rounded-lg text-muted-foreground font-semibold active:scale-95 text-start text-sm"
          onClick={onToggleLanguage}
          variant="ghost"
        >
          <Globe className="h-5 w-5 text-muted-foreground/80" />
          <span className="truncate">{language === "ar" ? "English" : "عربي"}</span>
        </Button>
        <Button
          className="w-full flex items-center justify-start gap-3 px-3 py-2 hover:bg-muted transition-all rounded-lg font-semibold text-muted-foreground active:scale-95 text-start text-sm"
          onClick={onToggleExpand}
          variant="ghost"
        >
          <PanelLeft
            className={cn(
              "h-5 w-5 text-muted-foreground/80 transition-transform",
              dir === "rtl" && "rotate-180",
            )}
          />
          <span className="truncate">{language === "ar" ? "طي القائمة" : "Collapse"}</span>
        </Button>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90"
        onClick={onToggleLanguage}
        title={language === "ar" ? "English" : "عربي"}
        variant="ghost"
      >
        <Globe className="h-5 w-5" />
      </Button>

      <Button
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-90"
        onClick={onToggleExpand}
        title={language === "ar" ? "توسيع" : "Expand"}
        variant="ghost"
      >
        <Menu className="h-5 w-5 transition-transform" />
      </Button>
    </div>
  );
}
