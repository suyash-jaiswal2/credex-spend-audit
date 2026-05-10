"use client";

import type { AuditResult, ToolRecommendation } from "@/types";
import { TOOLS } from "@/lib/tools";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { useState } from "react";
import { CheckCircle2, TrendingDown, ArrowRightLeft, XCircle, Copy, Check } from "lucide-react";

interface Props {
  result: AuditResult;
  isPublic?: boolean;
}

export function AuditResultsView({ result, isPublic = false }: Props) {
  const { totalMonthlySavings, totalAnnualSavings, recommendations, summary } = result;
  const isOptimal = totalMonthlySavings < 100;
  const isHighSavings = totalMonthlySavings > 500;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/audit/${result.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

      {/* Header & Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executive Summary</h1>
          <p className="text-muted-foreground text-sm">Audit ID: {result.id.slice(0,8)}</p>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Link Copied" : "Share Report"}
        </button>
      </div>

      {/* Hero Savings Card */}
      <div className={`relative overflow-hidden rounded-2xl border p-8 md:p-12 shadow-sm ${
        !isOptimal ? "bg-card" : "bg-card"
      }`}>
        <div className="relative z-10 space-y-4">
          {isOptimal ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Stack Optimized
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Efficiency Verified</h2>
              <p className="text-lg text-muted-foreground max-w-lg">
                Your current AI tooling stack is highly optimized. No significant structural savings identified at this time.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Identified Potential Savings</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-7xl font-bold tracking-tighter text-primary">${totalMonthlySavings.toFixed(0)}</span>
                <span className="text-xl md:text-2xl text-muted-foreground font-medium">/mo</span>
              </div>
              <p className="text-lg font-medium text-foreground">
                <span className="text-primary">${totalAnnualSavings.toFixed(0)}</span> projected annual reduction
              </p>
            </>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Strategic Analysis</h3>
        <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
          <p className="text-base md:text-lg leading-relaxed text-foreground/90">
            {summary}
          </p>
        </div>
      </div>

      {/* Per-tool Breakdown */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Stack Breakdown & Recommendations
        </h3>
        <div className="grid gap-4">
          {recommendations.map((rec) => (
            <div key={rec.toolId}>
              <RecommendationCard rec={rec} />
            </div>
          ))}
        </div>
      </div>

      {/* Credex CTA */}
      {isHighSavings && (
        <div className="rounded-2xl border bg-card p-8 shadow-sm mt-12 space-y-6 animate-in fade-in zoom-in-95 duration-500 delay-200">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight">Scale Your Savings with Credex</h3>
            <p className="text-muted-foreground leading-relaxed">
              We source secondary-market AI credits from enterprise over-allocations. Teams optimizing their stack structure often achieve an additional <strong className="text-foreground font-semibold">20–40% net reduction</strong> in unit costs by purchasing through the Credex exchange.
            </p>
          </div>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
          >
            Schedule Executive Review
          </a>
        </div>
      )}

      {/* Lead capture — shown after value, never before */}
      {!isPublic && (
        <div className="pt-8 border-t">
          <LeadCaptureForm
            auditId={result.id}
            isOptimal={isOptimal}
          />
        </div>
      )}

    </div>
  );
}

function RecommendationCard({ rec }: { rec: ToolRecommendation }) {
  const meta = TOOLS.find((t) => t.id === rec.toolId);
  
  const actionConfig = {
    keep:      { color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/50", border: "border-green-200 dark:border-green-900", icon: CheckCircle2 },
    downgrade: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/50", border: "border-yellow-200 dark:border-yellow-900", icon: TrendingDown },
    switch:    { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50", border: "border-blue-200 dark:border-blue-900", icon: ArrowRightLeft },
    cancel:    { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50", border: "border-red-200 dark:border-red-900", icon: XCircle },
  };

  const config = actionConfig[rec.recommendedAction];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm flex flex-col md:flex-row gap-6 transition-all hover:shadow-md`}>
      {/* Left Column: Tool & Action */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between md:justify-start md:gap-4">
          <span className="font-semibold text-lg">{meta?.label ?? rec.toolId}</span>
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium border ${config.bg} ${config.color} ${config.border} uppercase tracking-wider`}>
            <Icon className="w-3.5 h-3.5" />
            {rec.recommendedAction}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{rec.reasoning}</p>
      </div>

      {/* Right Column: Financials */}
      <div className="md:w-48 flex flex-col justify-center space-y-3 bg-secondary/30 p-4 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground font-medium">Current</span>
          <span className="font-mono">${rec.currentSpend}/mo</span>
        </div>
        
        {rec.monthlySavings > 0 && rec.currentSpend > 0 && (
          <div className="space-y-1.5">
            <div className="w-full bg-border rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((rec.monthlySavings / rec.currentSpend) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-primary">Savings</span>
              <span className="text-primary font-mono">&minus;${rec.monthlySavings.toFixed(0)}/mo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}