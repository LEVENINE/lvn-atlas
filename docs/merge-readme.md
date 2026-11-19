# Merge README — Financial calculation engine (Split 1.5)

Branch: `feature/financial-calculation-engine`
Base: `main` at `f913872`

## Summary

Budget figures are now derived server-side. Every budget read and replace returns a
`summary` computed from the blueprint's expected monthly income and its expense items, so
clients never calculate or submit totals themselves.

## What changed

| Area | Change |
| --- | --- |
| `apps/api/src/services/financial.service.ts` | New pure calculation module: decimal sum of expenses plus `summarizeBudget`. |
| `apps/api/src/services/budget.service.ts` | Budget serialization takes the blueprint income and attaches the summary. |
| `apps/api/src/controllers/budget.controller.ts` | Passes the owned blueprint's income into budget reads and replaces. |
| `apps/api/tests/financial.test.ts` | Unit tests for sums, zero expenses, derived savings, negative savings, and formatting. |
| `apps/api/tests/budgets.test.ts` | Endpoint tests assert the summary on read, on replace, and after clearing a budget. |
| `bruno/LVN Atlas API/Budgets/*.yml` | Request tests assert the summary fields and recalculation. |
| `README.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/architecture/01-domain-model.md` | Document the summary, its formulas, and the disposable-income caveat. |

## API behavior

Both `GET /api/v1/blueprints/:id/budget` and `PUT /api/v1/blueprints/:id/budget` now
include:

```json
"summary": {
  "expectedMonthlyIncome": "250000.00",
  "totalExpenses": "37000.00",
  "expectedSavings": "213000.00",
  "disposableIncome": "213000.00"
}
```

- `totalExpenses` is the decimal sum of the returned expense items.
- `expectedSavings` is income minus expenses and can be negative.
- `disposableIncome` equals `expectedSavings` until categories are classified as essential
  or discretionary.
- Values are two-decimal strings; no derived value is accepted from the client.

## Out of scope

- The web client still shows its own running total while editing and does not render the
  summary yet.
- Atlas Score v1 (Split 1.6) will consume this summary.

## Verification

- `pnpm check` on the branch (see results in the PR).
- `pnpm --filter @lvn/api test`: 62 tests in 8 files passed, including the new financial
  and endpoint assertions.
- Not verified: Bruno collection run against a live database in this session.

## Merge notes

- No migrations, environment variables, or dependency changes.
- Merge commit title: `Merge pull request #18 from LEVENINE/feature/financial-calculation-engine`
