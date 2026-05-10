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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Team context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <Label className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Team size</Label>
          <Input
            type="number"
            min={1}
            value={input.teamSize || ""}
            onChange={(e) => setTeamSize(e.target.value ? Number(e.target.value) : 1)}
            className="h-11 transition-all"
            placeholder="1"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Primary use case</Label>
          <Select value={input.useCase} onValueChange={(v) => v && setUseCase(v as UseCase)}>
            <SelectTrigger className="h-11 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["coding","writing","data","research","mixed"] as UseCase[]).map((u) => (
                <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add a tool */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Add Tool to Audit</Label>
          <Select value={selectedToolId} onValueChange={(v) => setSelectedToolId(v as ToolId)}>
            <SelectTrigger className="h-11 shadow-sm transition-all bg-card">
              <SelectValue placeholder="Select a tool..." />
            </SelectTrigger>
            <SelectContent>
              {TOOLS.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button 
            variant="secondary" 
            onClick={handleAddTool} 
            disabled={!selectedToolId}
            className="w-full sm:w-auto h-11 px-8 font-medium shadow-sm transition-all"
          >
            Add Tool
          </Button>
        </div>
      </div>

      {/* Tool entries */}
      <div className="space-y-4">
        {input.tools.map((entry, index) => {
          const meta = TOOLS.find((t) => t.id === entry.toolId)!;
          return (
            <div key={entry.toolId} className="p-6 rounded-xl border bg-card shadow-sm space-y-5 relative transition-all hover:shadow-md animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-lg font-semibold tracking-tight">{meta.label}</span>
                </div>
                <button
                  onClick={() => removeTool(entry.toolId)}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Plan */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Plan</Label>
                  <Select
                    value={entry.plan}
                    onValueChange={(v) => v && upsertTool({ ...entry, plan: v })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meta.plans.map((p) => (
                        <SelectItem key={p.planId} value={p.planId}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seats — hidden for API-direct tools */}
                {!meta.isApiDirect && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Seats</Label>
                    <Input
                      type="number"
                      min={1}
                      value={entry.seats || ""}
                      onChange={(e) => upsertTool({ ...entry, seats: e.target.value ? Number(e.target.value) : 1 })}
                      className="h-10"
                      placeholder="1"
                    />
                  </div>
                )}

                {/* Monthly spend */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Monthly Spend ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min={0}
                      value={entry.monthlySpend || ""}
                      onChange={(e) => upsertTool({ ...entry, monthlySpend: e.target.value ? Number(e.target.value) : 0 })}
                      className="h-10 pl-7 font-mono"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {input.tools.length > 0 && (
        <div className="pt-6">
          <Button 
            className="w-full h-14 text-base font-medium tracking-wide shadow-md hover:shadow-lg transition-all" 
            onClick={onSubmit} 
            disabled={loading}
          >
            {loading ? "Analyzing spend data..." : "Generate Audit Report"}
          </Button>
        </div>
      )}
    </div>
  );
}