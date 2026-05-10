"use client";

import { useState, useEffect } from "react";
import type { AuditResult } from "@/types";
import { AuditResultsView } from "@/components/AuditResultsView";

interface Props {
  serverResult: AuditResult;
}

export function AuditClient({ serverResult }: Props) {
  const [result, setResult] = useState<AuditResult>(serverResult);

  useEffect(() => {
    // Client-side hydration from sessionStorage if needed, but we start with SSR result
    const cached = sessionStorage.getItem("audit_result");
    if (cached) {
      try {
        const parsed: AuditResult = JSON.parse(cached);
        if (parsed.id === serverResult.id) {
          setResult(parsed);
        }
      } catch (e) {
        console.error("Failed to parse cached audit result", e);
      }
    }
  }, [serverResult.id, serverResult]);

  return <AuditResultsView result={result} isPublic={false} />;
}