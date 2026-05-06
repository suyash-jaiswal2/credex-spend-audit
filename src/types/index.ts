export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number; // what they actually pay today
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolRecommendation {
  toolId: ToolId;
  currentSpend: number;
  recommendedAction: "keep" | "downgrade" | "switch" | "cancel";
  recommendedPlan?: string;
  suggestedAlternative?: ToolId;
  monthlySavings: number;
  reasoning: string;
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary: string; // AI-generated or fallback
  createdAt: string;
}