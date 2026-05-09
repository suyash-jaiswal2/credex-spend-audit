"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuditResult } from "@/types";
import { SpendForm } from "@/components/SpendForm";
import { useAuditStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();           // add this
  const { input } = useAuditStore();  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, _hp: "" }),
      });

      if (!res.ok) throw new Error("Audit failed");

      const result: AuditResult = await res.json();
      // Store in sessionStorage for immediate display before DB round-trip
      sessionStorage.setItem("audit_result", JSON.stringify(result));
      // Redirect to the permanent shareable URL
      router.push(`/audit/${result.id}`);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-medium mb-2">AI spend audit</h1>
        {/* Honeypot — do not remove */}
        <input
          type="text"
          name="_hp"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
        />
      <p className="text-muted-foreground mb-8">
        Find out where you&apos;re overpaying on AI tools — free, no account needed.
      </p>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
      <SpendForm onSubmit={handleSubmit} loading={loading} />
    </main>
  );
}