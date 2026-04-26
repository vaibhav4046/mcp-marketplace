"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";

interface Props {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, language, filename, className }: Props) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    if (await copyToClipboard(code)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className={cn("group relative rounded-lg border border-border bg-bg-subtle overflow-hidden", className)}>
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-border bg-bg-muted px-3 py-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-fg-subtle">
            {filename && <span className="text-fg-muted">{filename}</span>}
            {language && (
              <span className="rounded border border-border bg-bg-inset px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                {language}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-fg-muted hover:text-fg hover:bg-bg-inset transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed font-mono">
        <code className="text-fg">{code}</code>
      </pre>
      {!filename && !language && (
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-2 top-2 flex items-center gap-1 rounded border border-border bg-bg-muted/80 backdrop-blur px-2 py-1 text-[11px] text-fg-muted opacity-0 group-hover:opacity-100 hover:text-fg hover:bg-bg-inset transition-all"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}
