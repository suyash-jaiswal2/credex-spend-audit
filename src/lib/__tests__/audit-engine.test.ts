import { describe, it, expect } from "vitest";
import { runAudit, auditTool } from "../audit-engine";
import type { AuditInput, ToolEntry } from "@/types";

// ── runAudit ──────────────────────────────────────────────────────────────────

describe("runAudit", () => {
  it("returns zero savings for an empty tool list", () => {
    const input: AuditInput = { tools: [], teamSize: 3, useCase: "coding" };
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
  });

  it("totalAnnualSavings is exactly 12× totalMonthlySavings", () => {
    const entry: ToolEntry = {
      toolId: "cursor",
      plan: "business",
      seats: 2,
      monthlySpend: 80,
    };
    const input: AuditInput = { tools: [entry], teamSize: 2, useCase: "coding" };
    const result = runAudit(input);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("never returns negative total savings", () => {
    const entry: ToolEntry = {
      toolId: "cursor",
      plan: "pro",
      seats: 1,
      monthlySpend: 20,
    };
    const input: AuditInput = { tools: [entry], teamSize: 1, useCase: "coding" };
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
  });
});

// ── auditTool — Cursor ────────────────────────────────────────────────────────

describe("auditTool — cursor", () => {
  it("recommends downgrade from Business to Pro for a team of 2", () => {
    const entry: ToolEntry = {
      toolId: "cursor",
      plan: "business",
      seats: 2,
      monthlySpend: 80,
    };
    const input: AuditInput = { tools: [entry], teamSize: 2, useCase: "coding" };
    const rec = auditTool(entry, input);
    expect(rec.recommendedAction).toBe("downgrade");
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it("recommends keep for a correctly-sized Business plan (8 seats)", () => {
    const entry: ToolEntry = {
      toolId: "cursor",
      plan: "business",
      seats: 8,
      monthlySpend: 320,
    };
    const input: AuditInput = { tools: [entry], teamSize: 8, useCase: "coding" };
    const rec = auditTool(entry, input);
    expect(rec.recommendedAction).toBe("keep");
  });
});