import Groq from "groq-sdk";
import type { AuditResult } from "@/types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateAuditSummary(result: AuditResult): Promise<string> {
  const { totalMonthlySavings, input, recommendations } = result;

  const topRec = recommendations
    .filter((r) => r.recommendedAction !== "keep")
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const prompt = `You are an AI infrastructure cost analyst. Write an 80-100 word personalised audit summary based on this data:

- Tools audited: ${recommendations.map((r) => r.toolId).join(", ")}
- Team size: ${input.teamSize}
- Primary use case: ${input.useCase}
- Total monthly savings identified: $${totalMonthlySavings.toFixed(0)}
- Biggest saving: ${topRec ? `${topRec.toolId} → ${topRec.recommendedAction} (saves $${topRec.monthlySavings.toFixed(0)}/mo)` : "none — already optimised"}

Rules:
- Write in second person ("your team", "you're spending")
- Reference the exact dollar numbers above — do not invent new ones
- No bullet points — flowing prose only
- Do not mention any specific vendor by name for promotions
- End with one concrete sentence about what the team could do with the savings`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content ?? fallbackSummary(result);
  } catch (err) {
    console.error("Groq API error:", err);
    return fallbackSummary(result);
  }
}

export function fallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, input, recommendations } = result;

  const topRec = recommendations
    .filter((r) => r.recommendedAction !== "keep")
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  if (totalMonthlySavings === 0) {
    return `Your team of ${input.teamSize} is spending efficiently across your AI tools. Your current stack is well-matched to your ${input.useCase} workflows — no immediate changes recommended.`;
  }

  return `Your team of ${input.teamSize} could save $${totalMonthlySavings.toFixed(0)}/month ($${(totalMonthlySavings * 12).toFixed(0)}/year) on AI tools. ${topRec ? `The biggest opportunity is your ${topRec.toolId} plan — ${topRec.reasoning}` : ""} Reinvesting these savings could fund an additional tool or two headcount-equivalent in AI capacity.`;
}