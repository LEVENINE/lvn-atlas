# LVN Atlas

> **Move with confidence, not assumptions.**

LVN Atlas is a migration intelligence platform that helps people understand the financial and lifestyle impact of relocating by learning from real migration journeys.

---

## Overview

Relocating to a new city is one of the biggest financial decisions a person can make.

People often know their future salary, but rarely understand what their new life will actually cost. Rent, groceries, transportation, utilities, security deposits, healthcare, and countless hidden expenses make relocation financially uncertain.

LVN Atlas aims to eliminate that uncertainty.

By combining anonymous migration journeys, personalized budgeting, and intelligent recommendations, the platform helps users understand what life could realistically look like before they relocate.

Rather than relying on assumptions or scattered advice from the internet, users receive migration plans built around people with similar backgrounds, lifestyles, and financial situations.

---

# Why LVN Atlas?

Most financial planning tools start **after** you've moved.

LVN Atlas starts **before** you make the decision.

The platform answers questions like:

- Can I actually afford to move?
- How much should I expect to spend every month?
- Will I still be able to save money?
- Should I relocate alone first?
- Can I bring my family immediately?
- How different will my lifestyle be after relocating?

The goal isn't simply to track expenses.

The goal is to help people make informed relocation decisions.

---

# Mission

Help people relocate with confidence by transforming migration experiences into practical financial planning.

---

# Vision

Become the world's most trusted relocation intelligence platform where every migration journey helps the next person make a better financial decision.

---

# Core Principles

LVN Atlas follows a set of engineering and product principles throughout its development.

## Documentation First

Every major feature is researched, designed, and documented before implementation.

---

## Architecture Before Code

Technical decisions are made with the complete system architecture in mind rather than solving isolated problems.

---

## Production Mindset

Every feature is designed as though it will eventually serve real users in a production environment.

---

## Understand Before Commit

No AI-generated code or documentation is committed unless its purpose, implementation, and trade-offs are fully understood.

---

## Continuous Improvement

Documentation, architecture, and implementation evolve together throughout the project's lifecycle.

---

# Planned MVP

The first version of LVN Atlas focuses on solving one problem well.

### Authentication

- User Registration
- Login
- Profile Management

### Migration Planning

- Current City
- Destination City
- Occupation
- Monthly Salary
- Family Information
- Lifestyle Preferences

### Personalized Budget

- Estimated Monthly Expenses
- Expense Categories
- Budget Editing
- Budget Saving

### Migration Intelligence

- Similar Migration Journeys
- Budget Cloning
- Cost Comparison
- Relocation Insights

### Atlas Score™

A relocation readiness score calculated using factors such as:

- Salary
- Housing Cost
- Family Size
- Savings Potential
- Expected Living Expenses
- Cost of Living
- Historical Migration Data

---

# Long-Term Roadmap

Future versions may include:

- Community-contributed migration journeys
- City comparison engine
- Cost-of-living trends
- Migration timeline simulator
- Recommendation engine
- Family relocation planner
- Public APIs
- Admin Dashboard
- Analytics
- Mobile Application

---

# Engineering Goals

LVN Atlas is also a long-term backend engineering project built to explore modern software engineering practices.

The project emphasizes:

- Production-grade backend architecture
- Scalable API design
- Clean code principles
- Documentation-driven development
- Authentication & Authorization
- Database design
- Caching strategies
- Background job processing
- System observability
- Automated testing
- Docker-based deployment
- Continuous Integration & Deployment

---

# Repository Status

✅ **API and Web Client Foundation Implemented**

Product discovery, domain modelling, and the system architecture are documented in `docs/`, and the foundation described in `docs/IMPLEMENTATION_PLAN.md` (Milestone 0, Splits 0.1–0.7 and 0.9) is implemented. The API is covered by tests; the web client is a static build with no automated tests yet.

Current focus:

- Blueprint comparison and dashboard data

## Technology Stack

| Layer          | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Language       | TypeScript (Node.js 24)                                         |
| API            | Express 5                                                       |
| Database       | PostgreSQL 17 via Prisma 7                                      |
| Validation     | Zod 4                                                           |
| Authentication | JWT (HS256) with bcrypt password hashing                        |
| Web client     | React 19, Vite, React Router, Tailwind CSS v4                   |
| Testing        | Vitest + Supertest (Prisma client mocked, no database required) |
| Tooling        | pnpm workspaces, ESLint, Prettier, GitHub Actions               |

## Implemented API

All routes are versioned under `/api/v1`.

| Method               | Route                    | Auth | Purpose                                                                     |
| -------------------- | ------------------------ | ---- | --------------------------------------------------------------------------- |
| GET                  | `/api/v1`                | No   | Service and database health check                                           |
| GET                  | `/cities`                | No   | List reference cities                                                       |
| GET                  | `/cities/:id`            | No   | Get one reference city                                                      |
| POST                 | `/auth/register`         | No   | Create an account, profile, and session token                               |
| POST                 | `/auth/login`            | No   | Exchange credentials for an access token                                    |
| GET                  | `/auth/me`               | Yes  | Read the authenticated user and profile                                     |
| GET / PUT            | `/users/:id`             | Yes  | Read or update your own user record                                         |
| GET / PUT            | `/profiles/:id`          | Yes  | Read or update your own profile                                             |
| GET / POST           | `/blueprints`            | Yes  | List your Migration Blueprints (with Atlas Scores) or create one            |
| GET / PATCH / DELETE | `/blueprints/:id`        | Yes  | Read, update, or delete one of your blueprints                              |
| GET                  | `/expense-categories`    | No   | List the shared expense categories                                          |
| GET / PUT            | `/blueprints/:id/budget` | Yes  | Read a blueprint's budget and derived summary, or replace its expense items |

A blueprint's budget is created with the blueprint. `PUT /blueprints/:id/budget` treats the submitted expense items as the complete set: amounts for omitted categories are removed, and expense amounts are returned as two-decimal strings.

Blueprint responses include a derived `atlasScore`: an integer `score` from 0 to 100, a `band` (`Strong`, `Promising`, `Tight`, or `At risk`), and the `factors` behind them (savings rate, expense ratio, housing cost ratio, household size). The score is recomputed from income, household size, and the blueprint's budget on every response, so it is never stored or accepted from the client. v1 weights give up to 45 points for savings rate, 25 for expense burden, 20 for housing cost (the `Rent` expense item, with half marks when rent is not recorded), and 10 for household size; community and journey data do not feed the score yet.

Budget responses also carry a `summary` computed server-side from the blueprint's income and expense items: `expectedMonthlyIncome`, `totalExpenses`, `expectedSavings`, and `disposableIncome`, all as two-decimal strings. Savings can be negative when expenses exceed income. Expense categories are not yet classified as essential or discretionary, so every expense currently counts as essential and `disposableIncome` equals `expectedSavings`.

The API enforces a single authorization rule: an authenticated user may only act on their own records. Full details are in `docs/architecture/04-api-overview.md` and `docs/architecture/05-authentication.md`.

Not implemented yet: migration journeys, blueprint comparison, and the recommendation features built on them.

## Web Application

`apps/web` is a single-page React client served as static files. It covers what the API exposes today:

| Screen                                       | Route             |
| -------------------------------------------- | ----------------- |
| Sign in                                      | `/login`          |
| Create account                               | `/register`       |
| Blueprint dashboard                          | `/`               |
| Create a blueprint                           | `/blueprints/new` |
| Blueprint detail, budget editing, and delete | `/blueprints/:id` |

The blueprint detail screen edits the monthly budget: every expense category is an amount field, a running total updates as you type, and saving replaces the blueprint's expense items (a cleared category is removed). The API returns server-computed totals and savings in the budget summary; the detail screen still sums the amounts locally for its running total while editing. It also shows the blueprint's Atlas Score and refreshes it after a budget save. Design notes, session handling, and hosting details are in `docs/architecture/07-web-application.md`. The access token is kept in `localStorage`, which is an MVP trade-off to revisit before the platform stores sensitive data.

## Local Development

Prerequisites: Node.js 24+, pnpm 11+, and Docker (for the local PostgreSQL instance).

```bash
# 1. Install dependencies
pnpm install

# 2. Configure the API environment
cp apps/api/.env.example apps/api/.env

# 3. Start PostgreSQL
docker compose up -d

# 4. Apply migrations, generate the client, and seed reference data
pnpm --filter @lvn/api exec prisma generate
pnpm --filter @lvn/api exec prisma migrate deploy
pnpm db:seed

# 5. Run the API (http://localhost:3000) and the web client (http://localhost:5173)
pnpm dev
```

Open http://localhost:5173 and sign in with the seeded demo account `john@example.com` / `Password123!`, or create your own account. The Vite dev server proxies `/api` to the API, so no CORS configuration is needed locally.

The same flow can be exercised without the UI using the requests in `bruno/LVN Atlas API/` (login, list cities, create a blueprint, then replace its budget).

### Environment variables

API (`apps/api/.env`, see `apps/api/.env.example`):

| Variable         | Purpose                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| `PORT`           | HTTP port (defaults to `3000`)                                                   |
| `DATABASE_URL`   | PostgreSQL connection string                                                     |
| `JWT_SECRET`     | Signing secret for access tokens                                                 |
| `JWT_EXPIRES_IN` | Optional token lifetime                                                          |
| `LOG_LEVEL`      | Optional log verbosity                                                           |
| `CORS_ORIGIN`    | Allowed browser origin(s), comma-separated (defaults to `http://localhost:5173`) |

Web client (build time):

| Variable                | Purpose                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | Absolute API origin for deployed builds, e.g. `https://api.example.com`. Leave unset in development. |
| `VITE_API_PROXY_TARGET` | Optional dev proxy target (defaults to `http://localhost:3000`)                                      |

## Hosting the Web Client

The client is static output:

```bash
pnpm --filter @lvn/web build   # writes apps/web/dist
```

Deploy `apps/web/dist` to any static host (Vercel, Netlify, Cloudflare Pages, S3 + CDN, nginx), set `VITE_API_BASE_URL` to the deployed API origin before building, and make sure the host rewrites unknown paths to `index.html` (`apps/web/public/_redirects` covers Netlify-style hosts). Then add that deployed origin to the API's `CORS_ORIGIN`.

## Quality Checks

```bash
pnpm check        # lint, typecheck, tests, format check, and build across both packages
pnpm test         # API Vitest suite, no database required
```

The same checks run in CI on every push and pull request via `.github/workflows/ci.yml`.

## Merging to Main

A branch is ready to merge when `pnpm check` passes and this README describes the merged behavior. Every merge to `main` must include a README update covering anything it changes: routes, screens, commands, configuration, or repository status.

---

# License

This project is licensed under the MIT License.
