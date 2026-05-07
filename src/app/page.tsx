"use client";

import { useRouter } from "next/navigation";
import { SpendForm } from "@/components/SpendForm";
import { useAuditStore } from "@/lib/store";
import { runAudit } from "@/lib/audit-engine";

export default function Home() {
  const router = useRouter();
  const { input } = useAuditStore();

  function handleSubmit() {
    const result = runAudit(input);
    // Day 4 you'll POST this to /api/audit and get a real ID back
    // For now, stash in sessionStorage and navigate
    sessionStorage.setItem("audit_result", JSON.stringify(result));
    router.push("/audit/preview");
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-medium mb-2">AI spend audit</h1>
      <p className="text-muted-foreground mb-8">
        Find out where you&apos;re overpaying on AI tools — free, no account needed.
      </p>
      <SpendForm onSubmit={handleSubmit} />
    </main>
  );
}