export interface PlanPricing {
  planId: string;
  label: string;
  pricePerSeatPerMonth: number;
  minSeats?: number;
  maxSeats?: number;
  notes?: string;
}

export const PRICING: Record<string, PlanPricing[]> = {
  cursor: [
    { planId: "hobby",      label: "Hobby",      pricePerSeatPerMonth: 0 },
    { planId: "pro",        label: "Pro",         pricePerSeatPerMonth: 0 }, // TODO
    { planId: "business",   label: "Business",    pricePerSeatPerMonth: 0 },
    { planId: "enterprise", label: "Enterprise",  pricePerSeatPerMonth: 0 },
  ],
  github_copilot: [],   // fill in after research
  claude: [],
  chatgpt: [],
  anthropic_api: [],
  openai_api: [],
  gemini: [],
  windsurf: [],
};