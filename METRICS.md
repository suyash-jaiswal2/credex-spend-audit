# METRICS.md

## North Star metric
**Audits completed per week**

Why: it's the moment value is delivered. Everything upstream (traffic, form
completion) and downstream (email capture, consultations) is driven by this
number. DAU is wrong for a tool people use once a quarter — weekly audit
completions captures real usage without flattering with repeat visitors.

## 3 input metrics
1. **Landing page → form start rate** — are visitors engaging with the product?
   Target: >40%. Below 25% means the hero copy or form design is broken.

2. **Form start → audit completion rate** — is the form too long or confusing?
   Target: >60%. Below 40% means a specific field is causing drop-off.

3. **Audit completion → email capture rate** — is enough value being shown?
   Target: >25%. Below 15% means the results page isn't compelling enough.

## What to instrument first
1. Audit completion event (with total_monthly_savings bucket: $0, $1-100, $100-500, $500+)
2. Email capture event (with audit savings bucket)
3. Credex CTA click event (only fires for >$500 audits)
4. Share URL copy event

Use Vercel Analytics (free, already available) + a simple events table in Supabase.

## Pivot trigger
If after 200 audit completions:
- Email capture rate is below 10% → the results page isn't delivering enough
  value; rethink the audit engine or results layout before more acquisition
- >60% of audits show $0 savings → pricing data is wrong or target users
  already optimised; broaden tool coverage or shift to API cost analysis
- Zero Credex CTA clicks despite high-savings audits → CTA placement or
  copy is broken; move the Credex block above the fold on the results page