import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Code2,
  Globe,
  Layers,
  Lock,
  Package,
  Rocket,
  Server,
  Terminal,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Deploy your MCP server",
  description:
    "Build, ship, and list your own Model Context Protocol server. Step-by-step from local stdio prototype to public hosted endpoint and listing on the marketplace.",
};

export default function DeployPage() {
  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="text-[11px] font-mono text-accent uppercase tracking-wider">
        Build · Ship · List
      </div>
      <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-balance">
        Deploy your own MCP server
      </h1>
      <p className="mt-4 text-fg-muted leading-relaxed text-base md:text-lg max-w-3xl">
        From a local <code className="rounded bg-bg-muted px-1.5 py-0.5 text-[12px]">stdio</code> prototype to a public HTTPS endpoint your team can install in seconds. Every step uses real, free tools.
      </p>

      {/* Stepper */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StepCard n="1" icon={<Code2 className="h-4 w-4" />} title="Build" desc="Scaffold a server with the official SDK." />
        <StepCard n="2" icon={<Terminal className="h-4 w-4" />} title="Test" desc="Run locally, hit it from Claude Code." />
        <StepCard n="3" icon={<Cloud className="h-4 w-4" />} title="Deploy" desc="Ship to Vercel, Cloudflare, or Fly." />
        <StepCard n="4" icon={<Rocket className="h-4 w-4" />} title="List" desc="Open a PR — your server lands on this site." />
      </div>

      {/* Step 1: Build */}
      <Section
        n="1"
        title="Build it"
        kicker="Pick your runtime, scaffold in 30 seconds."
        icon={<Code2 className="h-4 w-4" />}
      >
        <p className="text-fg-muted leading-relaxed">
          Anthropic ships official SDKs for TypeScript and Python. Pick one and scaffold a fresh project.
        </p>
        <Tabs defaultValue="ts" className="mt-4">
          <TabsList>
            <TabsTrigger value="ts">TypeScript</TabsTrigger>
            <TabsTrigger value="py">Python</TabsTrigger>
          </TabsList>
          <TabsContent value="ts" className="mt-3">
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# 1. New project
mkdir my-mcp && cd my-mcp
npm init -y

# 2. Install the SDK
npm install @modelcontextprotocol/sdk zod
npm install -D typescript tsx @types/node`}
            />
            <div className="mt-3">
              <CodeBlock
                language="ts"
                filename="src/index.ts"
                code={`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-mcp",
  version: "0.1.0",
});

server.tool(
  "echo",
  "Echoes a message back to the caller.",
  { message: z.string().describe("The message to echo") },
  async ({ message }) => ({
    content: [{ type: "text", text: \`echo: \${message}\` }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);`}
              />
            </div>
          </TabsContent>
          <TabsContent value="py" className="mt-3">
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# 1. New project (uv recommended)
uv init my-mcp && cd my-mcp

# 2. Install the SDK
uv add "mcp[cli]"`}
            />
            <div className="mt-3">
              <CodeBlock
                language="python"
                filename="server.py"
                code={`from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-mcp")

@mcp.tool()
def echo(message: str) -> str:
    """Echoes a message back to the caller."""
    return f"echo: {message}"

if __name__ == "__main__":
    mcp.run()`}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Step 2: Test */}
      <Section
        n="2"
        title="Test locally"
        kicker="Hook it into Claude Code in one command."
        icon={<Terminal className="h-4 w-4" />}
      >
        <p className="text-fg-muted leading-relaxed">
          The fastest feedback loop: register your local server with Claude Code and watch the tools show up.
        </p>
        <div className="mt-4 space-y-3">
          <CodeBlock
            language="bash"
            filename="terminal"
            code={`# TypeScript
claude mcp add my-mcp -- npx tsx src/index.ts

# Python
claude mcp add my-mcp -- uv run python server.py

# Verify it loaded
claude mcp list`}
          />
          <Card className="p-4 border-accent/30 bg-accent-subtle">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <div className="text-sm text-fg leading-relaxed">
                <strong className="font-semibold">Inspector tip:</strong> Run <code className="rounded bg-bg-muted px-1.5 py-0.5 text-[12px]">npx @modelcontextprotocol/inspector npx tsx src/index.ts</code> to debug requests and responses interactively in a browser UI.
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Step 3: Deploy */}
      <Section
        n="3"
        title="Deploy"
        kicker="Public HTTPS endpoint in under 5 minutes."
        icon={<Cloud className="h-4 w-4" />}
      >
        <p className="text-fg-muted leading-relaxed">
          Three battle-tested paths. All free at a startup-scale tier. Pick the one that matches the runtime you used in step&nbsp;1.
        </p>

        <Tabs defaultValue="vercel" className="mt-4">
          <TabsList>
            <TabsTrigger value="vercel">
              <Globe className="h-3.5 w-3.5" />
              Vercel
            </TabsTrigger>
            <TabsTrigger value="cloudflare">
              <Cloud className="h-3.5 w-3.5" />
              Cloudflare Workers
            </TabsTrigger>
            <TabsTrigger value="fly">
              <Server className="h-3.5 w-3.5" />
              Fly / Render / Railway
            </TabsTrigger>
            <TabsTrigger value="self">
              <Layers className="h-3.5 w-3.5" />
              Self-host (Docker)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vercel" className="mt-4 space-y-3">
            <p className="text-sm text-fg-muted">
              Best for TypeScript servers using the streamable-HTTP transport. Zero config — push the repo, Vercel detects it.
            </p>
            <CodeBlock
              language="ts"
              filename="api/mcp/route.ts"
              code={`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamable-http.js";

const server = new McpServer({ name: "my-mcp", version: "0.1.0" });
// ... register tools, resources, prompts

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);

export async function POST(req: Request) {
  return transport.handleRequest(req);
}`}
            />
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`npm i -g vercel
vercel --prod
# Your server is live at https://your-app.vercel.app/api/mcp`}
            />
          </TabsContent>

          <TabsContent value="cloudflare" className="mt-4 space-y-3">
            <p className="text-sm text-fg-muted">
              Edge-runtime, sub-50ms cold starts, free tier covers most workloads. Cloudflare ships an official MCP agent template.
            </p>
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# Use Cloudflare's MCP starter
npm create cloudflare@latest my-mcp -- --template=cloudflare/ai/demos/remote-mcp-authless

cd my-mcp
npx wrangler login
npx wrangler deploy
# Your server is live at https://my-mcp.<account>.workers.dev`}
            />
          </TabsContent>

          <TabsContent value="fly" className="mt-4 space-y-3">
            <p className="text-sm text-fg-muted">
              Best for Python or long-running stdio bridges. Works the same on Fly, Render, and Railway.
            </p>
            <CodeBlock
              language="dockerfile"
              filename="Dockerfile"
              code={`FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml ./
RUN pip install uv && uv sync --frozen
COPY . .
EXPOSE 8000
CMD ["uv", "run", "python", "server.py", "--http", "--port", "8000"]`}
            />
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# Fly
fly launch --no-deploy
fly deploy
# → https://<app>.fly.dev`}
            />
          </TabsContent>

          <TabsContent value="self" className="mt-4 space-y-3">
            <p className="text-sm text-fg-muted">
              Total control, your own infra. Build the image, run it behind a reverse proxy with TLS.
            </p>
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`docker build -t my-mcp .
docker run -d --name my-mcp -p 8000:8000 \\
  -e API_KEY=$API_KEY \\
  --restart unless-stopped \\
  my-mcp

# Front it with Caddy or nginx for TLS.`}
            />
          </TabsContent>
        </Tabs>

        <Card className="p-4 mt-5 border-warn/30 bg-warn/5">
          <div className="flex items-start gap-3">
            <Lock className="h-4 w-4 text-warn mt-0.5 shrink-0" />
            <div className="text-sm text-fg-muted leading-relaxed">
              <strong className="font-semibold text-fg">Auth checklist before going public:</strong> rate-limit per IP, validate every input with a schema, never log secrets, scope API keys to the minimum permissions, and treat any tool that mutates state as if a stranger could call it (because they can).
            </div>
          </div>
        </Card>
      </Section>

      {/* Step 4: List */}
      <Section
        n="4"
        title="List on this marketplace"
        kicker="Get discovered. Open one PR."
        icon={<Rocket className="h-4 w-4" />}
      >
        <p className="text-fg-muted leading-relaxed">
          Once your server is on a public repo, add an entry to{" "}
          <code className="rounded bg-bg-muted px-1.5 py-0.5 text-[12px]">data/servers.seed.json</code>. The daily auto-sync also picks up servers indexed by Glama, but a hand-curated entry gets you featured placement, richer metadata, and tool-schema previews.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/submit"
            className="group rounded-xl border border-border bg-bg-subtle p-4 hover-lift hover:border-accent/40"
          >
            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-fg">Submit a server →</div>
                <p className="text-xs text-fg-muted mt-1">Open a PR or issue with the entry.</p>
              </div>
            </div>
          </Link>
          <a
            href="https://github.com/vaibhav4046/mcp-marketplace/blob/main/lib/types.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border bg-bg-subtle p-4 hover-lift hover:border-accent/40"
          >
            <div className="flex items-start gap-3">
              <Code2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-fg">Entry schema →</div>
                <p className="text-xs text-fg-muted mt-1">Full TypeScript types for the registry shape.</p>
              </div>
            </div>
          </a>
        </div>
      </Section>

      {/* Resources */}
      <div className="mt-16 pt-8 border-t border-border">
        <div className="text-[11px] font-mono text-fg-muted uppercase tracking-wider">
          Reference
        </div>
        <h2 className="mt-1 text-xl font-semibold">Useful links</h2>
        <ul className="mt-3 grid gap-1.5 text-sm text-fg-muted">
          <li>
            <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="hover:text-fg inline-flex items-center gap-1.5">
              modelcontextprotocol.io <ArrowRight className="h-3 w-3" />
            </a>
            <span className="text-fg-subtle"> — official spec, transports, capability matrix</span>
          </li>
          <li>
            <a href="https://github.com/modelcontextprotocol/typescript-sdk" target="_blank" rel="noopener noreferrer" className="hover:text-fg inline-flex items-center gap-1.5">
              TypeScript SDK <ArrowRight className="h-3 w-3" />
            </a>
          </li>
          <li>
            <a href="https://github.com/modelcontextprotocol/python-sdk" target="_blank" rel="noopener noreferrer" className="hover:text-fg inline-flex items-center gap-1.5">
              Python SDK <ArrowRight className="h-3 w-3" />
            </a>
          </li>
          <li>
            <a href="https://github.com/modelcontextprotocol/inspector" target="_blank" rel="noopener noreferrer" className="hover:text-fg inline-flex items-center gap-1.5">
              MCP Inspector <ArrowRight className="h-3 w-3" />
            </a>
            <span className="text-fg-subtle"> — interactive debugger</span>
          </li>
          <li>
            <a href="https://docs.anthropic.com/en/docs/claude-code/mcp" target="_blank" rel="noopener noreferrer" className="hover:text-fg inline-flex items-center gap-1.5">
              Claude Code MCP docs <ArrowRight className="h-3 w-3" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

function StepCard({
  n,
  icon,
  title,
  desc,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-subtle p-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-fg-subtle uppercase tracking-wider">
          step {n}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-accent-subtle text-accent grid place-items-center">
          {icon}
        </div>
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-xs text-fg-muted leading-relaxed mt-2">{desc}</p>
    </div>
  );
}

function Section({
  n,
  title,
  kicker,
  icon,
  children,
}: {
  n: string;
  title: string;
  kicker: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 scroll-mt-20" id={`step-${n}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-[hsl(180,80%,60%)] text-accent-fg grid place-items-center font-bold text-sm shadow-md shadow-accent/20">
          {n}
        </div>
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-fg-subtle uppercase tracking-wider">
            {icon}
            <span>step {n}</span>
          </div>
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">{title}</h2>
      <p className="text-fg-muted mt-1 text-base">{kicker}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
