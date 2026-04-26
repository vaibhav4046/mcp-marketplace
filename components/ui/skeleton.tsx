import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-bg-muted",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full shimmer-bg animate-shimmer" />
    </div>
  );
}
