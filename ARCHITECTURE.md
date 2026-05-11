# ARCHITECTURE.md

## System diagram

```mermaid
flowchart TD
    A[User — browser] -->|fills spend form| B[SpendForm component]
    B -->|Zustand store| C[localStorage persistence]
    B -->|POST /api/audit| D[Audit API route]
    D -->|honeypot + rate limit| D
    D -->|runAudit pure fn| E[Audit Engine]
    E -->|ToolRecommendation[]| D
    D -->|generateAuditSummary| F[Groq API\nllama-3.3-70b]
    F -->|~100 word summary| D
    D -->|insert| G[(Supabase\naudits table)]
    G -->|AuditResult| D
    D -->|AuditResult JSON| B
    B -->|redirect| H[/audit/id — server component]
    H -->|select by id| G
    H -->|renders| I[AuditResultsView]
    I -->|email submitted| J[POST /api/leads]
    J -->|honeypot + rate limit| J
    J -->|insert| K[(Supabase\nleads table)]
    J -->|send| L[Resend email]
```

## Data flow: input → audit result

1. User fills `SpendForm` — state lives in Zustand, persisted to `localStorage`
2. On submit, `page.tsx` POSTs `{ input, _hp }` to `/api/audit`
3. API route checks rate limit and honeypot, then calls `runAudit(input)`
4. `runAudit` maps each `ToolEntry` through its dedicated audit function —
   pure TypeScript, no I/O, fully testable
5. The partial result is passed to `generateAuditSummary` which calls Groq;
   on any failure, `fallbackSummary` returns a templated string
6. The completed `AuditResult` is inserted into Supabase `audits` table
7. The result JSON is returned to the client, stored in `sessionStorage`,
   and the user is redirected to `/audit/:id`
8. The dynamic route is a Next.js server component — it fetches the audit
   from Supabase by ID and renders `AuditResultsView`
9. The public URL strips PII — email and company name are never in the DB
   row, only in the `leads` table which is never exposed client-side

## Stack choices

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router | Server components for the shareable audit page (SEO + OG tags without client JS), API routes co-located, Vercel deployment is trivial |
| Language | TypeScript | Audit engine has complex nested types — TS catches plan ID mismatches and missing cases at compile time, not runtime |
| Styling | Tailwind + shadcn/ui | shadcn gives accessible unstyled primitives; Tailwind keeps bundle small; no design system lock-in |
| State | Zustand + persist | Lightweight, no Provider boilerplate, built-in localStorage middleware |
| Database | Supabase | Postgres with a REST API, free tier sufficient for this scale, row-level security available if needed later |
| Email | Resend | Simple SDK, 3k free emails/month, better deliverability than raw SES for a new domain |
| AI summary | Groq (llama-3.3-70b) | Free tier, low latency (<1s for 100 tokens), graceful fallback if it fails |
| Testing | Vitest | Native ESM, faster than Jest, same API, works with the `@/*` alias without extra config |
| CI | GitHub Actions | Free for public repos, runs lint + tests on every push to main |

## What I'd change at 10k audits/day

1. **Move rate limiting to the edge** — the current in-memory `Map` resets on
   every cold start and doesn't work across multiple serverless instances.
   Replace with Upstash Redis + `@upstash/ratelimit` which works at the
   Vercel edge with zero cold start penalty.

2. **Add a queue for Groq calls** — at high volume, Groq's free tier rate
   limits will cause fallback summaries for most users. Move the AI summary
   generation to a background job (Inngest or Trigger.dev) and poll for
   completion, or switch to a paid Groq tier.

3. **Supabase connection pooling** — Supabase's direct Postgres connection
   limit is low on the free tier. Add PgBouncer or switch to the Supabase
   connection pooler URL for the API routes.

4. **CDN-cache the shareable audit pages** — the `/audit/:id` server
   component always hits Supabase. At scale, add `revalidate = 3600` since
   audit results never change after creation. This would serve 99% of
   shareable URL traffic from Vercel's edge cache.

5. **Separate the audit engine into a standalone package** — currently
   imported directly. At scale you'd want it versioned independently so
   pricing data updates don't require a full app redeploy.