import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-purple-500 active:scale-[0.98]",
        glow:
          "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700",
        outline:
          "border border-[#1f283d] bg-[#0c101c]/80 text-slate-200 shadow-sm hover:bg-[#141b2c] hover:border-violet-500/40 hover:text-white",
        secondary:
          "bg-[#121827] text-slate-200 border border-[#1e2638] shadow-sm hover:bg-[#182033] hover:text-white",
        ghost: "hover:bg-white/[0.06] text-slate-300 hover:text-white",
        link: "text-violet-400 underline-offset-4 hover:underline hover:text-violet-300",
        buy: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 font-semibold",
        sell: "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 font-semibold",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
