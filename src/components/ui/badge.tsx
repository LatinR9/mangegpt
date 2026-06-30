import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "border-blue-400/50 bg-blue-500/20 text-blue-100",
      secondary: "border-slate-600 bg-slate-800 text-slate-200",
      success: "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
      warning: "border-amber-400/50 bg-amber-500/15 text-amber-200",
      danger: "border-rose-400/50 bg-rose-500/15 text-rose-200",
      outline: "border-slate-700 text-slate-200"
    }
  },
  defaultVariants: { variant: "default" }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
