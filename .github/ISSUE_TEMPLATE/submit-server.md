---
name: Submit a server
about: Add a new MCP server to the registry
title: "Submit: <Server name>"
labels: ["new-server", "needs-review"]
---

<!-- Fill in as much as you can; curators will fill the rest. -->

**Name:**
**Slug (lowercase-dash-case):**
**One-line tagline:**
**Repository URL:**
**Author / org:**
**Author GitHub handle (optional):**
**Runtime:** node / python / go / rust / deno / bun / docker / binary / unknown
**Transports:** stdio / http / sse (pick one or more)
**Categories:** see [valid categories](https://github.com/vaibhav4046/mcp-marketplace/blob/main/lib/types.ts#L4) — pick 1–3
**Tags (comma-separated):**
**License (SPDX id):**
**Requires API key / OAuth?** yes / no

**Install — Claude Desktop config block:**

```json
{
  "command": "npx",
  "args": ["-y", "your-server"]
}
```

**Install — Claude Code one-liner (optional):**

```bash
claude mcp add my-server -- npx -y your-server
```

**Long description (Markdown allowed):**

…
