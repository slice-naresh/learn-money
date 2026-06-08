# Learn Money — Product Behaviour Spec (source of truth)

Living spec of **how the app behaves**. Every change request is checked against this doc first; after approval the doc + tests are updated. Each behaviour has an ID (e.g. `NAV-3`) — reference IDs in change requests.

- **App:** single-file generated web app (`gen.py` + `template.html` → `learn-money.html`), India / FY2026-27, English, ages 12–60.
- **Status:** all figures illustrative — **pending CA sign-off**.
- **Tests guard this spec:** `test_journeys.js` (66), `test_buckets.js` (11), `test_features.js` (45), `ui_test.js` (23), `qa_break.js` (24 adversarial). Build: `python3 gen.py`.

---

## How to use this doc (change-control loop)
1. **Request** names the desired behaviour change (ideally citing behaviour IDs).
2. **Impact check** — before coding, scan this spec for every behaviour the change touches or contradicts; list:
   - behaviours **changed**, behaviours **removed**, behaviours that **conflict**,
   - **tests that will fail** (from the Coverage Map), UX/visual regressions, the CA/compliance impact.
3. **Approval** — owner confirms the listed changes + accepts the breakages.
4. **Apply** — implement, update affected tests, run all suites + `qa_break.js` (must be green).
5. **Update this doc** — edit/add/remove the behaviour IDs to match the new reality, bump "Last updated".

> Rule: a behaviour is not "done" until this doc and the tests both reflect it.

_Last updated: added 32nd product **Endowment/money-back (LIC-style)** + clarified **ULIP**; INV-4 (insurance products); product count 31→32. Prior: salary calculator (CA-fixes), global invest-horizon, SIP step-up, global Reset, guided tour, cross-check additions (NAV-5, SIM-1b, SIM-3/4/5b)._

---

## 1. Global / cross-cutting
- **NAV-1** Top nav = 5 pills: Home · Try it · Investing · Tax · Salary · Credit (Home first, Try-it second). *(6 pills total.)*
- **NAV-2** `showSec(name)` switches sections; navigating to a sim step (`inflation/how/choose/results`) highlights the **Try it** pill.
- **NAV-3** **History-aware back:** every non-home section shows a "← Back" bar that returns to the *previous* section (LIFO stack); browser/device Back also works (pushState/popstate). Back bar hidden on Home.
- **NAV-4** Header has global **↺ Reset** and **🧒 Kid mode** toggles, visible from every flow. (Mobile <560px hides the "Simulation" badge to avoid overflow.)
- **NAV-5** Clicking the **brand/logo** (top-left) returns to Home.
- **GEN-1** No horizontal overflow at 390px on any section.
- **AD-1 (ads POC)** Placeholder ad slots: a **fixed bottom banner** (always, full-width, 728×90 style) + **left/right vertical rails** (160×600) shown only on wide screens (≥1300px, in the margin outside the 940px content). Clean dashed placeholders; `body` has bottom padding and the sticky live panel clears the bar. Rails hidden on mobile/tablet (no overflow).
- **A11Y-1** All click-only controls (toggles, chips, tabs, cards, lesson rows, glossary terms, steps) get `role="button"` + `tabindex=0`; Enter/Space activate them; visible `:focus` ring. Landmarks: `role=main`, `role=navigation`.
- **A11Y-2** Inputs have labels (`for`/`aria-label`); slab tables have `<caption>`. *(Deeper aria-pressed/aria-live = open gap.)*
- **MOTION-1** All animations respect `prefers-reduced-motion` (charts, count-up, sim CTA, tour, etc. still to final frame).
- **STATE-1 (persistence)** Portfolio, mode, income/regime, amounts, lenses, plan-years, SIP step-up, and Kid mode **autosave to localStorage**; restored on reload. Graceful if storage blocked (try/catch).
- **STATE-2 (reset)** Global Reset → wipes saved state **and** `lm_seen`, clears Kid mode, returns to **Home**, re-shows the welcome.
- **I18N-1** English only; Hindi strings parked, language toggle hidden. (New strings need not be translated.)

## 2. Home + onboarding
- **HOME-1** Home shows hero + **4 reading pillar cards** (Investing, Tax, Salary, Credit) + a distinct animated **simulator card** (`#simcard .simcta`) with a white **▶ Start the simulator** play button (pulsing badge, breathe).
- **HOME-2** Each pillar card routes to its section; the sim card → Try it.
- **COACH-1** First visit (no `lm_seen`) shows a welcome overlay with: **🚀 Show me around** (guided tour), **🧒 Start simple** (Kid mode + dismiss), **Skip**.
- **COACH-2** Guided tour = 4 spotlight steps (sim card → Investing → Salary → Kid mode) with Next/Skip + step counter; ending sets `lm_seen`. Shows once; Reset re-arms it.

## 3. Investing library
- **INV-1** Lists **all 32 products** as read-only lessons, grouped under 6 category headers; tab bar = **All + 6 filters**.
- **INV-2** Each lesson opens with a **🍱 food analogy**, then a plain "how it behaves" line, then deep sections: What it is · How it works · Returns · Example · Risks · Liquidity/lock-in · Taxation · Costs · Who it's for · Pros · Cons. Ends with a **💰 tax cross-link** to the Tax pillar.
- **INV-3** Tapping a lesson header expands/collapses it.
- **GLOSS-1** Jargon terms (NAV, LTCG, EPF, 80C, APR, …) are auto-marked across lessons + Tax + Credit; tapping shows a plain inline definition; tapping again hides it.
- **INV-4 (insurance products)** Catalog includes both insurance-as-investment types in Advanced: **ULIP** (market-linked, fund-choice, 5-yr lock, high charges) and **Endowment/money-back (LIC-style)** (traditional, guaranteed ~4–6%, long lock, 80C + 10(10D) tax-free). Both lessons make the "insurance + investing usually underperforms term + index" point. **Term insurance** is explained as pure protection (not a portfolio product).

## 4. Kid mode
- **KID-1** Header toggle adds `body.kid`; persists across navigation and reloads (STATE-1).
- **KID-2** In Kid mode, lessons show only food analogy + behaviour + example (`.kidhide` sections hidden: tax/costs/liquidity/pros-cons/tax-link).
- **KID-3** Tax & Credit pillars hide their detail cards and show one simple `.kidonly` card; Setup hides income/regime and shows a note. (Calculators stay.)
- **KID-4** Reset turns Kid mode off (STATE-2).

## 5. Tax pillar
- **TAX-1** Shows slab tables for **new vs old regime, rendered from the engine's own `REGIME_NEW`/`REGIME_OLD`** (so taught numbers match the simulator). 7 new bands, 4 old.
- **TAX-2** Explains std deduction (₹75k new / ₹50k old), 87A (zero tax ≤₹12L new / ≤₹5L old), surcharge tiers, 4% cess, deductions (80C/80D/80TTA/24b/80CCD), and the 5 tax buckets.
- **TAX-3** FY2026-27 disclaimer banner present.

## 6. Salary calculator (`takehome`)
All fields **prefilled + editable**. Output = monthly **in-hand** + per-year + salary-structure breakdown + **old-vs-new compare** (picks higher).
- **SAL-1** Inputs: CTC (₹12L), Basic % (40), EPF % (12), HRA % (50), Gratuity % (4.81), Employer-NPS % (0), Professional tax (₹2,400), Regime (Compare/New/Old), Age (Under 60/60–80/80+), and old-regime rent + metro + 80C/80D/NPS(1B)/home-loan.
- **SAL-2** Employer PF, gratuity, employer-NPS are part of CTC, **exempt, excluded from gross** (not in-hand, not taxed).
- **SAL-3** Gross = CTC − employerPF − gratuity − employerNPS. Taxable = gross − std deduction − **professional tax** − old-regime deductions.
- **SAL-4** Old-regime 80C = `min(your 80C input + employee EPF, ₹1.5L)` (EPF auto-counted). HRA exemption = `min(HRA, rent−10%·basic, 50/40%·basic)`.
- **SAL-5** Income tax = progressive slabs (old slabs shift with **age**) + 87A + **marginal relief** (87A band, surcharge thresholds) + surcharge (new ≤25%, old up to **37%**) + 4% cess.
- **SAL-6** In-hand = gross − tax − employee EPF − professional tax. Bounded `0 < in-hand ≤ CTC`; **monotonic** (rises with CTC, no cliff).
- **SAL-7** Non-goals (v1): LTA, bonus/variable, leave encashment, perks/RSUs, DA, EPF ₹15k ceiling, state-exact PT, gratuity exemption limits. Pending CA.

## 7. Credit pillar
- **CR-1** Six explainer cards: billing cycle, on-time vs late (side-by-side), how interest is charged, traps (cash/EMI/forex/over-limit), rewards vs cost, credit score.
- **CR-2** "Cost of carrying a balance" calculator: balance + APR + (minimum-only / fixed payment). Shows months-to-clear, total repaid, pure interest, principal-vs-interest bar; flags "never clears" when payment ≤ monthly interest.

## 8. Simulator (Try it)
- **SIM-1** Try-it landing = 4 journey starters (inflation, lump, SIP, SWP) + **3 preset chips**; a **stepper** (Inflation→Setup→Choose→Results) shows on sim screens; the Results step is disabled until valid (SIM-7).
- **SIM-1b (presets)** Presets set a ready mix + mode and jump to Choose: **Safe & steady** (lump; fd/ppf/gsec/index), **Young & aggressive** (SIP; index/equity_mf/stocks/crypto), **Balanced** (lump; index/ppf/fd/gold/equity_mf). Each sums to 100%.
- **SIM-2 (Inflation)** Amount + rate + horizon → animated erosion chart + "today's buying power" text.
- **SIM-3 (Setup)** Mode chips: **Invest once / Invest monthly / Take money out** (lump/SIP/SWP), each with an explainer box. Inputs: amount(s), **income (log slider ~₹3L–₹50Cr)** with a live marginal-rate + surcharge note, regime (new/old) with a detail box; **"Invest for N years"** global horizon (default 10); **"Yearly SIP increase %"** step-up (default 10, SIP-only). Scenario (worst/expected/best) is **removed**.
- **SIM-4 (Choose)** 32 products in **6 category tabs** (filter visible rows). Selecting auto **equal-splits to 100%** (1→100, 2→50, 4→25…); manual drag allowed but the **total can never exceed 100%**; a selected product can be dragged to 0% without deselecting; inactive product's slider is disabled. Each row has an editable **Return %** and a **"what is this?"** explainer (behaviour + ELI5 + worked example). Live dark "what you keep" panel (sticky) updates on every change.
- **SIM-5 (Results)** Headline You-keep / Lost / post-tax-return; result summary line; flow bar (net / charges+penalties / tax); growth chart with inflation reference line; **beat-inflation verdict**; per-product cards (each with a **💔 exit-early** toggle); lenses: **Exit early** (master) with a cost calculation, and **Today's ₹** with a **years** selector.
- **SIM-5b** Old regime + active 80C products → an **"80C bonus" box** shows the upfront tax saved (`min(80C invested, ₹1.5L) × marginal rate`), hidden in new regime. SWP that runs dry → a **"ran out of money" message** naming how many picks dried up.
- **SIM-6 (engine)** Per product over the global horizon: lumpsum compounds; SIP accrues monthly with **annual step-up**; SWP draws down (flags "ran dry"). Charges = expense ratio accrued monthly on actual balance. Tax by bucket: slab / LTCG 12.5% with **pooled ₹1.25L** equity exemption / tax-free / mixed / crypto 30%; +cess; surcharge (CG capped 15%). Exit-early adds a penalty + forfeits the tax perk.
- **SIM-7 (validation)** "See full breakdown" + stepper-Results are **disabled unless ≥1 product AND total = 100%**; allocation ≠100% shows a warning with "X% to go/over".
- **SIM-8** Money inputs show a words helper ("₹5,00,000 · 5 lakh"); all number inputs **clamp to min/max on blur**; never produce NaN/Infinity.

## 9. Invariants — must never break
- **INV-A** No NaN/Infinity/undefined in any visible result, under any input (qa_break).
- **INV-B** Allocation total never > 100% (SIM-4).
- **INV-C** Results unreachable while invalid (SIM-7) via button, stepper, or programmatic gate.
- **INV-D** Salary in-hand monotonic & bounded (SAL-6).
- **INV-E** No mobile horizontal overflow (GEN-1).
- **INV-F** Kid mode persists across flows and toggles cleanly (KID-1/4).
- **INV-G** Reset = clean slate from anywhere (STATE-2).

---

## Coverage map (what guards what — "what will fail" lookup)
| Area | Suite |
|---|---|
| NAV, HOME, COACH/tour, INV library, GLOSS, KID, TAX render, SIM nav/stepper, back-gate | `test_journeys.js` |
| Tax buckets / income-sensitivity | `test_buckets.js` |
| Warnings, 80C, SWP-dry, reset, presets, equal-split, gating, lenses, persistence, coachmark, **salary**, horizon, step-up | `test_features.js` |
| Real-Chrome render, fonts/colour, charts, mobile overflow (all sections), screenshots | `ui_test.js` |
| Adversarial: hostile inputs, nav churn, kid mid-flow, **salary** bounds/monotonicity | `qa_break.js` |

## Change-request template
```
### Change: <title>
Behaviour IDs touched: <e.g. SIM-4, SAL-3>
Desired new behaviour: <...>
Impact (pre-approval):
  - Changed: <IDs>
  - Removed: <IDs>
  - Conflicts: <IDs / none>
  - Tests expected to fail: <suite::test>
  - UX/compliance impact: <...>
Approved by: <name>
After merge: update PRODUCT.md IDs + tests; all suites + qa_break green.
```
