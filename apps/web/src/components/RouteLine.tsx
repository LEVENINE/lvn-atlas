import type { CitySummary } from "../lib/api";

export function RouteLine({
  origin,
  destination,
  size = "md",
}: {
  origin: CitySummary;
  destination: CitySummary;
  size?: "md" | "lg";
}) {
  const large = size === "lg";

  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0">
        <p className="eyebrow">From</p>
        <p
          className={`mt-1 truncate font-display text-mist-50 ${
            large ? "text-3xl sm:text-4xl" : "text-xl"
          }`}
        >
          {origin.name}
        </p>
        <p className="truncate text-xs text-mist-400">
          {origin.state ? `${origin.state}, ` : ""}
          {origin.country}
        </p>
      </div>

      <div className="relative mx-1 min-w-10 flex-1" aria-hidden="true">
        <div className="h-px w-full bg-gradient-to-r from-ember-500/70 via-white/20 to-tide-400/70" />
        <span className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-ember-400" />
        <span className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-tide-400" />
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.2em] text-mist-500 uppercase">
          to
        </span>
      </div>

      <div className="min-w-0 text-right">
        <p className="eyebrow">To</p>
        <p
          className={`mt-1 truncate font-display text-mist-50 ${
            large ? "text-3xl sm:text-4xl" : "text-xl"
          }`}
        >
          {destination.name}
        </p>
        <p className="truncate text-xs text-mist-400">
          {destination.state ? `${destination.state}, ` : ""}
          {destination.country}
        </p>
      </div>
    </div>
  );
}
