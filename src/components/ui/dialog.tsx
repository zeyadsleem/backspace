import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";

// ============================================================================
// Dialog Root
// ============================================================================
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

// ============================================================================
// Dialog Overlay
// ============================================================================
const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
      "data-[state=closed]:animate-out data-[state=open]:animate-in",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ============================================================================
// Dialog Content
// ============================================================================
export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-[95vw]",
};

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, maxWidth = "lg", ...props }, ref) => {
  const isRTL = useAppStore((state) => state.isRTL);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-2xl",
          "dark:bg-stone-900",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          maxWidthClasses[maxWidth],
          className
        )}
        dir={isRTL ? "rtl" : "ltr"}
        ref={ref}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              "absolute top-4 end-4 rounded-lg p-2 text-stone-400 transition-colors",
              "hover:bg-stone-100 hover:text-stone-600",
              "dark:hover:bg-stone-800 dark:hover:text-stone-300",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            )}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ============================================================================
// Dialog Header
// ============================================================================
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  iconClassName?: string;
}

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, icon, iconClassName, children, ...props }, ref) => (
    <div
      className={cn(
        "flex flex-shrink-0 items-center gap-3 border-stone-200 border-b p-6 dark:border-stone-800",
        className
      )}
      ref={ref}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
            iconClassName
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  )
);
DialogHeader.displayName = "DialogHeader";

// ============================================================================
// Dialog Title
// ============================================================================
const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn("font-semibold text-lg text-stone-900 dark:text-stone-100", className)}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ============================================================================
// Dialog Description
// ============================================================================
const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn("text-sm text-stone-500 dark:text-stone-400", className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ============================================================================
// Dialog Body
// ============================================================================
const DialogBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("scrollbar-thin flex-1 overflow-y-auto p-6", className)}
      ref={ref}
      {...props}
    />
  )
);
DialogBody.displayName = "DialogBody";

// ============================================================================
// Dialog Footer
// ============================================================================
const DialogFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "flex flex-shrink-0 gap-3 border-stone-200 border-t bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900/50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
};
