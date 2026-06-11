const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'learn-money.html'), 'utf8');
const errors = [];

function beforeParse(window) {
  window.scrollTo = () => {};
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
  window.devicePixelRatio = 1;
  const ctx = new Proxy({}, {
    get(_, prop) {
      if (prop === 'createLinearGradient') return () => ({ addColorStop(){} });
      if (prop === 'setTransform' || prop === 'canvas') return () => {};
      return (...a) => {};
    },
    set() { return true; }
  });
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  window.onerror = (msg) => errors.push('window.onerror: ' + msg);
}

const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.detail && e.detail.message || e.message)));

let dom;
try {
  dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, beforeParse, url: 'http://localhost/' });
} catch (e) { console.log('CONSTRUCT FAILED:', e.message); process.exit(1); }

const win = dom.window, doc = win.document;
const $ = s => doc.querySelector(s);
const $$ = s => [...doc.querySelectorAll(s)];
const results = [];
function check(name, fn) {
  const before = errors.length;
  try { const note = fn() || ''; const ok = errors.length === before;
    results.push([ok ? 'PASS' : 'FAIL', name, ok ? note : errors.slice(before).join(' | ')]);
  } catch (e) { results.push(['FAIL', name, 'threw: ' + e.message]); }
}
function click(el){ if(!el) throw new Error('element missing'); el.dispatchEvent(new win.Event('click',{bubbles:true})); }
function setInput(el,v){ if(!el) throw new Error('input missing'); el.value=v; el.dispatchEvent(new win.Event('input',{bubbles:true})); }
const activeSec = () => { const s=$$('.sec').find(x=>x.classList.contains('on')); return s?s.id:null; };
const num = s => parseInt(String(s).replace(/[^0-9-]/g,'')) || 0;
const visible = el => el && el.style.display !== 'none';
const bad = s => /NaN|Infinity|undefined/.test(s);

// ---- 1) Bottom "Next →" buttons (only top nav + path cards were tested before) ----
check('Bottom Next: inflation -> setup', ()=>{
  win.showSec('inflation');
  click($('#sec-inflation .nextbtn'));
  if(activeSec()!=='sec-how') throw new Error('went to '+activeSec());
  return 'ok';
});
check('Bottom Next: setup -> choose', ()=>{
  click($('#sec-how .nextbtn'));
  if(activeSec()!=='sec-choose') throw new Error('went to '+activeSec());
  return 'ok';
});
check('Show-results gated on allocation; skips walkthrough at 100%', ()=>{
  win.resetAll(); win.showSec('choose');
  const btn=$('#toResults');
  if(!btn.disabled) throw new Error('Show results enabled with 0 products');
  click($('[data-tgl="fd"]'));                 // 1 product → equal split = 100%
  if(btn.disabled) throw new Error('Show results disabled at exactly 100%');
  setInput($('[data-pct="fd"]'),'50');         // drag below 100
  if(!btn.disabled) throw new Error('enabled at 50%');
  setInput($('[data-pct="fd"]'),'100');
  // walkthrough NOT completed — "Show results" must still skip straight to results
  click(btn);
  if(activeSec()!=='sec-results') throw new Error('Show results did not skip to results at 100%: '+activeSec());
  return 'gated <100; Show results skips walkthrough at 100%';
});
check('Choose: Next steps through product types, Show results always present', ()=>{
  win.resetAll(); win.showSec('choose');
  const nb=$('#nextCat'), rb=$('#toResults');
  if(!nb||!rb) throw new Error('missing Next / Show-results buttons');
  const cats=win.S().cats.length;
  let guard=0; while($('#nextCat').style.display!=='none' && guard++<cats+2){ click($('#nextCat')); }
  if($('#nextCat').style.display!=='none') throw new Error('Next never exhausts categories');
  if(!rb.classList.contains('solid')) throw new Error('Show results not promoted after full walkthrough');
  return 'Next walks all types; Show results promoted';
});
check('Live panel breakdown toggle reveals charges/tax/penalty split', ()=>{
  win.resetAll(); win.showSec('choose');
  click($('[data-tgl="fd"]')); win.render();
  const tog=$('#liveBreakTog'), box=$('#liveBreak');
  if(!tog||!box) throw new Error('breakdown toggle missing');
  if(box.style.display!=='none') throw new Error('breakdown not collapsed by default');
  win.toggleLiveBreak();
  if(box.style.display==='none') throw new Error('breakdown did not open');
  const txt=box.textContent;
  ['invested','Charges','Tax','keep'].forEach(t=>{ if(!new RegExp(t,'i').test(txt)) throw new Error('breakdown missing: '+t); });
  return 'breakdown splits invested/charges/tax/net';
});
check('Selecting products splits 100% equally; draggable to 0', ()=>{
  win.resetAll(); win.showSec('choose');
  click($('[data-tgl="index"]'));
  if($('[data-pcv="index"]').textContent!=='100%') throw new Error('1 sel ≠100%');
  click($('[data-tgl="stocks"]'));
  if($('[data-pcv="index"]').textContent!=='50%'||$('[data-pcv="stocks"]').textContent!=='50%') throw new Error('2 sel ≠50/50');
  setInput($('[data-pct="index"]'),'0');       // can drag a selected one to 0
  if(!$('[data-tgl="index"]').classList.contains('on')) throw new Error('0% deactivated it');
  return 'equal split + 0% allowed';
});

// ---- 2) Allocation != 100% surfaces a visible warning; == 100% hides it ----
check('Alloc != 100% shows warning', ()=>{
  win.resetAll(); win.showSec('choose');
  const fd=$('[data-tgl="fd"]'); if(!fd.classList.contains('on')) click(fd); // blank slate → activate
  setInput($('[data-pct="fd"]'),'55');
  win.showSec('results');
  const w=$('#allocWarn');
  if(!visible(w)) throw new Error('warning hidden at total='+$('#totalPct').textContent);
  if(!/%/.test(w.innerHTML)) throw new Error('no pct in warning');
  return $('#totalPct').textContent+' -> warned';
});
check('Alloc == 100% hides warning', ()=>{
  setInput($('[data-pct="fd"]'),'100'); // single product → exactly 100
  win.showSec('results');
  if(visible($('#allocWarn'))) throw new Error('warning still shown at '+$('#totalPct').textContent);
  return '100% -> clean';
});

// ---- 3) 80C deduction box computes the right rupee saving (old regime) ----
check('80C box hidden under NEW regime', ()=>{
  click($('#regChips [data-r="new"]'));
  win.showSec('results');
  if(visible($('#dedBox'))) throw new Error('dedBox shown in new regime');
  return 'hidden';
});
check('80C box computes correct ₹ saving (old regime)', ()=>{
  // blank slate → activate PPF 10% of ₹5,00,000 = ₹50,000; min(50k,1.5L)=50k; old marginal @15L = 30% → ₹15,000
  win.resetAll(); win.showSec('choose');
  const ppf=$('[data-tgl="ppf"]'); if(!ppf.classList.contains('on')) click(ppf); setInput($('[data-pct="ppf"]'),'10');
  setInput($('#lumpAmt'),'500000');
  click($('#regChips [data-r="old"]'));
  win.showSec('results');
  const box=$('#dedBox');
  if(!visible(box)) throw new Error('dedBox hidden in old regime');
  if(bad(box.innerHTML)) throw new Error('NaN in dedBox');
  const m=box.innerHTML.match(/<b>₹([\d,]+)<\/b>/); // the bolded saving, not the "₹1.5L cap" text
  if(!m) throw new Error('no bolded ₹ saving in dedBox');
  const v=num(m[1]);
  if(v!==15000) throw new Error('expected ₹15,000, got ₹'+v.toLocaleString('en-IN'));
  return '₹'+v.toLocaleString('en-IN');
});
click($('#regChips [data-r="new"]')); // restore

// ---- 4) SWP corpus runs dry -> user-facing message; healthy SWP -> no message ----
check('SWP dry corpus shows "ran out" message', ()=>{
  win.resetAll(); win.showSec('choose');
  const fd=$('[data-tgl="fd"]'); if(!fd.classList.contains('on')) click(fd); setInput($('[data-pct="fd"]'),'100');
  click($('#modeChips [data-m="swp"]'));
  setInput($('#swpCorpus'),'100000');   // tiny corpus
  setInput($('#swpWd'),'50000');        // huge monthly draw
  win.showSec('results');
  const b=$('#swpDryBox');
  if(!visible(b)) throw new Error('dry box hidden');
  if(!/\d/.test(b.innerHTML)) throw new Error('no count in dry msg');
  return 'warned';
});
check('SWP healthy corpus -> no dry message', ()=>{
  setInput($('#swpCorpus'),'5000000');  // big corpus
  setInput($('#swpWd'),'2000');         // tiny draw
  win.showSec('results');
  if(visible($('#swpDryBox'))) throw new Error('dry box shown for healthy SWP');
  return 'clean';
});
click($('#modeChips [data-m="lumpsum"]')); // restore

// ---- 5) Bad / boundary input never yields NaN/Infinity ----
function headlineClean(){
  const n=[$('#num1'),$('#num2'),$('#num3')].map(e=>e.textContent);
  const cells=$$('#pcards .v').map(v=>v.textContent);
  const offenders=[...n,...cells].filter(bad);
  return offenders;
}
check('Blank lump amount -> no NaN', ()=>{
  setInput($('#lumpAmt'),'');
  win.showSec('results');
  const o=headlineClean(); if(o.length) throw new Error(o.join(','));
  return 'clean';
});
check('Negative lump amount -> no NaN', ()=>{
  setInput($('#lumpAmt'),'-5000');
  win.showSec('results');
  const o=headlineClean(); if(o.length) throw new Error(o.join(','));
  return 'clean';
});
check('Zero / blank years (global) -> no NaN', ()=>{
  win.showSec('how');
  setInput($('#planYears'),'0'); win.showSec('results');
  const o=headlineClean(); if(o.length) throw new Error(o.join(','));
  setInput($('#planYears'),'10');
  return 'clean';
});
check('Absurdly large amount -> finite numbers', ()=>{
  win.showSec('choose');
  setInput($('#lumpAmt'),'1000000000000000');
  win.showSec('results');
  const o=headlineClean(); if(o.length) throw new Error(o.join(','));
  return 'clean';
});
setInput($('#lumpAmt'),'500000'); // restore

// ---- 6) Reset returns to the blank-slate default ----
check('Reset returns to blank slate (no products, lump mode, inputs default)', ()=>{
  // mess it up
  win.showSec('choose');
  click($('#modeChips [data-m="sip"]'));
  click($('.cattab[data-cat="advanced"]'));
  const cr=$('[data-tgl="crypto"]'); if(!cr.classList.contains('on')) click(cr);
  setInput($('[data-pct="crypto"]'),'40');
  setInput($('#sipAmt'),'99999');
  // reset
  win.resetAll();
  if($$('#plist .tgl.on').length!==0) throw new Error('products still active after reset');
  if(!$('#modeChips [data-m="lumpsum"]').classList.contains('on')) throw new Error('mode not reset to lumpsum');
  if(num($('#sipAmt').value)!==10000) throw new Error('sip amount not reset: '+$('#sipAmt').value);
  win.showSec('results');
  if($('#totalPct').textContent!=='0%') throw new Error('total not 0 after reset: '+$('#totalPct').textContent);
  return 'blank slate restored';
});

// ---- 7) Starter presets apply allocation + mode and land on Choose ----
check('Preset row renders 3 presets on home', ()=>{
  const n=$$('#presetrow .preset').length; if(n!==3) throw new Error('presets='+n); return n+' presets';
});
check('Preset "Safe & steady" applies mix + lump mode', ()=>{
  win.applyPreset('safe');
  if(activeSec()!=='sec-choose') throw new Error('not on choose: '+activeSec());
  const on = id => $(`[data-tgl="${id}"]`).classList.contains('on');
  if(!(on('fd')&&on('ppf')&&on('gsec')&&on('index'))) throw new Error('safe mix not active');
  if(on('crypto')) throw new Error('crypto leaked into safe preset');
  if(!$('#modeChips [data-m="lumpsum"]').classList.contains('on')) throw new Error('mode not lumpsum');
  win.showSec('results');
  if($('#totalPct').textContent!=='100%') throw new Error('safe preset total != 100: '+$('#totalPct').textContent);
  if(bad($('#num1').textContent)) throw new Error('NaN headline');
  return '100% / lump';
});
check('Preset "Young & aggressive" applies SIP mode + equity-heavy mix', ()=>{
  win.applyPreset('aggressive');
  if(!$('#modeChips [data-m="sip"]').classList.contains('on')) throw new Error('mode not sip');
  const on = id => $(`[data-tgl="${id}"]`).classList.contains('on');
  if(!(on('index')&&on('stocks')&&on('crypto'))) throw new Error('aggressive mix not active');
  win.showSec('results');
  if(bad($('#num1').textContent)) throw new Error('NaN headline');
  return 'sip / equity-heavy';
});

// ---- 8) Switching mode after selecting products stays sane ----
check('Switch mode after picks -> no NaN, total preserved', ()=>{
  win.resetAll();
  win.showSec('choose');
  const before=$('#totalPct') && (win.showSec('results'),$('#totalPct').textContent);
  win.showSec('choose');
  click($('#modeChips [data-m="sip"]'));
  click($('#modeChips [data-m="swp"]'));
  click($('#modeChips [data-m="lumpsum"]'));
  win.showSec('results');
  if(bad($('#num1').textContent)) throw new Error('NaN after mode flips');
  if($('#totalPct').textContent!==before) throw new Error('total changed: '+before+' -> '+$('#totalPct').textContent);
  return 'stable @ '+$('#totalPct').textContent;
});

// ---- 9) Tax-correctness fixes ----
const taxOf = label => { let v=0; $$('#pcards .pcard').forEach(c=>{ if(c.querySelector('.top').textContent.includes(label)) v=num([...c.querySelectorAll('.v')][2].textContent); }); return v; };
const chgOf = label => { let v=0; $$('#pcards .pcard').forEach(c=>{ if(c.querySelector('.top').textContent.includes(label)) v=num([...c.querySelectorAll('.v')][1].textContent); }); return v; };
function deactivateDefaults(){ ['fd','index','ppf','gold_etf'].forEach(id=>{const t=$(`[data-tgl="${id}"]`); if(t.classList.contains('on')) click(t);}); }

check('LTCG ₹1.25L exemption is POOLED across equity (not per-fund)', ()=>{
  win.resetAll(); win.showSec('choose'); deactivateDefaults();
  click($('.cattab[data-cat="equity"]'));
  setInput($('#lumpAmt'),'1000000');
  // CASE 1: a single equity fund at 100%, 10yr @12%
  const idx=$('[data-tgl="index"]'); if(!idx.classList.contains('on')) click(idx);
  setInput($('[data-pct="index"]'),'100'); setInput($('[data-rt="index"]'),'12');
  win.showSec('results');
  const T1=taxOf('Index');
  // CASE 2: same money, same return, split 50/50 across two equity funds
  win.showSec('choose');
  setInput($('[data-pct="index"]'),'50');
  const eq=$('[data-tgl="equity_mf"]'); if(!eq.classList.contains('on')) click(eq);
  setInput($('[data-pct="equity_mf"]'),'50'); setInput($('[data-rt="equity_mf"]'),'12');
  win.showSec('results');
  const T2=taxOf('Index')+taxOf('Equity mutual fund');
  if(!(T1>0&&T2>0)) throw new Error('zero tax T1='+T1+' T2='+T2);
  // Same total gain -> same single ₹1.25L exemption -> total equity tax ~equal.
  // Per-fund bug would give CASE 2 a second exemption => T2 materially < T1.
  if(T2 < T1*0.98) throw new Error('splitting funds conjured a 2nd exemption: T1='+T1+' T2='+T2);
  return `single ₹${T1.toLocaleString('en-IN')} ≈ split ₹${T2.toLocaleString('en-IN')}`;
});

check('SIP charges accrue on balance, not principal×years (fee fix)', ()=>{
  win.resetAll(); win.showSec('choose'); deactivateDefaults();
  click($('#modeChips [data-m="sip"]'));
  setInput($('#sipAmt'),'10000'); setInput($('#sipStepup'),'0');  // isolate the fee model (no step-up)
  click($('.cattab[data-cat="equity"]'));
  const eq=$('[data-tgl="equity_mf"]'); if(!eq.classList.contains('on')) click(eq); // charge 1.5%
  setInput($('[data-pct="equity_mf"]'),'100'); setInput($('[data-rt="equity_mf"]'),'12');
  win.showSec('results');
  const chg=chgOf('Equity mutual fund');
  const naive=10000*120*0.015*10; // old model: invested * charge * years = ₹1,80,000
  if(!(chg>0)) throw new Error('zero charges');
  if(!(chg < naive)) throw new Error('SIP still overcharged: ₹'+chg+' vs naive ₹'+naive);
  return `₹${chg.toLocaleString('en-IN')} (was overcharging ₹${naive.toLocaleString('en-IN')})`;
});
win.resetAll();

// ---- 10) Exit-early lens (Results) + live Choose panel ----
function activate(id,pct){ win.showSec('choose'); const t=$(`[data-tgl="${id}"]`); if(!t.classList.contains('on')) click(t); setInput($(`[data-pct="${id}"]`),String(pct)); }
check('Exit-early lens lowers net + shows the penalty', ()=>{
  win.resetAll(); activate('fd',100); win.showSec('results');
  const keepBefore=num($('#num1').textContent);
  click($('#exitChips [data-exit="1"]'));                 // global "exit early" lens
  const keepAfter=num($('#num1').textContent);
  if(!(keepAfter<keepBefore)) throw new Error('exit-early did not reduce net: '+keepBefore+'→'+keepAfter);
  const cards=$$('#pcards .pcard').map(c=>c.textContent).join(' ');
  if(!/Early-exit penalty/.test(cards)) throw new Error('penalty not shown on product card');
  click($('#exitChips [data-exit="0"]')); // restore
  return 'net '+keepBefore+'→'+keepAfter+', penalty shown';
});
check('Exit-early forfeits a tax-free product\'s perk (PPF taxed)', ()=>{
  win.resetAll(); activate('ppf',100); win.showSec('results'); click($('#exitChips [data-exit="1"]'));
  const ppfCard=$$('#pcards .pcard').find(c=>/PPF/.test(c.querySelector('.top').textContent));
  if(!ppfCard) throw new Error('no PPF card');
  const vs=[...ppfCard.querySelectorAll('.v')];        // …, penalty, tax, net (net is last)
  const tax=num(vs[vs.length-2].textContent);
  if(!(tax>0)) throw new Error('exited PPF still tax-free (expected slab tax)');
  click($('#exitChips [data-exit="0"]'));
  return 'exited PPF taxed ₹'+tax.toLocaleString('en-IN');
});
check('Exit-early shows the cost calculation below the toggle', ()=>{
  win.resetAll(); activate('fd',100); win.showSec('results');
  click($('#exitChips [data-exit="1"]'));
  const ec=$('#exitCalc'); if(ec.style.display==='none') throw new Error('calc hidden when exiting');
  if(!/exiting early costs/i.test(ec.innerHTML)) throw new Error('no calc heading');
  if(!/held to term/i.test(ec.innerHTML)) throw new Error('no hold-vs-exit comparison');
  click($('#exitChips [data-exit="0"]')); if($('#exitCalc').style.display!=='none') throw new Error('calc shown while holding');
  return 'exit cost breakdown shown';
});
check('Live result panel on Choose updates (no NaN)', ()=>{
  win.resetAll(); win.showSec('choose');
  const k=$('#liveKeep').textContent, l=$('#liveLost').textContent;
  if(/NaN|undefined/.test(k+l)) throw new Error('NaN in live panel');
  if(!/₹/.test(k)) throw new Error('live "keep" empty');
  if(!$('#liveVerdict').innerHTML.trim()) throw new Error('no live verdict');
  return 'keep '+k+' / lost '+l;
});

// ---- 11) Input hardening + penalty labeling ----
check('Number inputs clamp out-of-range on blur', ()=>{
  win.resetAll(); win.showSec('how');
  const el=$('#lumpAmt'); el.value='-5000'; el.dispatchEvent(new win.Event('blur',{bubbles:true}));
  if(+el.value < 1000) throw new Error('negative not clamped to min: '+el.value);
  el.value='99999999999'; el.dispatchEvent(new win.Event('blur',{bubbles:true}));
  if(+el.value > 1000000000) throw new Error('huge not clamped to max: '+el.value);
  setInput($('#lumpAmt'),'500000');
  return 'clamped low+high';
});
check('"Lost" caption + flow legend mention penalties', ()=>{
  win.resetAll(); win.showSec('results');
  if(!/penalt/i.test($('#cap2').textContent)) throw new Error('cap2 missing penalties: '+$('#cap2').textContent);
  return $('#cap2').textContent;
});

// ---- 12) Money-in-words + inflation years toggle ----
check('Money inputs show a readable words helper (₹ + lakh)', ()=>{
  win.resetAll(); win.showSec('how'); setInput($('#lumpAmt'),'500000');
  const t=$('[data-amt-for="lumpAmt"]').textContent;
  if(!/5,00,000/.test(t)||!/lakh/i.test(t)) throw new Error('no words helper: "'+t+'"');
  return t;
});
check('Inflation years toggle changes the today-money value', ()=>{
  win.resetAll(); activate('index',100); win.showSec('results');
  click($('#adjChips [data-adj="1"]'));         // today's-money view
  const vAuto=$('#num1').textContent;
  click($('#adjYrsChips [data-iy="30"]'));
  if($('#num1').textContent===vAuto) throw new Error('30y did not change value');
  if(!/30 year/.test($('#adjBox').innerHTML)) throw new Error('adjBox not showing 30 years');
  click($('#adjYrsChips [data-iy="0"]'));
  return '30y differs from auto';
});

// ---- 13) Persistence (localStorage) + clean reset ----
check('State saves to localStorage; reset wipes it', ()=>{
  win.resetAll(); win.showSec('choose');
  const fd=$('[data-tgl="fd"]'); if(!fd.classList.contains('on')) click(fd);   // build something
  const saved=win.localStorage.getItem('lm_state');
  if(!saved) throw new Error('nothing persisted');
  const o=JSON.parse(saved); if(!o.ps.fd.active) throw new Error('fd not in saved state');
  win.resetAll();
  const o2=JSON.parse(win.localStorage.getItem('lm_state')||'{"ps":{}}');
  if(o2.ps.fd && o2.ps.fd.active) throw new Error('reset did not clear saved portfolio');
  return 'saved, then reset-wiped';
});
check('loadState restores saved settings (regime); stale kid flag ignored', ()=>{
  win.localStorage.setItem('lm_state', JSON.stringify({ps:{},mode:'lumpsum',regime:'old',kid:true,exit:false,adj:false,adjYrs:0,infH:10}));
  win.loadState();
  if(!$('#regChips [data-r="old"]').classList.contains('on')) throw new Error('regime not restored');
  if(doc.body.classList.contains('kid')) throw new Error('stale kid flag applied a removed mode');
  win.resetAll();   // cleanup
  return 'regime restored; old kid flag harmless';
});

// ---- 14) First-time coachmark ----
check('Coachmark shows for first-timer, dismiss hides + remembers', ()=>{
  win.localStorage.removeItem('lm_seen'); win.showCoachIfFirst();
  const c=$('#coach'); if(c.style.display==='none') throw new Error('coach not shown for first-timer');
  if(!/Welcome/i.test(c.textContent)) throw new Error('coach content missing');
  win.dismissCoach();
  if(c.style.display!=='none') throw new Error('coach not hidden on dismiss');
  if(win.localStorage.getItem('lm_seen')!=='1') throw new Error('seen flag not set');
  win.showCoachIfFirst(); if(c.style.display!=='none') throw new Error('coach shown again after seen');
  return 'shown once, remembered';
});

// ---- 15) Salary calculator ----
check('Salary calc: prefilled, shows monthly in-hand (no NaN)', ()=>{
  win.showSec('takehome');
  const net=$('#thNet').textContent, yr=$('#thNetYr').textContent;
  if(/NaN|undefined/.test(net+yr)) throw new Error('NaN in salary output');
  if(!/₹/.test(net) || num(net)<=0) throw new Error('no in-hand value: '+net);
  return net+'/mo';
});
check('Salary calc: EPF / HRA / PT are editable numbers', ()=>{
  win.showSec('takehome');
  ['thEpfRate','thHraPct','thPt'].forEach(id=>{ if($('#'+id).tagName!=='INPUT') throw new Error(id+' not an input'); });
  const before=num($('#thNetYr').textContent);
  setInput($('#thEpfRate'),'0');                 // drop EPF → more in-hand
  if(!(num($('#thNetYr').textContent)>before)) throw new Error('EPF=0 did not raise in-hand');
  setInput($('#thEpfRate'),'12');
  return 'EPF/HRA/PT editable';
});
check('Salary calc: senior age lowers old-regime tax (more in-hand)', ()=>{
  win.showSec('takehome'); click($('#thRegChips [data-thr="old"]')); setInput($('#thCtc'),'2000000');
  click($('#thAgeChips [data-age="lt60"]')); const a=num($('#thNetYr').textContent);
  click($('#thAgeChips [data-age="80"]')); const b=num($('#thNetYr').textContent);
  if(!(b>=a)) throw new Error('senior slab did not raise in-hand: '+a+'→'+b);
  click($('#thAgeChips [data-age="lt60"]')); click($('#thRegChips [data-thr="compare"]')); setInput($('#thCtc'),'1200000');
  return 'senior slab applied';
});
check('Salary calc: gratuity + employer-NPS appear as CTC (exempt)', ()=>{
  win.showSec('takehome'); setInput($('#thEmpNps'),'10');
  const t=$('#thBreak').textContent;
  if(!/Gratuity/.test(t)) throw new Error('no gratuity row'); if(!/Employer NPS/.test(t)) throw new Error('no employer NPS row');
  setInput($('#thEmpNps'),'0');
  return 'gratuity + employer NPS shown';
});
check('Salary calc: old-regime 80C auto-includes your EPF', ()=>{
  win.showSec('takehome'); click($('#thRegChips [data-thr="old"]'));
  if(!/80C used \(incl your EPF\)/i.test($('#thBreak').textContent)) throw new Error('80C+EPF note missing');
  click($('#thRegChips [data-thr="compare"]'));
  return 'EPF in 80C';
});
check('Salary calc: breakdown shows components incl HRA', ()=>{
  win.showSec('takehome'); click($('#thRegChips [data-thr="old"]'));
  const t=$('#thBreak').textContent;
  ['Basic','HRA','Special allowance','Gross','Income tax','In-hand'].forEach(s=>{ if(!t.includes(s)) throw new Error('breakdown missing: '+s); });
  if(!/HRA exemption/i.test(t)) throw new Error('no HRA exemption line');
  click($('#thRegChips [data-thr="compare"]'));
  return 'structure + HRA shown';
});
check('Salary calc: higher CTC → higher in-hand', ()=>{
  win.showSec('takehome');
  setInput($('#thCtc'),'1200000'); const a=num($('#thNetYr').textContent);
  setInput($('#thCtc'),'3000000'); const b=num($('#thNetYr').textContent);
  if(!(b>a)) throw new Error('in-hand did not rise with CTC: '+a+'→'+b);
  setInput($('#thCtc'),'1200000');
  return a+'→'+b;
});
check('Salary calc: compare shows both regimes + a "better" winner', ()=>{
  win.showSec('takehome');
  click($('#thRegChips [data-thr="compare"]'));
  const cards=$$('#thCompare .pcard'); if(cards.length!==2) throw new Error('compare cards='+cards.length);
  const txt=$('#thCompare').textContent; if(!/better/i.test(txt)) throw new Error('no winner marked');
  if(!/New regime/.test(txt)||!/Old regime/.test(txt)) throw new Error('missing a regime card');
  return 'old vs new compared';
});
check('Salary calc: low income pays ~zero tax (87A)', ()=>{
  win.showSec('takehome'); click($('#thRegChips [data-thr="new"]'));
  setInput($('#thCtc'),'900000');   // gross under ₹12L taxable → 87A → ~0 tax
  if(!/Income tax[\s−-]*₹0\b/i.test($('#thBreak').textContent)) throw new Error('expected ₹0 tax: '+$('#thBreak').textContent.slice(0,120));
  setInput($('#thCtc'),'1200000'); click($('#thRegChips [data-thr="compare"]'));
  return '87A zero-tax ok';
});

// ---- 15b) Global reset returns home + re-shows welcome ----
check('Reset (global, header) → Home + fresh welcome', ()=>{
  if(!$('#resetBtn')) throw new Error('no header reset button');
  win.showSec('credit'); try{win.localStorage.setItem('lm_seen','1');}catch(e){}
  win.resetAll();
  if(activeSec()!=='sec-home') throw new Error('reset did not return home: '+activeSec());
  if($('#coach').style.display==='none') throw new Error('welcome not re-shown after reset');
  if(win.localStorage.getItem('lm_seen')) throw new Error('seen flag not cleared');
  win.dismissCoach();
  return 'home + welcome';
});

// ---- 16) Guided tour ----
check('Guided tour: start → spotlight steps → done sets seen', ()=>{
  win.localStorage.removeItem('lm_seen');
  win.startTour();
  const tip=$('#tourtip'); if(tip.style.display==='none') throw new Error('tour tooltip not shown');
  if(!$('.tour-spot')) throw new Error('no spotlighted element');
  if(!/1\/4/.test(tip.textContent)) throw new Error('step counter missing');
  win.nextTour(); win.nextTour(); win.nextTour();   // advance to last + done
  win.endTour();
  if($('.tour-spot')) throw new Error('spotlight not cleared on end');
  if($('#tourtip').style.display!=='none') throw new Error('tooltip not hidden on end');
  if(win.localStorage.getItem('lm_seen')!=='1') throw new Error('tour end did not set seen');
  return 'tour runs + remembered';
});

// ---- 17) Global horizon + SIP step-up ----
check('Global "Invest for N years" drives the horizon', ()=>{
  win.resetAll(); win.showSec('choose'); const idx=$('[data-tgl="index"]'); if(!idx.classList.contains('on'))click(idx); setInput($('[data-pct="index"]'),'100');
  win.showSec('how'); setInput($('#planYears'),'5'); win.showSec('results'); const v5=num($('#num1').textContent);
  win.showSec('how'); setInput($('#planYears'),'20'); win.showSec('results'); const v20=num($('#num1').textContent);
  if(!(v20>v5)) throw new Error('longer horizon not larger: '+v5+'→'+v20);
  win.showSec('how'); setInput($('#planYears'),'10');
  return v5+'→'+v20;
});
check('SIP step-up raises total invested', ()=>{
  win.resetAll(); win.showSec('how'); click($('#modeChips [data-m="sip"]')); setInput($('#planYears'),'10');
  win.showSec('choose'); const idx=$('[data-tgl="index"]'); if(!idx.classList.contains('on'))click(idx); setInput($('[data-pct="index"]'),'100');
  win.showSec('how'); setInput($('#sipStepup'),'0'); win.showSec('results'); const inv0=num($('#num3').textContent);
  win.showSec('how'); setInput($('#sipStepup'),'10'); win.showSec('results'); const inv10=num($('#num3').textContent);
  if(!(inv10>inv0)) throw new Error('step-up did not raise invested: '+inv0+'→'+inv10);
  return inv0+'→'+inv10;
});

check('Goals: future cost = today₹ × (1+infl)^yrs (renders)', ()=>{
  win.showSec('goals');
  setInput($('#goalAmt'),'1000000'); setInput($('#goalYears'),'10');
  $('#goalInfl').value='6'; $('#goalInfl').dispatchEvent(new win.Event('input',{bubbles:true}));
  const fut=num($('#goalFuture').textContent);
  const exp=Math.round(1000000*Math.pow(1.06,10));            // ≈ 17,90,847
  if(Math.abs(fut-exp)>exp*0.01) throw new Error('future cost off: got '+fut+' exp '+exp);
  return '₹10L→'+fut+' in 10y';
});
check('Goals: required SIP grows it to the target (deterministic check)', ()=>{
  const target=win.gFinal? null:null;
  const sip=win.gRequiredSIP(5000000,0.11,15,0,0);
  if(!(sip>0)) throw new Error('required SIP not positive');
  const end=win.gFinal(sip,0.11,15,0,0);
  if(Math.abs(end-5000000)>5000000*0.01) throw new Error('SIP does not reach target: '+Math.round(end));
  // monotonic: bigger target → bigger SIP
  if(!(win.gRequiredSIP(10000000,0.11,15,0,0) > sip)) throw new Error('SIP not monotonic in target');
  return 'reqSIP ₹'+Math.round(sip)+'/mo';
});
check('Goals: Monte-Carlo prob in [0,100]; 90% SIP ≥ required SIP', ()=>{
  const ret=0.11,vol=win.volForReturn(0.11),yrs=15,fut=win.gFinal? 5000000:5000000;
  const req=win.gRequiredSIP(fut,ret,yrs,0,0);
  const p=win.gProb(req,ret,vol,yrs,0,0,fut,500);
  if(!(p>=0&&p<=1)) throw new Error('prob out of range: '+p);
  const sip90=win.gSipForConfidence(fut,ret,vol,yrs,0,0,0.9,req);
  if(!(sip90>=req)) throw new Error('90% SIP < required SIP');
  return 'p≈'+Math.round(p*100)+'%, sip90≥req';
});
check('Goals: preset chip sets amount + years', ()=>{
  win.showSec('goals'); click($('#goalPreset [data-gp="home"]'));
  if(num($('#goalAmt').value)!==5000000 || +$('#goalYears').value!==7) throw new Error('home preset not applied');
  return 'home → ₹50L / 7y';
});
check('Money fields show live thousand-commas + reads stay numeric', ()=>{
  win.resetAll(); win.showSec('how'); click($('#modeChips [data-m="lumpsum"]'));
  const el=$('#lumpAmt'); if(!el.classList.contains('money')) throw new Error('lumpAmt not a money field');
  setInput(el,'2500000');                         // dispatch input → live formatter
  if(el.value!=='25,00,000') throw new Error('no Indian commas: '+el.value);
  // and the computed engine still reads it as a number (no NaN)
  win.showSec('choose'); const idx=$('[data-tgl="index"]'); if(!idx.classList.contains('on'))click(idx); setInput($('[data-pct="index"]'),'100');
  win.showSec('results'); if(/NaN/.test($('#num1').textContent)) throw new Error('comma broke the math');
  return 'lumpAmt → 25,00,000; math intact';
});
check('Goals: product mixes drive blended return + slider lock', ()=>{
  win.showSec('goals');
  click($('#goalMixChips [data-gm="safe"]'));
  if(!$('#goalRet').disabled) throw new Error('slider not locked under a mix');
  const safeRet=+$('#goalRet').value;
  click($('#goalMixChips [data-gm="growth"]'));
  const growthRet=+$('#goalRet').value;
  if(!(growthRet>safeRet)) throw new Error('growth blend not higher than safe: '+safeRet+' vs '+growthRet);
  click($('#goalMixChips [data-gm="custom"]'));
  if($('#goalRet').disabled) throw new Error('custom did not unlock slider');
  click($('#goalMixChips [data-gm="balanced"]'));
  return `safe ${safeRet}% < growth ${growthRet}%; custom unlocks`;
});
check('Goals: what\'s-inside expander lists products w/ lesson links', ()=>{
  win.showSec('goals'); click($('#goalMixChips [data-gm="balanced"]'));
  win.toggleGoalMix(); const box=$('#goalMixBox');
  if(box.style.display==='none') throw new Error('mix box did not open');
  ['Index','PPF'].forEach(t=>{ if(!new RegExp(t,'i').test(box.textContent)) throw new Error('mix missing product: '+t); });
  win.openLesson('ppf');
  if(activeSec()!=='sec-invest') throw new Error('lesson link did not navigate');
  win.toggleGoalMix();
  return 'mix lists products; links open lessons';
});
check('Goals: stress-test bridges plan into the simulator', ()=>{
  win.resetAll(); win.showSec('goals'); win.renderGoals();
  const sip=num($('#goalSip').textContent);
  win.stressTestGoal();
  if(activeSec()!=='sec-results') throw new Error('did not land on results: '+activeSec());
  const modeOn=$('#modeChips .chip.on'); if(!modeOn||modeOn.dataset.m!=='sip') throw new Error('mode not sip: '+(modeOn&&modeOn.dataset.m));
  const sa=num($('#sipAmt').value);
  if(Math.abs(sa-sip)>1) throw new Error('sipAmt '+sa+' != goal SIP '+sip);
  const active=$$('[data-tgl].on').length;
  if(active<3) throw new Error('mix products not applied: '+active);
  if(/NaN/.test($('#num1').textContent)) throw new Error('NaN in stress-test results');
  win.resetAll();
  return 'sip '+sa+'/mo across '+active+' products';
});
check('Goals: odds-help expander toggles', ()=>{
  win.showSec('goals'); const box=$('#oddsHelp'); if(!box) throw new Error('no odds-help box');
  if(box.style.display!=='none') throw new Error('expander not collapsed by default');
  win.toggleOddsHelp(); if(box.style.display==='none') throw new Error('did not open');
  if(!/1,200|imaginary|chance/i.test(box.textContent)) throw new Error('explanation missing');
  return 'odds expander works';
});


// ---- report ----
const pass=results.filter(r=>r[0]==='PASS').length, fail=results.length-pass;
console.log('\n================ FEATURE / GAP TEST RESULTS ================');
for(const [s,n,note] of results) console.log((s==='PASS'?'✅':'❌')+' '+n+(note?'  —  '+note:''));
console.log('-----------------------------------------------------------');
console.log(`TOTAL: ${pass} passed, ${fail} failed`);
if(errors.length) { console.log('\nCaptured runtime errors:'); errors.forEach(e=>console.log('  • '+e)); }
process.exit(fail?1:0);
