import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Notice } from "../components/Notice";
import { api, errorMessage, type City } from "../lib/api";
import { formatCurrency } from "../lib/format";

export function NewBlueprintPage() {
  const navigate = useNavigate();

  const [cities, setCities] = useState<City[] | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const [originCityId, setOriginCityId] = useState("");
  const [destinationCityId, setDestinationCityId] = useState("");
  const [income, setIncome] = useState("");
  const [householdSize, setHouseholdSize] = useState("1");
  const [relocationDate, setRelocationDate] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .cities()
      .then((data) => {
        if (active) {
          setCities(data);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setCities([]);
          setCitiesError(errorMessage(loadError));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!originCityId || !destinationCityId) {
      setError("Choose both an origin and a destination city.");

      return;
    }

    if (originCityId === destinationCityId) {
      setError("Origin and destination cities must be different.");

      return;
    }

    const expectedMonthlyIncome = Number(income);

    if (!Number.isFinite(expectedMonthlyIncome) || expectedMonthlyIncome <= 0) {
      setError("Enter the monthly income you expect in the destination city.");

      return;
    }

    const parsedHouseholdSize = Number(householdSize);

    setSubmitting(true);

    try {
      const blueprint = await api.createBlueprint({
        originCityId,
        destinationCityId,
        expectedMonthlyIncome,
        relocatingHouseholdSize:
          Number.isInteger(parsedHouseholdSize) && parsedHouseholdSize > 0
            ? parsedHouseholdSize
            : 1,
        ...(relocationDate ? { plannedRelocationDate: relocationDate } : {}),
      });

      navigate(`/blueprints/${blueprint.id}`, { replace: true });
    } catch (submitError) {
      setError(errorMessage(submitError));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <Link
          to="/"
          className="text-xs text-mist-400 transition hover:text-mist-100"
        >
          ← All blueprints
        </Link>

        <p className="eyebrow mt-6">New scenario</p>

        <h1 className="mt-3 font-display text-4xl text-mist-50">
          Build a migration blueprint
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-mist-400">
          Start with the move itself. Costs, savings, and the Atlas Score will
          be calculated from this blueprint once budgeting ships.
        </p>
      </div>

      {citiesError && <Notice>{citiesError}</Notice>}

      <form
        onSubmit={handleSubmit}
        className="card flex flex-col gap-6 p-6 sm:p-8"
        noValidate
      >
        {error && <Notice>{error}</Notice>}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="originCityId" className="field-label">
              From
            </label>
            <select
              id="originCityId"
              value={originCityId}
              onChange={(event) => setOriginCityId(event.target.value)}
              disabled={cities === null}
              className="field-input"
              required
            >
              <option value="">
                {cities === null ? "Loading cities…" : "Select a city"}
              </option>
              {(cities ?? []).map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="destinationCityId" className="field-label">
              To
            </label>
            <select
              id="destinationCityId"
              value={destinationCityId}
              onChange={(event) => setDestinationCityId(event.target.value)}
              disabled={cities === null}
              className="field-input"
              required
            >
              <option value="">
                {cities === null ? "Loading cities…" : "Select a city"}
              </option>
              {(cities ?? []).map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="income" className="field-label">
              Expected monthly income
            </label>
            <input
              id="income"
              type="number"
              inputMode="numeric"
              min={1}
              step={1000}
              value={income}
              onChange={(event) => setIncome(event.target.value)}
              placeholder="250000"
              className="field-input"
              required
            />
            <p className="mt-2 text-xs text-mist-500">
              {income && Number(income) > 0
                ? `${formatCurrency(Number(income))} per month`
                : "The salary you would earn after moving."}
            </p>
          </div>

          <div>
            <label htmlFor="householdSize" className="field-label">
              People relocating
            </label>
            <input
              id="householdSize"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              step={1}
              value={householdSize}
              onChange={(event) => setHouseholdSize(event.target.value)}
              className="field-input"
            />
            <p className="mt-2 text-xs text-mist-500">
              Include yourself. Household size changes housing and food costs.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="relocationDate" className="field-label">
            Planned move date <span className="normal-case">(optional)</span>
          </label>
          <input
            id="relocationDate"
            type="date"
            value={relocationDate}
            onChange={(event) => setRelocationDate(event.target.value)}
            className="field-input"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="btn-ghost">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || cities === null}
            className="btn-primary"
          >
            {submitting ? "Saving blueprint…" : "Save blueprint"}
          </button>
        </div>
      </form>
    </div>
  );
}
