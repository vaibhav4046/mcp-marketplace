import Link from "next/link";
import { ShieldCheck, Star, Lock, Zap } from "lucide-react";
import type { MCPServer } from "@/lib/types";
import { CATEGORY_LABELS, RUNTIME_LABELS } from "@/lib/types";
import { cn, formatCount, githubAvatar, timeAgo } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface Props {
  server: MCPServer;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

export function ServerCard({ server, className, variant = "default" }: Props) {
  const isFeatured = variant === "featured";
  return (
    <Link
      href={`/server/${server.slug}`}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-bg-subtle p-4 card-glow tap-scale",
        isFeatured && "p-5",
        className
      )}
    >
      {isFeatured && (
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      )}

      <div className="flex items-start gap-3">
        <ServerLogo server={server} size={isFeatured ? 44 : 36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-fg truncate text-[14px]">
              {server.name}
            </h3>
            {server.official && (
              <span title="Official Anthropic reference server" className="text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            )}
            {!server.official && server.verified && (
              <span title="Verified by registry curators" className="text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-fg-subtle truncate">
            by {server.author}
          </p>
        </div>

        {typeof server.stars === "number" && server.stars > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-fg-subtle shrink-0 mt-0.5">
            <Star className="h-3 w-3" />
            {formatCount(server.stars)}
          </div>
        )}
      </div>

      <p className="mt-3 text-[13px] text-fg-muted line-clamp-2 leading-relaxed">
        {server.tagline}
      </p>

      <div className="mt-4 flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className="font-mono">
          <Zap className="h-3 w-3" />
          {RUNTIME_LABELS[server.runtime]}
        </Badge>
        {server.categories.slice(0, 2).map((c) => (
          <Badge key={c} variant="subtle">
            {CATEGORY_LABELS[c]}
          </Badge>
        ))}
        {server.authRequired && (
          <Badge variant="warn" className="ml-auto">
            <Lock className="h-3 w-3" />
            auth
          </Badge>
        )}
      </div>

      {(server.tools?.length || server.lastUpdated) && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-fg-subtle">
          {server.tools?.length ? (
            <span>{server.tools.length} tool{server.tools.length === 1 ? "" : "s"}</span>
          ) : (
            <span />
          )}
          {server.lastUpdated && <span>updated {timeAgo(server.lastUpdated)}</span>}
        </div>
      )}
    </Link>
  );
}

function ServerLogo({ server, size }: { server: MCPServer; size: number }) {
  const avatar = githubAvatar(server.authorGithub, size * 2);
  if (server.logo) {
    return (
      <img
        src={server.logo}
        alt={`${server.name} logo`}
        width={size}
        height={size}
        className="rounded-lg border border-border bg-bg-muted shrink-0 object-cover"
      />
    );
  }
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${server.author} avatar`}
        width={size}
        height={size}
        className="rounded-lg border border-border bg-bg-muted shrink-0 object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg border border-border bg-gradient-to-br from-accent/20 to-bg-muted grid place-items-center text-fg-muted font-mono text-xs shrink-0"
    >
      {server.name.slice(0, 2).toUpperCase()}
    </div>
  );
}
