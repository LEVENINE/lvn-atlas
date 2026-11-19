# Merge README — Atlas Score in budget responses

Branch: `feature/budget-score-response`
Base: `main` at `0ffce33`

## Summary

Budget reads and writes now return the recalculated `atlasScore` alongside the budget
summary. The web app applies that score from the save response instead of re-reading the
blueprint, so editing a budget costs one request and cannot leave a stale score behind.

## What changed

| Area                                                                                                                          | Change                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/services/budget.service.ts`                                                                                     | Budget serialization computes and returns `atlasScore` from the expense items and the blueprint's income and household size. |
| `apps/api/src/controllers/budget.controller.ts`                                                                               | Passes the owned blueprint's household size into budget reads and replaces.                                                  |
| `apps/api/tests/budgets.test.ts`                                                                                              | Asserts the score on read, the recalculated factors on replace, and the cleared-budget score.                                |
| `apps/web/src/lib/api.ts`                                                                                                     | `Budget` gains `summary` and `atlasScore` types.                                                                             |
| `apps/web/src/components/BudgetEditor.tsx`                                                                                    | `onSaved` now hands the returned score to the parent.                                                                        |
| `apps/web/src/pages/BlueprintDetailPage.tsx`                                                                                  | Applies the saved score to the header without refetching; the refetch error state is gone.                                   |
| `bruno/LVN Atlas API/Budgets/*.yml`                                                                                           | Request tests assert the score and its factors.                                                                              |
| `README.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/architecture/01-domain-model.md`, `docs/architecture/07-web-application.md` | Document the score on budget responses and fix stale web-client limitations.                                                 |

## Behavior

- `GET /api/v1/blueprints/:id/budget` and `PUT /api/v1/blueprints/:id/budget` include:

```json
"atlasScore": {
  "score": 100,
  "band": "Strong",
  "factors": {
    "savingsRate": 0.85,
    "expenseRatio": 0.15,
    "housingCostRatio": 0.1,
    "householdSize": 2
  }
}
```

- The score is computed from the saved expense items, so the value in a `PUT` response
  already reflects the new budget.
- No extra query: income and household size come from the blueprint the controller
  already loads for ownership checks.

## Out of scope

- Live scoring while the user types (a preview endpoint remains a later option).
- Comparison-oriented dashboard data (Split 1.7).

## Verification

- `pnpm check` on the branch (see results in the PR).
- API tests cover read, replace, and cleared-budget scores.
- Not verified: the Bruno collection against a live database, and the score card in a
  browser.

## Merge notes

- No migrations, environment variables, or dependency changes.
- Merge commit title follows the PR title.
