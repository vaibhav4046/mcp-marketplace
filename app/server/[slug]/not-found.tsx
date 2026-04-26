import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <div className="text-[11px] font-mono text-accent uppercase tracking-wider">
        404
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Server not in registry</h1>
      <p className="mt-3 text-fg-muted max-w-md mx-auto">
        We couldn't find that MCP server. It may have been removed, renamed, or
        not yet synced from upstream.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 mt-6 h-9 px-4 rounded-md border border-border bg-bg-subtle text-fg hover:bg-bg-muted transition-colors text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all servers
      </Link>
    </div>
  );
}
