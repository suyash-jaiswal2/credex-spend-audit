"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuditResult } from "@/types";
import { useAuditStore } from "@/lib/store";
import dynamic from "next/dynamic";
import { SpendForm } from "@/components/SpendForm";

const ThemeToggle = dynamic(
  () => import("@/components/ThemeToggle").then((m) => m.ThemeToggle),
  { ssr: false, loading: () => <div className="w-10 h-10 border border-foreground/10 rounded-md" /> }
);

export default function Home() {
  const router = useRouter();
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b bg-background px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            C
          </div>
          <span className="font-semibold tracking-tight text-lg">
            Credex
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center p-6 md:p-12 lg:p-24">
        <div className="w-full max-w-2xl space-y-10">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Audit your AI spend.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
              Discover where you&apos;re overpaying on AI tools. Professional analysis, instantly.
            </p>
          </div>
          
          {/* Honeypot — do not remove */}
          <input
            type="text"
            name="_hp"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
          />
          
          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 font-medium flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle h-5 w-5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}
          
          <div className="pt-4">
            <SpendForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}