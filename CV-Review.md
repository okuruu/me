# CV Review — Gilby Dhilega Yodiaz

*Two independent recruiter reviews (a senior technical recruiter and a non-technical/HR screener) read all four CVs cold. This file consolidates their findings, the scores, and the action list applied to the CVs.*

Reviewed: `CV-Gilby-EN-HeadOfIT.md`, `CV-Gilby-EN-Engineer.md`, `CV-Gilby-ID-HeadOfIT.md`, `CV-Gilby-ID-Engineer.md`

---

## Scores (before enhancement)

| CV | Tech recruiter | Non-tech recruiter |
|---|---|---|
| EN — Head of IT | 6.5 / 10 | 7.5 / 10 |
| EN — Engineer | 7.5 / 10 | 7.0 / 10 |
| ID — Head of IT | 6.5 / 10 | 8.0 / 10 |
| ID — Engineer | 7.5 / 10 | 7.5 / 10 |

**Tech verdict:** Genuinely above-average engineering depth — offline-first/resilience-pod/idempotency reads as *real lived engineering*, not buzzwords. Held back by no testing/CI signal, single-company concentration, soft security/perf wording, and title-vs-scale tension.

**Non-tech verdict:** Strong, verifiable, metrics-rich. The universal weakness is *density and jargon order* — leading with implementation instead of the business outcome — which costs at the non-technical screening gate every CV passes through first.

---

## Where both reviewers agreed (highest priority)

1. **Delete the "$18K/month projected" figure.** Both called it the single weakest line — a forecast is not an achievement and it taints trust in the *real* numbers. → **Applied: removed from all versions.**
2. **Reframe "revenue" you processed, not "drove."** "Driving over $10M in revenue" overclaims personal credit. → **Applied:** changed to "processing Rp 170B+ in annual transactions." Same for the "$2.8M sales programs" line → reframed as the platform that processed it.
3. **"Head of IT" + "team of 5" tension** reads as SMB title inflation to international screeners. → **Applied:** softened the team line and leaned on the honest "Head of IT Development / Lead Engineer" dual-frame; added the real IT-operations/infra/security scope that legitimately justifies the "Head" title.
4. **Lead with the business outcome, then the mechanism.** The Head-of-IT project blurbs were as jargon-heavy as the Engineer ones. → **Applied:** Head-of-IT project lines now open with the result; deep internals (UUIDv7, HMAC) trimmed to a lighter touch on the leadership versions, kept full on the Engineer versions.
5. **Fix consistency/detail slips.** "Kraeplin" → **"Kraepelin"**; clarified that the differing psychometric counts (8 / 6 / 7) are *different platforms*, not a contradiction. → **Applied.**

---

## Tech-recruiter-specific findings

- **Biggest gap: zero testing / CI-CD signal.** For a "Senior" claim this is the #1 reason a technical screener pauses. → **Action for you (not auto-applied — I won't fabricate):** if you do write tests / run pipelines, add a line like *"Testing: Pest/PHPUnit, Vitest · CI/CD: GitHub Actions."* This single line moves the Engineer CVs from ~7.5 to ~8.5.
- **Soft security wording.** "Strips any mutation keyword before it reaches the DB" is string-blacklisting — a red flag to a security-literate panel. → **Applied:** reworded to "constrained to read-only SELECT queries behind a safety gate." HMAC line tightened to "HMAC-SHA256–signed public IDs."
- **Vanity metric.** "~17ms average" with no percentile/dataset. → **Applied:** reframed to "sub-20ms typical query response."
- **Added safe ATS keywords** that were described in prose but not as tokens: **REST API**, **Laravel Queues**.
- **Flagged but left to you:** unsupported **Java** (no backing project), over-listed UI frameworks (Bootstrap/DaisyUI/Rocket), and hobbyist distro signaling (CachyOS/Mint). Kept your declared skills intact rather than pruning unilaterally — your call.
- **Beginner certs** ("…untuk Pemula") slightly lower a Head-of-IT level; the Engineer version already condensed them.
- **Strength to lean on:** live, clickable production URLs + a Play Store app are the rarest, most credible thing here. "Links you can click beat numbers you can't."

## Non-tech-recruiter-specific findings

- **The Engineer summary is jargon-dense from sentence one** — perfect for a technical recruiter, alienating for the generalist who screens first. → **Applied:** added a plain-language opener before the stack dive.
- **Length/redundancy:** Experience already describes Chocoa/HRIS/Membership/AI, then Selected Projects describes them again. → **Applied:** Head-of-IT versions tightened (outcome-led, less repetition); Engineer versions keep depth by design.
- **Promote the Dealls "Super Mentor" line** — "mentoring alongside C-level executives" is instantly legible to HR. → Kept first in the community section.
- **Currency for the Indonesian market:** leading with USD on an ID CV reads English-first. → **Applied:** ID versions now lead with Rupiah.
- **International-market consideration (left to your judgement):** on the English versions, the three Qur'an entries can introduce unconscious-bias/discrimination-law sensitivity in some Western markets. You explicitly asked to keep community in all versions, so I kept it — flagging it here so the choice is informed. For the Indonesian market it's a genuine asset.
- **Multiple concurrent "Present" roles** (Head of IT + Founder of a 13-person studio + Tutor) can read as divided attention to a full-time employer. Defensible (okuruu predates the day job) but be ready to address focus/hours in interview.

---

## Your weaknesses, named plainly

1. **No testing/CI/CD evidence** — the most damaging gap for a senior/lead engineering claim. Fix if true.
2. **Single-company career** — everything material is Dea Bakery; no external employer to triangulate collaboration, code review, or working in a codebase you didn't build. This is your biggest *interview* risk.
3. **Self-reported, round, unverifiable business metrics** (35%, 25%, $10M, $2.8M) — fine as directional claims, but have the measurement method ready; expect "how did you measure that?" on each.
4. **Title vs. scale** — "Head of IT" over 5 people is an SMB honorific to international eyes. The dual-title softens it.
5. **Cloud-light** — proudly on-prem/VPS. A differentiator for regulated/edge shops, an auto-filter for cloud-native ones. Know which roles you're aiming at.
6. **Soft security/perf phrasing** outpacing the underlying rigor — tightened, but be ready to defend the mechanisms in interview.

---

## What I changed vs. left to you

**Auto-applied to all four CVs:** removed the projected figure; reframed revenue→volume processed; softened the Head-of-IT title/scope and added legitimate IT-ops/security scope; outcome-first ordering on leadership project blurbs; tightened security + performance wording; added REST API / Laravel Queues keywords; fixed "Kraepelin"; Rp-first currency on ID versions; plain-language opener on Engineer summaries.

**Left to your decision (flagged, not changed):** adding a testing/CI line (don't want to fabricate); pruning Java / UI frameworks / distros; trimming the EN community section for international markets. Tell me and I'll apply any of these.
