import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const savings = Number(req.nextUrl.searchParams.get("savings") ?? "0");
  const isOptimal = savings < 100;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
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
            fontSize: 26,
            color: "#6b7280",
            marginBottom: 24,
            letterSpacing: "0.08em",
          }}
        >
          AI SPEND AUDIT
        </div>

        {isOptimal ? (
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Your stack is optimised
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                fontSize: 100,
                fontWeight: 700,
                color: "#16a34a",
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              ${Math.round(savings)}/mo
            </div>
            <div
              style={{
                fontSize: 36,
                color: "#6b7280",
              }}
            >
              ${Math.round(savings * 12).toLocaleString()} saved per year
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#9ca3af",
            marginTop: 48,
          }}
        >
          credex-spend-audit-ten.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}