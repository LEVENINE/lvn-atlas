# Merge README — Budget editing in the web client

Branch: `feature/budget-ui`
Base: `main` at `b9d909a`
Commit: `65ffa6a` — Add budget editing to the blueprint detail page

## Summary

The budgets API (`GET/PUT /api/v1/blueprints/:id/budget`) was already merged, but the web
client still told users that budgeting was being built. The blueprint detail page now
edits the blueprint's monthly budget directly.

## What changed

| Area                                         | Change                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/lib/api.ts`                    | Added `ExpenseCategory`, budget expense item, and `Budget` types, plus `expenseCategories()`, `budget(blueprintId)`, and `replaceBudget(blueprintId, items)`. |
| `apps/web/src/components/BudgetEditor.tsx`   | New editor: loads categories and the saved budget together, one amount field per category, running monthly total, save through the replace-budget endpoint.   |
| `apps/web/src/pages/BlueprintDetailPage.tsx` | Replaced the "What this plan does not have yet" placeholder with the editor.                                                                                  |
| `apps/web/src/pages/NewBlueprintPage.tsx`    | Removed the "once budgeting ships" copy.                                                                                                                      |     | `README.md` | Detail screen listed as "Blueprint detail, budget editing, and delete"; budget paragraph rewritten; status focus updated. |
| `docs/IMPLEMENTATION_PLAN.md`                | Repository status and Split 1.4 notes now cover web budget editing; Delivery Rules state the README update, merge README, and `pnpm check` gate.              |
| `docs/merge-readme.md`                       | This file, regenerated per merge.                                                                                                                             |

## Behavior

- Every shared expense category is shown; categories with a saved amount are prefilled.
- Saving sends only categories with an amount greater than zero, so clearing a field
  removes that expense item — matching the API's replace-the-complete-set contract.
- Amounts are rounded to two decimals before the request; negative or non-numeric input
  is rejected client-side with a `Notice`.
- The Save button is disabled until something changes; load and save failures render as
  `Notice`s; a successful save refreshes the fields from the API response.

## Out of scope

Derived figures (savings, remaining income, Atlas Score) stay with Split 1.5, the
financial calculation engine. The client total is a display-only sum of the entered
amounts.

## Verification

- `pnpm check` on the branch: exit 0 — lint, typecheck, format, 57 API tests in 7 files,
  API build, web build.
- Vite serves `src/components/BudgetEditor.tsx` and `/` with HTTP 200.
- Not verified: manual click-through of the save round-trip in the browser.

## Merge notes

- No migrations, environment variables, or dependency changes.
- Merge commit title: `Merge pull request #16 from LEVENINE/feature/budget-ui`
- Follow-up: Split 1.5 should expose server-computed totals so the client stops summing
  locally.
