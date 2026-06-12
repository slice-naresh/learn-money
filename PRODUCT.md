# Learn Money — Product Behaviour Spec (source of truth)

Living spec of **how the app behaves**. Every change request is checked against this doc first; after approval the doc + tests are updated. Each behaviour has an ID (e.g. `NAV-3`) — reference IDs in change requests.

- **App:** single-file generated web app (`gen.py` + `template.html` → `learn-money.html`), India / FY2026-27, English, ages 12–60.
- **Status:** all figures illustrative — **pending CA sign-off**.
- **Tests guard this spec:** `test_journeys.js` (63), `test_buckets.js` (11), `test_features.js` (60), `ui_test.js` (25), `qa_break.js` (19 adversarial), `design_lint.js` (9: + adds stuck-opacity-panel & aria-expanded checks). Build: `python3 gen.py`.

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

_Last updated: **"Can you live off your savings?"** — new reverse income flow (money saved + monthly want → safest-first feasibility across risk levels → drill into SWP), replacing the tenure-first SWP journey card (LIVE-1). Prior: SWP results: **inflation step-up** option (raise monthly income yearly, below the numbers) + **Dig-deeper cards moved to the top half** (chart relocated below them). Prior: **SWP tax modelled properly** — taxes only the realised gain portion of each withdrawal (proportional), per-year with the annual ₹1.25L exemption; leftover unrealised stays untaxed (SIM-6b). Materially lower, realistic tax. Prior: **SWP results clarified** — income drawn and money-left shown SEPARATELY (not summed into one scary number), plain words instead of "pot/corpus", run-dry wording fixed (no false monthly×months), all figures clamped ≥0, + a test asserting non-negativity & the identity (total = income + money-left − costs). Prior: Goals now shows a **detailed inflation breakdown** (today→factor→future, not folded into one number); results toggle **sheen on hover only** (continuous loop read as whole-page shimmer); **design_lint extended to 9** (stuck-opacity panels + aria-expanded). Prior: journey starters now **reset to a blank slate** (no carried-over picks from a prior preset/stress-test/autosave — fixes "why are products pre-selected"); clearer "what it can buy in today's money" inflation row. Prior: **Tax regime moved to Results too** — now beside income in the "How your income & tax regime change what you keep" section (regChips + regBox + margBox); Setup keeps only how-much/how-long inputs (SIM-3/SIM-5). Prior: **Income moved to Results** as a "🧾 How your income changes the tax" section — drag income → watch slab-taxed picks (FD/debt) move while equity stays flat 12.5% LTCG; off the abstract Setup screen (SIM-3/SIM-5). Also fixed scroll-reveal leaving collapsed-panel content at opacity:0. Prior: **Results decluttered** — hero "You keep" + a plain invested→becomes→tax→keep→inflation table; growth chart + verdict kept; exit-early, inflation-horizon and per-product breakdown moved into two collapsed panels (SIM-5). **Journey cards** reordered (lump→SIP→income→"why invest") + colour-coded by type with tags & entrance animation (SIM-1). Removed the top-right SIMULATION badge (looked clickable). Prior: **design_lint.js** added (7 automated UI/UX lints — caught unnamed toggles, AA-contrast miss, glossary gaps on first run; all fixed); SWP journey card renamed **"Get a monthly income"** + journey banner on the shared Setup explains the one-simulator design (SIM-1); preset cards explained. Prior: **Goal planner × products** — risk-mix chips with blended return/volatility derived from real products, "what's inside" lesson links (GOAL-2) + a **stress-test bridge** into the tax-aware simulator (GOAL-3). Prior: **Kid mode removed** (KID-0) — toggle, kid CSS/content, save flag and tour step deleted; coach + tour now point at the Goal planner; all lesson content always visible. Prior: **Goal planner** pillar — target+timeline → required SIP + Monte-Carlo odds + 90%-confidence SIP, all client-side (GOAL-1). Prior: **removed the sticky top section-nav pill bar** — navigation now via home pillar cards + brand→Home + Back bar (NAV-1/NAV-2); guided tour re-pointed to the pillar cards. Prior: Choose screen now offers **"Next" (guided) + "Show results" (skip)** — walkthrough optional (SIM-4b/SIM-7); live panel gains an expandable **breakdown** (invested/charges/tax/penalty/net/today's-₹, SIM-4c). Prior: **privacy reassurance** (hero pill + footer note, PRIV-1) + **Cash-App-grade motion** (kinetic hero, scroll-reveal, tap ripple, scroll-depth header — MOTION-2), all reduced-motion-safe. Prior: **visual polish v2** — ambient aurora bg, glass chrome, gradient-clip headings, CTA sheen/glow, refined shadows & micro-interactions (THEME-2). Prior: results flow bar splits **tax and early-exit penalty into separate segments** (SIM-5); Today's-₹ lens now shows a **full inflation breakdown** table (SIM-5c); Results gated behind a **mandatory product-type walkthrough** (SIM-4b/SIM-7). Prior: ALL ad/promo surfaces removed — ad slots, `SLICE_ADS`, the "courtesy of slice" mention, and `sliceStoreUrl`/`sliceOpen` are gone (AD-1). No slice ads/attribution remain. Prior: brand wordmark lowercased to "slice" (BRAND-1), slice-purple theme (THEME-1), 32nd product Endowment + ULIP clarified (INV-4), salary calculator, global horizon + SIP step-up, Reset, guided tour._

---

## 1. Global / cross-cutting
- **NAV-1** **No top section-nav bar** (removed by design). Section navigation is via the **Home pillar cards** (Investing / Tax / Salary / Credit), the **Try-it simulator card**, the clickable **brand/logo → Home** (NAV-5), and the per-section **← Back** bar (NAV-3).
- **NAV-2** `showSec(name)` switches sections (pushState/history-aware). Sim steps (`inflation/how/choose/results`) drive the **simsteps stepper** highlight.
- **NAV-3** **History-aware back:** every non-home section shows a "← Back" bar that returns to the *previous* section (LIFO stack); browser/device Back also works (pushState/popstate). Back bar hidden on Home.
- **NAV-4** Header has a global **↺ Reset** toggle, visible from every flow. (Mobile <560px hides the "Simulation" badge to avoid overflow.)
- **NAV-5** Clicking the **brand/logo** (top-left) returns to Home.
- **GEN-1** No horizontal overflow at 390px on any section.
- **AD-1 (no ads/attribution)** The app carries **no ads and no slice attribution**. Ad slots (bottom banner + side rails), `SLICE_ADS`, the "courtesy of slice" header mention, and `sliceStoreUrl`/`sliceOpen` have all been removed. No fixed bars / `body` bottom-padding remain.
- **THEME-1** Brand accent is **slice purple** (`--green` token now `#7c4dff`, dark `#5b2ee6`, bright `#9b6bff`) — primary buttons/chips/charts/CTAs. Semantic colours kept (tax buckets, red/amber). *(Exact brand hex pending — using slice's signature purple.)* The primary CTA `.nextbtn` keeps a **solid** `var(--green)` background (its computed colour `rgb(124,77,255)` is asserted in ui_test — never gradient-fill it).
- **THEME-2 (visual polish)** Premium layer: fixed **ambient aurora** background (`body::before`, slow drift) + faint film-grain (`body::after`); **glass** header/secnav (`backdrop-filter` blur+saturate); **gradient-clip** text on the hero `<em>` wordmark and the results keep-number (`.hl-num.green`); layered soft card elevation with top highlight; CTA glow + hover **sheen sweep**; chip/nav hover-lift + on-state glow; glowing brand dot; range-thumb glow; custom purple scrollbar + selection. Shadow tokens `--shadow-sm/md/lg`, gradient token `--grad-purple`. All continuous motion is **disabled under `prefers-reduced-motion`** (MOTION-1).
- **BRAND-1** Brand wordmark is **always lowercase "slice"** — never "Slice"/"SLICE" — in all UI copy (promo titles, "from slice" tag, CTAs).
- **A11Y-1** All click-only controls (toggles, chips, tabs, cards, lesson rows, glossary terms, steps) get `role="button"` + `tabindex=0`; Enter/Space activate them; visible `:focus` ring. Landmarks: `role=main`, `role=navigation`.
- **A11Y-2** Inputs have labels (`for`/`aria-label`); slab tables have `<caption>`. *(Deeper aria-pressed/aria-live = open gap.)*
- **MOTION-1** All animations respect `prefers-reduced-motion` (charts, count-up, sim CTA, tour, etc. still to final frame).
- **MOTION-2 (Cash-App-grade kinetics)** Kinetic hero (word rise-in on load + forever-shimmering gradient wordmark); **scroll-reveal** stagger via `IntersectionObserver` on `#simcard`, pillar cards, lesson rows, product cards, lenses, live readout (`.reveal`→`.in`, per-item `--rd` delay); **tap ripple** on all playful controls; sticky header gains depth on scroll (`header.scrolled`); pillar gradient-sweep + lift on hover. Fallbacks: no `IntersectionObserver` / reduced-motion → content shown immediately (never stuck hidden); a 1.5s safety pass reveals near-viewport leftovers. `observeReveals()` re-runs on every section switch.
- **PRIV-1 (privacy)** App is a **single static file with no backend** — nothing is ever sent to a server, no login, no tracking. Stated to the user in two places: a **hero privacy pill** (`privacyShort`) and a **footer note** (`privacy`), both lowercase-brand-safe. The only persistence is **device-local autosave** (STATE-1); ↺ Reset wipes it. *(We deliberately do NOT claim "erased after session" — localStorage survives tab close; the copy says "runs in your browser / nothing sent to a server / Reset to wipe", which is accurate.)*
- **STATE-1 (persistence)** Portfolio, mode, income/regime, amounts, lenses, plan-years and SIP step-up **autosave to localStorage** (device-local only — see PRIV-1); restored on reload. Graceful if storage blocked (try/catch).
- **STATE-2 (reset)** Global Reset → wipes saved state **and** `lm_seen`, returns to **Home**, re-shows the welcome.
- **I18N-1** English only; Hindi strings parked, language toggle hidden. (New strings need not be translated.)

## 2. Home + onboarding
- **HOME-1** Home shows hero + a **2-up "tools" grid** (`.toolgrid`) of the two **interactive tools side by side** — the **Simulator** (`#simcard .simcta`, ▶ Start the simulator) and the **Goal planner** (`#goalcard .simcta.simcta-alt`, ✦ Plan a goal) — then **4 reading pillar cards** (Investing, Tax, Salary, Credit). Tools stack on mobile (<760px). Goal is promoted up here (was buried as the last pillar) so people don't miss it.
- **HOME-2** Each pillar card routes to its section; the sim card → Try it.
- **COACH-1** First visit (no `lm_seen`) shows a welcome overlay with: **🚀 Show me around** (guided tour) and **Skip**; bullets mention topics, the simulator and the goal planner.
- **COACH-2** Guided tour = 4 spotlight steps (sim card → Investing → Salary → Goal planner) with Next/Skip + step counter; ending sets `lm_seen`. Shows once; Reset re-arms it.

## 3. Investing library
- **INV-1** Lists **all 32 products** as read-only lessons, grouped under 6 category headers; tab bar = **All + 6 filters**.
- **INV-2** Each lesson opens with a **🍱 food analogy**, then a plain "how it behaves" line, then deep sections: What it is · How it works · Returns · Example · Risks · Liquidity/lock-in · Taxation · Costs · Who it's for · Pros · Cons. Ends with a **💰 tax cross-link** to the Tax pillar.
- **INV-3** Tapping a lesson header expands/collapses it.
- **GLOSS-1** Jargon terms (NAV, LTCG, EPF, 80C, APR, …) are auto-marked across lessons + Tax + Credit; tapping shows a plain inline definition; tapping again hides it.
- **INV-4 (insurance products)** Catalog includes both insurance-as-investment types in Advanced: **ULIP** (market-linked, fund-choice, 5-yr lock, high charges) and **Endowment/money-back (LIC-style)** (traditional, guaranteed ~4–6%, long lock, 80C + 10(10D) tax-free). Both lessons make the "insurance + investing usually underperforms term + index" point. **Term insurance** is explained as pure protection (not a portfolio product).

## 4. Kid mode — REMOVED
- **KID-0** Kid mode was removed entirely (toggle, `body.kid` CSS, `.kidhide`/`.kidonly`/`.kidcard` content, save/load flag, tour step). Rationale: plain language + food analogies are already baked into every lesson for the 12–60 audience, so a separate mode was redundant surface. All content is now always visible. A stale `kid:true` in an old localStorage blob is ignored harmlessly.

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
- **SIM-1** Try-it landing = 4 journey starters (inflation, lump, SIP, SWP — SWP card titled "Get a monthly income" with a plain explanation; each investing card carries a `ctx` line). The 3 investing journeys open the SAME simulator Setup with the mode pre-selected; a **journey banner** (`#howCtx`, filled by `goPath`) names the journey you came from and says the shared simulator is intentional and the mode is switchable + **3 preset chips**; a **stepper** (Inflation→Setup→Choose→Results) shows on sim screens; the Results step is disabled until valid (SIM-7).
- **SIM-1b (presets)** Presets set a ready mix + mode and jump to Choose: **Safe & steady** (lump; fd/ppf/gsec/index), **Young & aggressive** (SIP; index/equity_mf/stocks/crypto), **Balanced** (lump; index/ppf/fd/gold/equity_mf). Each sums to 100%. Each preset renders as a **mini-card with a plain-language description** (what's inside + how it behaves — e.g. "Mostly FDs, PPF & govt bonds… barely wobbles"); the section label explains a preset *selects the products and split for you, changeable after*. No bare unexplained pills.
- **SIM-2 (Inflation)** Amount + rate + horizon → animated erosion chart + "today's buying power" text.
- **SIM-3 (Setup)** Mode chips: **Invest once / Invest monthly / Take money out** (lump/SIP/SWP), each with an explainer box. Inputs: amount(s), **income (log slider ~₹3L–₹50Cr)** with a live marginal-rate + surcharge note, regime (new/old) with a detail box; **"Invest for N years"** global horizon (default 10); **"Yearly SIP increase %"** step-up (default 10, SIP-only). Scenario (worst/expected/best) is **removed**.
- **SIM-4 (Choose)** 32 products in **6 category tabs** (filter visible rows). Selecting auto **equal-splits to 100%** (1→100, 2→50, 4→25…); manual drag allowed but the **total can never exceed 100%**; a selected product can be dragged to 0% without deselecting; inactive product's slider is disabled. Each row has an editable **Return %** and a **"what is this?"** explainer (behaviour + ELI5 + worked example). Live dark "what you keep" panel (sticky) updates on every change.
- **SIM-4c (live breakdown)** The sticky live panel has a **"▸ See breakdown"** toggle (`liveBreak`/`toggleLiveBreak`) that expands a per-total split: **Total invested · Charges · Tax · Early-exit penalty** (penalty row only if >0) · **You keep (net)** · **worth in today's ₹** (same inflation horizon/rate as the headline). Collapsed by default; keyboard-activatable.
- **SIM-5 (Results)** Headline You-keep / Lost / post-tax-return; result summary line; flow bar with **four separate segments — net / charges / tax / early-exit penalty** (tax and penalty are always distinct; penalty segment + its legend appear only when penalty>0); growth chart with inflation reference line; **beat-inflation verdict**; per-product cards (each with a **💔 exit-early** toggle, listing Invested / Charges / Penalty / Tax / Net as separate rows); lenses: **Exit early** (master) with a cost calculation, and **Today's ₹** with a **years** selector.
- **SIM-5c (inflation breakdown)** The Today's-₹ lens renders a **full breakdown table** (`adjBox`): future ₹ kept → inflation rate → years → price-rise factor (`(1+r)^yrs`, "₹100→₹X") → worth in today's ₹ → **lost to inflation (₹ and %)**, plus a plain-language sentence. Always shown when products are selected (regardless of the Future/Today toggle). Headline #num1 still switches nominal↔real on the toggle.
- **SIM-4b (optional guided walkthrough)** Two buttons on Choose: a primary **"Next: <type> →"** (`nextCat`) that steps through each un-browsed product-type tab (browsed tabs get a ✓; `catProg` banner shows "N/6 explored"), and a **"Show results"** (`toResults`) that **skips straight to results** at any time. Walkthrough is **not mandatory** — Show-results is gated only on allocation (SIM-7). When all types are browsed, Next disappears and Show-results promotes to the primary (`.solid`) style. Browsed set tracked in `SEEN_CATS` (reset by Reset).
- **SIM-5d (SWP story)** In SWP mode, Results opens with a **4-step story box** (`#swpStory`): started with pot ₹X → took ₹w/mo = ₹W total income → pot left ₹E (or "N picks ran dry") → tax (growth part only) + charges −₹C → **"You keep" = income taken + pot left − costs**. The headline caption reads "You keep (income taken + pot left)" so the blended number is explained.
- **SIM-5b** Old regime + active 80C products → an **"80C bonus" box** shows the upfront tax saved (`min(80C invested, ₹1.5L) × marginal rate`), hidden in new regime. SWP that runs dry → a **"ran out of money" message** naming how many picks dried up.
- **SIM-6 (engine)** Per product over the global horizon: lumpsum compounds; SIP accrues monthly with **annual step-up**; SWP draws down (flags "ran out"). Charges = expense ratio accrued monthly on actual balance. Tax by bucket: slab / LTCG 12.5% with **pooled ₹1.25L** equity exemption (lumpsum/SIP) / tax-free / mixed / crypto 30%; +cess; surcharge (CG capped 15%). Exit-early adds a penalty + forfeits the tax perk (not SWP).
- **SIM-6b (SWP tax)** SWP taxes only the **realised gain portion of each withdrawal** (proportional: gain-share of the current balance), accrued **per year with the annual ₹1.25L** equity exemption; the un-withdrawn remainder is unrealised → untaxed. All SWP figures clamp ≥0. Result shows **income drawn** and **money left** as separate lines (not summed), plain words (no "pot/corpus"). Guarded by a test asserting non-negativity + the identity *total = income + money-left − costs*.
- **SIM-7 (validation)** "Show results" + stepper-Results are **disabled unless ≥1 product AND total = 100%**; allocation ≠100% shows a warning with "X% to go/over". *(Walkthrough is no longer part of the gate — see SIM-4b.)*
- **SIM-8** Money inputs (`.money`, 16 fields: lump/sip/swp/inflation/credit/salary/goal amounts) render **live Indian thousand-commas as you type** (e.g. `25,00,000`) — they're text inputs (`inputmode=numeric`) converted by `setupMoneyInputs()`; all reads go through `mnum()` (strips commas), formatting via `mfmt()`. Percent/year fields stay plain. A words helper still shows ("₹5,00,000 · 5 lakh"); all inputs **clamp to min/max on blur** (`clampNum` reads min/max via attributes for text fields); never produce NaN/Infinity.
- **CHART-1 (usable charts)** All three canvases have **real labeled axes**, not just captions: ₹ Y-axis gridlines (0/mid/max via `fmtShort`), year X-axis (Now / mid / Yr N), and value markers — **Goal chart** (goal + final corpus), **growth/results chart** ("Put in ₹X" reference line + end-value dot, animation preserved), **inflation chart** ("Rupees you hold" dashed line + "Buys ₹X" end marker). Each also keeps its plain-language "Reading it" caption.
- **GOAL-1 (Goal planner)** 5th home pillar `goals`. Inputs (preset chips Retirement/Home/Education/Car/Custom + goal cost in today's ₹, years, already-saved, yearly SIP step-up, return & inflation sliders). Computes: **future cost** = `amt·(1+infl)^yrs`; **required monthly SIP** (binary-search over a deterministic monthly-compounding projection incl. step-up + existing corpus); **Monte-Carlo odds** (1200 sims, yearly normal-random returns via Box-Muller, volatility derived from the return assumption) → probability at the required SIP (~coin-flip by design) + the **SIP needed for ~90% confidence** + p10/p50/p90 corpus; a projected-path-vs-target chart. **100% client-side, no live data**; clearly disclaimed as educational, not advice. Engine fns (`gRequiredSIP/gFinal/gProb/gSipForConfidence/volForReturn`) are pure + unit-tested.
- **GOAL-2 (product mixes)** "How would you invest it?" chips — **Safe & steady / Balanced / Growth / Custom %** (`GOAL_MIXES`). A mix's **blended return + volatility are derived from the products inside it** (default returns from `PS_DEFAULTS`, swing from `ANIM_VOL` by behaviour type) — the return slider locks and mirrors the blend; Custom unlocks it (`volForReturn`). A **"What's inside this mix?"** expander lists each product (icon, %, ~return); every row is clickable → opens that product's lesson (`openLesson`). Mix %s are labelled illustrative, not advice.
- **GOAL-3 (stress-test bridge)** A **"🧪 Stress-test this plan →"** button (`stressTestGoal`) loads the goal plan into the simulator: applies the mix allocation to `PS`, sets SIP mode, `sipAmt` = required SIP, `planYears` = goal years, `sipStepup` = goal step-up → lands on **Results**, where **tax + charges are included**. A standing amber note on Goals says the goal numbers are **before tax & charges**. Custom-return plans bridge using the Balanced mix (the simulator needs concrete products).
- **LIVE-1 (Can you live off your savings?)** The "income" journey card now opens `sec-liveoff` — a **reverse, no-tenure** flow: inputs are just **money saved** + **monthly income wanted** (+ optional "raise with inflation 6%/yr"). `renderLiveoff` simulates a 40-yr drawdown (`swpLasts`) at each mix's blended return and gives a **safest-first headline verdict** (works indefinitely / lasts 40y+ but shrinks / runs out in ~N years) plus three colour-coded risk cards (Safe/Balanced/Growth). **"See it play out →"** (`liveoffToSim`) loads it into the existing SWP simulator (Balanced mix, corpus + withdrawal + step-up) → Results. Adds a "for how long?" horizon (optional, default "as long as it lasts") and a **spend-down vs keep-intact** choice: keep-intact shows income from RETURNS only (principal preserved; real return if income rises with inflation), hiding the horizon. This **replaces the old tenure-first SWP journey entry**; the SWP engine/mode remains as the drill-down.

## 9. Invariants — must never break
- **INV-A** No NaN/Infinity/undefined in any visible result, under any input (qa_break).
- **INV-B** Allocation total never > 100% (SIM-4).
- **INV-C** Results unreachable while invalid (SIM-7) via button, stepper, or programmatic gate.
- **INV-D** Salary in-hand monotonic & bounded (SAL-6).
- **INV-E** No mobile horizontal overflow (GEN-1).
- **INV-G** Reset = clean slate from anywhere (STATE-2).

---

## Coverage map (what guards what — "what will fail" lookup)
| Area | Suite |
|---|---|
| NAV, HOME, COACH/tour, INV library, GLOSS, KID, TAX render, SIM nav/stepper, back-gate | `test_journeys.js` |
| Tax buckets / income-sensitivity | `test_buckets.js` |
| Warnings, 80C, SWP-dry, reset, presets, equal-split, gating, lenses, persistence, coachmark, **salary**, horizon, step-up | `test_features.js` |
| Real-Chrome render, fonts/colour, charts, mobile overflow (all sections), screenshots | `ui_test.js` |
| Adversarial: hostile inputs, nav churn, **salary** bounds/monotonicity | `qa_break.js` |

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
