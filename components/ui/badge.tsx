import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-600 text-white shadow hover:bg-violet-500",
        secondary:
          "border-transparent bg-[#1a2235] text-slate-200 hover:bg-[#222f47] border border-[#232f48]",
        destructive:
          "border-rose-500/30 bg-rose-500/15 text-rose-400",
        outline: "text-slate-300 border-[#1e2a3f]",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        phase1: "border-violet-500/30 bg-violet-500/15 text-violet-400",
        phase2: "border-indigo-500/30 bg-indigo-500/15 text-indigo-400",
        funded: "border-emerald-500/30 bg-emerald-500/20 text-emerald-300 font-bold",
        breached: "border-rose-500/40 bg-rose-500/20 text-rose-400 font-bold",
        purple: "border-violet-500/40 bg-violet-500/20 text-violet-300 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
