const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

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

const vc = new (require('jsdom').VirtualConsole)();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.detail && e.detail.message || e.message)));

let dom;
try {
  dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, beforeParse });
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

// ===== Shell / IA =====
check('Initial load (no errors at startup)', () => 'startup clean');
check('Home is default section', () => { if(activeSec()!=='sec-home') throw new Error('active='+activeSec()); return 'home shown'; });
check('Home renders 4 reading pillars + a distinct simulator card', () => {
  const n=$$('#pillargrid .pathcard').length; if(n!==4) throw new Error('reading pillars='+n);
  if(!$('#simcard .simcta')) throw new Error('no unique simulator card');
  return '4 pillars + sim CTA';
});

// each reading pillar routes to its section
const pillarSec = ['sec-invest','sec-tax','sec-takehome','sec-credit'];
$$('#pillargrid .pathcard').forEach((card,i)=>{
  check('Pillar card '+(i+1)+' navigates', ()=>{ click(card); const a=activeSec(); if(a!==pillarSec[i]) throw new Error('went to '+a+', expected '+pillarSec[i]); return '-> '+a; });
});
check('Simulator card has a clear "Start" button + navigates', ()=>{ win.showSec('home'); if(!$('#simcard .sim-cta-btn')) throw new Error('no visible Start button on sim card'); click($('#simcard .simcta')); if(activeSec()!=='sec-tryit') throw new Error('went to '+activeSec()); return '-> tryit'; });

// secnav removed — section nav is now via home pillar cards (above) + brand→home + back bar
check('No section-nav top bar (removed by design)', ()=>{
  if($('.secnav')) throw new Error('secnav still present');
  return 'no secnav';
});

// history-aware back: returns to the PREVIOUS section, not just home
check('Back returns to PREVIOUS section (history stack)', ()=>{
  win.showSec('home'); win.showSec('invest'); win.showSec('tax');
  if(activeSec()!=='sec-tax') throw new Error('setup: not on tax');
  if($('#backbar').style.display==='none') throw new Error('back bar hidden on a section');
  click($('#backbar .backbtn')); if(activeSec()!=='sec-invest') throw new Error('back#1 expected invest, got '+activeSec());
  click($('#backbar .backbtn')); if(activeSec()!=='sec-home') throw new Error('back#2 expected home, got '+activeSec());
  if($('#backbar').style.display!=='none') throw new Error('back bar still shown on home');
  return 'tax → invest → home';
});

check('No ads and no courtesy mention (fully removed)', ()=>{
  if($('#adBar')||$('#adLeft')||$('#adRight')) throw new Error('ad slots not removed');
  if($('.courtesy')) throw new Error('courtesy mention not removed');
  if(/courtesy of slice/i.test(doc.body.textContent)) throw new Error('courtesy text still present');
  return 'no ads, no courtesy';
});

// ===== Investing library =====
check('Library renders all 32 lessons', ()=>{ win.showSec('invest'); const n=$$('#invlist .lrow').length; if(n!==32) throw new Error('rows='+n); return n+' lessons'; });
check('Library has 6 category headers + All-plus-6 tabs', ()=>{
  const heads=$$('#invlist .invcat').length, tabs=$$('#invtabs .cattab').length;
  if(heads!==6) throw new Error('headers='+heads); if(tabs!==7) throw new Error('tabs='+tabs); return heads+' headers / '+tabs+' tabs';
});
check('Library category filter shows only that category', ()=>{
  const eqTab=$('#invtabs [data-lcat="equity"]'); click(eqTab);
  const vis=$$('#invlist .lrow').filter(r=>r.style.display!=='none');
  if(!vis.length) throw new Error('0 visible'); if(vis.some(r=>r.dataset.lcatrow!=='equity')) throw new Error('foreign rows');
  click($('#invtabs [data-lcat="all"]')); // restore
  return vis.length+' equity lessons';
});
check('Library lesson expands to show behaviour + example', ()=>{
  const row=$('#invlist [data-lrow="crypto"]'); click($('[data-lhead="crypto"]'));
  if(!row.classList.contains('open')) throw new Error('did not open');
  const beh=row.querySelector('[data-lbehav]'); if(!beh || !beh.textContent.trim()) throw new Error('no behaviour');
  if(!/30/.test(row.textContent)) throw new Error('example missing');
  return 'behaviour + example shown';
});

check('Equity lessons are deep (multi-section + pros/cons)', ()=>{
  win.showSec('invest'); const row=$('[data-lrow="index"]');
  if(row.dataset.deep!=='1') throw new Error('index lesson not deep');
  click($('[data-lhead="index"]'));
  const txt=row.textContent;
  ['What it is','How it works','Risks','Taxation','Who it','Pros','Cons'].forEach(s=>{ if(!txt.includes(s)) throw new Error('missing section: '+s); });
  if(row.querySelectorAll('.proscons li').length<6) throw new Error('too few pros/cons items');
  return row.querySelectorAll('.lsec').length+' sections + pros/cons';
});

check('Kid mode: toggles, keeps food + example, marks grown-up sections hidden', ()=>{
  win.showSec('invest'); click($('[data-lhead="index"]')); const row=$('[data-lrow="index"]');
  win.toggleKid();
  if(!doc.body.classList.contains('kid')) throw new Error('kid class not set');
  if(!row.querySelector('.foodie')) throw new Error('food analogy gone in kid mode');
  if(!row.querySelector('.lsec:not(.kidhide)')) throw new Error('example (kept section) missing');
  if(!row.querySelector('.kidhide')) throw new Error('no grown-up sections to hide');
  if($('#kidBtn').textContent.indexOf('ON')<0) throw new Error('toggle label not updated');
  win.toggleKid(); if(doc.body.classList.contains('kid')) throw new Error('kid not toggled off');
  return 'kid mode on/off';
});
check('Kid mode extends to Tax, Credit and Setup', ()=>{
  win.toggleKid();
  win.showSec('tax'); if(!$('#sec-tax .kidonly')) throw new Error('no kid Tax card'); if(!$('#sec-tax .card.kidhide')) throw new Error('Tax detail not hidden in kid mode');
  win.showSec('credit'); if(!$('#sec-credit .kidonly')) throw new Error('no kid Credit card'); if(!$('#sec-credit .card.kidhide')) throw new Error('Credit detail not hidden');
  win.showSec('how'); if(!$('#sec-how .kidonly')) throw new Error('no kid Setup note'); if(!$('#regBox').classList.contains('kidhide')) throw new Error('regime not hidden in kid mode');
  win.toggleKid();
  return 'kid mode spans tax/credit/setup';
});
check('Each lesson opens with a food analogy', ()=>{
  win.showSec('invest'); const row=$('[data-lrow="fd"]'); click($('[data-lhead="fd"]'));
  const f=row.querySelector('.foodie'); if(!f||!/ladoo|dabba/i.test(f.textContent)) throw new Error('no food analogy in FD lesson');
  return f.textContent.slice(0,42);
});
check('Jargon terms are tap-to-define (glossary)', ()=>{
  win.showSec('invest'); const row=$('[data-lrow="index"]');
  const g=row.querySelector('.gloss'); if(!g) throw new Error('no glossary term wrapped in lesson');
  const term=g.dataset.term; click(g);
  const def=row.querySelector('.glossdef'); if(!def||!def.textContent.trim()) throw new Error('definition not revealed on tap');
  click(g); if(row.querySelector('.glossdef')) throw new Error('definition not hidden on second tap');
  return 'tap "'+term+'" → plain definition';
});

check('Results unreachable until valid — button + stepper both gated', ()=>{
  win.resetAll(); win.showSec('choose');
  win.proceedToResults(); if(activeSec()==='sec-results') throw new Error('reached results with 0 products');
  const fd=$('[data-tgl="fd"]'); if(!fd.classList.contains('on')) click(fd); setInput($('[data-pct="fd"]'),'50');
  win.proceedToResults(); if(activeSec()==='sec-results') throw new Error('reached results at 50%');
  win.showSec('how'); const sr=$('#simsteps [data-step="results"]'); if(sr&&!sr.disabled) throw new Error('stepper Results enabled at <100%');
  win.showSec('choose'); setInput($('[data-pct="fd"]'),'100');
  win.proceedToResults();   // walkthrough optional — Show results skips straight through at 100%
  if(activeSec()!=='sec-results') throw new Error('blocked at 100% (Show results should skip walkthrough)');
  return 'gated <100 on alloc; Show results opens at 100%';
});

// ===== Tax & take-home (Phase 2) =====
check('Tax: slab tables render from engine constants', ()=>{
  win.showSec('tax');
  const nNew=$$('#slabNewBody tr').length, nOld=$$('#slabOldBody tr').length;
  if(nNew!==7) throw new Error('new-regime rows='+nNew);
  if(nOld!==4) throw new Error('old-regime rows='+nOld);
  if(!/30%/.test($('#slabNewBody').textContent)) throw new Error('no top 30% band in new regime');
  return nNew+' new / '+nOld+' old bands';
});
check('Tax: surcharge/cess, deductions, 5 buckets, disclaimer present', ()=>{
  if(!$('.taxdisc')) throw new Error('no disclaimer');
  const buckets=$$('#sec-tax .taxbucket').length; if(buckets!==5) throw new Error('buckets='+buckets);
  const txt=$('#sec-tax').textContent;
  if(!/80C/.test(txt)) throw new Error('no 80C deduction');
  if(!/surcharge/i.test(txt)) throw new Error('no surcharge');
  if(!/cess/i.test(txt)) throw new Error('no cess');
  return buckets+' buckets, deductions + surcharge + cess shown';
});
check('Library lesson cross-links to Tax section', ()=>{
  win.showSec('invest');
  click($('[data-lhead="fd"]'));                       // open FD lesson
  const link=$('[data-lrow="fd"] [data-taxlink]');
  if(!link) throw new Error('no tax link in lesson');
  click(link);
  if(activeSec()!=='sec-tax') throw new Error('link did not open tax: '+activeSec());
  win.goBack();
  if(activeSec()!=='sec-invest') throw new Error('back from tax did not return to Investing: '+activeSec());
  return 'lesson → tax → back → Investing';
});

// ===== Try-it (simulator) — 4 journey starters + sim flow =====
check('Try-it landing renders 4 journey cards', ()=>{ win.showSec('tryit'); const n=$$('#pathgrid .pathcard').length; if(n!==4) throw new Error('cards='+n); return n+' cards'; });
const expectSec = ['sec-inflation','sec-how','sec-how','sec-how']; // inflation, lump, sip, swp
$$('#pathgrid .pathcard').forEach((card,i)=>{
  check('Journey card '+(i+1)+' navigates', ()=>{ win.showSec('tryit'); click($$('#pathgrid .pathcard')[i]); const a=activeSec(); if(a!==expectSec[i]) throw new Error('went to '+a+', expected '+expectSec[i]); return '-> '+a; });
});

check('Journey stepper: shows in sim, hidden off, marks active + done, clickable', ()=>{
  win.showSec('tryit'); if($('#simsteps').style.display!=='none') throw new Error('stepper shown off-journey');
  win.showSec('choose');
  const ss=$('#simsteps'); if(ss.style.display==='none') throw new Error('stepper hidden during journey');
  const b=[...ss.querySelectorAll('[data-step]')];
  if(!b[2].classList.contains('active')) throw new Error('Choose step not active');
  if(!b[0].classList.contains('done')||!b[1].classList.contains('done')) throw new Error('earlier steps not marked done');
  click(b[0]); if(activeSec()!=='sec-inflation') throw new Error('stepper click did not navigate');
  return 'stepper active/done/click ✓';
});
check('Inflation: change amount + rate + horizon', ()=>{
  win.showSec('inflation');
  setInput($('#infAmt'),'1000000'); setInput($('#infRate'),'7'); click($('#infChips [data-h="30"]'));
  const t=$('#infResult').innerHTML; if(!t.includes('₹')) throw new Error('no result text'); return 'result populated';
});
check('Setup: SIP shows SIP input', ()=>{ win.showSec('how'); click($('#modeChips [data-m="sip"]')); if(!$('#grpSip').classList.contains('on')) throw new Error('sip grp hidden'); return 'ok'; });
check('Setup: SWP shows corpus+withdrawal', ()=>{ click($('#modeChips [data-m="swp"]')); if(!$('#grpSwpC').classList.contains('on')||!$('#grpSwpW').classList.contains('on')) throw new Error('swp grps hidden'); return 'ok'; });
check('Setup: back to lump sum', ()=>{ click($('#modeChips [data-m="lumpsum"]')); if(!$('#grpLump').classList.contains('on')) throw 0; return 'ok'; });
check('Income slider to MAX (~50Cr) + surcharge note', ()=>{ setInput($('#inc'),'1000'); const v=$('#incV').textContent; const mb=$('#margBox').innerHTML; if(!v.includes('Cr')) throw new Error('incV='+v); if(!/surcharge/i.test(mb)) throw new Error('no surcharge note'); return v+' / surcharge shown'; });
check('Income slider back to ~15L', ()=>{ setInput($('#inc'),'217'); const v=$('#incV').textContent; if(!v.includes('L')) throw new Error('incV='+v); return v; });
check('Regime: old shows 80C detail', ()=>{ click($('#regChips [data-r="old"]')); if(!/80C/.test($('#regBox').innerHTML)) throw 0; click($('#regChips [data-r="new"]')); return 'ok'; });
check('Setup has NO scenario control (moved to Results)', ()=>{
  win.showSec('how'); if($('#sec-how #scnChips')) throw new Error('scenario still in Setup'); return 'setup = inputs only';
});
check('Market scenario is removed everywhere', ()=>{
  if($('#scnChips')||$('#scnBox')) throw new Error('scenario control still present');
  return 'no scenario';
});
check('Results exit lens explains itself', ()=>{
  win.showSec('results');
  click($('#exitChips [data-exit="1"]')); if(!/Exit early/i.test($('#exitBox').innerHTML)) throw new Error('no exit explanation');
  click($('#exitChips [data-exit="0"]')); if(!/Hold to term/i.test($('#exitBox').innerHTML)) throw new Error('no hold explanation');
  return 'exit lens explained';
});
check('Inactive product: allocation slider disabled until selected', ()=>{
  win.resetAll(); win.showSec('choose');
  const sl=$('[data-pct="savings"]'); if(!sl.disabled) throw new Error('slider movable while product OFF');
  click($('[data-tgl="savings"]')); if(sl.disabled) throw new Error('slider still disabled after selecting');
  click($('[data-tgl="savings"]'));
  return 'slider gated on selection';
});
check('Interactive controls are keyboard-accessible (role+tabindex)', ()=>{
  win.showSec('choose');
  const els=$$('.tgl,.chip,.cattab,.brk'); if(!els.length) throw new Error('no controls found');
  const bad=els.filter(e=>e.getAttribute('role')!=='button'||e.getAttribute('tabindex')!=='0');
  if(bad.length) throw new Error(bad.length+' controls missing role/tabindex');
  return els.length+' controls a11y-ready';
});
check('Per-product Exit early (on the Results card) applies + shows its penalty', ()=>{
  win.resetAll(); win.showSec('choose');
  const fd=$('[data-tgl="fd"]'); if(!fd.classList.contains('on')) click(fd);  // activate (blank slate)
  setInput($('[data-pct="fd"]'),'100');
  win.showSec('results');
  click($('[data-rbrk="fd"]'));   // exit-early toggle lives on the product's result card now
  const fdCard=$$('#pcards .pcard').find(c=>/Fixed Deposit/.test(c.querySelector('.top').textContent));
  if(!fdCard||!/Early-exit penalty/.test(fdCard.textContent)) throw new Error('per-product break penalty not shown');
  return 'per-product break works (on card)';
});
check('Equal distribution on select (1→100, 2→50, 4→25)', ()=>{
  win.resetAll(); win.showSec('choose');
  const ids=['index','stocks','equity_mf','elss'];
  const pct=id=>+$(`[data-pct="${id}"]`).value;
  click($('[data-tgl="index"]')); if(pct('index')!==100) throw new Error('1 sel ≠100: '+pct('index'));
  click($('[data-tgl="stocks"]')); if(pct('index')!==50||pct('stocks')!==50) throw new Error('2 sel ≠50/50');
  click($('[data-tgl="equity_mf"]')); click($('[data-tgl="elss"]'));
  const vals=ids.map(pct); const sum=vals.reduce((a,b)=>a+b,0);
  if(sum!==100) throw new Error('4 sel sum≠100: '+vals.join(','));
  if(vals.some(v=>v!==25)) throw new Error('4 sel not 25 each: '+vals.join(','));
  return '100 / 50,50 / 25×4';
});
check('Manual drag still cannot push total over 100%', ()=>{
  win.resetAll(); win.showSec('choose');
  click($('[data-tgl="fd"]')); click($('[data-tgl="index"]')); // 50/50
  setInput($('[data-pct="fd"]'),'90');                          // others=50 → capped to 50
  if(+$('[data-pct="fd"]').value>50) throw new Error('exceeded room: '+$('[data-pct="fd"]').value);
  win.showSec('results'); if(parseInt($('#totalPct').textContent)>100) throw new Error('total over 100');
  return 'cap holds';
});
check('Results: inflation / today-money toggle works', ()=>{
  win.resetAll(); win.showSec('choose');
  const fd=$('[data-tgl="fd"]'); if(!fd.classList.contains('on')) click(fd); setInput($('[data-pct="fd"]'),'100');
  win.showSec('results');
  const future=$('#num1').textContent;
  click($('#adjChips [data-adj="1"]'));
  if(!/today/i.test($('#cap1').textContent)) throw new Error('caption not switched to today');
  const box=$('#adjBox').innerHTML;
  if(!/How inflation changes/i.test(box)) throw new Error('no inflation breakdown');
  ['Inflation assumed','Prices rise by','today','Lost to inflation'].forEach(t=>{ if(!new RegExp(t,'i').test(box)) throw new Error('breakdown missing: '+t); });
  if($('#num1').textContent===future) throw new Error('value did not adjust for inflation');
  click($('#adjChips [data-adj="0"]'));
  return 'breakdown: future ↔ today’s, lost-to-inflation';
});

check('Choose renders all 32 product rows', ()=>{ win.showSec('choose'); const n=$$('#plist .prow').length; if(n!==32) throw new Error('rows='+n); return n+' rows'; });
check('No products selected by default (blank slate)', ()=>{
  win.resetAll(); const on=$$('#plist .tgl.on').length; if(on!==0) throw new Error(on+' active by default');
  win.showSec('results'); if($('#totalPct').textContent!=='0%') throw new Error('total='+$('#totalPct').textContent);
  win.showSec('choose'); return 'blank slate';
});
check('Category tabs (6) switch visible rows', ()=>{
  const tabs=$$('#cattabs .cattab'); if(tabs.length!==6) throw new Error('tabs='+tabs.length);
  let log=[];
  for(const tab of tabs){ click(tab); const cat=tab.dataset.cat;
    const visible=$$('#plist .prow').filter(r=>!r.classList.contains('hidecat'));
    if(visible.length===0) throw new Error('cat '+cat+' shows 0');
    if(visible.some(r=>r.dataset.pcat!==cat)) throw new Error('cat '+cat+' shows foreign rows');
    log.push(cat+':'+visible.length);
  }
  return log.join(' ');
});
check('Toggle a product on (crypto) + set its inputs', ()=>{
  click($('#cattabs .cattab[data-cat="advanced"]'));
  const tgl=$('[data-tgl="crypto"]'); click(tgl); if(!tgl.classList.contains('on')) throw new Error('toggle off');
  setInput($('[data-pct="crypto"]'),'10'); setInput($('[data-rt="crypto"]'),'25');
  if($('[data-pcv="crypto"]').textContent!=='10%') throw new Error('pct label not updated');
  return 'crypto on, 10%/4yr/25%';
});
check('Total allocation updates', ()=>{ const t=$('#totalPct').textContent; if(!t.endsWith('%')) throw 0; return 'total='+t; });

check('Results headline numbers valid (no NaN)', ()=>{
  win.showSec('results');
  const n1=$('#num1').textContent,n2=$('#num2').textContent,n3=$('#num3').textContent;
  if([n1,n2,n3].some(x=>/NaN|undefined/.test(x))) throw new Error(n1+' | '+n2+' | '+n3);
  return n1+' kept / '+n2+' lost / '+n3;
});
check('Per-product cards render for active products', ()=>{ const n=$$('#pcards .pcard').length; if(n<1) throw new Error('cards='+n); return n+' product cards'; });
check('Stress: all 32 products active, no NaN anywhere', ()=>{
  win.showSec('choose');
  $$('[data-tgl]').forEach(t=>{ if(!t.classList.contains('on')) click(t); });
  win.showSec('results');
  const bad=$$('#pcards .v').map(v=>v.textContent).filter(x=>/NaN|undefined|Infinity/.test(x));
  const n1=$('#num1').textContent;
  if(/NaN|Infinity/.test(n1)||bad.length) throw new Error('num1='+n1+' bad='+bad.join(','));
  return '32 active, headline '+n1;
});

// ===== Credit & borrowing (Phase 3) =====
check('Credit: how-it-works + calculator render (no NaN)', ()=>{
  win.showSec('credit');
  const rows=$$('#sec-credit .taxbucket').length; if(rows!==4) throw new Error('how-it-works rows='+rows);
  const t=$('#ccResult').textContent; if(!/₹|month|balance/i.test(t)) throw new Error('empty result');
  if(/NaN|Infinity/.test(t+$('#ccSegI').style.width)) throw new Error('NaN in calculator');
  return rows+' explainer rows, result populated';
});
check('Credit: minimum-only payoff shows months', ()=>{
  setInput($('#ccBal'),'50000'); setInput($('#ccApr'),'42'); win.renderCredit();
  const t=$('#ccResult').textContent; if(!/months/.test(t)) throw new Error('no month count: '+t.slice(0,40));
  return t.slice(0,46);
});
check('Credit: fixed tiny payment never clears (trap)', ()=>{
  click($('#ccModeChips [data-cm="fixed"]'));
  setInput($('#ccPay'),'100'); win.renderCredit();
  if(!/never clears/i.test($('#ccResult').textContent)) throw new Error('never-clears not flagged');
  setInput($('#ccPay'),'5000'); click($('#ccModeChips [data-cm="min"]')); // restore
  return 'never-clears flagged';
});

// ===== Polish (Phase 4) =====
check('All 32 lessons are deep (non-equity too)', ()=>{
  win.showSec('invest');
  const shallow=$$('#invlist .lrow').filter(r=>r.dataset.deep!=='1').map(r=>r.dataset.lrow);
  if(shallow.length) throw new Error('still shallow: '+shallow.join(','));
  // spot-check a non-equity one
  click($('[data-lhead="fd"]'));
  const row=$('[data-lrow="fd"]');
  ['What it is','Risks','Taxation','Pros','Cons'].forEach(s=>{ if(!row.textContent.includes(s)) throw new Error('fd missing '+s); });
  if(row.querySelectorAll('.proscons li').length<6) throw new Error('fd lacks pros/cons');
  return 'all 32 deep ✓';
});
check('Beat-inflation verdict shows on results (growth mode)', ()=>{
  win.resetAll(); win.showSec('choose');
  const idx=$('[data-tgl="index"]'); if(!idx.classList.contains('on')) click(idx); setInput($('[data-pct="index"]'),'100');
  win.showSec('results');
  const iv=$('#inflVerdict'); if(iv.style.display==='none') throw new Error('verdict hidden');
  if(!/inflation/i.test(iv.innerHTML)) throw new Error('no inflation verdict text');
  return /beat/i.test(iv.innerHTML)?'beats ✅':'loses ⚠️';
});
check('Plain mode labels (no jargon-only chips)', ()=>{
  win.showSec('how');
  const lump=$('#modeChips [data-m="lumpsum"]').textContent;
  if(!/Invest once/i.test(lump)) throw new Error('mode label not plain: '+lump);
  return 'lump="'+lump+'"';
});

// ===== Language: English-only for now (toggle hidden in UI) =====
check('Language toggle is hidden (English-only build)', ()=>{ const lang=$('.lang'); if(lang.style.display!=='none') throw new Error('lang toggle visible'); return 'hidden'; });
check('Return to home keeps pillars + sim card', ()=>{ win.showSec('home'); const n=$$('#pillargrid .pathcard').length; if(n!==4||!$('#simcard .simcta')) throw new Error('pillars='+n); return '4 + sim'; });

// ---- report ----
const pass=results.filter(r=>r[0]==='PASS').length, fail=results.length-pass;
console.log('\n================ JOURNEY TEST RESULTS ================');
for(const [s,n,note] of results) console.log((s==='PASS'?'✅':'❌')+' '+n+(note?'  —  '+note:''));
console.log('------------------------------------------------------');
console.log(`TOTAL: ${pass} passed, ${fail} failed`);
if(errors.length) { console.log('\nCaptured runtime errors:'); errors.forEach(e=>console.log('  • '+e)); }
process.exit(fail?1:0);
