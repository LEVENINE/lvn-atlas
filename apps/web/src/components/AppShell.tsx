import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { Wordmark } from "./Wordmark";

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : (user?.email ?? "");

  function handleSignOut() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(70rem_40rem_at_15%_-10%,rgba(247,181,103,0.09),transparent_60%),radial-gradient(60rem_40rem_at_95%_10%,rgba(78,205,181,0.07),transparent_65%)]"
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            className="rounded-sm transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember-300"
          >
            <Wordmark compact />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm text-mist-200">{displayName}</p>
              <p className="text-xs text-mist-500">{user?.email}</p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium tracking-wide text-mist-300 transition hover:border-white/25 hover:text-mist-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-mist-500 sm:flex-row sm:items-center sm:justify-between">
          <p>LVN Atlas — migration intelligence.</p>
          <p>Estimates are projections, not guarantees.</p>
        </div>
      </footer>
    </div>
  );
}
