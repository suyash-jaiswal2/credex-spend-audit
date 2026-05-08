import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/groq";
import type { AuditInput, AuditResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const input: AuditInput = await req.json();

    // Basic validation
    if (!input.tools || !Array.isArray(input.tools)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const partial = runAudit(input);
    const summary = await generateAuditSummary({ ...partial, summary: "" });
    const result: AuditResult = { ...partial, summary };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Audit API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}