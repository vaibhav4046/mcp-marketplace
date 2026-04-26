"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CodeBlock } from "./ui/code-block";
import type { MCPServer } from "@/lib/types";
import { prettyJson } from "@/lib/utils";

interface Props {
  server: MCPServer;
}

export function InstallTabs({ server }: Props) {
  const tabs: { id: string; label: string; render: () => React.ReactNode }[] = [];

  if (server.install.claudeCode) {
    tabs.push({
      id: "claude-code",
      label: "Claude Code",
      render: () => (
        <div className="space-y-3">
          <p className="text-xs text-fg-muted">
            Run this in your terminal to register the server with Claude Code.
          </p>
          <CodeBlock code={server.install.claudeCode!} language="bash" filename="terminal" />
        </div>
      ),
    });
  }

  if (server.install.claudeDesktop) {
    const cfg = {
      mcpServers: {
        [server.slug.replace(/-/g, "_")]: {
          command: server.install.claudeDesktop.command,
          ...(server.install.claudeDesktop.args ? { args: server.install.claudeDesktop.args } : {}),
          ...(server.install.claudeDesktop.env ? { env: server.install.claudeDesktop.env } : {}),
        },
      },
    };
    tabs.push({
      id: "claude-desktop",
      label: "Claude Desktop",
      render: () => (
        <div className="space-y-3">
          <p className="text-xs text-fg-muted">
            Add this block to your{" "}
            <code className="rounded bg-bg-muted px-1.5 py-0.5 text-[11px]">
              claude_desktop_config.json
            </code>{" "}
            then restart Claude Desktop.
          </p>
          <CodeBlock code={prettyJson(cfg)} language="json" filename="claude_desktop_config.json" />
        </div>
      ),
    });
  }

  if (server.install.cli) {
    tabs.push({
      id: "cli",
      label: "CLI / dev",
      render: () => (
        <div className="space-y-3">
          <p className="text-xs text-fg-muted">
            Run the server directly to test it locally before wiring it up.
          </p>
          <CodeBlock code={server.install.cli!} language="bash" filename="terminal" />
        </div>
      ),
    });
  }

  if (server.install.docker) {
    tabs.push({
      id: "docker",
      label: "Docker",
      render: () => (
        <div className="space-y-3">
          <p className="text-xs text-fg-muted">Run with Docker — useful in CI or on a fresh machine.</p>
          <CodeBlock code={server.install.docker!} language="bash" filename="terminal" />
        </div>
      ),
    });
  }

  if (tabs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-bg-subtle p-4 text-xs text-fg-muted">
        No install snippet recorded yet. Check the{" "}
        <a href={server.repo} target="_blank" rel="noopener" className="text-accent hover:underline">
          repository
        </a>{" "}
        for instructions.
      </p>
    );
  }

  return (
    <Tabs defaultValue={tabs[0].id}>
      <TabsList>
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            {t.render()}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
