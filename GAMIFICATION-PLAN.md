# Learn Money — Gamification Plan

_Status: PROPOSAL for approval. No code written yet._
_Audience: age 12–60. Context: SliceBank education tool, single-file generated web app (vanilla JS + Python `gen.py`), no backend, EN + HI._

---

## 1. Principle: "meaningful play", not a Skinner box

This is a **bank** education tool that **minors may see**. So gamification must **teach**, never **nudge behaviour or addict**.

- ✅ Mechanics that reward **understanding** (beat inflation, build a tax-efficient mix).
- ❌ Mechanics that reward **time-on-app or risk-taking** (streaks, daily loot, leaderboards, anything that makes crypto% look like "winning").

**Hard guardrails (compliance):**
- Keep the "Simulation" badge everywhere; scores rate *understanding*, never give *advice*.
- The score must **not reward higher risk** (no points for crypto/equity %). It rewards *beating inflation after tax* + *diversification* + *low charges* — neutral, educational signals.
- No PII, no accounts, no network calls. Any persistence = **localStorage only** (anonymous, device-local).
- Disclaimers unchanged. If under-13 users are in scope, confirm legal sign-off before any persistence.

---

## 2. What to build — three tiers

### Tier 1 — Core (recommended, no persistence) — "instant learning payoff"

**1A. Beat-Inflation Verdict** (Results screen)
- Off the inflation reference line already on the growth chart.
- Badge: ✅ "You beat inflation by **X%**" / ⚠️ "This **lost** to inflation — your money buys less."
- One-liner teaches the core lesson the app exists for.

**1B. Smart Money Score** (Results screen) — a *rubric*, not arbitrary points
- 0–100, broken into teaching sub-scores, each with a plain reason:
  - **Beats inflation** (post-tax CAGR vs inflation rate)
  - **Diversification** (spread across categories; concentration penalised)
  - **Tax-efficiency** (share of returns lost to tax — rewards using exemptions/tax-free, neutral on product type)
  - **Low charges** (fee drag on returns)
- Shows breakdown: e.g. _"Tax-efficiency 5/10 — most of your money is in slab-taxed FD; some tax-free options grow the same with less tax."_
- This doubles as a **scorecard that explains the app's whole thesis** (what you keep after tax + charges + inflation).

### Tier 2 — Engagement (optional, needs localStorage) — "explore + master"

**2A. Challenges / Missions** (new entry on Home)
- 3–5 starter goals the user builds a portfolio to satisfy; engine checks pass/fail + gives guidance. Examples:
  - "Turn ₹1L into ₹2L in 10 years." (growth)
  - "Build a mix that **beats inflation AND keeps tax under ₹X**." (trade-off)
  - "Make ₹20k/month income for 20 years without the pot running dry." (SWP — reuses the dry-corpus logic)
  - "Beat an FD-only plan over 15 years." (comparison)
- Teaches trade-offs by *doing*. Reuses existing `outcome()`/`render()` math entirely.

**2B. Concept Collection** (ties to the tab-discoverability problem)
- Expanding a product's "what is this?" marks it **learned**; "You've learned 12 / 31 products," group completion ticks.
- Turns the hidden-tab exploration into a light collection incentive — fixes a real UX gap *and* gamifies.

**2C. Progress badges** — tried each mode (lump/SIP/SWP), compared regimes, ran the inflation tool, completed a challenge. Breadth, not grind.

### Tier 3 — Explicitly EXCLUDED (wrong for a bank / minors)
- Streaks, daily rewards, random/loot rewards, leaderboards, avatars/virtual currency, social sharing of "wins". Skip all.

---

## 3. Architecture fit (how it lands in this codebase)

- **All client-side.** New pure functions reusing engine totals (`tNet, tTax, tChg, maxY`, inflation rate) — no engine rewrite.
- **Data in `gen.py`** (so it stays EN/HI + build-time): challenge definitions `{id, goal text EN/HI, check params}`, score-rubric copy, badge labels.
- **Score/verdict = pure functions** in `template.html`, called at end of `render()`. Testable in jsdom.
- **Persistence (Tier 2 only):** a tiny `localStorage` wrapper (`lm_progress`), guarded + try/catch (jsdom/SSR safe). Anonymous.
- **New UI:** Results scorecard panel (Tier 1); a "Challenges" card on Home + a learned-tick on explainers + a badges strip (Tier 2).
- **i18n:** every new string in both `en`/`hi` STR maps, same pattern as today.
- **Tests:** extend `test_features.js` — score rubric calc, beat-inflation verdict true/false, each challenge pass + fail case, localStorage progress round-trip. Keep all 79 green.

---

## 4. Phasing & rough effort

| Phase | Scope | Effort | Persistence |
|---|---|---|---|
| **A** | Beat-Inflation Verdict + Smart Money Score (Tier 1A+1B) | ~0.5–1 day | none |
| **B** | Challenges (Tier 2A), 3–5 starter missions | ~1 day | localStorage |
| **C** | Concept Collection + progress badges (2B+2C) | ~1 day | localStorage |

Recommend **Phase A first** — highest learning payoff, zero persistence/compliance surface, ships independently. Decide on B/C after seeing A live.

---

## 5. Open questions (need your call before/within build)

1. **Under-13 in scope as actual users?** If yes → confirm legal sign-off before any localStorage (Phase B/C). Phase A is safe regardless.
2. **Score visible by default, or behind a "Rate my plan" button?** (Default-on teaches more; button-gated is calmer.)
3. **Challenges as a separate Home entry, or woven into the existing path cards?**
4. Should the score **ever** factor risk appetite, or stay strictly neutral? (Plan assumes strictly neutral for compliance.)
