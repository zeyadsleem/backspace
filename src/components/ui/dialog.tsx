import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";

// ============================================================================
// Dialog Root
// ============================================================================
const Dialog = Root;
const DialogTrigger = Trigger;
const DialogClose = Close;
const DialogPortal = Portal;

// ============================================================================
// Dialog Overlay
// ============================================================================
const DialogOverlay = forwardRef<
  React.ElementRef<typeof Overlay>,
  React.ComponentPropsWithoutRef<typeof Overlay>
>(({ className, ...props }, ref) => (
  <Overlay
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
DialogOverlay.displayName = Overlay.displayName;

// ============================================================================
// Dialog Content
// ============================================================================
export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof Content> {
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

const DialogContent = forwardRef<React.ElementRef<typeof Content>, DialogContentProps>(
  ({ className, children, showCloseButton = true, maxWidth = "lg", ...props }, ref) => {
    const isRTL = useAppStore((state) => state.isRTL);

    return (
      <DialogPortal>
        <DialogOverlay />
        <Content
          aria-describedby={undefined}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-xl",
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
            <Close
              className={cn(
                "absolute end-3 top-3 rounded-lg p-2 text-stone-400 transition-colors",
                "hover:bg-stone-100 hover:text-stone-600",
                "dark:hover:bg-stone-800 dark:hover:text-stone-300",
                "focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Close>
          )}
        </Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = Content.displayName;

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
        "flex flex-shrink-0 items-center gap-3 border-stone-200 border-b p-5 dark:border-stone-800",
        className
      )}
      ref={ref}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
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
  React.ElementRef<typeof Title>,
  React.ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
  <Title
    className={cn("font-bold text-stone-900 text-xl dark:text-stone-100", className)}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = Title.displayName;

// ============================================================================
// Dialog Description
// ============================================================================
const DialogDescription = forwardRef<
  React.ElementRef<typeof Description>,
  React.ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    className={cn("text-sm text-stone-500 dark:text-stone-400", className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = Description.displayName;

// ============================================================================
// Dialog Body
// ============================================================================
const DialogBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("scrollbar-thin flex-1 overflow-y-auto p-5", className)}
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
        "flex flex-shrink-0 gap-3 border-stone-200 border-t bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900/50",
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
