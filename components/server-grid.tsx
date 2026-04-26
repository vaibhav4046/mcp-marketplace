"use client";

import * as React from "react";
import Fuse from "fuse.js";
import { Filter, Search, X } from "lucide-react";
import type { MCPServer, ServerCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ServerCard } from "./server-card";
import { Badge } from "./ui/badge";

interface Props {
  servers: MCPServer[];
  categoryCounts: Record<string, number>;
}

type SortKey = "stars" | "recent" | "alpha";

export function ServerGrid({ servers, categoryCounts }: Props) {
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<ServerCategory | "all">("all");
  const [authOnly, setAuthOnly] = React.useState<"all" | "no-auth" | "auth">("all");
  const [sort, setSort] = React.useState<SortKey>("stars");

  const fuse = React.useMemo(
    () =>
      new Fuse(servers, {
        keys: [
          { name: "name", weight: 3 },
          { name: "tagline", weight: 2 },
          { name: "tags", weight: 1.4 },
          { name: "categories", weight: 1.2 },
          { name: "author", weight: 1 },
          { name: "description", weight: 0.6 },
        ],
        threshold: 0.36,
        ignoreLocation: true,
      }),
    [servers]
  );

  const filtered = React.useMemo(() => {
    let list = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : [...servers];

    if (activeCategory !== "all") {
      list = list.filter((s) => s.categories.includes(activeCategory));
    }
    if (authOnly === "auth") list = list.filter((s) => s.authRequired);
    if (authOnly === "no-auth") list = list.filter((s) => !s.authRequired);

    list.sort((a, b) => {
      if (sort === "stars") return (b.stars ?? 0) - (a.stars ?? 0);
      if (sort === "recent") {
        const ta = new Date(a.lastUpdated || a.addedAt || 0).getTime();
        const tb = new Date(b.lastUpdated || b.addedAt || 0).getTime();
        return tb - ta;
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [servers, fuse, query, activeCategory, authOnly, sort]);

  const categories = React.useMemo(() => {
    return (Object.keys(categoryCounts) as ServerCategory[])
      .filter((c) => c !== "official")
      .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
  }, [categoryCounts]);

  const hasFilters = query || activeCategory !== "all" || authOnly !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter servers by name, tag, or author…"
            className="w-full h-10 rounded-md border border-border bg-bg-subtle pl-9 pr-3 text-sm placeholder:text-fg-subtle focus:bg-bg focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center text-fg-subtle hover:text-fg rounded-md hover:bg-bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SegmentedControl
            options={[
              { v: "all", l: "All" },
              { v: "no-auth", l: "No-auth" },
              { v: "auth", l: "Auth req." },
            ]}
            value={authOnly}
            onChange={(v) => setAuthOnly(v as "all" | "no-auth" | "auth")}
          />
          <SegmentedControl
            options={[
              { v: "stars", l: "Popular" },
              { v: "recent", l: "Recent" },
              { v: "alpha", l: "A–Z" },
            ]}
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <CategoryChip
          label="All"
          count={servers.length}
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c}
            label={CATEGORY_LABELS[c]}
            count={categoryCounts[c]}
            active={activeCategory === c}
            onClick={() => setActiveCategory(c)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-bg-subtle p-12 text-center">
          <Filter className="h-6 w-6 mx-auto mb-2 text-fg-subtle" />
          <div className="text-sm text-fg">No servers match those filters.</div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory("all");
                setAuthOnly("all");
              }}
              className="mt-3 text-xs text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-[11px] text-fg-subtle font-mono">
            {filtered.length} server{filtered.length === 1 ? "" : "s"}
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                  setAuthOnly("all");
                }}
                className="ml-3 text-accent hover:underline"
              >
                clear filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <ServerCard key={s.slug} server={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 h-7 rounded-full px-3 text-[11px] font-medium transition-all border",
        active
          ? "bg-accent text-accent-fg border-accent shadow-sm shadow-accent/20"
          : "bg-bg-subtle text-fg-muted border-border hover:bg-bg-muted hover:text-fg"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded px-1 py-0.5 text-[10px] font-mono",
          active ? "bg-accent-fg/20" : "bg-bg-inset"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; l: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-bg-subtle p-0.5">
      {options.map((opt) => (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          className={cn(
            "h-7 px-2.5 text-[11px] font-medium rounded transition-colors",
            value === opt.v
              ? "bg-bg text-fg shadow-sm"
              : "text-fg-muted hover:text-fg"
          )}
        >
          {opt.l}
        </button>
      ))}
    </div>
  );
}
