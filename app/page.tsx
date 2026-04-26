import Link from "next/link";
import { ArrowRight, Github, Sparkles, ShieldCheck, Zap, Clock } from "lucide-react";
import {
  getAllServers,
  getCategoriesWithCounts,
  getFeaturedServers,
  getRecentlyAdded,
  getRegistryMeta,
  getStats,
  getTrendingServers,
} from "@/lib/data";
import { ServerCard } from "@/components/server-card";
import { ServerGrid } from "@/components/server-grid";
import { formatCount, timeAgo } from "@/lib/utils";

export default function HomePage() {
  const all = getAllServers();
  const featured = getFeaturedServers(6);
  const trending = getTrendingServers(8);
  const recent = getRecentlyAdded(8);
  const meta = getRegistryMeta();
  const stats = getStats();
  const categoryCounts = getCategoriesWithCounts();

  return (
    <>
      <Hero stats={stats} meta={meta} />

      <Section
        title="Featured & official"
        description="Anthropic reference servers and curator-verified picks."
        icon={<Sparkles className="h-3.5 w-3.5" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((s) => (
            <ServerCard key={s.slug} server={s} variant="featured" />
          ))}
        </div>
      </Section>

      <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <SidePanel
          title="Trending"
          icon={<Zap className="h-3.5 w-3.5" />}
          items={trending.map((s) => ({
            href: `/server/${s.slug}`,
            primary: s.name,
            secondary: s.tagline,
            tail: `★ ${formatCount(s.stars)}`,
          }))}
        />
        <SidePanel
          title="Recently added"
          icon={<Clock className="h-3.5 w-3.5" />}
          items={recent.map((s) => ({
            href: `/server/${s.slug}`,
            primary: s.name,
            secondary: s.tagline,
            tail: timeAgo(s.addedAt),
          }))}
        />
      </div>

      <Section
        title="Browse all servers"
        description="Filter by category, runtime, or keyword. Press ⌘K to search anywhere."
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        className="mt-16"
      >
        <ServerGrid servers={all} categoryCounts={categoryCounts} />
      </Section>
    </>
  );
}

function Hero({
  stats,
  meta,
}: {
  stats: ReturnType<typeof getStats>;
  meta: ReturnType<typeof getRegistryMeta>;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-pattern" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-64 bg-grid-fade" aria-hidden />

      <div className="container relative pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <a
            href="https://github.com/vaibhav4046/mcp-marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1 text-[11px] text-fg-muted hover:bg-bg-muted hover:text-fg transition-colors"
          >
            <Sparkles className="h-3 w-3 text-accent" />
            Auto-synced daily from official + community sources
            <ArrowRight className="h-3 w-3" />
          </a>

          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-balance">
            The fastest way to discover
            <br />
            <span className="bg-gradient-to-br from-accent via-[hsl(252,95%,75%)] to-[hsl(180,80%,60%)] bg-clip-text text-transparent">
              MCP servers
            </span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-fg-muted leading-relaxed max-w-2xl text-balance">
            Browse and install <strong className="text-fg">{stats.total}+</strong> Model Context Protocol servers for Claude Code, Claude Desktop, Cursor, and any MCP-aware client. One-click install snippets, tool-schema previews, daily auto-sync — and a step-by-step path to deploy your own.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#browse"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-accent text-accent-fg font-medium text-sm shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all hover:-translate-y-0.5"
            >
              Browse all servers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/deploy"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-md border border-border-strong text-fg font-medium text-sm hover:bg-bg-muted transition-colors"
            >
              Deploy your own
            </Link>
            <a
              href="https://github.com/vaibhav4046/mcp-marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-md border border-border-strong text-fg font-medium text-sm hover:bg-bg-muted transition-colors"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 sm:gap-12 text-center">
            <Stat value={String(stats.total)} label="Servers" />
            <Stat value={String(stats.official)} label="Official" />
            <Stat value={formatCount(stats.totalStars)} label="Total ★" />
          </div>

          <div className="mt-6 text-[11px] text-fg-subtle font-mono">
            Last sync: {timeAgo(meta.generatedAt)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-br from-fg to-fg-muted bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-fg-subtle mt-1">
        {label}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`container ${className} mt-16 scroll-mt-20`} id="browse">
      <div className="flex flex-col gap-1 mb-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono text-accent uppercase tracking-wider">
          {icon}
          {title}
        </div>
        {description && (
          <p className="text-sm text-fg-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SidePanel({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { href: string; primary: string; secondary: string; tail: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-subtle">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono text-fg-muted uppercase tracking-wider">
          {icon}
          {title}
        </div>
      </div>
      <ul className="divide-y divide-border">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg-muted transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-fg truncate">
                  {it.primary}
                </div>
                <div className="text-[11.5px] text-fg-muted truncate">
                  {it.secondary}
                </div>
              </div>
              <span className="text-[11px] text-fg-subtle font-mono shrink-0">
                {it.tail}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
