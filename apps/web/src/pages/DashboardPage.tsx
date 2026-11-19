import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { BlueprintCard } from "../components/BlueprintCard";
import { Notice } from "../components/Notice";
import { api, errorMessage, type Blueprint } from "../lib/api";
import { formatCurrency, pluralize } from "../lib/format";

export function DashboardPage() {
  const { user } = useAuth();

  const [blueprints, setBlueprints] = useState<Blueprint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    setError(null);

    api
      .blueprints()
      .then((data) => {
        if (active) {
          setBlueprints(data);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setBlueprints([]);
          setError(errorMessage(loadError));
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.deleteBlueprint(id);

      setBlueprints((current) =>
        current ? current.filter((blueprint) => blueprint.id !== id) : current,
      );
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  }, []);

  const total = blueprints?.length ?? 0;
  const destinationCount = new Set(
    blueprints?.map((blueprint) => blueprint.destinationCity.id),
  ).size;
  const averageIncome =
    total > 0
      ? (blueprints ?? []).reduce(
          (sum, blueprint) => sum + Number(blueprint.expectedMonthlyIncome),
          0,
        ) / total
      : 0;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Migration workspace</p>

          <h1 className="mt-4 font-display text-4xl leading-tight text-mist-50 sm:text-5xl">
            {user?.profile
              ? `${user.profile.firstName}, where could you live next?`
              : "Where could you live next?"}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist-400">
            Each blueprint holds one relocation scenario: two cities, the income
            you expect there, and who is moving with you. Budgets and savings
            projections arrive in the next milestone.
          </p>
        </div>

        <Link to="/blueprints/new" className="btn-primary shrink-0">
          New blueprint
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      {error && (
        <div className="flex flex-col gap-3">
          <Notice>{error}</Notice>

          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="self-start text-xs text-mist-400 underline underline-offset-4 transition hover:text-mist-100"
          >
            Try again
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Blueprints saved" value={String(total)} />
        <StatCard
          label="Destinations explored"
          value={String(destinationCount)}
        />
        <StatCard
          label="Average expected income"
          value={total > 0 ? formatCurrency(averageIncome) : "—"}
          hint="per month"
        />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="font-display text-2xl text-mist-50">
            Your blueprints
          </h2>

          <p className="text-xs text-mist-500">
            {total} {pluralize(total, "plan", "plans")}
          </p>
        </div>

        {blueprints === null ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((key) => (
              <div
                key={key}
                className="h-72 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : blueprints.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {blueprints.map((blueprint) => (
              <BlueprintCard
                key={blueprint.id}
                blueprint={blueprint}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card px-5 py-4">
      <p className="eyebrow">{label}</p>

      <p className="mt-3 font-display text-2xl text-mist-50">
        {value}
        {hint && <span className="ml-1 text-xs text-mist-500">{hint}</span>}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-white/15 px-8 py-16 text-center">
      <svg viewBox="0 0 120 40" aria-hidden="true" className="h-10 w-40">
        <path
          d="M4 30c22-24 90-24 112 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 5"
          className="text-white/20"
        />
        <circle cx="4" cy="30" r="3" className="fill-ember-400" />
        <circle cx="116" cy="30" r="3" className="fill-tide-400" />
      </svg>

      <div>
        <h3 className="font-display text-xl text-mist-50">No blueprints yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-mist-400">
          Start with where you are and where you are considering. You can keep
          as many scenarios side by side as you need.
        </p>
      </div>

      <Link to="/blueprints/new" className="btn-ghost">
        Create your first blueprint
      </Link>
    </div>
  );
}
