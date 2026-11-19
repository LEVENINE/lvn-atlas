# Agent Instructions

Project conventions for anyone (human or AI) working in this repository.

## Branch workflow

- Work stays on a feature branch; never merge to `main` or push without an explicit request.
- When the current branch is complete and `pnpm check` passes, tell the user that it is ready to merge to `main`, and summarize what was verified.
- Do not quietly leave finished work uncommitted: note when a branch still has uncommitted changes and whether it is merge-ready.

## README requirement for every merge

- Every merge to `main` must include a README update. If the change alters behavior, routes, screens, commands, configuration, or status, the README must reflect it in the same merge.
- A branch is not merge-ready until the README matches the code being merged.

## Quality gate

- `pnpm check` (lint, typecheck, tests, format check, build) must pass before a branch is reported as merge-ready.
