import { useEffect, useState, type FormEvent } from "react";

import {
  api,
  errorMessage,
  type AtlasScore,
  type ExpenseCategory,
} from "../lib/api";
import { formatCurrency } from "../lib/format";
import { Notice } from "./Notice";

type Amounts = Record<string, string>;

function amountsFromCategories(
  categories: ExpenseCategory[],
  amounts: Record<string, string> = {},
): Amounts {
  return Object.fromEntries(
    categories.map((category) => [category.id, amounts[category.id] ?? ""]),
  );
}

export function BudgetEditor({
  blueprintId,
  onSaved,
}: {
  blueprintId: string;
  onSaved?: (atlasScore: AtlasScore) => void;
}) {
  const [categories, setCategories] = useState<ExpenseCategory[] | null>(null);
  const [amounts, setAmounts] = useState<Amounts>({});
  const [savedAmounts, setSavedAmounts] = useState<Amounts>({});

  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    setLoadError(null);

    Promise.all([api.expenseCategories(), api.budget(blueprintId)])
      .then(([categoryList, budget]) => {
        if (!active) {
          return;
        }

        const current = Object.fromEntries(
          budget.expenseItems.map((item) => [item.categoryId, item.amount]),
        );
        const nextAmounts = amountsFromCategories(categoryList, current);

        setCategories(categoryList);
        setAmounts(nextAmounts);
        setSavedAmounts(nextAmounts);
      })
      .catch((loadFailure: unknown) => {
        if (active) {
          setCategories([]);
          setLoadError(errorMessage(loadFailure));
        }
      });

    return () => {
      active = false;
    };
  }, [blueprintId]);

  const isDirty =
    categories !== null &&
    JSON.stringify(amounts) !== JSON.stringify(savedAmounts);

  const total = (categories ?? []).reduce(
    (sum, category) => sum + (Number(amounts[category.id]) || 0),
    0,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categories) {
      return;
    }

    setSaveError(null);

    const parsed = categories.map((category) => ({
      category,
      amount: Number(amounts[category.id] || 0),
    }));

    const invalid = parsed.find(
      (entry) => !Number.isFinite(entry.amount) || entry.amount < 0,
    );

    if (invalid) {
      setSaveError(
        `Enter a valid monthly amount for ${invalid.category.name}.`,
      );

      return;
    }

    const expenseItems = parsed
      .filter((entry) => entry.amount > 0)
      .map((entry) => ({
        categoryId: entry.category.id,
        amount: Math.round(entry.amount * 100) / 100,
      }));

    setSaving(true);

    try {
      const budget = await api.replaceBudget(blueprintId, expenseItems);
      const current = Object.fromEntries(
        budget.expenseItems.map((item) => [item.categoryId, item.amount]),
      );
      const nextAmounts = amountsFromCategories(categories, current);

      setAmounts(nextAmounts);
      setSavedAmounts(nextAmounts);
      setSaved(true);
      onSaved?.(budget.atlasScore);
    } catch (saveFailure) {
      setSaveError(errorMessage(saveFailure));
    } finally {
      setSaving(false);
    }
  }

  function updateAmount(categoryId: string, value: string) {
    setSaved(false);
    setAmounts((current) => ({ ...current, [categoryId]: value }));
  }

  return (
    <section className="card flex flex-col gap-6 p-6 sm:p-8">
      <div>
        <h2 className="font-display text-xl text-mist-50">Monthly budget</h2>

        <p className="mt-2 text-sm leading-relaxed text-mist-400">
          Estimate what life in the destination city costs each month. Leave a
          category empty to exclude it.
        </p>
      </div>

      {loadError && <Notice>{loadError}</Notice>}

      {categories === null ? (
        <div className="h-40 animate-pulse rounded-xl bg-white/[0.03]" />
      ) : categories.length === 0 && !loadError ? (
        <p className="text-sm text-mist-500">
          No expense categories are available right now.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          noValidate
        >
          {saveError && <Notice>{saveError}</Notice>}

          <div className="flex flex-col divide-y divide-white/5">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <label
                  htmlFor={`expense-${category.id}`}
                  className="text-sm text-mist-200"
                >
                  {category.name}
                </label>

                <div className="flex items-center gap-2 sm:w-48">
                  <span aria-hidden className="text-xs text-mist-500">
                    ₹
                  </span>
                  <input
                    id={`expense-${category.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.01}
                    value={amounts[category.id] ?? ""}
                    onChange={(event) =>
                      updateAmount(category.id, event.target.value)
                    }
                    placeholder="0"
                    className="field-input py-2 text-right"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <div>
              <p className="eyebrow">Monthly expenses</p>
              <p className="mt-1 font-display text-2xl text-mist-50">
                {formatCurrency(total)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {saved && !isDirty && (
                <span className="text-xs text-tide-300">Budget saved</span>
              )}

              <button
                type="submit"
                disabled={saving || !isDirty}
                className="btn-primary"
              >
                {saving ? "Saving…" : "Save budget"}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
