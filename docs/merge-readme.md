# Merge README — Atlas Score v1 (Split 1.6)

Branch: `feature/atlas-score`
Base: `main` at `bf69840`

## Summary

Blueprint responses now include a server-computed `atlasScore`: a 0–100 readiness
estimate with a band and the factor breakdown behind it. It is derived from the
blueprint's income, household size, and budget on every response — never stored and
never accepted from the client.

## What changed

| Area                                                                               | Change                                                                                         |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/api/src/services/atlas-score.service.ts`                                     | New pure scoring module with documented weights, bands, and factors.                           |
| `apps/api/src/services/blueprint.service.ts`                                       | Blueprint queries load the budget, compute the score, and keep the budget out of the response. |
| `apps/api/tests/atlas-score.test.ts`                                               | Unit tests for full marks, tight band, overspending, missing rent, and household penalty.      |
| `apps/api/tests/blueprints.test.ts`                                                | Endpoint test proves the score is returned and the budget is not leaked.                       |
| `apps/web/src/lib/api.ts`                                                          | `AtlasScore` type on `Blueprint`.                                                              |
| `apps/web/src/pages/BlueprintDetailPage.tsx`                                       | Shows the score and band; refreshes the blueprint after a budget save.                         |
| `apps/web/src/components/BudgetEditor.tsx`                                         | Optional `onSaved` callback so the parent can refresh derived values.                          |
| `bruno/LVN Atlas API/Blueprints/*.yml`                                             | Request tests assert the score shape on list and detail.                                       |
| `README.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/architecture/01-domain-model.md` | Document the score, its formula, and Split 1.6 status.                                         |

## Formula

| Factor             | Points | Full marks            | Zero marks                                |
| ------------------ | ------ | --------------------- | ----------------------------------------- |
| Savings rate       | 45     | 30% of income saved   | No savings or overspending                |
| Expense burden     | 25     | 50% of income spent   | 100% of income spent                      |
| Housing cost ratio | 20     | 25% of income on rent | 60% of income on rent                     |
| Household size     | 10     | Two people or fewer   | Six or more (two points per extra person) |

- Housing uses the `Rent` expense category; with no rent recorded it earns half marks.
- Bands: `Strong` 80–100, `Promising` 60–79, `Tight` 40–59, `At risk` 0–39.
- Community and migration journey data are not modelled yet and do not contribute.

Response shape:

```json
"atlasScore": {
  "score": 84,
  "band": "Strong",
  "factors": {
    "savingsRate": 0.5,
    "expenseRatio": 0.5,
    "housingCostRatio": 0.5,
    "householdSize": 3
  }
}
```

## Out of scope

- Comparison-oriented dashboard data (Split 1.7).
- Journey and community factors in the score.
- Storing score history.

## Verification

- `pnpm check` on the branch (see results in the PR).
- Live check against Postgres: a temporary blueprint scored 88 with no expenses, then 84
  after adding ₹60,000 rent; the blueprint was deleted afterward.
- Not verified: the Bruno collection run against a live database.

## Merge notes

- No migrations, environment variables, or dependency changes.
- Client input for the score is rejected implicitly: the field is never read from requests.
- Merge commit title follows the PR title.
