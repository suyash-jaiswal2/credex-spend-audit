import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "AI Spend Audit — free tool for startups";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#6b7280",
            marginBottom: 24,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Free tool for startups
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 1.1,
          }}
        >
          Are you overpaying for AI tools?
        </div>

        <div
          style={{
            fontSize: 32,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          2-minute audit. No account needed.
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: 32,
            width: "100%",
            textAlign: "center",
          }}
        >
          credex-spend-audit.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}