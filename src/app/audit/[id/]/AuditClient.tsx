"use client";

import { useState } from "react";
import type { AuditResult } from "@/types";
import { AuditResultsView } from "@/components/AuditResultsView";

interface Props {
  serverResult: AuditResult;
}

export function AuditClient({ serverResult }: Props) {
  const [result] = useState<AuditResult>(() => {
    if (typeof window === "undefined") return serverResult;
    const cached = sessionStorage.getItem("audit_result");
    if (!cached) return serverResult;
    const parsed: AuditResult = JSON.parse(cached);
    // Only use cache if it matches this audit ID
    return parsed.id === serverResult.id ? parsed : serverResult;
  });

  return <AuditResultsView result={result} isPublic={false} />;
}