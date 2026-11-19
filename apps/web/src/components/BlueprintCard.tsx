import { useState } from "react";
import { Link } from "react-router-dom";

import type { Blueprint } from "../lib/api";
import { formatCurrency, formatDate, formatHousehold } from "../lib/format";
import { RouteLine } from "./RouteLine";

export function BlueprintCard({
  blueprint,
  onDelete,
}: {
  blueprint: Blueprint;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    try {
      await onDelete(blueprint.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <article className="card group flex flex-col gap-6 p-6 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Migration blueprint</p>
          <p className="mt-1 text-xs text-mist-500">
            Saved {formatDate(blueprint.createdAt)}
          </p>
        </div>

        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] tracking-[0.14em] text-mist-400 uppercase">
          Draft
        </span>
      </div>

      <RouteLine
        origin={blueprint.originCity}
        destination={blueprint.destinationCity}
      />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-5 text-sm">
        <div>
          <dt className="eyebrow">Expected income</dt>
          <dd className="mt-1 text-mist-100">
            {formatCurrency(blueprint.expectedMonthlyIncome)}
            <span className="text-xs text-mist-500"> /mo</span>
          </dd>
        </div>

        <div>
          <dt className="eyebrow">Household</dt>
          <dd className="mt-1 text-mist-100">
            {formatHousehold(blueprint.relocatingHouseholdSize)}
          </dd>
        </div>

        <div>
          <dt className="eyebrow">Planned move</dt>
          <dd className="mt-1 text-mist-100">
            {formatDate(blueprint.plannedRelocationDate)}
          </dd>
        </div>

        <div>
          <dt className="eyebrow">Monthly expenses</dt>
          <dd className="mt-1 text-mist-100">
            {formatCurrency(blueprint.summary.totalExpenses)}
          </dd>
        </div>

        <div>
          <dt className="eyebrow">Expected savings</dt>
          <dd
            className={`mt-1 ${
              Number(blueprint.summary.expectedSavings) < 0
                ? "text-red-300"
                : "text-mist-100"
            }`}
          >
            {formatCurrency(blueprint.summary.expectedSavings)}
          </dd>
        </div>

        <div>
          <dt className="eyebrow">Atlas Score</dt>
          <dd className="mt-1 text-mist-100">
            {blueprint.atlasScore.score} / 100
            <span className="text-xs text-mist-500">
              {" "}
              · {blueprint.atlasScore.band}
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3">
        <Link
          to={`/blueprints/${blueprint.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-ember-300 transition hover:text-ember-200"
        >
          Open plan
          <span aria-hidden="true">→</span>
        </Link>

        {confirming ? (
          <span className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full bg-red-400/15 px-3 py-1.5 font-medium text-red-200 transition hover:bg-red-400/25 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-full px-2 py-1.5 text-mist-400 transition hover:text-mist-100"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-xs text-mist-500 transition hover:text-red-300"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
