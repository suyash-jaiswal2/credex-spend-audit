"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  auditId: string;
  isOptimal: boolean;
}

export function LeadCaptureForm({ auditId, isOptimal }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, email, company, role, _hp: "" }),
      });
      setSubmitted(true);
    } catch {
      // silent fail — lead capture is non-critical
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border p-6 text-center space-y-1">
        <p className="font-medium">Report sent ✓</p>
        <p className="text-sm text-muted-foreground">Check your inbox for your audit summary.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <div>
        <p className="font-medium">
          {isOptimal ? "Get notified when new optimisations apply to your stack" : "Get your full report by email"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isOptimal
            ? "AI pricing changes fast. We'll let you know when there's a saving opportunity."
            : "We'll send a PDF summary and flag if Credex credits could save you more."}
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Work email *</Label>
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Company (optional)</Label>
            <Input
              placeholder="Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Role (optional)</Label>
            <Input
              placeholder="CTO"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="_hp"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
      />

      <Button className="w-full" onClick={handleSubmit} disabled={loading || !email}>
        {loading ? "Sending..." : "Send my report"}
      </Button>
    </div>
  );
}