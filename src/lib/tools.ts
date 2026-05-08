import type { ToolId } from "@/types";

export interface ToolMeta {
  id: ToolId;
  label: string;
  isApiDirect: boolean;  // true = user inputs monthly $ directly, no seat calc
  plans: { planId: string; label: string }[];
}

export const TOOLS: ToolMeta[] = [
  {
    id: "cursor",
    label: "Cursor",
    isApiDirect: false,
    plans: [
      { planId: "hobby",      label: "Hobby (Free)" },
      { planId: "pro",        label: "Pro" },
      { planId: "pro_plus",   label: "Pro+" },
      { planId: "ultra",      label: "Ultra" },
      { planId: "teams",      label: "Teams" },
      { planId: "enterprise", label: "Enterprise" },
    ],
  },
  {
    id: "github_copilot",
    label: "GitHub Copilot",
    isApiDirect: false,
    plans: [
      { planId: "free",       label: "Free" },
      { planId: "pro",        label: "Pro" },
      { planId: "pro_plus",   label: "Pro+" },
      { planId: "business",   label: "Business" },
      { planId: "enterprise", label: "Enterprise" },
    ],
  },
  {
    id: "claude",
    label: "Claude",
    isApiDirect: false,
    plans: [
      { planId: "free",          label: "Free" },
      { planId: "pro",           label: "Pro" },
      { planId: "max",           label: "Max" },
      { planId: "team_standard", label: "Team Standard" },
      { planId: "team_premium",  label: "Team Premium" },
      { planId: "enterprise",    label: "Enterprise" },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    isApiDirect: false,
    plans: [
      { planId: "free",       label: "Free" },
      { planId: "go",         label: "Go" },
      { planId: "plus",       label: "Plus" },
      { planId: "pro",        label: "Pro" },
      { planId: "business",   label: "Business" },
      { planId: "enterprise", label: "Enterprise" },
    ],
  },
  {
    id: "anthropic_api",
    label: "Anthropic API",
    isApiDirect: true,
    plans: [{ planId: "api_direct", label: "API Direct" }],
  },
  {
    id: "openai_api",
    label: "OpenAI API",
    isApiDirect: true,
    plans: [{ planId: "api_direct", label: "API Direct" }],
  },
  {
    id: "gemini",
    label: "Gemini",
    isApiDirect: false,
    plans: [
      { planId: "free",       label: "Free" },
      { planId: "plus",       label: "Plus" },
      { planId: "pro",        label: "Pro" },
      { planId: "ultra",      label: "Ultra" },
      { planId: "workspace",  label: "Workspace" },
      { planId: "enterprise", label: "Enterprise" },
    ],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    isApiDirect: false,
    plans: [
      { planId: "free",       label: "Free" },
      { planId: "pro",        label: "Pro" },
      { planId: "max",        label: "Max" },
      { planId: "teams",      label: "Teams" },
      { planId: "enterprise", label: "Enterprise" },
    ],
  },
];