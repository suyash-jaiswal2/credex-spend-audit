import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/groq";
import { supabaseAdmin } from "@/lib/supabase";
import type { AuditInput, AuditResult } from "@/types";

// Simple in-memory rate limit: max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (entry.count >= 10) return true;

  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input: AuditInput = body.input;

    // Honeypot check — bots fill this field, humans don't see it
    if (body._hp && body._hp !== "") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!input?.tools || !Array.isArray(input.tools)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const partial = runAudit(input);
    const tempResult: AuditResult = { ...partial, summary: "" };
    const summary = await generateAuditSummary(tempResult);

    // Persist to Supabase
    const { error } = await supabaseAdmin
      .from("audits")
      .insert({
        id: partial.id,
        input: partial.input,
        recommendations: partial.recommendations,
        total_monthly_savings: partial.totalMonthlySavings,
        total_annual_savings: partial.totalAnnualSavings,
        summary,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      // Still return result even if DB fails — don't block the user
      return NextResponse.json({ ...tempResult, summary });
    }

    const result: AuditResult = { ...partial, summary };
    return NextResponse.json(result);
  } catch (err) {
    console.error("Audit API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}