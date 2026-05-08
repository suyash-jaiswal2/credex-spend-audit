"use client";

import { useState } from "react";
import { TOOLS } from "@/lib/tools";
import { useAuditStore } from "@/lib/store";
import type { ToolId, UseCase } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  onSubmit: () => void;
  loading?: boolean;
}

export function SpendForm({ onSubmit, loading = false }: Props)  {
  const { input, upsertTool, removeTool, setTeamSize, setUseCase } = useAuditStore();
  const [selectedToolId, setSelectedToolId] = useState<ToolId | "">("");

  const tool = TOOLS.find((t) => t.id === selectedToolId);

  function handleAddTool() {
    if (!selectedToolId || !tool) return;
    upsertTool({
      toolId: selectedToolId,
      plan: tool.plans[0].planId,
      seats: 1,
      monthlySpend: 0,
    });
  }

  return (
    <div className="space-y-6">
      {/* Team context */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Team size</Label>
          <Input
            type="number"
            min={1}
            value={input.teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Primary use case</Label>
          <Select value={input.useCase} onValueChange={(v) => v && setUseCase(v as UseCase)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["coding","writing","data","research","mixed"] as UseCase[]).map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add a tool */}
      <div className="flex gap-2">
        <Select value={selectedToolId} onValueChange={(v) => setSelectedToolId(v as ToolId)}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Add a tool..." /></SelectTrigger>
          <SelectContent>
            {TOOLS.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleAddTool} disabled={!selectedToolId}>
          Add
        </Button>
      </div>

      {/* Tool entries */}
      {input.tools.map((entry) => {
        const meta = TOOLS.find((t) => t.id === entry.toolId)!;
        return (
          <div key={entry.toolId} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{meta.label}</span>
              <button
                onClick={() => removeTool(entry.toolId)}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Plan */}
              <div className="space-y-1">
                <Label className="text-xs">Plan</Label>
                <Select
                  value={entry.plan}
                  onValueChange={(v) => v && upsertTool({ ...entry, plan: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {meta.plans.map((p) => (
                      <SelectItem key={p.planId} value={p.planId}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seats — hidden for API-direct tools */}
              {!meta.isApiDirect && (
                <div className="space-y-1">
                  <Label className="text-xs">Seats</Label>
                  <Input
                    type="number"
                    min={1}
                    value={entry.seats}
                    onChange={(e) => upsertTool({ ...entry, seats: Number(e.target.value) })}
                  />
                </div>
              )}

              {/* Monthly spend */}
              <div className="space-y-1">
                <Label className="text-xs">Monthly spend ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={entry.monthlySpend}
                  onChange={(e) => upsertTool({ ...entry, monthlySpend: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Submit */}
      {input.tools.length > 0 && (
        <Button className="w-full" onClick={onSubmit} disabled={loading}>
          {loading ? "Analysing..." : "Run audit →"}
        </Button>
      )}
    </div>
  );
}