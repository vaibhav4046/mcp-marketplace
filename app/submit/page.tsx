import Link from "next/link";
import { ArrowLeft, Github, GitPullRequestArrow, Send } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Submit an MCP server",
};

const sampleEntry = `{
  "slug": "my-awesome-server",
  "name": "My Awesome Server",
  "tagline": "One-line elevator pitch.",
  "description": "Longer Markdown description.",
  "author": "Your Name",
  "authorGithub": "yourhandle",
  "repo": "https://github.com/you/my-awesome-server",
  "runtime": "node",
  "transports": ["stdio"],
  "categories": ["productivity"],
  "tags": ["awesome"],
  "install": {
    "claudeDesktop": {
      "command": "npx",
      "args": ["-y", "my-awesome-server"]
    },
    "cli": "npx -y my-awesome-server"
  },
  "tools": [
    { "name": "do_thing", "description": "Does the thing." }
  ],
  "license": "MIT",
  "source": "community"
}`;

export default function SubmitPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="text-[11px] font-mono text-accent uppercase tracking-wider">
        Contribute
      </div>
      <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
        Submit an MCP server
      </h1>
      <p className="mt-3 text-fg-muted leading-relaxed max-w-2xl">
        Two ways: open a pull request adding your entry to{" "}
        <code className="rounded bg-bg-muted px-1.5 py-0.5 text-[12px]">data/servers.json</code>,
        or open an issue with the details and a curator will add it. Daily auto-sync also pulls from upstream registries.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <PathCard
          icon={<GitPullRequestArrow className="h-4 w-4" />}
          title="Open a pull request"
          description="Fastest path. Add your entry, run the typecheck, open the PR."
          href="https://github.com/vaibhav4046/mcp-marketplace/edit/main/data/servers.json"
          cta="Edit servers.json"
        />
        <PathCard
          icon={<Send className="h-4 w-4" />}
          title="File an issue"
          description="Don't want to PR? Drop the details and we'll add it."
          href="https://github.com/vaibhav4046/mcp-marketplace/issues/new?template=submit-server.md&title=Submit%3A+"
          cta="Open issue"
        />
      </div>

      <h2 className="mt-12 text-xl font-semibold">Entry shape</h2>
      <p className="mt-2 text-sm text-fg-muted">
        Append a new object to the <code className="rounded bg-bg-muted px-1.5 py-0.5 text-[12px]">servers</code> array. Most fields are optional — name, slug, tagline, repo, and runtime are the bare minimum.
      </p>
      <div className="mt-4">
        <CodeBlock code={sampleEntry} language="json" filename="data/servers.json" />
      </div>

      <Card className="mt-8 p-5">
        <h3 className="font-semibold">What gets accepted</h3>
        <ul className="mt-3 space-y-2 text-sm text-fg-muted">
          <li>• Servers that implement a real MCP server (stdio, http, or sse).</li>
          <li>• Public source-available repos. Closed-source allowed if there's a public install path.</li>
          <li>• Reasonable description, tagline, and at least one install snippet.</li>
        </ul>
        <h3 className="font-semibold mt-5">What doesn't</h3>
        <ul className="mt-3 space-y-2 text-sm text-fg-muted">
          <li>• Pure stubs, demos with no working tools, or duplicates of existing entries.</li>
          <li>• Servers behind login walls with no public docs or repo.</li>
        </ul>
      </Card>

      <div className="mt-12 flex items-center gap-2 text-xs text-fg-subtle">
        <Github className="h-3.5 w-3.5" />
        Source on{" "}
        <a
          href="https://github.com/vaibhav4046/mcp-marketplace"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}

function PathCard({
  icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-border bg-bg-subtle p-5 hover-lift hover:border-accent/40"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-accent-subtle text-accent grid place-items-center shrink-0">
          {icon}
        </div>
        <div>
          <div className="font-semibold text-fg">{title}</div>
          <p className="text-xs text-fg-muted leading-relaxed mt-1">{description}</p>
          <div className="mt-3 text-xs font-medium text-accent group-hover:underline">
            {cta} →
          </div>
        </div>
      </div>
    </a>
  );
}
