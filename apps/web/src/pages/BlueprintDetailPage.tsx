import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { BudgetEditor } from "../components/BudgetEditor";
import { Notice } from "../components/Notice";
import { RouteLine } from "../components/RouteLine";
import {
  ApiError,
  api,
  errorMessage,
  type AtlasScore,
  type Blueprint,
} from "../lib/api";
import { formatCurrency, formatDate, formatHousehold } from "../lib/format";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; blueprint: Blueprint }
  | { status: "error"; message: string; missing: boolean };

export function BlueprintDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setState({ status: "loading" });

    api
      .blueprint(id)
      .then((blueprint) => {
        if (active) {
          setState({ status: "ready", blueprint });
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setState({
            status: "error",
            message: errorMessage(loadError),
            missing: loadError instanceof ApiError && loadError.status === 404,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  function handleBudgetSaved(atlasScore: AtlasScore) {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            blueprint: { ...current.blueprint, atlasScore },
          }
        : current,
    );
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteBlueprint(id);
      navigate("/", { replace: true });
    } catch (deleteFailure) {
      setDeleteError(errorMessage(deleteFailure));
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <Link
        to="/"
        className="text-xs text-mist-400 transition hover:text-mist-100"
      >
        ← All blueprints
      </Link>

      {state.status === "loading" && (
        <div className="h-80 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
      )}

      {state.status === "error" && (
        <div className="flex flex-col gap-4">
          <Notice>{state.message}</Notice>

          <Link to="/" className="btn-ghost self-start">
            Back to blueprints
          </Link>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <section className="card flex flex-col gap-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Migration blueprint</p>
                <p className="mt-1 text-xs text-mist-500">
                  Created {formatDate(state.blueprint.createdAt)}
                </p>
              </div>

              <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] tracking-[0.14em] text-mist-400 uppercase">
                Draft
              </span>
            </div>

            <RouteLine
              origin={state.blueprint.originCity}
              destination={state.blueprint.destinationCity}
              size="lg"
            />

            <dl className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
              <Fact
                label="Expected monthly income"
                value={formatCurrency(state.blueprint.expectedMonthlyIncome)}
              />
              <Fact
                label="People relocating"
                value={formatHousehold(state.blueprint.relocatingHouseholdSize)}
              />
              <Fact
                label="Planned move"
                value={formatDate(state.blueprint.plannedRelocationDate)}
              />
              <Fact
                label="Last updated"
                value={formatDate(state.blueprint.updatedAt)}
              />
              <Fact
                label="Atlas Score"
                value={`${state.blueprint.atlasScore.score} / 100 · ${state.blueprint.atlasScore.band}`}
              />
            </dl>
          </section>

          <BudgetEditor
            blueprintId={state.blueprint.id}
            onSaved={handleBudgetSaved}
          />

          <section className="flex flex-col gap-4">
            {deleteError && <Notice>{deleteError}</Notice>}

            <div className="flex flex-wrap items-center gap-3">
              {confirming ? (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-full bg-red-400/15 px-5 py-3 text-sm font-medium text-red-200 transition hover:bg-red-400/25 disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Yes, delete this blueprint"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={deleting}
                    className="btn-ghost"
                  >
                    Keep it
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="text-sm text-mist-500 transition hover:text-red-300"
                >
                  Delete blueprint
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 font-display text-2xl text-mist-50">{value}</dd>
    </div>
  );
}
