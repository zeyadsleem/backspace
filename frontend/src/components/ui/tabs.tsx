import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Tabs Variants (CVA)
// ============================================================================
const tabsListVariants = cva("inline-flex items-center gap-1 rounded-xl border p-1", {
  variants: {
    variant: {
      default: "border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800",
      pills: "gap-2 border-0 bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=inactive]:text-stone-600 data-[state=active]:shadow-sm data-[state=inactive]:hover:text-stone-900 dark:data-[state=active]:bg-stone-900 dark:data-[state=active]:text-stone-100 dark:data-[state=inactive]:text-stone-400 dark:data-[state=inactive]:hover:text-stone-100",
        pills:
          "data-[state=active]:bg-amber-500 data-[state=inactive]:bg-stone-100 data-[state=active]:text-white data-[state=inactive]:text-stone-600 data-[state=active]:shadow-amber-500/20 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-stone-200 dark:data-[state=active]:bg-amber-600 dark:data-[state=inactive]:bg-stone-800 dark:data-[state=inactive]:text-stone-300 dark:data-[state=inactive]:hover:bg-stone-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ============================================================================
// Tabs Component
// ============================================================================
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

Tabs.displayName = "Tabs";

// ============================================================================
// TabsList Component
// ============================================================================
export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <div className={cn(tabsListVariants({ variant, className }))} ref={ref} {...props} />
  )
);

TabsList.displayName = "TabsList";

// ============================================================================
// TabsTrigger Component
// ============================================================================
export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
  isActive?: boolean;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant, value, isActive, children, ...props }, ref) => (
    <button
      className={cn(tabsTriggerVariants({ variant, className }))}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      ref={ref}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
);

TabsTrigger.displayName = "TabsTrigger";

// ============================================================================
// TabsContent Component
// ============================================================================
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  isActive?: boolean;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, isActive, children, ...props }, ref) => {
    if (!isActive) {
      return null;
    }

    return (
      <div
        className={cn("mt-4 focus:outline-none", className)}
        data-state={isActive ? "active" : "inactive"}
        data-value={value}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
