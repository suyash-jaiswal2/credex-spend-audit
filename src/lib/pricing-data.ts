export interface PlanPricing {
  planId: string;
  label: string;
  pricePerSeatPerMonth: number;
  minSeats?: number;
  notes?: string;
}

export interface ApiPricing {
  modelId: string;
  label: string;
  inputPer1MTokens: number;
  outputPer1MTokens: number;
  notes?: string;
}

export interface ToolPricing {
  plans?: PlanPricing[];
  api?: ApiPricing[];
}

export const PRICING: Record<string, ToolPricing> = {
  cursor: {
    plans: [
      { planId: "hobby",      label: "Hobby",    pricePerSeatPerMonth: 0 },
      { planId: "pro",        label: "Pro",      pricePerSeatPerMonth: 20 },
      { planId: "pro_plus",   label: "Pro+",     pricePerSeatPerMonth: 60 },
      { planId: "ultra",      label: "Ultra",    pricePerSeatPerMonth: 200 },
      { planId: "teams",      label: "Teams",    pricePerSeatPerMonth: 40 },
      { planId: "enterprise", label: "Enterprise", pricePerSeatPerMonth: 0, notes: "Custom pricing" },
    ],
  },

  github_copilot: {
    plans: [
      { planId: "free",       label: "Free",       pricePerSeatPerMonth: 0 },
      { planId: "pro",        label: "Pro",        pricePerSeatPerMonth: 10 },
      { planId: "pro_plus",   label: "Pro+",       pricePerSeatPerMonth: 39 },
      { planId: "business",   label: "Business",   pricePerSeatPerMonth: 19 },
      { planId: "enterprise", label: "Enterprise", pricePerSeatPerMonth: 39 },
    ],
  },

  claude: {
    plans: [
      { planId: "free",         label: "Free",         pricePerSeatPerMonth: 0 },
      { planId: "pro",          label: "Pro",          pricePerSeatPerMonth: 20 },
      { planId: "max",          label: "Max",          pricePerSeatPerMonth: 100 },
      { planId: "team_standard",label: "Team Standard",pricePerSeatPerMonth: 20, minSeats: 2 },
      { planId: "team_premium", label: "Team Premium", pricePerSeatPerMonth: 100, minSeats: 2 },
      { planId: "enterprise",   label: "Enterprise",   pricePerSeatPerMonth: 20, notes: "+ API rates" },
    ],
  },

  chatgpt: {
    plans: [
      { planId: "free",     label: "Free",     pricePerSeatPerMonth: 0 },
      { planId: "go",       label: "Go",       pricePerSeatPerMonth: 8 },
      { planId: "plus",     label: "Plus",     pricePerSeatPerMonth: 20 },
      { planId: "pro",      label: "Pro",      pricePerSeatPerMonth: 100 },
      { planId: "business", label: "Business", pricePerSeatPerMonth: 21 },
      { planId: "enterprise", label: "Enterprise", pricePerSeatPerMonth: 0, notes: "Custom pricing" },
    ],
  },

  anthropic_api: {
    api: [
      { modelId: "claude-opus-4",   label: "Claude Opus 4",   inputPer1MTokens: 5,  outputPer1MTokens: 25 },
      { modelId: "claude-sonnet-4", label: "Claude Sonnet 4", inputPer1MTokens: 3,  outputPer1MTokens: 15 },
      { modelId: "claude-haiku-4",  label: "Claude Haiku 4",  inputPer1MTokens: 1,  outputPer1MTokens: 5 },
    ],
  },

  openai_api: {
    api: [
      { modelId: "gpt-5",      label: "GPT-5",      inputPer1MTokens: 5,    outputPer1MTokens: 30 },
      { modelId: "gpt-5-mini", label: "GPT-5 mini", inputPer1MTokens: 2.5,  outputPer1MTokens: 15 },
      { modelId: "gpt-5-nano", label: "GPT-5 nano", inputPer1MTokens: 0.75, outputPer1MTokens: 4.5 },
    ],
  },

  gemini: {
    plans: [
      { planId: "free",      label: "Free",      pricePerSeatPerMonth: 0 },
      { planId: "plus",      label: "Plus",      pricePerSeatPerMonth: 7.99 },
      { planId: "pro",       label: "Pro",       pricePerSeatPerMonth: 19.99 },
      { planId: "ultra",     label: "Ultra",     pricePerSeatPerMonth: 249.99 },
      { planId: "workspace", label: "Workspace", pricePerSeatPerMonth: 14 },
      { planId: "enterprise",label: "Enterprise",pricePerSeatPerMonth: 21 },
    ],
    api: [
      { modelId: "gemini-2.5-pro",        label: "Gemini 2.5 Pro",        inputPer1MTokens: 1.25, outputPer1MTokens: 10 },
      { modelId: "gemini-2.5-flash",      label: "Gemini 2.5 Flash",      inputPer1MTokens: 0.30, outputPer1MTokens: 2.5 },
      { modelId: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", inputPer1MTokens: 0.10, outputPer1MTokens: 0.4 },
    ],
  },

  windsurf: {
    plans: [
      { planId: "free",       label: "Free",       pricePerSeatPerMonth: 0 },
      { planId: "pro",        label: "Pro",        pricePerSeatPerMonth: 20 },
      { planId: "max",        label: "Max",        pricePerSeatPerMonth: 200 },
      { planId: "teams",      label: "Teams",      pricePerSeatPerMonth: 40 },
      { planId: "enterprise", label: "Enterprise", pricePerSeatPerMonth: 0, notes: "Custom pricing" },
    ],
  },
};