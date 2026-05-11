# TESTS.md

## Running all tests

\```bash
npm test
\```

## Test files

### `src/lib/__tests__/audit-engine.test.ts`

Covers the core audit engine — the most business-critical code in the project.

| Test | What it covers |
|---|---|
| `returns zero savings for an empty tool list` | `runAudit` handles empty input without throwing |
| `totalAnnualSavings is exactly 12× totalMonthlySavings` | Annual savings calculation is correct |
| `never returns negative total savings` | Engine never returns a negative saving |
| `recommends downgrade from Teams to Pro for a team of 2` | Cursor Teams downgrade rule fires correctly for small teams |
| `recommends keep for a correctly-sized Teams plan (8 seats)` | Cursor Teams keep rule fires correctly — no false positives |

## How to run individual test files

\```bash
npm test -- src/lib/__tests__/audit-engine.test.ts
\```

## CI

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`.
The workflow runs `npm run lint` then `npm test`.
Current status: ✅ passing