# LVN Atlas — Implementation Plan

> Status: Planning  
> Source documents: `README.md`, `PRODUCT.md`, `DOMAIN_MODEL.md`, `ERD.md`, `MVP_FEATURES.md`, `USER_FLOW.md`, `USER_PERSONAS.md`, `USER_STORIES.md`, `docs/architecture/*`

This document converts the product and domain documentation into an executable delivery plan.

The plan is organized as **milestones** (product outcomes) and **splits** (small, reviewable implementation units). Each split should normally become one branch and one pull request.

---

## Current Repository Status

Already in place:

- pnpm monorepo with `apps/api` and workspace packages
- Express 5 API foundation
- Environment validation, Pino logging, global error handling
- Prisma 7 + PostgreSQL foundation
- MVP domain schema and migrations
- Seed data for expense categories, cities, and demo users
- Cities API: list and get by id
- Users and profiles API: CRUD operations
- Bruno collections for health, cities, users, and profiles
- Code-quality scripts: lint, typecheck, format, build

In progress / incomplete:

- Authentication is implemented; per-user authorization rules are not
- Migration blueprints, budgets, journeys, and Atlas Score are not implemented
- Automated tests and CI are not implemented

---

## Delivery Rules

1. Documentation and architecture changes precede implementation changes.
2. One split should solve one coherent problem and be independently reviewable.
3. Database migrations must be additive and reversible where practical.
4. Every API split should include route, controller, service, validation, and Bruno coverage.
5. Derived values (expenses, savings, disposable income, Atlas Score) are calculated by the system, never accepted as client input.
6. Personal identity must never be exposed through Migration Journey responses.

---

## Milestone 0 — Foundation and Developer Experience

**Outcome:** A runnable, testable, documented backend base that later milestones can build on.

**Status:** Mostly complete.

### Split 0.1 — Repository and Tooling

- Scope: monorepo, scripts, ESLint, Prettier, TypeScript
- Status: Complete

### Split 0.2 — Database and Prisma Foundation

- Scope: PostgreSQL, Prisma client, migrations, schema
- Status: Complete

### Split 0.3 — Reference Data Seeding

- Scope: expense categories, cities, demo users
- Status: In progress
- Notes: Demo user seeding is present but should be reviewed for consistency with the final user/profile model.

### Split 0.4 — Cities API

- Scope: list cities and get city by id
- Status: Complete

### Split 0.5 — Users and Profiles API

- Scope: expose user and profile CRUD operations
- Dependencies: authentication design
- Deliverables:
  - user controller and routes
  - profile controller and routes
  - request validation
  - Bruno requests
- Status: Complete

### Split 0.6 — Authentication Foundation

- Scope: registration, login, password hashing, JWT/session strategy
- Dependencies: Split 0.5
- Deliverables:
  - auth routes and controllers
  - auth middleware
  - password and token utilities
  - protected route support
- Status: Complete
- Notes: See `docs/architecture/05-authentication.md`. Per-user authorization is deferred.

### Split 0.7 — Testing and CI Baseline

- Scope: unit and integration test setup
- Dependencies: Split 0.6
- Deliverables:
  - Vitest configuration
  - API integration tests for health, cities, auth
  - CI workflow running lint, typecheck, tests, build
- Status: Not started

### Split 0.8 — API Documentation Baseline

- Scope: complete Bruno collection and document API conventions
- Dependencies: Split 0.5, Split 0.6
- Status: Partial

---

## Milestone 1 — Can the User Decide Whether Relocating Is Financially Possible?

**Outcome:** A new user can create an account, complete a profile, create a Migration Blueprint, receive an estimated budget and Atlas Score, save multiple blueprints, and compare relocation options.

**Related user stories:** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-010, US-011, US-012

### Split 1.1 — Authentication and Account Management

- Scope: registration, login, current user endpoint
- Dependencies: Milestone 0
- Acceptance criteria:
  - A user can register with email and password
  - A user can log in and access protected endpoints
  - Passwords are never stored or returned in plain text

### Split 1.2 — User Profile Management

- Scope: create, read, and update the authenticated user's profile
- Dependencies: Split 1.1
- Acceptance criteria:
  - Every user has exactly one profile
  - Profile data personalizes later blueprint generation

### Split 1.3 — Migration Blueprint CRUD

- Scope: create, list, get, update, and delete Migration Blueprints
- Dependencies: Split 1.2, Cities API
- Acceptance criteria:
  - Origin city and destination city must differ
  - A blueprint belongs to exactly one authenticated user
  - A user can own multiple blueprints

### Split 1.4 — Budget and Expense Item Management

- Scope: create and update a blueprint's budget and expense items
- Dependencies: Split 1.3
- Acceptance criteria:
  - Every blueprint owns exactly one budget
  - Expense items belong to shared expense categories
  - Expense amounts can be customized by the user

### Split 1.5 — Financial Calculation Engine

- Scope: total expenses, expected savings, disposable income
- Dependencies: Split 1.4
- Acceptance criteria:
  - Calculations are derived server-side
  - Updated expense values recalculate budget summaries

### Split 1.6 — Atlas Score v1

- Scope: initial relocation readiness score
- Dependencies: Split 1.5
- Acceptance criteria:
  - Score is calculated, not user-entered
  - Score reflects income, expenses, savings, housing cost, household size, and available community data

### Split 1.7 — Blueprint Comparison and Dashboard Data

- Scope: list saved blueprints and provide comparison-oriented responses
- Dependencies: Split 1.6
- Acceptance criteria:
  - A user can view all saved blueprints
  - Blueprint summaries support side-by-side comparison

### Split 1.8 — Validation and Error Hardening

- Scope: request validation, domain rule enforcement, consistent API errors
- Dependencies: Splits 1.1 through 1.7
- Acceptance criteria:
  - Invalid requests return structured validation errors
  - Domain rule violations return meaningful operational errors

---

## Milestone 2 — Can the Platform Explain Its Recommendations?

**Outcome:** The platform becomes trustworthy by showing similar migration journeys, explaining budget calculations, supporting cloning, and allowing recommendation customization.

**Related user stories:** US-008, US-009

### Split 2.1 — Migration Journey Contribution CRUD

- Scope: create, list, get, update, and delete Migration Journeys
- Dependencies: Milestone 1
- Acceptance criteria:
  - A journey belongs to the authenticated contributor
  - A journey contains origin, destination, household, preference, and expense data

### Split 2.2 — Journey Anonymization and Privacy

- Scope: ensure contributed journeys do not expose personal identity
- Dependencies: Split 2.1
- Acceptance criteria:
  - Public journey responses exclude user identity
  - Contributors can update or remove their own contributions

### Split 2.3 — Journey Matching and Filtering

- Scope: deterministic filtering and weighted similarity for relevant journeys
- Dependencies: Split 2.2
- Acceptance criteria:
  - Journeys can be filtered by origin, destination, occupation, income range, household size, and preferences
  - Results are ordered by relevance

### Split 2.4 — Blueprint Creation from a Journey

- Scope: clone a journey's expense structure into a new blueprint budget
- Dependencies: Split 2.3, Milestone 1
- Acceptance criteria:
  - Copied expenses become independent budget items
  - Source journey changes do not modify existing blueprints

### Split 2.5 — Recommendation Explanation

- Scope: expose the data and reasoning behind budget and score outputs
- Dependencies: Split 2.4
- Acceptance criteria:
  - Users can see which journey influenced a blueprint
  - Budget summaries explain major expense categories

### Split 2.6 — Customization Recalculation

- Scope: recalculate budget, savings, and score after user edits
- Dependencies: Split 2.5
- Acceptance criteria:
  - Editing expenses updates all derived values
  - Updated values remain consistent across endpoints

---

## Milestone 3 — Can the Platform Learn from Real Migration Journeys?

**Outcome:** Users can anonymously contribute, update, and remove real migration data, improving future recommendations.

**Related user stories:** US-013, US-014

### Split 3.1 — Anonymous Contribution Flow

- Scope: submit a Migration Journey as anonymized community data
- Dependencies: Milestone 2
- Acceptance criteria:
  - Contributors understand what data will be shared
  - Submitted journeys are stored without public identity

### Split 3.2 — Contribution Update and Removal

- Scope: allow contributors to edit or remove their own journeys
- Dependencies: Split 3.1
- Acceptance criteria:
  - Owners can update expense and preference data
  - Owners can delete their contributions

### Split 3.3 — Data Quality and Validation

- Scope: validate journey completeness and reasonable expense values
- Dependencies: Split 3.1
- Acceptance criteria:
  - Incomplete or invalid contributions are rejected
  - Validation errors are structured and actionable

### Split 3.4 — Journey Moderation Hooks

- Scope: moderation-ready data flags and review support
- Dependencies: Split 3.3
- Acceptance criteria:
  - Journeys can be marked for review
  - Moderation does not block initial contribution flow

---

## Milestone 4 — Can the Platform Help Users Plan Beyond Today?

**Outcome:** LVN Atlas expands from monthly expense estimation into longer-term relocation decision support.

**Related user stories:** None yet; future stories required before implementation.

### Split 4.1 — Relocation Timeline Estimates

- Scope: estimated one-time and transition costs
- Dependencies: Milestone 1

### Split 4.2 — Salary Offer Comparison

- Scope: compare multiple expected income scenarios
- Dependencies: Split 4.1

### Split 4.3 — Housing Strategy Comparison

- Scope: compare rent, shared housing, and other housing choices
- Dependencies: Split 4.2

### Split 4.4 — Transportation Strategy Comparison

- Scope: compare transportation cost strategies
- Dependencies: Split 4.3

### Split 4.5 — Long-Term Savings Forecast

- Scope: multi-month and annual savings projections
- Dependencies: Split 4.4

---

## Milestone 5 — Can the Platform Scale?

**Outcome:** Platform operations, administration, and analytics support production usage.

**Related user stories:** US-015, US-016

### Split 5.1 — City and Category Administration

- Scope: manage cities and expense categories
- Dependencies: Milestone 1

### Split 5.2 — Journey Moderation Dashboard

- Scope: review, approve, reject, or remove community data
- Dependencies: Milestone 3

### Split 5.3 — Notifications

- Scope: user-facing and operational notifications
- Dependencies: Milestone 1

### Split 5.4 — Analytics and Reporting

- Scope: product and platform metrics
- Dependencies: Milestones 1 through 4

### Split 5.5 — Admin Authentication and Authorization

- Scope: role-based access for administrative operations
- Dependencies: Milestone 0 authentication

---

## Suggested Execution Order

1. Complete Milestone 0, especially authentication and testing.
2. Complete Milestone 1 before exposing any recommendation features.
3. Complete Milestone 2 before enabling community contributions.
4. Complete Milestone 3 before relying on community data for recommendations.
5. Evaluate Milestones 4 and 5 after the core relocation decision experience is validated.

---

## Explicitly Out of Scope for the MVP

- AI chat assistant
- Job marketplace
- Apartment marketplace
- Loan planning
- Insurance recommendations
- Investment planning
- Messaging
- Community feed
- Employer portal
- International relocation

These may be explored after the core relocation planning experience has matured.

---

## Definition of Done for Each Split

A split is complete when:

- Code is implemented and follows project standards
- Database changes are migrated
- API behavior is documented in Bruno
- Relevant tests pass
- Lint, typecheck, format, and build checks pass
- The change is reviewed before merge