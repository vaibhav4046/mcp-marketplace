"use client";

import * as React from "react";
import Link from "next/link";
import { Github, Menu, Rocket, Send, BookOpen, X } from "lucide-react";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-subtle text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors tap-scale"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 sm:hidden bg-fg/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-y-0 right-0 w-[78%] max-w-xs bg-bg border-l border-border shadow-2xl animate-slide-down"
            style={{ animationName: "slide-up" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="h-8 w-8 grid place-items-center rounded-md hover:bg-bg-muted text-fg-muted hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col p-3 stagger">
              <MobileLink href="/deploy" icon={<Rocket className="h-4 w-4" />} onClick={() => setOpen(false)}>
                Deploy your MCP
              </MobileLink>
              <MobileLink href="/submit" icon={<Send className="h-4 w-4" />} onClick={() => setOpen(false)}>
                Submit a server
              </MobileLink>
              <MobileLink
                href="https://modelcontextprotocol.io"
                external
                icon={<BookOpen className="h-4 w-4" />}
              >
                MCP docs
              </MobileLink>
              <MobileLink
                href="https://github.com/vaibhav4046/mcp-marketplace"
                external
                icon={<Github className="h-4 w-4" />}
              >
                Source on GitHub
              </MobileLink>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  icon,
  external,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const Tag: React.ElementType = external ? "a" : Link;
  const extra = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Tag
      href={href}
      onClick={onClick}
      {...extra}
      className="flex items-center gap-3 px-3 py-3 rounded-md text-fg hover:bg-bg-muted transition-colors text-sm"
    >
      <span className="h-7 w-7 rounded-md bg-bg-subtle border border-border grid place-items-center text-accent">
        {icon}
      </span>
      {children}
    </Tag>
  );
}
