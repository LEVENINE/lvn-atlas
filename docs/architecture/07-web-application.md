# Web Application

The web client lives in `apps/web` and is the browser entry point for LVN Atlas.

## Stack

| Concern    | Choice                              | Why                                                               |
| ---------- | ----------------------------------- | ----------------------------------------------------------------- |
| Build tool | Vite                                | Fast dev server, static output that any host can serve            |
| UI         | React 19 + TypeScript               | Matches the typed API client; no server rendering required yet    |
| Routing    | React Router                        | Client-side routes with SPA fallback (`public/_redirects`)        |
| Styling    | Tailwind CSS v4                     | Design tokens live in `src/index.css`; no separate CSS build      |
| Data       | `fetch` wrapper in `src/lib/api.ts` | No extra runtime dependency; one place for auth and error mapping |

There is no component library: the small set of shared classes (`.card`, `.btn-primary`, `.field-input`, `.eyebrow`) is defined once in `src/index.css`.

## Routes

| Route             | Screen                   | Access        |
| ----------------- | ------------------------ | ------------- |
| `/login`          | Sign in                  | Public        |
| `/register`       | Create account           | Public        |
| `/`               | Blueprint dashboard      | Authenticated |
| `/blueprints/new` | Create a blueprint       | Authenticated |
| `/blueprints/:id` | Blueprint detail, delete | Authenticated |
| `*`               | Not found                | Public        |

`RequireAuth` in `src/auth/AuthContext.tsx` restores the session by calling `GET /api/v1/auth/me` when a stored token exists, redirects to `/login` when there is none, and returns the caller to their original route after signing in.

## Session handling

The access token is stored in `localStorage` under `lvn-atlas.access-token`. This is a deliberate MVP trade-off: it keeps the SPA stateless and simple, but it means any script running on the page can read the token. Before handling sensitive data, move the session to an `HttpOnly` cookie issued by the API.

## Talking to the API

- **Development** — the browser only calls the Vite dev server. `vite.config.ts` proxies `/api` to `http://localhost:3000`, so no CORS is involved. Override the target with `VITE_API_PROXY_TARGET`.
- **Deployed** — the static bundle has no server of its own, so set `VITE_API_BASE_URL` at build time (for example `https://api.example.com`). Vite inlines this value; it is public configuration, never a secret.
- **API side** — `CORS_ORIGIN` must list the deployed web origin (comma-separated for several origins). See `docs/architecture/05-authentication.md`.

## Hosting

Any static host works:

- Build command: `pnpm --filter @lvn/web build`
- Output directory: `apps/web/dist`
- SPA fallback: serve `index.html` for unknown paths (`public/_redirects` covers Netlify-style hosts; other hosts need the equivalent rewrite)
- Environment: `VITE_API_BASE_URL`

## Current limitations

- The UI covers accounts, Migration Blueprints, budget editing, the Atlas Score, and a side-by-side comparison table on the dashboard. Migration journeys and recommendation screens do not exist yet.
- Blueprints can be created, listed, viewed, and deleted; there is no edit form, although `PATCH /api/v1/blueprints/:id` already supports it.
- Amounts are formatted as INR because the seeded reference cities are Indian. Currency belongs to the reference data model before this is shown to users elsewhere.
