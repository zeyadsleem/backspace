import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  className,
  showCloseButton = true,
}: ModalProps) {
  const isRTL = useAppStore((state) => state.isRTL);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        aria-modal="true"
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full transform flex-col rounded-xl bg-white shadow-2xl transition-all duration-200 dark:bg-stone-900",
          maxWidth,
          className,
          isRTL ? "rtl-dialog" : "ltr-dialog"
        )}
        dir={isRTL ? "rtl" : "ltr"}
        role="dialog"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex flex-shrink-0 items-center justify-between border-stone-200 border-b p-6 dark:border-stone-800">
            <div className="font-bold text-lg text-stone-900 dark:text-stone-100">{title}</div>
            {showCloseButton && (
              <button
                aria-label="Close"
                className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
