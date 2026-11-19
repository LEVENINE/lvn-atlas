import type { ReactNode } from "react";

import { RouteLine } from "./RouteLine";
import { Wordmark } from "./Wordmark";

const sampleOrigin = {
  id: "sample-origin",
  name: "Mumbai",
  state: "Maharashtra",
  country: "India",
};

const sampleDestination = {
  id: "sample-destination",
  name: "Pune",
  state: "Maharashtra",
  country: "India",
};

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_10%_0%,rgba(247,181,103,0.10),transparent_60%),radial-gradient(50rem_40rem_at_90%_20%,rgba(78,205,181,0.08),transparent_65%)]"
      />

      <aside className="relative hidden flex-col justify-between border-r border-white/10 px-12 py-12 lg:flex">
        <Wordmark />

        <div className="max-w-md">
          <p className="eyebrow">Migration intelligence</p>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-mist-50">
            Know the cost before you commit to the move.
          </h1>

          <p className="mt-6 text-sm leading-relaxed text-mist-300">
            LVN Atlas turns a relocation into a concrete monthly plan: where you
            would live, what it would cost, and whether your income still leaves
            room to save.
          </p>
        </div>

        <div className="max-w-md">
          <RouteLine origin={sampleOrigin} destination={sampleDestination} />
          <p className="mt-6 text-xs text-mist-500">
            Every plan starts with two cities and a salary.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Wordmark />
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
