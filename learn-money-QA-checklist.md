# Learn Money — QA & Test Checklist

_Literacy-first app (ages 12–60): 4 pillars + simulator + salary calculator, Kid mode, persistence, coachmark._
_Automated tests run in **jsdom** (logic/wiring) + **headless Chrome** (UI/pixels) + an **adversarial harness**._

**Total: 141 suite checks + 24 adversarial probes — all passing.**
- `test_journeys.js` (66) — IA/nav/pillars/back-stack/stepper, library + glossary + food analogy, Kid mode (incl. Tax/Credit/Setup), gating, equal-split.
- `test_buckets.js` (11) — tax-engine buckets.
- `test_features.js` (41) — warnings, 80C ₹, SWP-dry, bad input, reset, presets, exit/inflation lenses, persistence, coachmark, **salary calculator**.
- `ui_test.js` (23) — real-Chrome render + mobile-overflow (all sections) + screenshots.
- `qa_break.js` (24) — adversarial: hostile inputs, nav churn, kid-mode mid-flow, **salary calculator** (monotonicity, bounds, all field/regime/age combos).

### 💼 Salary calculator — tested
- [x] Prefilled, editable; shows monthly in-hand (no NaN) and per-year
- [x] Higher CTC → higher in-hand (monotonic; no 87A/surcharge cliff)
- [x] Old-vs-new **compare** renders both cards + marks the better one
- [x] 87A → ~₹0 tax for low income
- [x] **EPF / HRA% / gratuity% / employer-NPS% / professional tax** all editable
- [x] Salary-structure breakdown shows Basic / HRA / Special / gratuity / employer-NPS → gross → in-hand
- [x] **Senior-citizen** age slabs lower old-regime tax
- [x] Old-regime **80C auto-includes your EPF**; **professional tax deducted before tax**; **employer NPS 80CCD(2)** exempt both regimes
- [x] Adversarial: blank/negative/huge/garbage in every field × all regimes/age/metro → no NaN, in-hand bounded 0<x≤CTC

### ⚠️ Salary — pending CA / non-goals (v1)
- [ ] **CA sign-off** on slabs/87A/surcharge/cess + HRA/80C/PF/gratuity/NPS treatment (illustrative, banner shown)
- [ ] Non-goals: LTA, bonus/variable, leave encashment, perquisites/RSUs, DA, EPF ₹15k ceiling, state-exact PT, gratuity exemption limits, full marginal-relief edge bands

---

## ✅ Tested & passing (64 jsdom checks)

### Navigation & journeys (`test_journeys.js` — 33)
- [x] App loads with **no runtime errors** at startup
- [x] **Home** is the default section on load
- [x] Home renders **6 path cards**
- [x] Each path card routes to the correct section (and pre-sets mode):
  - [x] "What doing nothing costs" → Inflation
  - [x] "Invest a lump sum" → Setup (lump-sum mode)
  - [x] "Start a monthly SIP" → Setup (SIP mode)
  - [x] "Make your money pay you" → Setup (SWP mode)
  - [x] "Explore all 31 products" → Choose
  - [x] "Jump to your results" → Results
- [x] All 5 top **nav tabs** switch sections
- [x] **State persists** across section navigation (single-page, no reset)
- [x] Inflation: amount / rate / horizon inputs update the result text
- [x] Setup mode switch: SIP shows SIP input; SWP shows corpus + withdrawal; lump-sum shows lump input
- [x] Income slider to **max (~₹50 Cr)** shows "Cr" value **and** the surcharge note
- [x] Income slider back down to ~₹15 L reads correctly (log scale works)
- [x] Regime toggle: old regime surfaces the 80C detail
- [x] Scenario toggle (worst / expected / best) runs without error
- [x] Choose renders **all 31 product rows**
- [x] All **6 category tabs** filter rows correctly (no foreign-category rows leak in)
- [x] Toggle a product on, edit its %/years/return — % label updates live
- [x] Explainer expands: **animation SVG + worked example** both present
- [x] Total-allocation indicator updates
- [x] Results headline numbers valid — **no NaN**
- [x] Per-product result cards render for active products
- [x] Stress: **all 31 products active** — no NaN anywhere
- [x] Language → **Hindi** (paths + labels translate), results valid in Hindi, switch back to English
- [x] Path cards re-render in the active language

### Tax engine with real money (`test_buckets.js` — 11)
- [x] All 5 tax buckets render cards with real allocations
- [x] No NaN / Infinity in any bucket: slab, flat, exempt, mixed, crypto
- [x] **Slab** tax (FD) **rises with income** (₹0 at ₹3 L → ₹72,594 at ₹50 Cr)
- [x] **Flat** tax (equity) rises only by the **capped ~15% CG surcharge**
- [x] **Exempt** (PPF) tax is **zero** at every income
- [x] **Crypto** taxed even at low income (flat 30%)
- [x] Crypto tax rises with income (surcharge applies)

### Features & former gaps (`test_features.js` — 20)
- [x] Bottom **"Next →" buttons** clicked directly: inflation→setup→choose→results
- [x] Allocation **≠ 100%** surfaces a visible warning; **= 100%** hides it
- [x] **80C deduction box**: hidden under new regime; under old regime computes the right ₹ saving (PPF 10% of ₹5L × 30% = **₹15,000**)
- [x] **SWP corpus runs dry** → user-facing "ran out" message; healthy SWP shows none
- [x] Input **bounds / bad input**: blank, negative, zero years (clamps ≥1), absurdly large — no NaN/Infinity anywhere
- [x] **Reset to defaults** restores allocations, mode, and all amount inputs
- [x] **Starter presets** (3) render on home; "Safe & steady" → lump mix totals 100%, "Young & aggressive" → SIP equity-heavy, no NaN
- [x] Switching **mode after selecting products** keeps allocations sane (no NaN, total preserved)
- [x] **₹1.25L LTCG exemption pooled** across equity (splitting one holding into two funds does NOT conjure a second exemption)
- [x] **Charges accrue on balance**, not `principal × years` (SIP no longer over-charges fees on money not yet invested)

### 🔧 Tax-model fixes applied (were the top-2 review findings)
- **₹1.25L LTCG exemption** now pooled per-taxpayer across all equity (flat) funds and split proportionally by gain — was applied per-fund, understating tax when multiple equity funds were active.
- **Expense-ratio charges** now accrue monthly on the actual balance (ramping for SIP, compounding for lumpsum, drawing down for SWP) — was `invested × charge × years`, which over-charged SIP ~30% by billing fees on contributions not yet made.
- _Still simplified (proportional split, annual accrual, no fee-on-fee compounding) — keep on the CA review list, but materially closer to real._

---

## ✅ Verified in real Chrome (`ui_test.js` — headless Chromium, 15 checks + screenshots)
- [x] No page/console errors across full desktop + mobile interaction
- [x] **Space Grotesk** font actually loads; hero uses it
- [x] CTA button is exactly Cash green (`rgb(0,213,75)`)
- [x] Path arrow is a plain chevron (no green circle)
- [x] Product explainer animation keyframes active (e.g. `barGrow`)
- [x] Explainer shows animated SVG when expanded
- [x] **Inflation chart** actually draws (pixels verified)
- [x] **Growth chart** actually draws (pixels verified) — full-width curve
- [x] **Count-up** animation tweens through intermediate values
- [x] Hindi renders without breaking layout
- [x] **No horizontal overflow** on mobile (home / choose / results @ 390px)
- [x] Visual eyeball pass on screenshots: home, setup, choose+explainer, inflation, results, mobile

### 🐛 Bugs caught by UI testing & fixed
- [x] Inflation chart was **blank on first visit** (canvas sized while hidden) → re-render on section show
- [x] Canvas **height doubled every render** (page ballooned to ~53,000px) → pinned CSS height, read `clientHeight`
- [x] **"₹₹"** doubled rupee in the result summary line → removed literal ₹ (fmtShort already includes it)
- [x] Added **prefers-reduced-motion** support (charts/count-up draw final frame instantly) — accessibility bonus

## ⚠️ Still needs a human eyeball on a real device
- [ ] Spring **press** feel & **section entrance** bounce timing (rendered, but motion not judged)
- [ ] Green intensity / contrast on an actual phone screen (OLED vs LCD)
- [ ] Emoji icon consistency across iOS / Android / Windows
- [ ] The looping explainer SVG animations at real speed (captured mid-frame only)
- [ ] Header "Learn Money" wraps to 2 lines on very narrow screens (cosmetic)

---

## 🔧 NOT yet covered — functional gaps worth adding tests for
- [ ] CAGR with **negative net** (extreme tax) — guarded in code, not asserted
- [ ] **Accessibility**: keyboard navigation, focus states, ARIA, screen-reader labels
- [ ] **Performance** with all 31 active + animations on low-end Android
- _(Next buttons, alloc≠100% warning, 80C ₹ saving, SWP-dry message, bad-input bounds, reset, presets, mode-switch sanity — now covered in `test_features.js`.)_

---

## 📋 Beyond code — product / compliance / roadmap
- [ ] **Compliance & legal sign-off** (it's a bank): return assumptions, tax simplifications, disclaimers
- [ ] **CA review** of FY2026-27 figures (slabs, surcharge, cess, 87A, ₹1.25 L exemption)
- [ ] Refine known simplifications (all flagged in the footer):
  - [ ] NPS gains shown tax-deferred (real: 60% tax-free / 40% annuity taxed)
  - [ ] SWP taxes total growth, not lot-by-lot
  - [ ] Mixed-asset holding thresholds unified to 1 yr (real: gold/property/foreign = 24 mo)
  - [ ] SGB / ULIP edge-case treatment
- [x] ~~Decide on **starter presets**~~ — shipped: Safe & steady / Young & aggressive / Balanced
- [x] ~~Inflation baseline line on the Results growth chart~~ — shipped (amber dashed reference line)
- [x] ~~**Reset to defaults** control~~ — shipped (Choose section)
- [ ] Real Slice data integration (only if aggregate data is available & approved)
- [ ] Localisation beyond Hindi (Tamil, Telugu, etc.)
- [ ] **Analytics / funnel** instrumentation (the acquisition goal)

---

## How to re-run the tests
```bash
python3 gen.py          # rebuild learn-money.html first
node test_journeys.js   # 33 navigation + journey checks
node test_buckets.js    # 11 tax-engine checks
node test_features.js   # 18 feature / gap checks
node ui_test.js         # 15 real-Chrome UI checks + screenshots in ./shots/
# or all at once: npm run test:all
```
Re-run after **every** change to `template.html` / `gen.py`, then regenerate with `python3 gen.py`.
