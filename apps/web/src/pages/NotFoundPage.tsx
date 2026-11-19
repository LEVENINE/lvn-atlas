import { Link } from "react-router-dom";

import { Wordmark } from "../components/Wordmark";

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <Wordmark />

        <div>
          <p className="eyebrow">404</p>
          <h1 className="mt-3 font-display text-3xl text-mist-50">
            This route does not exist
          </h1>
          <p className="mt-3 text-sm text-mist-400">
            The page you were looking for has moved, or never existed.
          </p>
        </div>

        <Link to="/" className="btn-ghost">
          Back to your blueprints
        </Link>
      </div>
    </div>
  );
}
