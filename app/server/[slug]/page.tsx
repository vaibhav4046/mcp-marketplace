import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Lock,
  Scale,
  Server as ServerIcon,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { getAllServers, getServerBySlug } from "@/lib/data";
import { CATEGORY_LABELS, RUNTIME_LABELS } from "@/lib/types";
import { formatCount, githubAvatar, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ServerCard } from "@/components/server-card";
import { InstallTabs } from "@/components/install-tabs";
import { ToolList } from "@/components/tool-list";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllServers().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const server = getServerBySlug(slug);
  if (!server) return { title: "Server not found" };
  return {
    title: `${server.name} — MCP server`,
    description: server.tagline,
    openGraph: {
      title: `${server.name} — MCP server`,
      description: server.tagline,
    },
  };
}

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const server = getServerBySlug(slug);
  if (!server) notFound();

  const related = getAllServers()
    .filter((s) => s.slug !== server.slug)
    .filter((s) => s.categories.some((c) => server.categories.includes(c)))
    .slice(0, 3);

  const avatar = githubAvatar(server.authorGithub, 96);

  return (
    <div className="container py-8 md:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All servers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="min-w-0">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={server.author}
                  width={56}
                  height={56}
                  className="rounded-xl border border-border bg-bg-muted object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl border border-border bg-gradient-to-br from-accent/20 to-bg-muted grid place-items-center font-mono text-fg-muted">
                  {server.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {server.name}
                </h1>
                {server.official && (
                  <span title="Official Anthropic reference server" className="inline-flex items-center gap-1 text-[11px] text-accent">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    official
                  </span>
                )}
                {!server.official && server.verified && (
                  <span title="Verified by registry curators" className="inline-flex items-center gap-1 text-[11px] text-success">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    verified
                  </span>
                )}
              </div>
              <p className="text-fg-muted mt-1 leading-relaxed">{server.tagline}</p>
              <div className="mt-3 flex items-center gap-3 text-[11.5px] text-fg-subtle flex-wrap">
                <span>by <span className="text-fg-muted">{server.author}</span></span>
                {typeof server.stars === "number" && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {formatCount(server.stars)}
                  </span>
                )}
                {server.license && (
                  <span className="inline-flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    {server.license}
                  </span>
                )}
                {server.lastUpdated && (
                  <span>updated {timeAgo(server.lastUpdated)}</span>
                )}
                {server.addedAt && (
                  <span>added {timeAgo(server.addedAt)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {server.description && (
            <Card className="p-5 mb-6">
              <p className="text-[14px] text-fg leading-relaxed whitespace-pre-wrap">
                {server.description}
              </p>
            </Card>
          )}

          {/* Install */}
          <section className="mb-8">
            <SectionTitle>Install</SectionTitle>
            <InstallTabs server={server} />
          </section>

          {/* Tools */}
          {server.tools && server.tools.length > 0 && (
            <section className="mb-8">
              <SectionTitle hint={`${server.tools.length} tool${server.tools.length === 1 ? "" : "s"}`}>
                Tools exposed
              </SectionTitle>
              <ToolList tools={server.tools} />
            </section>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section className="mb-8">
              <SectionTitle>Related servers</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <ServerCard key={r.slug} server={r} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-4">
            <SidebarLabel>Source</SidebarLabel>
            <a
              href={server.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-2 text-[13px] text-fg hover:text-accent group"
            >
              <ExternalLink className="h-3.5 w-3.5 text-fg-subtle group-hover:text-accent shrink-0" />
              <span className="truncate">
                {server.repo.replace(/^https?:\/\//, "")}
              </span>
              <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 shrink-0" />
            </a>
            {server.homepage && server.homepage !== server.repo && (
              <a
                href={server.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 text-[13px] text-fg hover:text-accent group"
              >
                <ExternalLink className="h-3.5 w-3.5 text-fg-subtle group-hover:text-accent shrink-0" />
                <span className="truncate">Homepage</span>
                <ArrowUpRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 shrink-0" />
              </a>
            )}
          </Card>

          <Card className="p-4">
            <SidebarLabel>Runtime</SidebarLabel>
            <div className="mt-2 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span className="text-[13px] text-fg">{RUNTIME_LABELS[server.runtime]}</span>
            </div>
            <SidebarLabel className="mt-4">Transports</SidebarLabel>
            <div className="mt-1.5 flex gap-1.5 flex-wrap">
              {server.transports.map((t) => (
                <Badge key={t} variant="outline" className="font-mono">
                  {t}
                </Badge>
              ))}
            </div>
            <SidebarLabel className="mt-4">Categories</SidebarLabel>
            <div className="mt-1.5 flex gap-1.5 flex-wrap">
              {server.categories.map((c) => (
                <Badge key={c} variant="subtle">
                  {CATEGORY_LABELS[c]}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <SidebarLabel>Requirements</SidebarLabel>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-[13px]">
                <Lock className={server.authRequired ? "h-3.5 w-3.5 text-warn" : "h-3.5 w-3.5 text-success"} />
                <span className="text-fg-muted">
                  {server.authRequired ? "API key / OAuth required" : "No auth needed"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <ServerIcon className="h-3.5 w-3.5 text-fg-subtle" />
                <span className="text-fg-muted">
                  {server.transports.includes("http") ? "Local or remote" : "Local only"}
                </span>
              </div>
            </div>
          </Card>

          {server.tags.length > 0 && (
            <Card className="p-4">
              <SidebarLabel>Tags</SidebarLabel>
              <div className="mt-2 flex gap-1.5 flex-wrap">
                {server.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    #{t}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-sm font-semibold text-fg">{children}</h2>
      {hint && <span className="text-[11px] text-fg-subtle font-mono">{hint}</span>}
    </div>
  );
}

function SidebarLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-[10px] uppercase tracking-wider font-mono text-fg-subtle ${className}`}>
      {children}
    </div>
  );
}
