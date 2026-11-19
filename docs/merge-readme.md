# Merge README — Blueprint comparison and dashboard data (Split 1.7)

Branch: `feature/blueprint-comparison`
Base: `main` at `9ca1664`

## Summary

Blueprint list and detail responses now carry the budget-derived summary next to the
Atlas Score, so saved scenarios can be compared from a single request. The dashboard
renders those figures on each card and adds a side-by-side comparison table once a user
has more than one blueprint.

## What changed

| Area                                                                                  | Change                                                                                                    |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `apps/api/src/services/blueprint.service.ts`                                          | Blueprint responses include `summary` computed from the already-loaded budget.                            |
| `apps/api/tests/blueprints.test.ts`                                                   | Asserts an empty-budget summary and the budgeted summary alongside the score.                             |
| `apps/web/src/lib/api.ts`                                                             | Extracted `BudgetSummary` and added `summary` to `Blueprint`.                                             |
| `apps/web/src/components/BlueprintCard.tsx`                                           | Cards show monthly expenses, expected savings (red when negative), and the Atlas Score.                   |
| `apps/web/src/pages/DashboardPage.tsx`                                                | Adds a "Compare scenarios" table for two or more blueprints; copy no longer says budgets are future work. |
| `bruno/LVN Atlas API/Blueprints/*.yml`                                                | Request tests assert the comparison figures on list and detail.                                           |
| `README.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/architecture/07-web-application.md` | Document comparison data, mark Split 1.7 complete, and refresh limitations.                               |

## Behavior

Blueprint responses now include:

```json
"summary": {
  "expectedMonthlyIncome": "250000.00",
  "totalExpenses": "25000.00",
  "expectedSavings": "225000.00",
  "disposableIncome": "225000.00"
}
```

- No new endpoint or query: the list response is the comparison payload.
- Dashboard comparison table columns: scenario route (links to detail), Atlas Score and
  band, income, expenses, and savings. Shown only when at least two blueprints exist.
- Budget edits still update figures through the budget endpoints; blueprint figures
  refresh with the next blueprint read.

## Out of scope

- Editing a blueprint's income or household size from the web client.
- Choosing which blueprints to compare; the dashboard compares all of them.
- Migration journey data.

## Verification

- `pnpm check` on the branch (see results in the PR).
- API tests cover empty-budget and budgeted summaries on blueprint responses.
- Not verified: the dashboard comparison table in a browser, or a live Bruno run.

## Merge notes

- No migrations, environment variables, or dependency changes.
- Merge commit title follows the PR title.
