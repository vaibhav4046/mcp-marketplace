import { ImageResponse } from "next/og";
import { getStats } from "@/lib/data";

export const runtime = "edge";
export const alt = "MCP Marketplace — Discover Model Context Protocol servers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function HomeOG() {
  const stats = getStats();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0c 0%, #14122b 50%, #0a0a0c 100%)",
          padding: 80,
          color: "#f3f5fa",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -150,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 600,
            borderRadius: 9999,
            background: "radial-gradient(ellipse, rgba(124,92,255,0.42), transparent 65%)",
            filter: "blur(60px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 32px rgba(124,92,255,0.6)",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 9999, background: "#fff" }} />
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>
            MCP Marketplace
          </span>
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -2.5,
            lineHeight: 1,
            maxWidth: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c8cfdc 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Discover {stats.total}+
          </span>
          <span
            style={{
              background: "linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            MCP servers
          </span>
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#c8cfdc",
            marginTop: 28,
            maxWidth: 880,
            lineHeight: 1.35,
            display: "flex",
          }}
        >
          Browse, search, and install Model Context Protocol servers for Claude Code, Claude Desktop, and Cursor.
        </div>

        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
            fontFamily: "monospace",
            fontSize: 18,
            color: "#8c94a6",
          }}
        >
          <span>{stats.total} servers</span>
          <span style={{ color: "#5a6378" }}>·</span>
          <span>{stats.official} official</span>
          <span style={{ color: "#5a6378" }}>·</span>
          <span>auto-synced daily</span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "#5a6378",
            fontFamily: "monospace",
          }}
        >
          mcp-hub-registry.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
