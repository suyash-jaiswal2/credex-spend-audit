import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { AuditResult } from "@/types";
import { AuditClient } from "./AuditClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

async function getAudit(id: string): Promise<AuditResult | null> {
  const { data, error } = await supabaseAdmin
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    input: data.input,
    recommendations: data.recommendations,
    totalMonthlySavings: data.total_monthly_savings,
    totalAnnualSavings: data.total_annual_savings,
    summary: data.summary,
    createdAt: data.created_at,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) return { title: "Audit not found" };

  const savings = audit.totalMonthlySavings;
  const title = savings > 0
    ? `AI spend audit — $${savings.toFixed(0)}/mo in savings found`
    : "AI spend audit — your stack is optimised";
  const description = savings > 0
    ? `Potential savings of $${(savings * 12).toFixed(0)}/year identified across your AI tool stack.`
    : "No overspend found — your AI stack is well optimised.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/audit/${audit}`,
      siteName: "AI Spend Audit",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();
  return <AuditClient serverResult={audit} />;
}