import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

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
            textTransform: "uppercase",
          }}
        >
          AI Spend Audit
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
            You&apos;re spending well ✓
          </div>
        ) : (
          <>
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
                marginBottom: 48,
              }}
            >
              ${annual.toLocaleString()} saved per year
            </div>
          </>
        )}

        <div
          style={{
            fontSize: 22,
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: 28,
            width: "100%",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Free audit · credex-spend-audit-ten.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}