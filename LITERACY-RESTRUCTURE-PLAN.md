# Learn Money — Literacy-First Restructure Plan

_Status: PROPOSAL for approval. No code yet. Supersedes GAMIFICATION-PLAN.md (gamification trimmed to one sim-only feedback touch — see §8)._

---

## 1. Core idea (the reframe)

The site is a **financial-literacy library** — teach *how each money product works*. The simulator is **one optional path**, not the whole app.

> Today: simulator-first; product lessons are trapped inside the allocation step.
> Target: **lessons are the product**; simulator is a "see it play out" feature.

The spine that makes it cohere: **tax & take-home** — the app's whole point is *what you keep after tax, charges, inflation*.

## 2. Audience & scope

- **Age 12–60**, plain language (a smart 12-yo follows it; not a literal under-13 product).
- **English only for now.** Hindi strings stay parked in code; **hide the EN/हिं toggle** to avoid half-translated pages. Re-add languages later.
- No backend, no accounts, no PII. Single-file generated app (`gen.py` + `template.html` → `learn-money.html`).

## 3. New information architecture — 4 pillars

```
HOME — "Learn how money works"
│
├── 📈 INVESTING          ── 31 products, each a standalone lesson
├── 🧾 TAX & TAKE-HOME    ── slabs, deductions, per-product taxation (the spine)
├── 💳 CREDIT & BORROWING ── credit cards (cards first; loans later)
└── 🧪 TRY IT (Simulator) ── existing flow, demoted to a feature
```

Product library = the new home surface. This also **absorbs the "click-continue" discoverability bug** (an all-products browse replaces the hidden category tabs).

## 4. Lesson content model (every product/topic page)

- **What it is** (ELI5 — already have)
- **How it works** (mechanics)
- **How it behaves** (plain line — already added)
- **Worked example** (already have; add a 2nd where one isn't enough)
- **Pros / cons / who it's for** (new, short)
- **Tax treatment** → links to the Tax pillar (two-way link)

## 5. Reuse vs new

**Reuse (most of it):** 31 products already carry `eli5` + `example` + `behaviour` + tax-`bucket` + `is80c` in `gen.py`. That *is* the literacy content — it just needs a **standalone browse + detail view** instead of living in an allocation row.

**New:** Home/IA shell · product detail page layout · Tax module · Credit module · pros/cons data.

## 6. Tax & Take-home module (the spine) — CA-GATED

Promote today's terse Setup notes into taught content:
- **Income tax slabs**: NEW vs OLD, side by side (data exists: `REGIME_NEW`/`REGIME_OLD`).
- **Standard deduction ₹75k · 87A rebate** (zero tax ≤ ₹12L new regime).
- **Surcharge tiers** (`surcharge()`) **· 4% cess** — plain-explained.
- **Deductions (old regime):** 80C ₹1.5L (PPF/ELSS/EPF/SSY…), 80D health, 80TTA savings interest, 24(b) home-loan interest, 80CCD(1B) NPS — **highlight which products earn each** (use `is80c`, extend for others).
- **How gains are taxed → the 5 buckets**: slab · LTCG 12.5% + ₹1.25L · tax-free · mixed-holding · crypto 30%.
- **Cross-link:** each investment lesson → its tax rule → the slab/deduction explainer, and back.

## 7. Credit & Borrowing module (cards first)

- **How a credit card works:** billing cycle · grace period · interest/APR · **minimum-due trap** · rewards vs cost · impact on credit score · secured vs unsecured.
- **"Cost of carrying a balance" calculator:** carry ₹X at Y% APR, pay only min-due → see months-to-clear + total interest. Mirrors the investing sim's hidden-cost theme (tax/charges/inflation → now **interest/debt**).
- Loans / EMI / BNPL: out of scope now, structured to add later.

## 8. Simulator (demoted) + the one gamification touch kept

- Existing inflation → setup → choose → results flow stays, reached via "Try it".
- Keep **only** the **beat-inflation verdict** (✅/⚠️ off the inflation line) as educational feedback. **Drop** badges/score/collection/challenges — wrong for a pure literacy tool.

## 9. Compliance gates (hard, pre-launch)

- Tax is now **taught as fact**, not a disclaimed sim assumption → **CA sign-off required** for FY2026-27 slabs, 87A, surcharge, cess, every deduction limit, and the ₹1.25L / bucket rules.
- Credit-card terms (APR ranges, grace, min-due math) → **legal/product review**.
- Keep "Simulation"/"Educational only" framing; no advice, no product nudging.

## 10. Phasing (English-only)

| Phase | Scope | Rough effort | Gate |
|---|---|---|---|
| **1 — IA flip** | New Home (4 pillars) · standalone product **library + detail pages** (reuse existing data) · demote simulator · hide lang toggle | ~1–2 days | — |
| **2 — Tax module** | Slab tables, deductions, 87A/surcharge/cess, per-bucket taxation, cross-links | ~1–2 days | **CA sign-off** |
| **3 — Credit module** | Credit-card lesson + balance-cost calculator | ~1–2 days | Legal review |
| **4 — Polish** | Plain-language 12–60 pass · pros/cons · 2nd examples · beat-inflation verdict | ~1 day | — |

Recommend **Phase 1 first** — flips the product into a literacy library (the core idea) with mostly existing content, no compliance gate. Tax/Credit follow once their sign-offs are moving.

## 11. Decisions locked / assumptions / open

**Locked:** literacy-first · 4 pillars · English-only now · 12–60 · no gamification beyond beat-inflation verdict.
**Assumed (override anytime):** hide lang toggle · credit = content + balance calculator · cards before loans.
**Open:** none blocking Phase 1. Tax/credit accuracy = compliance, not engineering.
