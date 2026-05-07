import type { AuditInput, AuditResult, ToolRecommendation, ToolEntry } from "@/types";
import { PRICING } from "./pricing-data";

export function auditTool(entry: ToolEntry, input: AuditInput): ToolRecommendation {
  const { toolId, plan, seats, monthlySpend } = entry;
  const { teamSize, useCase } = input;

  switch (toolId) {
    case "cursor":         return auditCursor(entry, teamSize);
    case "github_copilot": return auditCopilot(entry, teamSize, useCase);
    case "claude":         return auditClaude(entry, teamSize, useCase);
    case "chatgpt":        return auditChatGPT(entry, teamSize, useCase);
    case "anthropic_api":  return auditAnthropicApi(entry, teamSize);
    case "openai_api":     return auditOpenAiApi(entry, teamSize);
    case "gemini":         return auditGemini(entry, teamSize, useCase);
    case "windsurf":       return auditWindsurf(entry, teamSize, useCase);
    default:               return noOpRecommendation(entry);
  }
}

export function runAudit(input: AuditInput): Omit<AuditResult, "id" | "summary" | "createdAt"> {
  const recommendations = input.tools.map((entry) => auditTool(entry, input));
  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);

  return {
    input,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
  };
}

// ── Individual tool auditors ──────────────────────────────────────────────────

function auditCursor(entry: ToolEntry, teamSize: number): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const plans = PRICING.cursor?.plans ?? [];

  // Example rule: if on Business but seats < 5, Pro is sufficient
  if (plan === "business" && seats < 5) {
    const proPlan = plans.find((p) => p.planId === "pro");
    if (proPlan) {
      const expectedCost = proPlan.pricePerSeatPerMonth * seats;
      const savings = monthlySpend - expectedCost;
      if (savings > 0) {
        return {
          toolId: "cursor",
          currentSpend: monthlySpend,
          recommendedAction: "downgrade",
          recommendedPlan: "pro",
          monthlySavings: savings,
          reasoning: `Business plan is designed for teams of 5+. With ${seats} seat(s), Pro gives identical features at $${proPlan.pricePerSeatPerMonth}/seat/mo, saving $${savings.toFixed(0)}/mo.`,
        };
      }
    }
  }

  return keepRecommendation(entry, "Cursor plan looks right-sized for your team.");
}

function auditCopilot(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
  // TODO: fill in rules after pricing research
  return keepRecommendation(entry, "GitHub Copilot audit logic — implement after pricing research.");
}

function auditClaude(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
  // TODO
  return keepRecommendation(entry, "Claude audit logic — implement after pricing research.");
}

function auditChatGPT(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
  // TODO
  return keepRecommendation(entry, "ChatGPT audit logic — implement after pricing research.");
}

function auditAnthropicApi(entry: ToolEntry, teamSize: number): ToolRecommendation {
  const { monthlySpend } = entry;
  // Flag unusually high API spend for small teams
  const highSpendThreshold = teamSize * 150; // rough: $150/dev/mo is high
  if (monthlySpend > highSpendThreshold) {
    return {
      toolId: "anthropic_api",
      currentSpend: monthlySpend,
      recommendedAction: "switch",
      monthlySavings: 0, // savings depend on actual usage pattern
      reasoning: `$${monthlySpend}/mo on the Anthropic API is above typical benchmarks for a ${teamSize}-person team ($${highSpendThreshold}/mo). Review model selection — switching high-volume tasks from Opus to Sonnet or Haiku can cut costs 5–20×.`,
    };
  }
  return keepRecommendation(entry, "API spend looks within normal range for your team size.");
}

function auditOpenAiApi(entry: ToolEntry, teamSize: number): ToolRecommendation {
  // TODO: mirror auditAnthropicApi logic with OpenAI benchmarks
  return keepRecommendation(entry, "OpenAI API audit logic — implement after pricing research.");
}

function auditGemini(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
  // TODO
  return keepRecommendation(entry, "Gemini audit logic — implement after pricing research.");
}

function auditWindsurf(entry: ToolEntry, teamSize: number, useCase: string): ToolRecommendation {
  // TODO
  return keepRecommendation(entry, "Windsurf audit logic — implement after pricing research.");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function keepRecommendation(entry: ToolEntry, reasoning: string): ToolRecommendation {
  return {
    toolId: entry.toolId,
    currentSpend: entry.monthlySpend,
    recommendedAction: "keep",
    monthlySavings: 0,
    reasoning,
  };
}

function noOpRecommendation(entry: ToolEntry): ToolRecommendation {
  return keepRecommendation(entry, "No audit rules defined for this tool.");
}