# Email provider comparison — The Agile Forum

Research snapshot (July 2026). No secrets. Use this to choose transactional email for staging and production.

## What the app sends today

| Type | Trigger | Recipient | Status |
|------|---------|-----------|--------|
| **Email verification** | Register, `POST /verify-email/resend` | User | Implemented (`email-verification-service.ts`) |
| **Enrollment confirmation** | Paid order / checkout complete | Learner | Implemented (`enrollment-notifier.ts`) |
| **Ops enrollment alert** | Same | `OPS_ENROLLMENT_ALERT_EMAIL` | Implemented |
| **Ops Telegram alert** | Same | Telegram chat | Implemented (parallel channel, not email) |

`LiveEmailAdapter` sends via [Resend](https://resend.com) when `RESEND_API_KEY` and `EMAIL_FROM` are set; otherwise it stubs (no delivery). See **`docs/resend-setup.md`** for DNS, Render env, and staging verification steps.

## Planned (PRD / architecture)

| Category | Examples | Volume profile |
|----------|----------|----------------|
| **Transactional** | Webinar confirm/remind, discovery-call confirm, password reset (future) | Low → moderate; time-sensitive |
| **Lifecycle / ops** | Multi-recipient enrollment alerts, delivery status tracking | Low |
| **Marketing / campaigns** | Interest-based nurture, cart abandon, scholarship outreach, post-session offers (`q_notifications`) | Moderate → high; consent/unsubscribe required |

---

## Provider comparison

### Microsoft 365 Basic (already paid)

**Fit:** Human mail (`ops@`, `support@`, team inboxes). **Poor fit:** App-generated transactional at scale; **not supported** for bulk/marketing per [Microsoft outbound spam guidance](https://learn.microsoft.com/en-us/defender-office-365/outbound-spam-protection-about).

| Dimension | Notes |
|-----------|--------|
| **Cost** | $0 marginal (license already paid) |
| **Limits** | ~30 messages/min/mailbox, 10,000 recipients/day; tenant can be restricted if flagged as bulk |
| **Auth** | SMTP Basic Auth disabled by default end of 2026 → OAuth app registration or Graph `Mail.Send` |
| **Setup** | Medium–high: Azure AD app, permissions, mailbox for `noreply@`, SPF/DKIM via M365 DNS |
| **Deliverability** | Fine for 1:1 human mail; risky for automated patterns (verification bursts, identical templates) |
| **Bounces / webhooks** | Message trace only; no first-class app webhooks |
| **Marketing** | Explicitly not a supported bulk channel; can harm primary domain reputation |
| **Render** | SMTP or Graph HTTPS both work; OAuth token refresh adds ops burden |

### Resend (recommended primary for app mail)

| Dimension | Notes |
|-----------|--------|
| **Cost** | Free: 3k/mo (100/day). Pro: $20/mo (50k), $35/mo (100k). Scale from $90/mo |
| **Setup** | Low: API key, DNS (SPF/DKIM/DMARC), Node SDK maps cleanly to `EmailAdapter` |
| **Deliverability** | Strong for transactional; shared IPs on lower tiers |
| **Transactional vs marketing** | Separate products/billing; keeps reputation isolated |
| **Render** | REST API — ideal for Render web services |
| **Compliance** | SOC 2, GDPR DPA; marketing needs app-side consent + unsubscribe (FR-56) |
| **Bounces** | Webhooks (`email.bounced`, `email.complained`, etc.) |

### Alternatives (brief)

| Provider | Best for | 1k / 10k / 100k mo (approx.) | Caveat |
|----------|----------|------------------------------|--------|
| **Postmark** | Highest transactional deliverability | $15 / $15 / ~$85–115 | No marketing; premium $/email |
| **Amazon SES** | Lowest $ at 100k+ | ~$0.10 / ~$1 / ~$10 | AWS setup, bounce/SNS wiring, no dashboard DX |
| **Brevo** | All-in-one SMB + free tier | $0 / $0–9 / ~$65 | 300 emails/day free cap; marketing-first |
| **SendGrid** | Enterprise hybrid transactional + marketing | $20 / $20 / ~$90 | No permanent free tier (60-day trial); Twilio complexity |

---

## Cost at scale (transactional only, USD/mo)

| Volume | M365 Basic | Resend | Postmark | SES | Brevo | SendGrid |
|--------|------------|--------|----------|-----|-------|----------|
| **1k** | $0* | $0 | $15† | ~$0 | $0 | ~$20 |
| **10k** | $0* | $20 | $15 | ~$1 | $0‡ | ~$20 |
| **100k** | Not recommended | $35–90 | ~$85–115 | ~$10 | ~$65 | ~$90 |

\*Marginal $0 but reputation/limits risk, not “free” operationally.  
†Postmark free tier is 100/mo only.  
‡Brevo free capped at ~9k/mo (300/day).

---

## Recommendation

| Role | Provider | Address pattern |
|------|----------|-----------------|
| **App transactional (prod)** | **Resend** | `noreply@theagileforum.com` or `notifications@theagileforum.com` |
| **Human / reply mail** | **M365** (keep) | `ops@`, `support@`, `hello@` |
| **Staging** | **Resend free tier** | Separate sending subdomain, e.g. `notify.staging.theagileforum.com` |
| **Marketing (later)** | **Resend Marketing** or **Brevo** | Subdomain `m.theagileforum.com` — never through M365 |

**Is M365 “good enough” because you already pay?**  
For **early staging smoke tests** only (tens of emails). For **production transactional** — **no**: throttling, OAuth migration, no webhooks, bulk-policy risk, and shared reputation with human mail make it the wrong default.

**Hybrid (recommended):** M365 for people; Resend for the app. Point `OPS_ENROLLMENT_ALERT_EMAIL` at the real ops inbox on M365; send learner/verification mail via Resend.

**Next implementation step:** Bounce/complaint webhooks; marketing subdomain when campaigns launch.

**Implemented:** `LiveEmailAdapter` + Resend (`RESEND_API_KEY`, `EMAIL_FROM`) — see `docs/resend-setup.md`.

---

## References

- Staging gap: `docs/staging-deploy.md` §8
- Resend setup: `docs/resend-setup.md`
- Adapter contract: `server/src/integrations/contracts.ts`
- Microsoft sending limits: [Exchange Online limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits)
- Resend pricing: https://resend.com/pricing
