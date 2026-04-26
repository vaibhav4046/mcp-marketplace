"use client";

import Link from "next/link";
import * as React from "react";
import { Github, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { CommandPaletteTrigger } from "./command-palette";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-7 w-7 rounded-md bg-gradient-to-br from-accent to-[hsl(180,80%,60%)] grid place-items-center text-accent-fg font-bold text-sm shadow-md shadow-accent/20">
            <span className="font-mono">M</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">
              MCP <span className="text-fg-muted font-normal">Marketplace</span>
            </span>
            <span className="text-[10px] text-fg-subtle font-mono mt-0.5 hidden sm:inline-block">
              the model context protocol registry
            </span>
          </div>
        </Link>

        <CommandPaletteTrigger />

        <div className="flex items-center gap-1">
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-fg-muted hover:text-fg rounded-md hover:bg-bg-muted transition-colors"
          >
            Submit
          </Link>
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-fg-muted hover:text-fg rounded-md hover:bg-bg-muted transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/vaibhav4046/mcp-marketplace"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-subtle text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
