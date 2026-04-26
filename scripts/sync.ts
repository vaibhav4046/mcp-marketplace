/**
 * Sync MCP server registry from upstream sources.
 *
 * Sources:
 *   1. Glama public MCP API (paginated, full corpus — thousands of servers)
 *   2. modelcontextprotocol/servers README (official + reference list)
 *   3. data/servers.seed.json (optional manual entries that survive every sync)
 *
 * Pipeline:
 *   - Fetch every page from Glama (cursor pagination)
 *   - Parse the official MCP repo README for the curated list
 *   - Merge with existing entries; manual entries always win on conflict
 *   - Filter low-signal entries (missing repo / description)
 *   - Cap to a fast-but-deep set: all official + verified + top N by activity
 *
 * Run:
 *   npm run sync
 *   npm run sync -- --dry
 *   npm run sync -- --max=1500
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { MCPServer, RegistryFile, Runtime, ServerCategory, Transport } from "../lib/types";
import { slugify } from "../lib/utils";

const REGISTRY_PATH = path.resolve(process.cwd(), "data/servers.json");
const SEED_PATH = path.resolve(process.cwd(), "data/servers.seed.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry");
const MAX_FLAG = args.find((a) => a.startsWith("--max="));
const MAX_SERVERS = MAX_FLAG ? parseInt(MAX_FLAG.split("=")[1], 10) : 800;

interface GlamaServer {
  id: string;
  slug?: string;
  name: string;
  namespace?: string;
  description?: string;
  attributes?: string[];
  repository?: { url?: string };
  url?: string;
  spdxLicense?: { name?: string } | null;
  environmentVariablesJsonSchema?: { properties?: Record<string, unknown>; required?: string[] };
  tools?: { name: string; description?: string }[];
}

async function main() {
  const t0 = Date.now();
  console.log(`▶ Syncing MCP registry${DRY_RUN ? " (dry)" : ""} — cap: ${MAX_SERVERS}`);

  const existing = await loadExisting();
  console.log(`  • ${existing.length} existing entries`);

  const fromGlama = await fetchAllGlamaPages().catch((e) => {
    console.warn(`  ! Glama fetch failed: ${e.message}`);
    return [];
  });
  console.log(`  • ${fromGlama.length} from Glama`);

  const fromOfficial = await fetchOfficialList().catch((e) => {
    console.warn(`  ! Official list fetch failed: ${e.message}`);
    return [];
  });
  console.log(`  • ${fromOfficial.length} from official MCP repo`);

  const seed = await loadSeed();
  if (seed.length) console.log(`  • ${seed.length} seed entries`);

  // Existing entries are loaded from current registry; we treat manual ones as untouchable.
  // The merge prefers source-priority: manual > official > community/glama.
  const merged = merge([...existing, ...seed, ...fromOfficial, ...fromGlama]);

  const filtered = merged.filter((s) => {
    if (!s.repo || !s.repo.startsWith("http")) return false;
    if (!s.tagline || s.tagline.length < 10) return false;
    return true;
  });

  // Rank: official → verified → has tools → most recent. Cap.
  const ranked = filtered
    .map((s) => ({ s, score: rankScore(s) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SERVERS)
    .map((x) => x.s);

  const out: RegistryFile = {
    generatedAt: new Date().toISOString(),
    totalCount: ranked.length,
    servers: ranked.sort((a, b) => {
      if (!!b.official !== !!a.official) return b.official ? 1 : -1;
      if (!!b.verified !== !!a.verified) return b.verified ? 1 : -1;
      return a.name.localeCompare(b.name);
    }),
  };

  console.log(
    `✓ Final count: ${ranked.length} (was ${existing.length}); kept ${ranked.filter((s) => s.official).length} official + ${ranked.filter((s) => s.verified).length} verified.`
  );
  console.log(`  ⏱  ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  if (DRY_RUN) {
    console.log("  Dry run — not writing.");
    return;
  }

  await writeFile(REGISTRY_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`✓ Wrote ${REGISTRY_PATH} (${prettyBytes(JSON.stringify(out).length)})`);
}

async function loadExisting(): Promise<MCPServer[]> {
  if (!existsSync(REGISTRY_PATH)) return [];
  const raw = await readFile(REGISTRY_PATH, "utf8");
  return (JSON.parse(raw) as RegistryFile).servers || [];
}

async function loadSeed(): Promise<MCPServer[]> {
  if (!existsSync(SEED_PATH)) return [];
  const raw = await readFile(SEED_PATH, "utf8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : data.servers || [];
  } catch {
    return [];
  }
}

// -------- Glama (full pagination) --------

async function fetchAllGlamaPages(): Promise<MCPServer[]> {
  const PAGE_SIZE = 100;
  const MAX_PAGES = 200; // safety cap — 20k servers
  const out: MCPServer[] = [];
  let cursor: string | undefined = undefined;
  let page = 0;

  while (page < MAX_PAGES) {
    page++;
    const url = new URL("https://glama.ai/api/mcp/v1/servers");
    url.searchParams.set("first", String(PAGE_SIZE));
    if (cursor) url.searchParams.set("after", cursor);

    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "mcp-marketplace-sync" },
    });
    if (!r.ok) {
      if (r.status === 429) {
        const wait = 5000 * page;
        console.warn(`  ! Glama 429, sleeping ${wait}ms`);
        await sleep(wait);
        continue;
      }
      throw new Error(`Glama HTTP ${r.status}`);
    }

    const data = (await r.json()) as {
      servers: GlamaServer[];
      pageInfo: { hasNextPage: boolean; endCursor: string };
    };

    for (const g of data.servers) {
      const m = glamaToServer(g);
      if (m) out.push(m);
    }

    if (page % 5 === 0) console.log(`  · Glama page ${page} → ${out.length} servers so far`);

    if (!data.pageInfo.hasNextPage) break;
    cursor = data.pageInfo.endCursor;

    // gentle pacing
    await sleep(120);
  }

  return out;
}

function glamaToServer(g: GlamaServer): MCPServer | null {
  if (!g.name) return null;
  const repo = g.repository?.url || "";
  if (!repo) return null;

  const slug = slugifyComposite(g.namespace, g.slug || g.name);
  const author = g.namespace || extractGithubOwner(repo) || "Unknown";
  const authorGithub = g.namespace || extractGithubOwner(repo);
  const attrs = g.attributes || [];
  // "Official" = strictly Anthropic reference servers. Glama's
  // "author:official" attribute is too loose (it tags any vendor-
  // published server). We only mark true Anthropic refs as official.
  const isOfficial = repo.includes("modelcontextprotocol/servers") || g.namespace === "modelcontextprotocol";
  const isVerified = attrs.includes("author:official") || attrs.includes("verified") || isOfficial;
  const transports: Transport[] = inferTransports(attrs);
  const authRequired = !!g.environmentVariablesJsonSchema?.required?.length;
  const runtime = inferRuntimeFromRepo(repo, g.namespace);
  const categories = inferCategories(g.description, g.namespace, g.name);
  const tags = inferTags(g.description, g.name);
  const license = g.spdxLicense?.name?.replace(/\s*License\s*$/i, "");

  return {
    slug,
    name: prettyName(g.name),
    tagline: truncate(cleanText(g.description) || `MCP server: ${g.name}`, 130),
    description: g.description,
    author,
    authorGithub,
    repo,
    homepage: g.url,
    runtime,
    transports,
    categories,
    tags,
    install: { cli: `# See ${repo}#readme for the canonical install command.` },
    tools: g.tools && g.tools.length > 0 ? g.tools : undefined,
    official: isOfficial,
    verified: isVerified,
    authRequired,
    license,
    source: isOfficial ? "official" : "glama",
    addedAt: new Date().toISOString(),
  };
}

// -------- Official MCP repo README --------

async function fetchOfficialList(): Promise<MCPServer[]> {
  const url = "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md";
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const md = await r.text();
  const out: MCPServer[] = [];

  // Match patterns: - **[Name](url)** - description
  const re = /^[-*]\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[-—–]\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(md)) !== null) {
    const [, name, repoUrl, desc] = m;
    if (!repoUrl.includes("github.com") && !repoUrl.includes("modelcontextprotocol")) continue;
    if (seen.has(name)) continue;
    seen.add(name);

    const isReference = repoUrl.includes("modelcontextprotocol/servers");
    const slug = slugify(name);
    out.push({
      slug,
      name,
      tagline: truncate(desc.trim(), 130),
      author: extractGithubOwner(repoUrl) || "Unknown",
      authorGithub: extractGithubOwner(repoUrl),
      repo: repoUrl,
      runtime: "unknown",
      transports: ["stdio"],
      categories: inferCategories(desc, undefined, name),
      tags: [],
      install: { cli: `# See ${repoUrl}#readme for install instructions.` },
      official: isReference,
      verified: isReference,
      source: isReference ? "official" : "community",
      addedAt: new Date().toISOString(),
    });
  }
  return out;
}

// -------- Merge --------

function merge(all: MCPServer[]): MCPServer[] {
  const map = new Map<string, MCPServer>();
  for (const s of all) {
    const existing = map.get(s.slug);
    if (!existing) {
      map.set(s.slug, s);
    } else {
      map.set(s.slug, mergeOne(existing, s));
    }
  }
  return Array.from(map.values());
}

function mergeOne(a: MCPServer, b: MCPServer): MCPServer {
  const priority = (x: MCPServer) => {
    if (x.source === "manual") return 5;
    if (x.source === "official") return 4;
    if (x.source === "community") return 3;
    if (x.source === "glama") return 2;
    return 1;
  };
  const [primary, secondary] = priority(a) >= priority(b) ? [a, b] : [b, a];

  return {
    ...secondary,
    ...primary,
    description: primary.description || secondary.description,
    homepage: primary.homepage || secondary.homepage,
    license: primary.license || secondary.license,
    stars: Math.max(primary.stars ?? 0, secondary.stars ?? 0) || undefined,
    tools: primary.tools?.length ? primary.tools : secondary.tools,
    install: { ...secondary.install, ...primary.install },
    tags: Array.from(new Set([...(primary.tags || []), ...(secondary.tags || [])])).slice(0, 12),
    categories: Array.from(
      new Set([...(primary.categories || []), ...(secondary.categories || [])])
    ) as ServerCategory[],
    transports: Array.from(
      new Set([...(primary.transports || []), ...(secondary.transports || [])])
    ) as Transport[],
    lastUpdated: latest(primary.lastUpdated, secondary.lastUpdated),
    addedAt: earliest(primary.addedAt, secondary.addedAt),
    official: primary.official || secondary.official,
    verified: primary.verified || secondary.verified,
    authRequired: primary.authRequired || secondary.authRequired,
  };
}

// -------- Inference helpers --------

function rankScore(s: MCPServer): number {
  let score = 0;
  if (s.source === "manual") score += 10000;
  if (s.official) score += 5000;
  if (s.verified) score += 1500;
  score += Math.min(s.tools?.length || 0, 20) * 25;
  score += s.description ? 200 : 0;
  score += s.tags.length * 5;
  if (s.lastUpdated) {
    const daysAgo = (Date.now() - new Date(s.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 200 - daysAgo);
  }
  if (s.addedAt) {
    const daysAgo = (Date.now() - new Date(s.addedAt).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 60 - daysAgo);
  }
  return score;
}

function inferTransports(attrs: string[]): Transport[] {
  const out: Transport[] = [];
  if (attrs.includes("hosting:remote-capable") || attrs.includes("hosting:hybrid")) {
    out.push("http", "stdio");
  } else {
    out.push("stdio");
  }
  return Array.from(new Set(out));
}

function inferRuntimeFromRepo(repo: string, namespace: string | undefined): Runtime {
  const r = repo.toLowerCase();
  const n = (namespace || "").toLowerCase();
  if (r.includes("/typescript") || r.includes("/ts-")) return "node";
  if (r.endsWith(".py") || n.includes("py")) return "python";
  if (r.includes("python")) return "python";
  if (r.includes("/go-") || r.endsWith("-go")) return "go";
  if (r.includes("/rust-")) return "rust";
  if (r.includes("docker")) return "docker";
  return "unknown";
}

function inferCategories(
  description: string | undefined,
  namespace: string | undefined,
  name: string | undefined
): ServerCategory[] {
  const haystack = `${description || ""} ${namespace || ""} ${name || ""}`.toLowerCase();
  const map: { kw: string[]; cat: ServerCategory }[] = [
    { kw: ["postgres", "mysql", "sqlite", "mariadb", "duckdb", "clickhouse", "snowflake", "bigquery", "redshift", "redis", "mongodb", "cassandra", " sql "], cat: "database" },
    { kw: ["browser", "puppeteer", "playwright", "scrape", "crawl"], cat: "browser" },
    { kw: ["aws", "gcp", "azure", "cloudflare", "vercel", "kubernetes", "k8s", "docker", "terraform"], cat: "cloud" },
    { kw: ["figma", "design", "canva", "adobe"], cat: "design" },
    { kw: ["jira", "linear", "github", "gitlab", "bitbucket", "circleci", "ci/cd"], cat: "developer-tools" },
    { kw: ["filesystem", "files", "fs ", "directory"], cat: "filesystem" },
    { kw: ["notion", "obsidian", "confluence", "wiki", "knowledge", "docs"], cat: "knowledge" },
    { kw: ["memory", "knowledge graph", "vector", "embedding", "rag"], cat: "memory" },
    { kw: ["slack", "discord", "telegram", "email", "gmail", "outlook", "messag"], cat: "messaging" },
    { kw: ["sentry", "datadog", "grafana", "prometheus", "monitor", "log "], cat: "monitoring" },
    { kw: ["calendar", "todo", "task", "schedul", "meeting", "productivity"], cat: "productivity" },
    { kw: ["arxiv", "pubmed", "research", "academic", "paper", "scholar"], cat: "research" },
    { kw: ["search", "google", "bing", "duckduckgo", "perplexity", "exa", "tavily", "brave"], cat: "search" },
    { kw: ["security", "vulnerab", "auth ", "oauth", "secret"], cat: "security" },
    { kw: ["s3", "gcs", "blob", "drive", "dropbox", "storage", "bucket"], cat: "storage" },
    { kw: ["git", "github", "gitlab", "bitbucket", "version control", "vcs"], cat: "version-control" },
    { kw: ["video", "youtube", "vimeo", "ffmpeg"], cat: "video" },
    { kw: ["voice", "tts", "stt", "speech", "audio", "elevenlabs"], cat: "voice" },
    { kw: ["llm", " ai ", "openai", "anthropic", "gemini", "claude", "gpt", "embedding", "agent"], cat: "ai" },
  ];
  const cats = new Set<ServerCategory>();
  for (const { kw, cat } of map) {
    if (kw.some((k) => haystack.includes(k))) cats.add(cat);
  }
  if (cats.size === 0) cats.add("other");
  return Array.from(cats);
}

function inferTags(desc: string | undefined, name: string | undefined): string[] {
  const out = new Set<string>();
  const text = `${desc || ""} ${name || ""}`.toLowerCase();
  const candidates = [
    "rest", "graphql", "rag", "agents", "openai", "anthropic", "gemini", "claude",
    "postgres", "mysql", "sqlite", "redis", "mongodb",
    "kubernetes", "docker", "aws", "gcp", "azure",
    "github", "gitlab", "linear", "jira", "notion",
    "slack", "discord", "telegram", "gmail",
    "embedding", "vector", "memory", "knowledge",
    "browser", "playwright", "puppeteer",
  ];
  for (const c of candidates) if (text.includes(c)) out.add(c);
  return Array.from(out).slice(0, 8);
}

function slugifyComposite(namespace: string | undefined, name: string): string {
  const base = namespace ? `${namespace}-${name}` : name;
  return slugify(base) || slugify(name) || "unknown";
}

function prettyName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b(mcp|server)\b/gi, (m) => m.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(s: string | undefined): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

function extractGithubOwner(url: string): string | undefined {
  const m = url.match(/github\.com\/([^/]+)/i);
  return m?.[1];
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function latest(a: string | undefined, b: string | undefined): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) > new Date(b) ? a : b;
}

function earliest(a: string | undefined, b: string | undefined): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) < new Date(b) ? a : b;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function prettyBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

main().catch((e) => {
  console.error("✗ Sync failed:", e);
  process.exit(1);
});
