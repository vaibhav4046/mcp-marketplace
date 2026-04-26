import { ImageResponse } from "next/og";
import { getServerBySlug } from "@/lib/data";
import { CATEGORY_LABELS, RUNTIME_LABELS } from "@/lib/types";

export const runtime = "edge";
export const alt = "MCP server card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ServerOG({ params }: { params: { slug: string } }) {
  const server = getServerBySlug(params.slug);
  if (!server) return notFoundOg();

  const title = server.name;
  const tagline = (server.tagline || "").slice(0, 200);
  const author = server.author || "Unknown";
  const runtime = RUNTIME_LABELS[server.runtime] || "Unknown";
  const cats = server.categories.slice(0, 3).map((c) => CATEGORY_LABELS[c]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0c 0%, #14122b 50%, #0a0a0c 100%)",
          padding: 64,
          color: "#f3f5fa",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent gradient blob */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(124,92,255,0.45), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(34,211,238,0.32), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(124,92,255,0.5)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: "#fff",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
              MCP Marketplace
            </span>
            <span style={{ fontSize: 13, color: "#8c94a6", fontFamily: "monospace" }}>
              the model context protocol registry
            </span>
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 16,
              color: "#22d3ee",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {server.official ? "OFFICIAL · " : server.verified ? "VERIFIED · " : ""}
            {runtime} · by {author}
          </div>
          <div
            style={{
              fontSize: title.length > 30 ? 64 : 80,
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              maxWidth: 1080,
              background: "linear-gradient(135deg, #ffffff 0%, #c8cfdc 100%)",
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#c8cfdc",
              lineHeight: 1.35,
              maxWidth: 1000,
              display: "flex",
            }}
          >
            {tagline}
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {cats.map((c) => (
              <div
                key={c}
                style={{
                  padding: "8px 16px",
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 18,
                  color: "#c8cfdc",
                  display: "flex",
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Footer URL */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            color: "#8c94a6",
            fontFamily: "monospace",
          }}
        >
          <span>mcp-hub-registry.vercel.app/server/{server.slug}</span>
          <span style={{ color: "#22d3ee" }}>{server.tools?.length || ""}{server.tools?.length ? " tools" : ""}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

function notFoundOg() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0c",
          color: "#f3f5fa",
          fontSize: 48,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Server not in registry
      </div>
    ),
    { ...size }
  );
}
