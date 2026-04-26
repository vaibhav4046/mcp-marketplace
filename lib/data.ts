/**
 * Server registry data layer. Reads from `data/servers.json`.
 *
 * Designed to be replaceable: drop in a Supabase fetch later, the
 * call sites stay the same.
 */

import { cache } from "react";
import registry from "@/data/servers.json";
import type { MCPServer, RegistryFile, ServerCategory } from "./types";

const data = registry as RegistryFile;

export const getRegistryMeta = cache(() => ({
  generatedAt: data.generatedAt,
  totalCount: data.totalCount,
}));

export const getAllServers = cache((): MCPServer[] => {
  return [...data.servers].sort((a, b) => {
    // Official first, then by stars desc, then alpha
    if (!!b.official !== !!a.official) return b.official ? 1 : -1;
    const sb = b.stars ?? 0;
    const sa = a.stars ?? 0;
    if (sb !== sa) return sb - sa;
    return a.name.localeCompare(b.name);
  });
});

export const getServerBySlug = cache((slug: string): MCPServer | undefined => {
  return data.servers.find((s) => s.slug === slug);
});

export const getServersByCategory = cache((category: ServerCategory): MCPServer[] => {
  return getAllServers().filter((s) => s.categories.includes(category));
});

export const getFeaturedServers = cache((limit = 6): MCPServer[] => {
  return getAllServers()
    .filter((s) => s.official || s.verified)
    .slice(0, limit);
});

export const getTrendingServers = cache((limit = 8): MCPServer[] => {
  return [...getAllServers()]
    .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
    .slice(0, limit);
});

export const getRecentlyAdded = cache((limit = 8): MCPServer[] => {
  return [...getAllServers()]
    .filter((s) => s.addedAt)
    .sort((a, b) => new Date(b.addedAt!).getTime() - new Date(a.addedAt!).getTime())
    .slice(0, limit);
});

export const getCategoriesWithCounts = cache(() => {
  const counts: Record<string, number> = {};
  for (const s of data.servers) {
    for (const c of s.categories) counts[c] = (counts[c] || 0) + 1;
  }
  return counts;
});

/**
 * Lite server shape for the client-side command palette: keeps the
 * payload tiny by stripping description, tools, install snippets, etc.
 */
export type LiteServer = Pick<
  MCPServer,
  "slug" | "name" | "tagline" | "author" | "authorGithub" | "stars" | "official" | "verified" | "categories" | "tags"
>;

export const getSearchableServers = cache((): LiteServer[] => {
  return getAllServers().map((s) => ({
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    author: s.author,
    authorGithub: s.authorGithub,
    stars: s.stars,
    official: s.official,
    verified: s.verified,
    categories: s.categories,
    tags: s.tags,
  }));
});

export const getStats = cache(() => {
  const all = data.servers;
  return {
    total: all.length,
    official: all.filter((s) => s.official).length,
    verified: all.filter((s) => s.verified).length,
    totalStars: all.reduce((s, x) => s + (x.stars || 0), 0),
    runtimes: Object.entries(
      all.reduce<Record<string, number>>((acc, s) => {
        acc[s.runtime] = (acc[s.runtime] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]),
  };
});
