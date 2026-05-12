import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const savings = Number(req.nextUrl.searchParams.get("savings") ?? "0");
  const annual = Math.round(savings * 12);
  const isOptimal = savings < 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top label */}
        <div style={{ display: "flex", fontSize: 24, color: "#9ca3af", marginBottom: 20, letterSpacing: 4 }}>
          AI SPEND AUDIT
        </div>

        {/* Main message */}
        <div style={{ display: "flex", fontSize: 32, color: "#6b7280", marginBottom: 8 }}>
          {isOptimal ? "No savings found —" : "We found potential savings of"}
        </div>

        {/* Big number or optimal message */}
        <div style={{ display: "flex", fontSize: isOptimal ? 72 : 110, fontWeight: 700, color: isOptimal ? "#111827" : "#16a34a", marginBottom: isOptimal ? 0 : 8 }}>
          {isOptimal ? "You are spending well" : `$${Math.round(savings)}/mo`}
        </div>

        {/* Annual savings */}
        {!isOptimal && (
          <div style={{ display: "flex", fontSize: 40, color: "#6b7280", marginBottom: 0 }}>
            {`$${annual.toLocaleString()} per year`}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", width: "80%", height: 1, background: "#e5e7eb", marginTop: 40, marginBottom: 24 }} />

        {/* Footer */}
        <div style={{ display: "flex", fontSize: 22, color: "#9ca3af" }}>
          credex-spend-audit-ten.vercel.app — free audit, no account needed
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}