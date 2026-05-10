"use client";

import { useState } from "react";
import type { AuditResult } from "@/types";
import dynamic from "next/dynamic";

const AuditResultsView = dynamic(
  () => import("@/components/AuditResultsView").then((m) => ({ default: m.AuditResultsView })),
  { ssr: false }
);

interface Props {
  serverResult: AuditResult;
}

export function AuditClient({ serverResult }: Props) {
  const [result] = useState<AuditResult>(() => {
    if (typeof window === "undefined") return serverResult;
    const cached = sessionStorage.getItem("audit_result");
    if (!cached) return serverResult;
    const parsed: AuditResult = JSON.parse(cached);
    return parsed.id === serverResult.id ? parsed : serverResult;
  });

  return <AuditResultsView result={result} isPublic={false} />;
}