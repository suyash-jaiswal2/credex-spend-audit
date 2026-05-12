import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const alt = "AI Spend Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("audits")
    .select("total_monthly_savings, total_annual_savings")
    .eq("id", id)
    .single();

  const savings = data?.total_monthly_savings ?? 0;
  const annual = data?.total_annual_savings ?? 0;
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
        {/* Top label */}
        <div
          style={{
            fontSize: 28,
            color: "#6b7280",
            marginBottom: 24,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          AI Spend Audit
        </div>

        {/* Main number */}
        {isOptimal ? (
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 16,
            }}
          >
            You&apos;re spending well ✓
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: "#16a34a",
                marginBottom: 8,
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
              ${Math.round(annual)} saved per year
            </div>
          </>
        )}

        {/* Bottom tag */}
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
          Free audit at credex-spend-audit.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}