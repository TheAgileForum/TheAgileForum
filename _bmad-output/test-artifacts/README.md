# Test Artifacts



Canonical QA documentation and run evidence for **The Agile Forum** (`mybmadproj`).



**Project root:** `C:\AgileForum\mybmadproj`



## Contents



| File | Purpose |

|------|---------|

| **`qa-work-status-report.html`** | **Full completed + pending work report (tabular, open in browser)** |

| `test-summary.md` | Living inventory of automated tests and latest run status |

| `auth-consent-rbac-test-plan.md` | FR-1..3, FR-151, FR-180 auth/consent/RBAC matrix |

| `diagnosis-journey-test-plan.md` | FR-3..7, FR-158..160 diagnosis journey matrix |

| `commerce-checkout-policy-test-plan.md` | FR-mapped commerce/checkout QA matrix |

| `catalog-browse-test-plan.md` | FR-161–168 catalog browse QA matrix |

| `emi-installment-test-plan.md` | FR-169–175 EMI/installment QA matrix |

| `shell-trust-commerce-test-plan.md` | FR-176–182 shell, currency, trust, upsell, admin catalog matrix |

| `pending-work-queue.md` | Ordered backlog of QA tasks |



## Planning doc traceability



QA plans are aligned to:



- `planning-artifacts/prd-agile-forum.md` (FR-1..182)

- `planning-artifacts/epics-agile-forum.md`

- `planning-artifacts/api-contract-matrix.md`

- `planning-artifacts/implementation-readiness-report-2026-06-07.md`

- `planning-artifacts/payment-provider-matrix.md`

- `planning-artifacts/must-have-priorities-agile-forum.md` (A9–A14)



## Commands



```powershell

cd C:\AgileForum\mybmadproj\server

npm run test

npm run test:integration

```



## Legacy path



Older copies may exist under `_bmad-output/implementation-artifacts/tests/`. Prefer this folder going forward.


