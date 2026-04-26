"use client";

import * as React from "react";
import { ChevronRight, Wrench } from "lucide-react";
import type { MCPTool } from "@/lib/types";
import { cn, prettyJson } from "@/lib/utils";

interface Props {
  tools: MCPTool[];
}

export function ToolList({ tools }: Props) {
  const [open, setOpen] = React.useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (!tools.length) {
    return (
      <p className="text-xs text-fg-muted">No tools recorded for this server yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-bg-subtle overflow-hidden">
      {tools.map((tool) => {
        const isOpen = open.has(tool.name);
        return (
          <li key={tool.name}>
            <button
              type="button"
              onClick={() => toggle(tool.name)}
              className="w-full flex items-start gap-3 text-left px-4 py-3 hover:bg-bg-muted transition-colors"
              aria-expanded={isOpen}
            >
              <div className="mt-0.5 h-7 w-7 rounded-md bg-bg-inset border border-border grid place-items-center text-fg-muted shrink-0">
                <Wrench className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[12.5px] text-fg">{tool.name}</div>
                {tool.description && (
                  <div className="text-[12px] text-fg-muted leading-relaxed mt-0.5">
                    {tool.description}
                  </div>
                )}
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-fg-subtle transition-transform shrink-0 mt-1",
                  isOpen && "rotate-90"
                )}
              />
            </button>
            {isOpen && tool.inputSchema && (
              <div className="px-4 pb-4 -mt-1">
                <div className="rounded-md border border-border bg-bg p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-fg-subtle mb-1.5">
                    Input schema
                  </div>
                  <pre className="text-[11.5px] font-mono text-fg-muted overflow-x-auto">
                    {prettyJson(tool.inputSchema)}
                  </pre>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
