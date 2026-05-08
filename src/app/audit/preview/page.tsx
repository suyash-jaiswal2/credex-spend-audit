"use client";

import { useState } from "react";
import type { AuditResult, ToolRecommendation } from "@/types";
import { TOOLS } from "@/lib/tools";

export default function AuditPreviewPage() {
  const [result] = useState<AuditResult | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("audit_result");
    return raw ? JSON.parse(raw) : null;
  });

  if (!result) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const { totalMonthlySavings, totalAnnualSavings, recommendations, summary } = result;
  const isOptimal = totalMonthlySavings < 100;
  const isHighSavings = totalMonthlySavings > 500;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">

      {/* Hero */}
      <div className="rounded-xl border p-6 text-center space-y-1">
        {isOptimal ? (
          <>
            <p className="text-sm text-muted-foreground">Audit complete</p>
            <p className="text-2xl font-medium">You&apos;re spending well ✓</p>
            <p className="text-sm text-muted-foreground mt-2">
              No significant savings found for your current stack.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Potential monthly savings</p>
            <p className="text-4xl font-medium">${totalMonthlySavings.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">
              ${totalAnnualSavings.toFixed(0)} saved per year
            </p>
          </>
        )}
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border p-6 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">AI analysis</p>
        <p className="text-sm leading-relaxed">{summary}</p>
      </div>

      {/* Per-tool breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Breakdown
        </h2>
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.toolId} rec={rec} />
        ))}
      </div>

      {/* Credex CTA — only for high savings */}
      {isHighSavings && (
        <div className="rounded-xl border-2 border-green-600 bg-green-50 dark:bg-green-950 p-6 space-y-3">
          <p className="font-medium text-green-900 dark:text-green-100">
            You could save even more with Credex
          </p>
          <p className="text-sm text-green-800 dark:text-green-200">
            Credex sources discounted AI credits from companies that overforecast.
            Teams saving ${totalMonthlySavings.toFixed(0)}/mo on plan changes often
            save an additional 20–40% buying through credits.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-green-700 dark:text-green-300 underline"
          >
            Book a Credex consultation &#8594;
          </a>
        </div>
      )}

      {/* Optimal CTA */}
      {isOptimal && (
        <div className="rounded-xl border p-6 space-y-3">
          <p className="font-medium">Stay ahead of new optimisations</p>
          <p className="text-sm text-muted-foreground">
            AI tool pricing changes fast. We&apos;ll notify you when better options
            apply to your stack.
          </p>
          {/* Email capture goes here Day 4 */}
          <p className="text-xs text-muted-foreground italic">Email capture coming soon</p>
        </div>
      )}

    </main>
  );
}

function RecommendationCard({ rec }: { rec: ToolRecommendation }) {
  const meta = TOOLS.find((t) => t.id === rec.toolId);
  const actionColors: Record<string, string> = {
    keep:      "text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300",
    downgrade: "text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300",
    switch:    "text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300",
    cancel:    "text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{meta?.label ?? rec.toolId}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColors[rec.recommendedAction]}`}>
          {rec.recommendedAction}
        </span>
      </div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">${rec.currentSpend}/mo</span>
        {rec.monthlySavings > 0 && (
          <span className="text-green-600 font-medium">
            − ${rec.monthlySavings.toFixed(0)}/mo
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{rec.reasoning}</p>
    </div>
  );
}