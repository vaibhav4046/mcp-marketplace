import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { CommandPaletteProvider } from "@/components/command-palette";
import { Header } from "@/components/header";
import { getAllServers } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mcp-marketplace.vercel.app"),
  title: {
    default: "MCP Marketplace — Discover Model Context Protocol servers",
    template: "%s · MCP Marketplace",
  },
  description:
    "Browse, search, and install Model Context Protocol (MCP) servers. Auto-synced from upstream registries — official, verified, and community.",
  keywords: [
    "MCP",
    "Model Context Protocol",
    "Claude",
    "Claude Code",
    "Claude Desktop",
    "Anthropic",
    "agents",
    "AI tools",
    "mcp servers",
    "marketplace",
  ],
  authors: [{ name: "Vaibhav Lalwani", url: "https://github.com/vaibhav4046" }],
  creator: "Vaibhav Lalwani",
  openGraph: {
    type: "website",
    title: "MCP Marketplace — Discover Model Context Protocol servers",
    description:
      "Browse, search, and install MCP servers. Auto-synced from upstream registries.",
    siteName: "MCP Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP Marketplace",
    description: "Browse and install Model Context Protocol servers.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const servers = getAllServers();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <CommandPaletteProvider servers={servers}>
            <Header />
            <main>{children}</main>
            <Footer />
          </CommandPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-accent to-[hsl(180,80%,60%)] grid place-items-center text-[10px] font-bold text-accent-fg">
              M
            </div>
            <span className="font-semibold text-sm">MCP Marketplace</span>
          </div>
          <p className="text-fg-muted leading-relaxed max-w-xs">
            An open registry of Model Context Protocol servers. Auto-synced from upstream sources daily.
          </p>
        </div>
        <div>
          <div className="font-medium text-fg mb-2">Resources</div>
          <ul className="space-y-1.5 text-fg-muted">
            <li>
              <a className="hover:text-fg" href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
                MCP spec
              </a>
            </li>
            <li>
              <a className="hover:text-fg" href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noopener noreferrer">
                Reference servers
              </a>
            </li>
            <li>
              <a className="hover:text-fg" href="https://docs.anthropic.com/en/docs/claude-code/mcp" target="_blank" rel="noopener noreferrer">
                Claude Code MCP docs
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-fg mb-2">Project</div>
          <ul className="space-y-1.5 text-fg-muted">
            <li>
              <a className="hover:text-fg" href="https://github.com/vaibhav4046/mcp-marketplace" target="_blank" rel="noopener noreferrer">
                Source on GitHub
              </a>
            </li>
            <li>
              <a className="hover:text-fg" href="/submit">Submit a server</a>
            </li>
            <li>
              <a className="hover:text-fg" href="https://github.com/vaibhav4046/mcp-marketplace/issues" target="_blank" rel="noopener noreferrer">
                Report an issue
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-fg-subtle">
          <span>
            Built by{" "}
            <a className="text-fg-muted hover:text-fg" href="https://github.com/vaibhav4046">
              @vaibhav4046
            </a>
            . Not affiliated with Anthropic.
          </span>
          <span>MIT licensed · {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
