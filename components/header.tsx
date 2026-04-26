"use client";

import Link from "next/link";
import * as React from "react";
import { Github } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { CommandPaletteTrigger } from "./command-palette";
import { MobileMenu } from "./mobile-menu";
import { ScrollProgress } from "./scroll-progress";

export function Header() {
  return (
    <>
      <ScrollProgress />
      <header className="sticky top-0 z-40 w-full border-b border-border glass">
        <div className="container flex h-14 items-center justify-between gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.svg"
              alt="MCP Marketplace logo"
              width={32}
              height={32}
              className="rounded-md shadow-md shadow-accent/20 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300 ease-swift"
            />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">
                MCP <span className="text-fg-muted font-normal hidden xs:inline">Marketplace</span>
              </span>
              <span className="text-[10px] text-fg-subtle font-mono mt-0.5 hidden md:inline-block">
                the model context protocol registry
              </span>
            </div>
          </Link>

          <CommandPaletteTrigger />

          <div className="flex items-center gap-1">
            <Link
              href="/deploy"
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-fg-muted hover:text-fg rounded-md hover:bg-bg-muted transition-colors tap-scale"
            >
              Deploy yours
            </Link>
            <Link
              href="/submit"
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-fg-muted hover:text-fg rounded-md hover:bg-bg-muted transition-colors tap-scale"
            >
              Submit
            </Link>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-fg-muted hover:text-fg rounded-md hover:bg-bg-muted transition-colors tap-scale"
            >
              Docs
            </a>
            <a
              href="https://github.com/vaibhav4046/mcp-marketplace"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hidden xs:inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-subtle text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors tap-scale"
            >
              <Github className="h-4 w-4" />
            </a>
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}
