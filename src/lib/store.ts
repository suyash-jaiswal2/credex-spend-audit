import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuditInput, ToolEntry, UseCase } from "@/types";

interface AuditStore {
  input: AuditInput;
  setTools: (tools: ToolEntry[]) => void;
  upsertTool: (entry: ToolEntry) => void;
  removeTool: (toolId: string) => void;
  setTeamSize: (n: number) => void;
  setUseCase: (u: UseCase) => void;
  reset: () => void;
}

const DEFAULT_INPUT: AuditInput = {
  tools: [],
  teamSize: 1,
  useCase: "mixed",
};

export const useAuditStore = create<AuditStore>()(
  persist(
    (set) => ({
      input: DEFAULT_INPUT,
      setTools: (tools) => set((s) => ({ input: { ...s.input, tools } })),
      upsertTool: (entry) =>
        set((s) => {
          const existing = s.input.tools.find((t) => t.toolId === entry.toolId);
          const tools = existing
            ? s.input.tools.map((t) => (t.toolId === entry.toolId ? entry : t))
            : [...s.input.tools, entry];
          return { input: { ...s.input, tools } };
        }),
      removeTool: (toolId) =>
        set((s) => ({
          input: { ...s.input, tools: s.input.tools.filter((t) => t.toolId !== toolId) },
        })),
      setTeamSize: (teamSize) => set((s) => ({ input: { ...s.input, teamSize } })),
      setUseCase: (useCase) => set((s) => ({ input: { ...s.input, useCase } })),
      reset: () => set({ input: DEFAULT_INPUT }),
    }),
    { name: "credex-audit-input" }  // localStorage key
  )
);