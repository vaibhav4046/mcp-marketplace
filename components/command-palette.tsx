"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search, Command, ArrowRight, Star, ShieldCheck } from "lucide-react";
import type { LiteServer } from "@/lib/data";
import { cn, formatCount } from "@/lib/utils";

const CommandPaletteContext = React.createContext<{
  open: () => void;
  servers: LiteServer[];
} | null>(null);

export function CommandPaletteProvider({
  servers,
  children,
}: {
  servers: LiteServer[];
  children: React.ReactNode;
}) {
  const [openState, setOpenState] = React.useState(false);
  const open = React.useCallback(() => setOpenState(true), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenState((s) => !s);
      }
      if (e.key === "Escape") setOpenState(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, servers }}>
      {children}
      {openState && (
        <CommandPalette servers={servers} onClose={() => setOpenState(false)} />
      )}
    </CommandPaletteContext.Provider>
  );
}

function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext);
  return ctx;
}

export function CommandPaletteTrigger() {
  const ctx = useCommandPalette();
  return (
    <button
      type="button"
      onClick={() => ctx?.open()}
      className="flex-1 max-w-md flex items-center gap-2 h-9 rounded-md border border-border bg-bg-subtle px-3 text-fg-subtle text-xs hover:bg-bg-muted hover:border-border-strong transition-colors"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-left truncate">Search MCP servers, tools, categories…</span>
      <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono">
        <kbd className="rounded border border-border bg-bg-muted px-1 py-0.5">⌘</kbd>
        <kbd className="rounded border border-border bg-bg-muted px-1 py-0.5">K</kbd>
      </span>
    </button>
  );
}

function CommandPalette({
  servers,
  onClose,
}: {
  servers: LiteServer[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fuse = React.useMemo(
    () =>
      new Fuse(servers, {
        keys: [
          { name: "name", weight: 3 },
          { name: "tagline", weight: 2 },
          { name: "tags", weight: 1.5 },
          { name: "categories", weight: 1.2 },
          { name: "author", weight: 1 },
        ],
        threshold: 0.36,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [servers]
  );

  const results = React.useMemo(() => {
    if (!query.trim()) return servers.slice(0, 12);
    return fuse.search(query, { limit: 20 }).map((r) => r.item);
  }, [query, fuse, servers]);

  React.useEffect(() => {
    setActive(0);
  }, [query]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        const r = results[active];
        if (r) {
          router.push(`/server/${r.slug}`);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, active, router, onClose]);

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx='${active}']`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search MCP servers"
      className="fixed inset-0 z-50 grid place-items-start pt-[12vh] px-4 bg-fg/30 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border bg-bg shadow-2xl overflow-hidden animate-slide-up"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-fg-subtle shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 'github', 'postgres', 'browser', 'memory'…"
            className="flex-1 bg-transparent text-sm placeholder:text-fg-subtle focus:outline-none"
          />
          <kbd className="hidden sm:inline rounded border border-border bg-bg-muted px-1.5 py-0.5 text-[10px] font-mono text-fg-subtle">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-fg-subtle">
              No servers match
              <span className="font-medium text-fg"> "{query}"</span>.
              <div className="mt-2 text-xs">
                Try keywords like{" "}
                <code className="rounded bg-bg-muted px-1.5 py-0.5">database</code>,{" "}
                <code className="rounded bg-bg-muted px-1.5 py-0.5">browser</code>, or{" "}
                <code className="rounded bg-bg-muted px-1.5 py-0.5">memory</code>.
              </div>
            </div>
          ) : (
            results.map((s, i) => (
              <Link
                key={s.slug}
                data-idx={i}
                href={`/server/${s.slug}`}
                onClick={onClose}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex items-start gap-3 px-4 py-2.5 text-sm transition-colors",
                  i === active ? "bg-bg-muted" : "hover:bg-bg-subtle"
                )}
              >
                <div className="mt-0.5 h-7 w-7 rounded-md bg-bg-muted border border-border grid place-items-center text-[11px] font-mono text-fg-muted shrink-0">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-fg truncate">{s.name}</span>
                    {s.official && (
                      <ShieldCheck className="h-3 w-3 text-accent shrink-0" aria-label="Official" />
                    )}
                    <span className="text-[10px] text-fg-subtle truncate ml-1">
                      by {s.author}
                    </span>
                  </div>
                  <div className="text-xs text-fg-muted truncate mt-0.5">
                    {s.tagline}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-fg-subtle shrink-0">
                  {s.stars ? (
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      {formatCount(s.stars)}
                    </span>
                  ) : null}
                  <ArrowRight className="h-3 w-3 opacity-50" />
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-bg-subtle px-4 py-2 text-[11px] text-fg-subtle">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-bg-muted px-1 py-0.5 font-mono">↵</kbd>
              open
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
