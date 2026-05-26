# Story S0.1: Repo + Standards + CI Baseline

## Story Intent

As an engineering team, we need a stable repository structure and CI baseline so all Sprint 0 and Sprint 1 work can ship with consistent quality gates.

## Owner Lane

- Primary: DevOps + Tech Lead
- Supporting: Backend, Frontend, QA

## Dependencies

- None

## Step-by-Step Tasks

1. Create and validate top-level folder standards (`apps`, `services`, `workers`, `docs`, `infra`).
2. Add/update branching and PR workflow documentation.
3. Add `.editorconfig` and standard formatting defaults.
4. Add linting configuration for each code package.
5. Add base unit test runner and one smoke test command per package.
6. Create CI workflow: install -> lint -> test -> build.
7. Add PR template with checklist for tests, security, and docs impact.
8. Verify CI runs successfully on a clean branch.
9. Document failure triage steps for broken CI checks.

## Acceptance Checklist

- Repo structure is documented and enforced.
- CI executes lint/test/build on pull requests.
- PR template is active and visible to contributors.
- At least one smoke test per package passes in CI.

## Evidence Required

- CI run URL or screenshot showing green pipeline.
- `README` or contributor doc section describing standards.
- PR template file present and versioned.

## Risks and Rollback

- Risk: CI too strict at bootstrap blocks onboarding.
- Mitigation: start with baseline checks and harden incrementally.
- Rollback: temporarily downgrade non-critical checks to warnings while preserving lint/test/build execution.

## Definition of Done

This story is done when any engineer can open a PR and automatically run standardized quality checks with clear pass/fail signals.