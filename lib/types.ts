/**
 * Core MCP server registry types.
 */

export type ServerCategory =
  | "official"
  | "ai"
  | "browser"
  | "cloud"
  | "database"
  | "design"
  | "developer-tools"
  | "filesystem"
  | "knowledge"
  | "memory"
  | "messaging"
  | "monitoring"
  | "productivity"
  | "research"
  | "search"
  | "security"
  | "storage"
  | "version-control"
  | "video"
  | "voice"
  | "other";

export type Runtime = "node" | "python" | "go" | "rust" | "deno" | "bun" | "docker" | "binary" | "unknown";

export type Transport = "stdio" | "http" | "sse";

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface MCPServer {
  /** Stable slug for URLs and lookups (lowercase, dash-separated). */
  slug: string;
  /** Human-readable name shown in UI. */
  name: string;
  /** Short tagline (1 line). */
  tagline: string;
  /** Long description (Markdown allowed). */
  description?: string;
  /** Author or organization name. */
  author: string;
  /** Author's GitHub handle (without @), used for avatar. */
  authorGithub?: string;
  /** Source repo URL. */
  repo: string;
  /** Optional homepage URL. */
  homepage?: string;
  /** Runtime / language. */
  runtime: Runtime;
  /** Transports the server speaks. */
  transports: Transport[];
  /** Categories / tags for filtering. */
  categories: ServerCategory[];
  /** Free-form tags. */
  tags: string[];
  /** Install commands, keyed by client. */
  install: {
    /** Claude Desktop config block. */
    claudeDesktop?: ClaudeDesktopConfig;
    /** Claude Code add command. */
    claudeCode?: string;
    /** Generic npm / pip / go install. */
    cli?: string;
    /** Docker run command. */
    docker?: string;
  };
  /** Tool list (subset; full list lives in repo). */
  tools?: MCPTool[];
  /** GitHub stars at last sync. */
  stars?: number;
  /** Whether maintained by Anthropic / official ref impl. */
  official?: boolean;
  /** Verified by registry curators. */
  verified?: boolean;
  /** Whether the server requires API keys / OAuth. */
  authRequired?: boolean;
  /** ISO date last updated upstream. */
  lastUpdated?: string;
  /** ISO date when added to this registry. */
  addedAt?: string;
  /** License SPDX id. */
  license?: string;
  /** Source registry that fed this entry. */
  source?: "official" | "glama" | "manual" | "community";
  /** Banner / logo URL. */
  logo?: string;
}

export interface ClaudeDesktopConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface RegistryFile {
  generatedAt: string;
  totalCount: number;
  servers: MCPServer[];
}

export const CATEGORY_LABELS: Record<ServerCategory, string> = {
  official: "Official",
  ai: "AI / LLM",
  browser: "Browser",
  cloud: "Cloud",
  database: "Database",
  design: "Design",
  "developer-tools": "Developer tools",
  filesystem: "Filesystem",
  knowledge: "Knowledge",
  memory: "Memory",
  messaging: "Messaging",
  monitoring: "Monitoring",
  productivity: "Productivity",
  research: "Research",
  search: "Search",
  security: "Security",
  storage: "Storage",
  "version-control": "Version control",
  video: "Video",
  voice: "Voice",
  other: "Other",
};

export const RUNTIME_LABELS: Record<Runtime, string> = {
  node: "Node.js",
  python: "Python",
  go: "Go",
  rust: "Rust",
  deno: "Deno",
  bun: "Bun",
  docker: "Docker",
  binary: "Binary",
  unknown: "Unknown",
};
