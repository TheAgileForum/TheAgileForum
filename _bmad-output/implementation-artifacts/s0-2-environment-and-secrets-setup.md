# Story S0.2: Environment and Secrets Setup (Dev/Stage)

## Story Intent

As a platform team, we need deterministic environment and secrets setup so services start reliably across local, dev, and staging.

## Owner Lane

- Primary: DevOps
- Supporting: Backend, Security

## Dependencies

- S0.1

## Step-by-Step Tasks

1. Define environment matrix: local, shared-dev, staging.
2. Create `.env.example` for API, worker, scheduler, and frontend surfaces.
3. Mark variables as required/optional with defaults where safe.
4. Configure centralized secret storage and access policy.
5. Add startup validation script that fails fast on missing required env vars.
6. Document bootstrap commands for each environment.
7. Run clean-machine bootstrap test using only the runbook.
8. Capture and fix any setup ambiguity discovered in bootstrap test.

## Acceptance Checklist

- [ ] Environment matrix and variable inventory are documented.
- [ ] All services fail fast with clear missing-env errors.
- [ ] No plaintext secrets are committed in repository.
- [ ] Clean-machine bootstrap succeeds using documentation only.

## Evidence Required

- Env runbook and variable inventory file.
- Bootstrap terminal logs from clean setup.
- Secret management policy note with owners.

## Risks and Rollback

- Risk: fragmented env names cause runtime drift.
- Mitigation: single shared config module and strict naming conventions.
- Rollback: freeze new env vars until naming and validation rules are re-aligned.

## Definition of Done

This story is done when engineers can reliably configure and launch all runtime components across dev/stage with secure secret handling.
