# REFLECTION.md

## 1. The hardest bug I hit this week

The hardest bug was the 404 on the shareable audit URL after deploying to Vercel.
The page worked perfectly on localhost — `/audit/:id` rendered the audit result
correctly every time. On the deployed URL it returned a blank 404.

My first hypothesis was that the Supabase environment variables weren't set in
Vercel. I checked the dashboard — all three keys were there. I then checked the
Supabase table directly and confirmed the audit row existed, so the DB insert was
working fine. The data was there, the keys were there, but the page still 404'd.

My second hypothesis was that the dynamic route folder wasn't deploying correctly.
I checked the Vercel build logs and the route was compiling without errors.

What actually fixed it: Next.js 15 changed `params` from a plain object to a
Promise. In previous versions `params.id` worked synchronously. In Next.js 15,
`params` must be awaited before accessing any property. My `getAudit` function was
receiving `undefined` as the ID, returning null, and the page was calling
`notFound()`. The fix was two lines:

```ts
// before
export default async function AuditPage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);

// after
export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
```

The lesson: when a feature works locally but breaks on deployment, check for
framework version differences before assuming infrastructure issues.

## 2. A decision I reversed mid-week

I originally planned to use the Anthropic API for the AI-generated audit summary.
The brief specifically recommends it and I'd already written the wrapper in
`src/lib/anthropic.ts` with the full prompt and fallback logic.

I reversed this when I realised the Anthropic API requires a paid account with
billing set up — there's no free tier for API access. For a 7-day internship
assignment where the AI summary is one feature out of six, setting up billing and
spending real money felt like the wrong call. The brief says to apply for free
credits if you don't have access, but that process isn't instant.

I switched to Groq, which has a genuine free tier with generous rate limits.
The `llama-3.3-70b-versatile` model produces output comparable to Claude Sonnet
for a short summarisation task. The SDK interface is nearly identical to the
Anthropic SDK so the change took under 30 minutes including updating the prompt.

The fallback behaviour is identical in both implementations — if the API call
fails for any reason, `fallbackSummary()` assembles a templated string from the
audit data directly. Users never see a broken state.

What made me commit to the switch: the feature requirement is "use an LLM to
generate a personalised summary" — it doesn't mandate a specific provider. Using
a free tier that actually works is a better engineering decision than using a
preferred provider that requires setup friction.

## 3. What I would build in week 2

**Embeddable widget** — a `<script>` tag that any blogger or newsletter author
could drop into their site. The widget renders a minimal version of the spend
form inline. This is the highest-leverage distribution feature: every publication
embedding the tool is a passive acquisition channel with zero ongoing CAC. One
viral newsletter embed could drive more completions than a week of social posts.

**Pricing change alerts** — email users when a tool in their saved audit changes
price. This requires a background job that runs weekly, diffs current pricing
against stored audit inputs, and sends a notification if a saving or a price
increase applies to their stack. It brings users back without paid acquisition and
positions the tool as ongoing infrastructure rather than a one-time calculator.

**Benchmark mode** — "your AI spend per developer is $X, companies your size
average $Y." After enough audits, anonymised aggregate data becomes its own
product. This is high shareability — people love knowing where they rank — and
it gives Credex a proprietary dataset no competitor has.

**Referral system** — share the tool, both parties get a small perk (a PDF report,
early access to benchmark data). Turns satisfied users into a distribution channel
without paid incentives.

## 4. How I used AI tools

I used Claude throughout the week as a pair programmer and advisor. Specifically:

- **Scaffolding and boilerplate** — initial project structure, component shells,
  API route patterns, CI workflow. Fast to generate, always reviewed before use.
- **Debugging** — when I hit TypeScript errors or lint failures I pasted the error
  and got targeted fixes. Faster than reading docs for unfamiliar error messages.
- **Documentation** — ARCHITECTURE.md structure, Mermaid diagram syntax,
  ECONOMICS.md unit economics framework.

What I didn't trust AI with:
- **Audit engine reasoning** — the logic connecting a plan recommendation to a
  specific dollar saving had to be written and checked manually. AI-generated
  reasoning was plausible-sounding but not always financially defensible.
- **Pricing data** — every number was pulled directly from vendor pricing pages
  and dated manually. AI pricing knowledge has a training cutoff and is wrong
  more often than it appears.

One specific time the AI was wrong: the original audit engine scaffold used
`plan: "business"` as the plan ID for Cursor's team tier. The real Cursor pricing
page uses `"teams"` not `"business"`. The test checking for a downgrade
recommendation on a 2-person Cursor Business plan was failing because the
condition `plan === "business"` never matched. I caught it by comparing the
scaffold plan IDs against my PRICING_DATA.md line by line.

## 5. Self-ratings

| Dimension | Rating | Reason |
|---|---|---|
| Discipline | 10/10 | I can't rest without getting my work done |
| Code quality | 9/10 | Code is fairly structured |
| Design sense | 9/10 | Minimalist design, nothing too fancy |
| Problem-solving | 10/10 | No issues in the current code base |
| Entrepreneurial thinking | 10/10 | I will be replacing every credex mention so the company can't use my product and brand it as their own |