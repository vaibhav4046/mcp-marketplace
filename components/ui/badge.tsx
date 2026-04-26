import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "subtle" | "accent" | "success" | "warn" | "danger";

const variantClasses: Record<Variant, string> = {
  default: "bg-bg-inset text-fg",
  outline: "border border-border text-fg-muted",
  subtle: "bg-bg-muted text-fg-muted",
  accent: "bg-accent-subtle text-accent border border-accent/20",
  success: "bg-success/10 text-success border border-success/20",
  warn: "bg-warn/10 text-[hsl(var(--warn))] border border-warn/20",
  danger: "bg-danger/10 text-danger border border-danger/20",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
