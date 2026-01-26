import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Button Variants (CVA)
// ============================================================================
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-amber-500 text-white shadow-amber-500/10 shadow-lg hover:bg-amber-600 focus:ring-amber-500/20 active:scale-[0.98] dark:bg-amber-600 dark:hover:bg-amber-500",
        success:
          "bg-emerald-600 text-white shadow-emerald-600/10 shadow-lg hover:bg-emerald-700 focus:ring-emerald-500/20 active:scale-[0.98]",
        danger:
          "bg-red-600 text-white shadow-lg shadow-red-600/10 hover:bg-red-700 focus:ring-red-500/20 active:scale-[0.98] dark:bg-red-700 dark:hover:bg-red-600",
        ghost:
          "bg-stone-100 text-stone-600 hover:bg-stone-200 focus:ring-stone-400/20 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
        outline:
          "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 focus:ring-stone-400/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
        link: "text-amber-600 underline-offset-4 hover:underline focus:ring-0 dark:text-amber-400",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// ============================================================================
// Button Component
// ============================================================================
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// ============================================================================
// IconButton Component
// ============================================================================
export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "size"> {
  icon: React.ReactNode;
  label: string;
  isLoading?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", icon, label, isLoading, disabled, ...props }, ref) => {
    return (
      <button
        aria-label={label}
        className={cn(buttonVariants({ variant, size: "icon", className }))}
        disabled={disabled || isLoading}
        ref={ref}
        title={label}
        {...props}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { Button, IconButton, buttonVariants };
