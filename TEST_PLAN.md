# Learn Money — Test Plan (page by page)

Manual + automated test cases for every screen: **functional · input validation · stress/edge · security · accessibility/UX**. Each case lists the **expected result** and its **coverage** — which automated suite guards it, or `MANUAL` / `GAP`.

## How to run the automated suites
```bash
python3 gen.py            # build learn-money.html + index.html
node test_journeys.js     # user journeys / navigation / content (63)
node test_buckets.js      # tax-bucket math correctness (11)
node test_features.js     # feature behaviours / persistence / engine (56)
node ui_test.js           # headless-Chrome render, fonts, overflow, charts (24)
node qa_break.js          # adversarial: hostile inputs, nav churn, salary bounds (19 probes)
node design_lint.js       # UI/UX lint: default-styled controls, a11y names, contrast, tap targets, glossary (7)
```
Legend: ✅ automated · 👤 MANUAL (needs a human/real device) · ⚠️ GAP (not yet covered).

---

## 0. Global / cross-cutting
| # | Case | Expected | Coverage |
|---|---|---|---|
| G1 | Load with empty localStorage | Home renders, no console/page errors | ✅ ui_test, journeys |
| G2 | Reload after building a portfolio | State restored (products, mode, amounts, regime, years) | ✅ features (loadState) |
| G3 | Reset button | Wipes state + `lm_seen`, returns Home, re-shows welcome | ✅ features, qa_break |
| G4 | Navigate every section back-and-forth rapidly | No NaN/undefined/errors; back-bar correct (LIFO) | ✅ qa_break (nav churn), journeys (back stack) |
| G5 | Brand/logo click | Returns Home | ✅ journeys |
| G6 | No horizontal overflow at 390px on every section | scrollWidth ≤ viewport | ✅ ui_test |
| G7 | `prefers-reduced-motion` | All continuous motion stops; content fully visible | 👤 (emulated once in probes) |
| G8 | **Security: XSS** — no untrusted string reaches `innerHTML` | All sinks are build-data or numeric; loadState only sets `.value`/dict-keys | 👤 reviewed (see SECURITY below) |
| G9 | **Security: CSP** present, `connect-src 'none'`, no external fetch | meta CSP blocks exfil; only data: fonts/img | ✅ build grep · 👤 |
| G10 | **Offline** — open with no network | Fully works; fonts embedded (no Google CDN) | ✅ build grep (0 external) · 👤 |
| G11 | Money fields show live Indian commas; reads stay numeric | `25,00,000`; engine never sees a comma (no NaN) | ✅ features, qa_break |
| G12 | Every interactive element has an accessible name | role+aria-label/text on all | ✅ design_lint |
| G13 | Body text WCAG AA contrast ≥4.5:1 | pass | ✅ design_lint |

## 1. Home
| # | Case | Expected | Coverage |
|---|---|---|---|
| H1 | 2 tool cards (Simulator, Goal) side by side + 4 reading pillars | counts exact | ✅ journeys, ui_test |
| H2 | Each pillar card → its section | invest/tax/takehome/credit | ✅ journeys |
| H3 | Simulator card & Goal card navigate | tryit / goals | ✅ journeys |
| H4 | Privacy pill + footer note present, lowercase "slice" copy | accurate, no false "erased" claim | ✅ journeys (no ads/courtesy) |
| H5 | Tools stack on mobile (<760px) | no overflow | ✅ ui_test |

## 2. Onboarding (coach + tour)
| # | Case | Expected | Coverage |
|---|---|---|---|
| O1 | First visit (no `lm_seen`) shows welcome | overlay; "Show me around" + Skip | ✅ features |
| O2 | Guided tour: 4 spotlight steps → done sets `lm_seen` | sim → invest → salary → goal | ✅ features |
| O3 | Tour spotlight targets exist (no dead selectors) | each step finds its element | ✅ features (spotlight present) |

## 3. Investing library
| # | Case | Expected | Coverage |
|---|---|---|---|
| I1 | 32 lessons across 6 category tabs | count = 32; tabs filter rows | ✅ journeys, ui_test |
| I2 | Each lesson opens with a food analogy + sections | `.foodie` + ≥2 `.lsec` | ✅ journeys |
| I3 | Category tab switches visible rows | per-cat counts | ✅ journeys |
| I4 | Lesson rows keyboard-activatable | role+tabindex | ✅ journeys (a11y) |

## 4. Tax & take-home (reading)
| # | Case | Expected | Coverage |
|---|---|---|---|
| T1 | New + old slab tables render (11 rows total) | correct slabs incl. 30% | ✅ journeys, ui_test |
| T2 | Surcharge + deductions sections render | static content | ✅ ui_test |
| T3 | "How each investment is taxed" badges (bucket colours) | per-bucket | 👤 visual |

## 5. Salary calculator
| # | Case | Expected | Coverage |
|---|---|---|---|
| S1 | Default CTC → in-hand (new & old) compare | 2 regime cards + winner | ✅ features |
| S2 | All fields editable + prefilled (EPF/HRA/gratuity/NPS/PT/80C/80D/home-loan) | reflected in result | ✅ features |
| S3 | **Validation**: each money/% field clamps to min/max on blur | no out-of-range | ✅ qa_break (lumpAmt class) · ⚠️ extend per-field |
| S4 | **Stress**: CTC 0 / 1 / 100Cr, rent>CTC, all-zero | no NaN; monotonic in-hand | ✅ qa_break (salary bounds/monotonicity) |
| S5 | Senior age lowers old-regime tax | more in-hand | ✅ features |
| S6 | 80C auto-includes EPF (old regime) | capped ₹1.5L | ✅ features |
| S7 | Commas in CTC/rent/80C etc. | rendered; math intact | ✅ features |

## 6. Credit & borrowing
| # | Case | Expected | Coverage |
|---|---|---|---|
| C1 | Credit calculator renders a result (no NaN) | months/never/₹ | ✅ ui_test |
| C2 | **Stress**: balance 0/huge, payment 0/huge, min-only | no crash; "never pays off" handled | ✅ qa_break |
| C3 | APR slider + fixed/min payment modes | result updates | 👤 + features (mode chips) |
| C4 | Balance & payment fields clamp | min/max | ✅ (clampNum) |

## 7. Goal planner
| # | Case | Expected | Coverage |
|---|---|---|---|
| GP1 | Future cost = amount·(1+infl)^yrs | exact (±1%) | ✅ features |
| GP2 | Required SIP reaches target; monotonic in target | bigger goal → bigger SIP | ✅ features |
| GP3 | Monte-Carlo prob ∈ [0,100]; 90%-SIP ≥ required SIP | sane | ✅ features |
| GP4 | Preset chips set amount + years | applied | ✅ features |
| GP5 | Mix chips → blended return/vol from products; slider locks; Custom unlocks | growth>safe | ✅ features |
| GP6 | "What's inside" lists products w/ lesson links | nav to invest | ✅ features |
| GP7 | Stress-test → simulator with SIP + mix applied | lands on results, mode=sip, ≥3 picks | ✅ features |
| GP8 | Odds-help expander toggles | explanation shown | ✅ features |
| GP9 | Goal chart labeled axes (₹ × years) | gridlines + markers | 👤 visual |
| GP10 | **Stress**: target 1cr+, years=1/40, return min/max, have≥target | no NaN; SIP=0 when funded | ⚠️ extend |

## 8. Simulator — Inflation step
| # | Case | Expected | Coverage |
|---|---|---|---|
| N1 | Chart draws (non-blank) + labeled axes | pixels + "Rupees you hold"/"Buys ₹X" | ✅ ui_test (pixels) · 👤 labels |
| N2 | Amount/rate/horizon change → erosion updates | live | ✅ (renderInflation) |
| N3 | infAmt clamps; commas | valid | ✅ |

## 9. Simulator — Setup
| # | Case | Expected | Coverage |
|---|---|---|---|
| U1 | Mode chips (once/monthly/income) switch inputs | correct amtgrp shown | ✅ features |
| U2 | Journey banner names the journey + "blank slate" note | shown w/ mode | 👤 + journeys (nav) |
| U3 | Plan-years + SIP step-up editable, clamp 1–40 / 0–50 | valid | ✅ features (step-up), clampNum |
| U4 | Entering via a journey starter clears prior picks | Choose blank | ✅ features (clean slate) |

## 10. Simulator — Choose
| # | Case | Expected | Coverage |
|---|---|---|---|
| CH1 | Toggle product → equal-split to 100% | 1→100,2→50… | ✅ features |
| CH2 | Total never exceeds 100% (drag) | capped | ✅ features |
| CH3 | Product rows show name + bucket tag (no blanks) on every entry path | named | ✅ journeys (journey→Choose names) |
| CH4 | "what is this?" explainer + **full-explanation link → lesson** | opens invest lesson | ✅ features |
| CH5 | Live panel + breakdown toggle (charges/tax/penalty/net) | splits | ✅ features |
| CH6 | "Next" walks all categories; "Show results" skips at 100% | gate = alloc only | ✅ features, journeys |
| CH7 | Results gated <100% (button + stepper + programmatic) | disabled | ✅ features, journeys, qa_break |

## 11. Simulator — Results
| # | Case | Expected | Coverage |
|---|---|---|---|
| R1 | Hero "You keep" + summary table (invested→becomes→tax→keep) | values, no NaN | ✅ journeys (no-NaN), 👤 layout |
| R2 | Growth chart draws + count-up tweens | pixels + frames | ✅ ui_test |
| R3 | Beat-inflation verdict | green/red correct | ✅ (render) |
| R4 | "Dig deeper" toggles expand (income/regime, play-with-it, breakdown) | reveal content (not stuck opacity:0) | ✅ journeys + features (income/regime toggle) |
| R5 | Income slider on results → tax updates live; slab note names slab-taxed picks | live | ✅ features |
| R6 | Regime new/old on results → tax + 80C box update | live | ✅ features (80C box) |
| R7 | Tax & early-exit penalty are **separate** flow segments + cards | distinct | ✅ (SIM-5) · 👤 visual |
| R8 | SWP story box (4 steps) + "income + pot left" caption | shown in SWP | 👤 + (render) |
| R9 | **Stress**: all 32 active, all off, exit-early, SWP runs dry, income 0–50Cr | no NaN anywhere | ✅ qa_break |
| R10 | Inflation breakdown table (factor, lost%) in Today's-₹ lens | exact math | ✅ journeys |

## 12. Tax-bucket engine (math)
| # | Case | Expected | Coverage |
|---|---|---|---|
| E1 | slab / LTCG(12.5% + ₹1.25L pooled) / exempt / mixed / crypto(30%) | correct per bucket | ✅ test_buckets |
| E2 | Surcharge capped 15% on CG; +4% cess | applied | ✅ test_buckets |
| E3 | Exit-early penalty + forfeits tax perk | applied | ✅ features, qa_break |
| E4 | Pure engine fns unit-tested (goal SIP/prob; outcome) | deterministic checks | ✅ features, buckets |

---

## Security review (summary — full audit in chat history)
- **XSS:** no untrusted string reaches `innerHTML`; all sinks are build-time data or numeric (`rupee`/`fmtIN`). `loadState` only sets form `.value` or uses values as dict keys/equality. **No vector.**
- **Dangerous APIs:** none — no `eval`/`Function`/`document.write`/string-`setTimeout`.
- **Secrets / supply chain:** none embedded; zero runtime deps; fonts inlined as data-URIs.
- **Network:** no `fetch`/XHR/cookies; CSP `default-src 'none'` + `connect-src 'none'`; `referrer: no-referrer`. Only external token is the SVG XML namespace string (not a request).
- **Transport:** HTTPS (Pages); no `target=_blank`/opener.
- **localStorage tampering:** worst case breaks the attacker's own session (clamped, NaN-guarded). Self-inflicted only.
- **Header-level limits (Pages can't set):** clickjacking (no `X-Frame-Options`) — low risk (no auth/sensitive action). Move to a header-capable host (Cloudflare/Netlify) for HSTS/X-Frame-Options if needed.

## Known gaps to close (prioritised)
3. ⚠️ Per-field clamp coverage for **all** money/% inputs (currently representative).
4. ⚠️ GP10 — Goal-planner edge stress (extreme target/years/return).
5. 👤 Cross-browser (Safari/Firefox) + real iOS/Android device pass.
6. 👤 **CA / compliance sign-off** on every tax rule (the #1 non-technical blocker).

_Build: `python3 gen.py`. Behaviour spec: `PRODUCT.md`. This plan is the QA companion — update both when behaviour changes._
