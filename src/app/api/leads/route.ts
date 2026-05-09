import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Honeypot
    if (body._hp && body._hp !== "") {
      return NextResponse.json({ ok: true }); // silent reject
    }

    const { auditId, email, company, role } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Get audit for the email content
    const { data: audit } = await supabaseAdmin
      .from("audits")
      .select("total_monthly_savings, total_annual_savings, summary")
      .eq("id", auditId)
      .single();

    // Save lead
    await supabaseAdmin.from("leads").insert({
      audit_id: auditId,
      email,
      company_name: company ?? null,
      role: role ?? null,
    });

    const isHighSavings = audit && audit.total_monthly_savings > 500;
    const auditUrl = `${process.env.NEXT_PUBLIC_APP_URL}/audit/${auditId}`;

    // Send confirmation email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: audit
        ? `Your AI spend audit — $${Number(audit.total_monthly_savings).toFixed(0)}/mo in savings found`
        : "Your AI spend audit",
      html: `
        <p>Hi${company ? ` from ${company}` : ""},</p>
        <p>Your AI spend audit is ready.</p>
        ${audit ? `
          <p><strong>Potential monthly savings: $${Number(audit.total_monthly_savings).toFixed(0)}</strong><br>
          Annual: $${Number(audit.total_annual_savings).toFixed(0)}</p>
          <p>${audit.summary}</p>
        ` : ""}
        <p><a href="${auditUrl}">View your full audit report</a></p>
        ${isHighSavings ? `
          <hr>
          <p><strong>Want to save even more?</strong><br>
          Credex sources discounted AI credits from companies that overforecast.
          <a href="https://credex.rocks">Book a free consultation</a>.</p>
        ` : ""}
        <p style="color:#888;font-size:12px;">
          You're receiving this because you used the AI Spend Audit tool.
        </p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Leads API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}