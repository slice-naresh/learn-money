# Learn Money — build & test

Financial-literacy web app for SliceBank — "how money works" for ages **12–60**. Single-file app, **generated** from data. Plain-language, India / FY2026-27.

## Files
- `gen.py` — data: 31 products (catalog, ELI5, deep lessons, food analogies, tips, behaviour, tax buckets), glossary, EN/HI strings. **Edit here for data.**
- `template.html` — HTML/CSS/JS with `/*PLACEHOLDER*/` markers. **Edit here for layout/logic/design.**
- `learn-money.html` — generated output. **Do not edit by hand** (overwritten on build).
- `test_journeys.js` — jsdom journey/nav/IA/kid-mode tests (66)
- `test_buckets.js` — jsdom tax-engine bucket tests (11)
- `test_features.js` — jsdom feature tests: warnings, 80C, SWP-dry, reset, presets, equal-split, gating, inflation/exit lenses, persistence, coachmark, **salary calculator** (41)
- `ui_test.js` — headless-Chrome UI + mobile-overflow + screenshots to `./shots/` (23)
- `qa_break.js` — **adversarial QA harness** (hostile inputs, nav churn, kid mode, salary) — 24 probes, run standalone
- `demo_capture.js` / `demo_video.js` — screenshot reel / narrated MP4 demo → `./shots/`
- `learn-money-QA-checklist.md` — QA status & what's left

Paths are script-relative — clone anywhere and it builds/runs.

## Build
```bash
python3 gen.py            # gen.py + template.html -> learn-money.html
```

## Test (run after every change, then rebuild)
```bash
npm install               # once — jsdom + puppeteer + ffmpeg-static (devDeps)
node test_journeys.js && node test_buckets.js && node test_features.js && node ui_test.js
node qa_break.js          # adversarial pass
```
**Total: 141 suite checks + 24 adversarial probes.** Re-run after every change, then rebuild.

> ⚠️ **Node 26 + puppeteer/yargs:** a fresh `npm install` can reintroduce a yargs ESM break under Node 26 that crashes puppeteer (UI test + demo). Workaround applied in `node_modules/yargs/package.json`: `"type":"module"` → `"commonjs"`. Re-apply after any reinstall (or pin/patch durably).

## Structure — literacy-first
- **Home** — 4 reading pillars + a distinct animated **▶ Start the simulator** play card. First visit shows a one-time coachmark.
- **📈 Investing** — all 31 products as standalone lessons (All + 6 filters; each opens with a **🍱 food analogy**, behaviour line, deep 10-section lesson, tap-to-define glossary, tax cross-link).
- **🧾 Tax** — slab tables (from the engine's own regime constants), std deduction/87A, surcharge & cess, deductions (80C/80D/80TTA/24b/80CCD), per-bucket taxation.
- **💼 Salary calculator** — enter CTC (all fields prefilled + editable: basic%, EPF%, HRA%, gratuity%, employer-NPS%, professional tax, age, old-regime deductions) → monthly **in-hand** after tax, with salary-structure breakdown and **old-vs-new** comparison.
- **💳 Credit** — how a card works + minimum-due trap + "cost of carrying a balance" calculator.
- **🧪 Try it** — simulator: inflation → setup → choose (equal-split, live panel, 100% gate) → results (flow bar, growth chart, beat-inflation verdict, exit-early & today's-money lenses).

**Cross-cutting:** 🧒 **Kid mode** (header toggle — strips every section to kid-simple), **persistence** (autosaves portfolio/settings to localStorage; **Reset** wipes clean), history-aware Back + browser back, equal-split & 100% cap, money-in-words helpers, input clamping, keyboard a11y (role/tabindex/focus), `prefers-reduced-motion`. English-only for now (Hindi strings parked, toggle hidden).

## Still open (NEEDS A HUMAN — not code)
- **CA sign-off** on every FY2026-27 figure — slabs, 87A, surcharge, cess, ₹1.25L exemption, **and the salary calculator** (HRA/80C/PF/gratuity/NPS treatment). All illustrative until verified; banners in place.
- **Salary non-goals (v1):** LTA, bonus/variable pay, leave encashment, perquisites/RSUs, DA, EPF ₹15k wage ceiling, state-exact professional-tax slabs, gratuity exemption limits.
- **Deeper a11y** (aria-pressed/aria-live + real screen-reader pass), Hindi re-enable, cross-browser/real-device testing.

See `LITERACY-RESTRUCTURE-PLAN.md` for the design. `GAMIFICATION-PLAN.md` superseded.
