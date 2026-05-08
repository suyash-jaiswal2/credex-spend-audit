## Audit summary prompt

### Prompt
[paste the exact prompt string from generateAuditSummary]

### Why this way
- Second person keeps it personal and actionable
- Numbers are injected directly so the model can't hallucinate them
- "Do not mention Credex" keeps the summary feeling neutral and trustworthy
- 80-100 word limit keeps it scannable on the results page

### What I tried that didn't work
- Asking for bullet points — looked like generic AI output, not a personal summary
- Letting the model infer the numbers — it rounded differently and felt inconsistent

### Fallback
If the API call fails, `fallbackSummary()` assembles a templated string from
the same data. Users never see a broken state.

## Switched from Anthropic to Groq

Anthropic API requires paid access. Groq offers a free tier with
llama-3.3-70b-versatile — comparable output quality for a ~100-word summary task.
Fallback behaviour is identical: if the API call fails for any reason,
`fallbackSummary()` assembles a templated string from the audit data directly.