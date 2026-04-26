/**
 * Sync MCP server registry from upstream sources.
 *
 * Runs daily via GitHub Actions. Pulls from:
 *   1. Glama public MCP API (https://glama.ai/api/mcp/v1/servers)
 *   2. The official `modelcontextprotocol/servers` repo readme list
 *   3. (Optionally) any seed entries in `data/servers.seed.json`
 *
 * Merges with the existing `data/servers.json`, preferring whichever
 * source has the richer record. Manual entries are never overwritten.
 *
 * Usage:
 *   pnpm sync
 *   pnpm sync --dry
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { MCPServer, RegistryFile, Runtime, ServerCategory } from "../lib/types";
import { slugify } from "../lib/utils";

const REGISTRY_PATH = path.resolve(process.cwd(), "data/servers.json");
const SEED_PATH = path.resolve(process.cwd(), "data/servers.seed.json");

const DRY_RUN = process.argv.includes("--dry");

interface GlamaServer {
  id?: string;
  slug?: string;
  name: string;
  description?: string;
  author?: { username?: string; displayName?: string };
  attributes?: { official?: boolean; verified?: boolean };
  repository?: { url?: string };
  homepage?: string;
  language?: string;
  license?: string;
  stars?: number;
  category?: string;
  tags?: string[];
  updatedAt?: string;
  createdAt?: string;
  tools?: { name: string; description?: string }[];
}

async function main() {
  console.log(`▶ Syncing MCP registry${DRY_RUN ? " (dry run)" : ""}…`);

  const existing = await loadExisting();
  console.log(`  • Loaded ${existing.length} existing entries`);

  const fromGlama = await fetchGlama().catch((e) => {
    console.warn(`  ! Glama fetch failed: ${e.message}`);
    return [];
  });
  console.log(`  • Fetched ${fromGlama.length} from Glama`);

  const fromOfficial = await fetchOfficialList().catch((e) => {
    console.warn(`  ! Official list fetch failed: ${e.message}`);
    return [];
  });
  console.log(`  • Fetched ${fromOfficial.length} from official MCP repo`);

  const seed = await loadSeed();
  if (seed.length) console.log(`  • Loaded ${seed.length} seed entries`);

  const merged = merge([...existing, ...seed, ...fromOfficial, ...fromGlama]);
  const sorted = merged.sort((a, b) => {
    if (!!b.official !== !!a.official) return b.official ? 1 : -1;
    return (b.stars ?? 0) - (a.stars ?? 0);
  });

  const out: RegistryFile = {
    generatedAt: new Date().toISOString(),
    totalCount: sorted.length,
    servers: sorted,
  };

  console.log(`✓ Final count: ${sorted.length} (was ${existing.length})`);

  if (DRY_RUN) {
    console.log("  Dry run — not writing to disk.");
    return;
  }

  await writeFile(REGISTRY_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`✓ Wrote ${REGISTRY_PATH}`);
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

async function fetchGlama(): Promise<MCPServer[]> {
  const url = "https://glama.ai/api/mcp/v1/servers?limit=200";
  const r = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "mcp-marketplace-sync" },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = (await r.json()) as { servers?: GlamaServer[] } | GlamaServer[];
  const list = Array.isArray(data) ? data : data.servers || [];
  return list.map(glamaToServer).filter(Boolean) as MCPServer[];
}

function glamaToServer(g: GlamaServer): MCPServer | null {
  if (!g.name) return null;
  const slug = g.slug || slugify(g.name);
  const repo = g.repository?.url || "";
  if (!repo) return null;
  const author = g.author?.displayName || g.author?.username || "Unknown";
  const authorGithub = g.author?.username || extractGithubOwner(repo);

  return {
    slug,
    name: g.name,
    tagline: truncate(g.description || g.name, 110),
    description: g.description,
    author,
    authorGithub,
    repo,
    homepage: g.homepage,
    runtime: detectRuntime(g.language, repo),
    transports: ["stdio"],
    categories: mapCategories(g.category, g.tags),
    tags: (g.tags || []).slice(0, 8),
    install: inferInstall(repo),
    tools: g.tools,
    stars: g.stars,
    official: !!g.attributes?.official,
    verified: !!g.attributes?.verified,
    license: g.license,
    source: "glama",
    addedAt: g.createdAt || new Date().toISOString(),
    lastUpdated: g.updatedAt,
  };
}

async function fetchOfficialList(): Promise<MCPServer[]> {
  // Pull the README from modelcontextprotocol/servers and extract the
  // bullet list of community + reference servers. This is a best-effort
  // parse; richer fields come from Glama or manual entries.
  const url = "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md";
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const md = await r.text();
  const out: MCPServer[] = [];

  // match: - **[Name](https://...)** - description
  const re = /^[-*]\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[-—]\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const [, name, repoUrl, desc] = m;
    if (!repoUrl.includes("github.com") && !repoUrl.includes("modelcontextprotocol")) continue;
    const slug = slugify(name);
    out.push({
      slug,
      name,
      tagline: truncate(desc.trim(), 110),
      author: extractGithubOwner(repoUrl) || "Unknown",
      authorGithub: extractGithubOwner(repoUrl),
      repo: repoUrl,
      runtime: "unknown",
      transports: ["stdio"],
      categories: ["other"],
      tags: [],
      install: inferInstall(repoUrl),
      source: "official",
      official: repoUrl.includes("modelcontextprotocol/servers"),
      addedAt: new Date().toISOString(),
    });
  }
  return out;
}

function merge(all: MCPServer[]): MCPServer[] {
  const map = new Map<string, MCPServer>();
  for (const s of all) {
    const key = s.slug;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, s);
      continue;
    }
    map.set(key, mergeOne(existing, s));
  }
  return Array.from(map.values());
}

function mergeOne(a: MCPServer, b: MCPServer): MCPServer {
  // Prefer manual / official source over remote sync data
  const priority = (x: MCPServer) =>
    x.source === "manual" ? 4 : x.source === "official" ? 3 : x.source === "community" ? 2 : 1;
  const [primary, secondary] = priority(a) >= priority(b) ? [a, b] : [b, a];

  return {
    ...secondary,
    ...primary,
    description: primary.description || secondary.description,
    homepage: primary.homepage || secondary.homepage,
    license: primary.license || secondary.license,
    stars: Math.max(primary.stars ?? 0, secondary.stars ?? 0) || undefined,
    tools: primary.tools?.length ? primary.tools : secondary.tools,
    tags: Array.from(new Set([...(primary.tags || []), ...(secondary.tags || [])])).slice(0, 12),
    categories: Array.from(new Set([...(primary.categories || []), ...(secondary.categories || [])])) as ServerCategory[],
    transports: Array.from(new Set([...(primary.transports || []), ...(secondary.transports || [])])),
    lastUpdated: latest(primary.lastUpdated, secondary.lastUpdated),
    addedAt: earliest(primary.addedAt, secondary.addedAt),
    official: primary.official || secondary.official,
    verified: primary.verified || secondary.verified,
  };
}

// ---- helpers ----

function detectRuntime(lang: string | undefined, repo: string): Runtime {
  const l = (lang || "").toLowerCase();
  if (l.includes("typescript") || l.includes("javascript") || l === "node") return "node";
  if (l.includes("python")) return "python";
  if (l.includes("go")) return "go";
  if (l.includes("rust")) return "rust";
  if (l.includes("deno")) return "deno";
  if (l.includes("bun")) return "bun";
  if (repo.includes("docker")) return "docker";
  return "unknown";
}

function mapCategories(category: string | undefined, tags: string[] | undefined): ServerCategory[] {
  const t = (category || "").toLowerCase();
  const candidates: ServerCategory[] = [];
  const map: Record<string, ServerCategory> = {
    database: "database",
    db: "database",
    browser: "browser",
    cloud: "cloud",
    devops: "cloud",
    productivity: "productivity",
    research: "research",
    search: "search",
    knowledge: "knowledge",
    memory: "memory",
    storage: "storage",
    messaging: "messaging",
    chat: "messaging",
    monitoring: "monitoring",
    observability: "monitoring",
    ai: "ai",
    llm: "ai",
    voice: "voice",
    audio: "voice",
    video: "video",
    design: "design",
    git: "version-control",
    vcs: "version-control",
    "developer-tools": "developer-tools",
    devtools: "developer-tools",
    security: "security",
    filesystem: "filesystem",
    files: "filesystem",
  };
  for (const k of Object.keys(map)) if (t.includes(k)) candidates.push(map[k]);
  for (const tag of tags || []) {
    const m = map[tag.toLowerCase()];
    if (m) candidates.push(m);
  }
  return candidates.length ? Array.from(new Set(candidates)) : ["other"];
}

function inferInstall(repo: string): MCPServer["install"] {
  const out: MCPServer["install"] = {};
  const owner = extractGithubOwner(repo);
  if (owner) {
    // Best-effort guess only — real entries should override.
    out.cli = `# See ${repo}#readme for the canonical install command.`;
  }
  return out;
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

main().catch((e) => {
  console.error("✗ Sync failed:", e);
  process.exit(1);
});
