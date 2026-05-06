export interface PlanPricing {
  planId: string;
  label: string;
  pricePerSeatPerMonth: number;
  minSeats?: number;
  maxSeats?: number;
  notes?: string;
}

export interface ApiPricing {
  modelId: string;
  label: string;
  inputPer1MTokens: number;   // USD
  outputPer1MTokens: number;  // USD
  notes?: string;
}

export interface PlanPricing {
  planId: string;
  label: string;
  pricePerSeatPerMonth: number;
  minSeats?: number;
  maxSeats?: number;
  notes?: string;
}

// A tool can have seat pricing, API pricing, or both (e.g. Claude has plans AND API)
export interface ToolPricing {
  plans?: PlanPricing[];
  api?: ApiPricing[];
}

export const PRICING: Record<string, ToolPricing> = {
  anthropic_api: {
    api: [
      { modelId: "claude-opus-4",    label: "Claude Opus 4",    inputPer1MTokens: 0, outputPer1MTokens: 0 },
      { modelId: "claude-sonnet-4",  label: "Claude Sonnet 4",  inputPer1MTokens: 0, outputPer1MTokens: 0 },
      { modelId: "claude-haiku-4",   label: "Claude Haiku 4",   inputPer1MTokens: 0, outputPer1MTokens: 0 },
    ]
  },
  openai_api: {
    api: [
      { modelId: "gpt-4o",           label: "GPT-4o",           inputPer1MTokens: 0, outputPer1MTokens: 0 },
      { modelId: "gpt-4o-mini",      label: "GPT-4o mini",      inputPer1MTokens: 0, outputPer1MTokens: 0 },
      { modelId: "o3",               label: "o3",               inputPer1MTokens: 0, outputPer1MTokens: 0 },
    ]
  },
  gemini: {
    plans: [
      { planId: "free",   label: "Free",          pricePerSeatPerMonth: 0 },
      { planId: "pro",    label: "Gemini Pro",    pricePerSeatPerMonth: 0 },
      { planId: "ultra",  label: "Gemini Ultra",  pricePerSeatPerMonth: 0 },
    ],
    api: [
      { modelId: "gemini-2.5-pro",   label: "Gemini 2.5 Pro",   inputPer1MTokens: 0, outputPer1MTokens: 0 },
      { modelId: "gemini-2.5-flash", label: "Gemini 2.5 Flash", inputPer1MTokens: 0, outputPer1MTokens: 0 },
    ]
  },
  // seat-based tools stay as-is
  cursor: {
    plans: [
      { planId: "hobby",      label: "Hobby",      pricePerSeatPerMonth: 0 },
      { planId: "pro",        label: "Pro",         pricePerSeatPerMonth: 0 },
      { planId: "business",   label: "Business",    pricePerSeatPerMonth: 0 },
    ]
  },
};

// For seat-based tools: seats × price = expected monthly spend
export function expectedSeatCost(plan: PlanPricing, seats: number): number {
  return plan.pricePerSeatPerMonth * seats;
}

// For API tools: user just inputs their actual monthly bill directly
// You compare it against benchmarks, not a formula
export interface ApiBenchmark {
  //useCase: UseCase;
  teamSize: "small" | "medium" | "large";  // <5, 5–20, 20+
  monthlySpendLow: number;
  monthlySpendHigh: number;
  notes: string;
}