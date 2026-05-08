import type { AuditInput, AuditResult, ToolRecommendation, ToolEntry, UseCase } from "@/types";
import { PRICING } from "./pricing-data";
import { randomUUID } from "crypto";

export function runAudit(input: AuditInput): Omit<AuditResult, "summary"> {
  const recommendations = input.tools.map((entry) => auditTool(entry, input));
  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  return {
    id: randomUUID(),
    input,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    createdAt: new Date().toISOString(),
  };
}

export function auditTool(entry: ToolEntry, input: AuditInput): ToolRecommendation {
  switch (entry.toolId) {
    case "cursor":         return auditCursor(entry, input.teamSize, input.useCase);
    case "github_copilot": return auditCopilot(entry, input.teamSize, input.useCase);
    case "claude":         return auditClaude(entry, input.teamSize, input.useCase);
    case "chatgpt":        return auditChatGPT(entry, input.teamSize, input.useCase);
    case "anthropic_api":  return auditApiSpend(entry, input.teamSize, "anthropic_api", "Sonnet instead of Opus");
    case "openai_api":     return auditApiSpend(entry, input.teamSize, "openai_api", "GPT-5 mini instead of GPT-5");
    case "gemini":         return auditGemini(entry, input.teamSize, input.useCase);
    case "windsurf":       return auditWindsurf(entry, input.teamSize, input.useCase);
    default:               return keep(entry, "No audit rules defined for this tool.");
  }
}

// ── Cursor ────────────────────────────────────────────────────────────────────

function auditCursor(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const plans = PRICING.cursor?.plans ?? [];

  // Ultra ($200) — overkill unless solo power user; Pro+ ($60) covers most needs
  if (plan === "ultra") {
    const proPlusPlan = plans.find((p) => p.planId === "pro_plus")!;
    const expected = proPlusPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "cursor", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro_plus",
        monthlySavings: savings,
        reasoning: `Ultra ($200/seat) is designed for users who need the absolute highest model limits. Pro+ ($60/seat) offers extended limits sufficient for most engineering teams, saving $${savings.toFixed(0)}/mo across ${seats} seat(s).`,
      };
    }
  }

  // Pro+ ($60) with <3 seats on a mixed/non-coding team — Pro ($20) is enough
  if (plan === "pro_plus" && seats < 3 && useCase !== "coding") {
    const proPlan = plans.find((p) => p.planId === "pro")!;
    const expected = proPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "cursor", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro",
        monthlySavings: savings,
        reasoning: `Pro+ is worth it for heavy coding workloads. For ${useCase} use cases with ${seats} seat(s), Pro ($20/seat) provides full code completion and chat without the extended limits you're unlikely to hit, saving $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Teams ($40) with <4 seats — Pro ($20) is identical features, no minimum
  if (plan === "teams" && seats < 4) {
    const proPlan = plans.find((p) => p.planId === "pro")!;
    const expected = proPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "cursor", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro",
        monthlySavings: savings,
        reasoning: `Teams plan ($40/seat) adds centralised billing and admin controls. With ${seats} seat(s) you don't need the overhead — individual Pro plans ($20/seat) give the same coding features and save $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Non-coding use case on a paid plan — Claude or ChatGPT is better value
  if (useCase !== "coding" && useCase !== "mixed" && plan !== "hobby") {
    return {
      toolId: "cursor", currentSpend: monthlySpend,
      recommendedAction: "switch", suggestedAlternative: "claude",
      monthlySavings: 0,
      reasoning: `Cursor is purpose-built for code generation and IDE integration. For ${useCase} workflows, Claude Pro ($20/seat) or ChatGPT Plus ($20/seat) offer broader writing, research, and data capabilities at the same price point.`,
    };
  }

  return keep(entry, "Cursor plan is well-matched to your team size and use case.");
}

// ── GitHub Copilot ────────────────────────────────────────────────────────────

function auditCopilot(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const plans = PRICING.github_copilot?.plans ?? [];

  // Enterprise ($39) for <10 seats — Pro+ ($39 same price but no enterprise overhead)
  // Actually Enterprise = Pro+ in price, but Enterprise needs GitHub Enterprise license
  // Flag this: they might be paying for Enterprise without needing GitHub Enterprise
  if (plan === "enterprise" && seats < 10) {
    return {
      toolId: "github_copilot", currentSpend: monthlySpend,
      recommendedAction: "downgrade", recommendedPlan: "pro_plus",
      monthlySavings: 0,
      reasoning: `Enterprise ($39/seat) requires a GitHub Enterprise license on top of Copilot. If you're not on GitHub Enterprise, you're paying for a tier you can't fully use. Pro+ ($39/seat) gives the same AI models without that dependency.`,
    };
  }

  // Pro+ ($39) with <5 seats on Business plan — Business ($19) covers team needs
  if (plan === "pro_plus" && seats >= 5) {
    const businessPlan = plans.find((p) => p.planId === "business")!;
    const expected = businessPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "github_copilot", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "business",
        monthlySavings: savings,
        reasoning: `Pro+ ($39/seat) is optimised for individual developers who need the latest models. For teams of ${seats}, Business ($19/seat) provides organisation-wide policy controls and the same core completion features, saving $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Business ($19) for 1-2 seats — Pro ($10) is sufficient
  if (plan === "business" && seats <= 2) {
    const proPlan = plans.find((p) => p.planId === "pro")!;
    const expected = proPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "github_copilot", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro",
        monthlySavings: savings,
        reasoning: `Business plan adds organisation management features designed for teams of 5+. With ${seats} seat(s), Pro ($10/seat) provides identical code completion and chat at half the price, saving $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Non-coding use case — Copilot is wasted spend
  if (useCase !== "coding" && useCase !== "mixed" && plan !== "free") {
    return {
      toolId: "github_copilot", currentSpend: monthlySpend,
      recommendedAction: "switch", suggestedAlternative: "claude",
      monthlySavings: monthlySpend,
      reasoning: `GitHub Copilot is an IDE code-completion tool with no meaningful capability outside software development. For ${useCase} workflows, Claude Pro ($20/seat) or ChatGPT Plus ($20/seat) cover writing, research, and data tasks far more effectively.`,
    };
  }

  return keep(entry, "GitHub Copilot plan looks right-sized for your team.");
}

// ── Claude ────────────────────────────────────────────────────────────────────

function auditClaude(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const plans = PRICING.claude?.plans ?? [];

  // Max ($100) for most users — Pro ($20) handles the majority of workloads
  if (plan === "max") {
    const proPlan = plans.find((p) => p.planId === "pro")!;
    const expected = proPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "claude", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro",
        monthlySavings: savings,
        reasoning: `Max ($100/seat) is for users who consistently hit Pro's usage limits — typically power users running multi-hour research sessions daily. Most teams find Pro ($20/seat) sufficient, saving $${savings.toFixed(0)}/mo. Downgrade and monitor limit warnings for 2 weeks before deciding.`,
      };
    }
  }

  // Team Premium ($100) — same advice as Max
  if (plan === "team_premium") {
    const teamStandard = plans.find((p) => p.planId === "team_standard")!;
    const expected = teamStandard.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "claude", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "team_standard",
        monthlySavings: savings,
        reasoning: `Team Premium ($100/seat) mirrors Max-tier limits for teams. Team Standard ($20/seat) provides the same collaboration features with standard usage limits — sufficient unless your team is hitting caps regularly. Potential saving: $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Team Standard ($20) for 1 person — just use Pro ($20), same price, no min seat req
  if (plan === "team_standard" && seats === 1) {
    return {
      toolId: "claude", currentSpend: monthlySpend,
      recommendedAction: "downgrade", recommendedPlan: "pro",
      monthlySavings: 0,
      reasoning: `Team Standard requires a minimum of 2 seats. With 1 user you're either paying for an unused seat or on a non-standard billing arrangement. Switch to Pro ($20/seat) — identical AI access, no seat minimum.`,
    };
  }

  // Pure coding use case — Cursor or Copilot are more purpose-built
  if (useCase === "coding" && plan !== "free") {
    return {
      toolId: "claude", currentSpend: monthlySpend,
      recommendedAction: "switch", suggestedAlternative: "cursor",
      monthlySavings: 0,
      reasoning: `For coding-primary workflows, Cursor ($20/seat) or GitHub Copilot Pro ($10/seat) integrate directly into your IDE with inline completions, file context, and codebase indexing. Claude is better suited as a secondary tool for architecture discussions and code review.`,
    };
  }

  return keep(entry, "Claude plan looks well-matched to your team's use case and size.");
}

// ── ChatGPT ───────────────────────────────────────────────────────────────────

function auditChatGPT(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const plans = PRICING.chatgpt?.plans ?? [];

  // Pro ($100) — very high ceiling, most users never need it
  if (plan === "pro") {
    const plusPlan = plans.find((p) => p.planId === "plus")!;
    const expected = plusPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "chatgpt", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "plus",
        monthlySavings: savings,
        reasoning: `ChatGPT Pro ($100/seat) is designed for users who need unlimited o1 pro mode and extended thinking — a niche requiring extremely heavy daily use. Plus ($20/seat) covers GPT-4o, o1, and o3-mini access for most teams, saving $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Business ($21) for ≤3 seats — Plus ($20) is effectively the same price
  if (plan === "business" && seats <= 3) {
    return {
      toolId: "chatgpt", currentSpend: monthlySpend,
      recommendedAction: "downgrade", recommendedPlan: "plus",
      monthlySavings: seats * 1,
      reasoning: `Business ($21/seat) adds admin controls and data privacy guarantees for organisations. With ${seats} seat(s) the $1/seat premium is small, but you're also committing to annual billing. Plus ($20/seat) on monthly billing gives the same model access with more flexibility.`,
    };
  }

  // Plus ($20) for coding-primary use case — Cursor is better value
  if (plan === "plus" && useCase === "coding") {
    return {
      toolId: "chatgpt", currentSpend: monthlySpend,
      recommendedAction: "switch", suggestedAlternative: "cursor",
      monthlySavings: 0,
      reasoning: `ChatGPT Plus is a great general-purpose tool but lacks IDE integration. For coding-primary workflows, Cursor ($20/seat) provides the same model access with inline completions, file context, and terminal integration built in.`,
    };
  }

  // Go ($8) — already good value, keep
  if (plan === "go") {
    return keep(entry, "Go plan ($8/seat) is excellent value for light ChatGPT usage.");
  }

  return keep(entry, "ChatGPT plan looks right-sized for your team's use case.");
}

// ── Gemini ────────────────────────────────────────────────────────────────────

function auditGemini(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const plans = PRICING.gemini?.plans ?? [];

  // Ultra ($249.99) — extremely niche, Pro ($19.99) covers all standard use cases
  if (plan === "ultra") {
    const proPlan = plans.find((p) => p.planId === "pro")!;
    const expected = proPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "gemini", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro",
        monthlySavings: savings,
        reasoning: `Gemini Ultra ($249.99/seat) targets enterprise-grade workloads with Google One AI Premium perks. Gemini Pro ($19.99/seat) provides Gemini Advanced access — the same underlying model — for 92% less per seat. Saving: $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Workspace ($14) or Enterprise ($21) for non-Google ecosystem teams
  if ((plan === "workspace" || plan === "enterprise") && useCase !== "data") {
    return {
      toolId: "gemini", currentSpend: monthlySpend,
      recommendedAction: "switch", suggestedAlternative: "claude",
      monthlySavings: 0,
      reasoning: `Gemini Workspace/Enterprise tiers make most sense for teams deeply embedded in Google Workspace (Docs, Sheets, Gmail integration). For ${useCase} workflows without a Google dependency, Claude Pro or ChatGPT Plus offer equivalent or stronger capability at $20/seat.`,
    };
  }

  // Pro ($19.99) for coding use case — better coding tools exist
  if (plan === "pro" && useCase === "coding") {
    return {
      toolId: "gemini", currentSpend: monthlySpend,
      recommendedAction: "switch", suggestedAlternative: "cursor",
      monthlySavings: 0,
      reasoning: `Gemini Pro is competitive for general tasks but lacks IDE-native integration. For coding-primary teams, Cursor ($20/seat) provides the same spend with purpose-built code completion, codebase context, and terminal integration.`,
    };
  }

  return keep(entry, "Gemini plan looks reasonable for your team's use case.");
}

// ── Windsurf ──────────────────────────────────────────────────────────────────

function auditWindsurf(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const plans = PRICING.windsurf?.plans ?? [];

  // Max ($200) — comparable to Cursor Ultra, same downgrade logic
  if (plan === "max") {
    const proPlan = plans.find((p) => p.planId === "pro")!;
    const expected = proPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "windsurf", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro",
        monthlySavings: savings,
        reasoning: `Windsurf Max ($200/seat) unlocks unlimited AI actions — worthwhile only if you're consistently exhausting Pro's monthly credits. Pro ($20/seat) covers 90%+ of engineering team use cases at 10% of the price, saving $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Teams ($40) with <4 seats — Pro ($20) is cheaper with no minimum
  if (plan === "teams" && seats < 4) {
    const proPlan = plans.find((p) => p.planId === "pro")!;
    const expected = proPlan.pricePerSeatPerMonth * seats;
    const savings = monthlySpend - expected;
    if (savings > 0) {
      return {
        toolId: "windsurf", currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "pro",
        monthlySavings: savings,
        reasoning: `Windsurf Teams ($40/seat) adds shared credits and team management. With ${seats} seat(s), individual Pro plans ($20/seat) are simpler and half the price — team features only pay off at 5+ seats. Saving: $${savings.toFixed(0)}/mo.`,
      };
    }
  }

  // Non-coding use case — wrong tool
  if (useCase !== "coding" && useCase !== "mixed" && plan !== "free") {
    return {
      toolId: "windsurf", currentSpend: monthlySpend,
      recommendedAction: "switch", suggestedAlternative: "claude",
      monthlySavings: monthlySpend,
      reasoning: `Windsurf is an AI coding IDE — outside software development it provides no value. For ${useCase} workflows, Claude Pro ($20/seat) or ChatGPT Plus ($20/seat) are the right tools.`,
    };
  }

  // Windsurf vs Cursor — both at Pro tier, flag overlap if both present
  return keep(entry, "Windsurf plan looks right-sized for your team.");
}

// ── API spend ─────────────────────────────────────────────────────────────────

function auditApiSpend(
  entry: ToolEntry,
  teamSize: number,
  toolId: "anthropic_api" | "openai_api",
  modelSuggestion: string
): ToolRecommendation {
  const { monthlySpend } = entry;
  const benchmarkPerDev = 100; // $100/dev/mo is a reasonable high-usage benchmark
  const threshold = teamSize * benchmarkPerDev;

  if (monthlySpend > threshold * 2) {
    return {
      toolId, currentSpend: monthlySpend,
      recommendedAction: "downgrade",
      monthlySavings: Math.round(monthlySpend * 0.4),
      reasoning: `$${monthlySpend}/mo is significantly above the ~$${threshold}/mo benchmark for a ${teamSize}-person team. The most common cause is model selection — running all requests through the flagship model when lighter tasks could use a cheaper one. Routing high-volume or automated tasks to ${modelSuggestion} typically cuts API costs 40–80%.`,
    };
  }

  if (monthlySpend > threshold) {
    return {
      toolId, currentSpend: monthlySpend,
      recommendedAction: "keep",
      monthlySavings: 0,
      reasoning: `$${monthlySpend}/mo is above typical benchmarks for a ${teamSize}-person team ($${threshold}/mo). Worth auditing your model selection — consider ${modelSuggestion} for non-critical tasks — but not an urgent concern.`,
    };
  }

  return keep(entry, `API spend of $${monthlySpend}/mo is within normal range for a ${teamSize}-person team.`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function keep(entry: ToolEntry, reasoning: string): ToolRecommendation {
  return {
    toolId: entry.toolId,
    currentSpend: entry.monthlySpend,
    recommendedAction: "keep",
    monthlySavings: 0,
    reasoning,
  };
}