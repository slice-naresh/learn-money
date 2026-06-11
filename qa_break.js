// Adversarial QA harness — tries to BREAK the app. Throwaway.
const fs=require('fs'), path=require('path'), {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'learn-money.html'),'utf8');
const errors=[];
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errors.push('jsdomError: '+(e.detail&&e.detail.message||e.message)));
const dom=new JSDOM(html,{runScripts:'dangerously',resources:'usable',virtualConsole:vc,beforeParse(w){
  w.scrollTo=()=>{};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.devicePixelRatio=1;
  const c=new Proxy({},{get(_,p){if(p==='createLinearGradient')return()=>({addColorStop(){}});return()=>{};},set(){return true;}});
  w.HTMLCanvasElement.prototype.getContext=()=>c; w.onerror=(m)=>errors.push('onerror: '+m);
}});
const win=dom.window, doc=win.document, $=s=>doc.querySelector(s), $$=s=>[...doc.querySelectorAll(s)];
const click=el=>el&&el.dispatchEvent(new win.Event('click',{bubbles:true}));
const setI=(el,v)=>{if(!el)return;el.value=v;el.dispatchEvent(new win.Event('input',{bubbles:true}));};
const blur=el=>el&&el.dispatchEvent(new win.Event('blur',{bubbles:true}));
const sec=()=>{const s=$$('.sec').find(x=>x.classList.contains('on'));return s?s.id:null;};
let fails=0,probes=0;
function bad(t){return /NaN|Infinity|undefined|null/.test(t);}
function scanDOM(label){ // scan all visible result/credit/inflation text for bad values
  const ids=['#num1','#num2','#num3','#liveKeep','#liveLost','#infResult','#ccResult','#totalPct','#resSummary'];
  let hits=[];
  ids.forEach(id=>{const e=$(id); if(e&&bad(e.textContent)) hits.push(id+'="'+e.textContent.trim()+'"');});
  $$('#pcards .v').forEach(v=>{if(bad(v.textContent))hits.push('pcard:'+v.textContent);});
  if(hits.length){fails++;console.log('❌ '+label+' → BAD VALUE '+hits.join(', '));}
}
function ok(cond,label){probes++; if(!cond){fails++;console.log('❌ '+label);} }
function activate(id,pct){win.showSec('choose');const t=$(`[data-tgl="${id}"]`);if(t&&!t.classList.contains('on'))click(t);if(pct!=null)setI($(`[data-pct="${id}"]`),pct);}

console.log('=== ADVERSARIAL QA ===');

// 1) Hostile numeric inputs across modes
win.resetAll(); win.showSec('choose'); activate('fd',100);
[['lumpsum','#lumpAmt'],['sip','#sipAmt'],['swp','#swpCorpus']].forEach(([m,inp])=>{
  click($(`#modeChips [data-m="${m}"]`));
  ['','-99999','0','0.0001','1e21','99999999999999','abc','   ','-0'].forEach(v=>{
    setI($(inp),v); win.showSec('results'); scanDOM(`mode ${m} input ${inp}="${v}"`);
    win.showSec('choose');
  });
});

// 2) Years / return hostile (per product)
win.resetAll(); activate('stocks',100);
[['#planYears',['0','-5','999','1.5','']],['[data-rt="stocks"]',['0','-10','40','99','']]].forEach(([sel,vals])=>{
  vals.forEach(v=>{setI($(sel),v); win.showSec('results'); scanDOM(`stocks ${sel}="${v}"`); win.showSec('choose');});
});

// 3) Income extremes
win.resetAll(); activate('fd',100);
['0','1','500','1000','99999'].forEach(v=>{setI($('#inc'),v); win.showSec('results'); scanDOM(`income slider=${v}`);});

// 4) Allocation cap — never exceed 100 with many products + hostile drags
win.resetAll(); win.showSec('choose');
['fd','index','ppf','gold_etf','stocks','crypto'].forEach(id=>activate(id,null));
['fd','index','ppf'].forEach(id=>setI($(`[data-pct="${id}"]`),'100'));
win.showSec('results');
ok(parseInt($('#totalPct').textContent)<=100,'allocation total exceeded 100 after hostile drags ('+$('#totalPct').textContent+')');

// 5) Equal split sums to 100 for N=1..31
win.resetAll(); win.showSec('choose');
let n=0;
for(const t of $$('#plist .tgl')){ if(!t.classList.contains('on')) click(t); n++;
  const sum=$$('#plist .tgl.on').map(x=>+$(`[data-pcv="${x.dataset.tgl}"]`).textContent.replace('%','')).reduce((a,b)=>a+b,0);
  if(sum!==100){fails++;console.log(`❌ equal-split sum≠100 at N=${n}: ${sum}`);break;}
}
ok(true,'equal-split N=1..31');

// 6) Gated proceed button must NOT navigate when disabled
win.resetAll(); win.showSec('choose');
const btn=$('#toResults');
ok(btn.disabled,'proceed enabled with 0 products');
click(btn); ok(sec()==='sec-choose','disabled proceed button navigated anyway → '+sec());

// 7) Exit-early with 0 products (must not crash / NaN)
win.resetAll(); win.showSec('results'); click($('#exitChips [data-exit="1"]')); scanDOM('exit-early with 0 products'); click($('#exitChips [data-exit="0"]'));

// 8) SWP nightmare: corpus 0, huge withdrawal, 0 years
win.resetAll(); activate('fd',100); click($('#modeChips [data-m="swp"]'));
[['0','999999'],['1000','99999999'],['100000','0']].forEach(([c,w])=>{setI($('#swpCorpus'),c);setI($('#swpWd'),w);win.showSec('results');scanDOM(`SWP corpus=${c} wd=${w}`);win.showSec('choose');});
setI($('#planYears'),'0'); win.showSec('results'); scanDOM('SWP 0 years');

// 9) Navigation churn + back stack integrity
win.resetAll();
const order=['invest','tax','credit','tryit','inflation','how','choose','results','home','invest','results','home'];
order.forEach(s=>win.showSec(s));
ok(sec()==='sec-home','nav churn left wrong section: '+sec());
// deep back chain
win.showSec('home'); win.showSec('invest'); win.showSec('tax'); win.showSec('credit');
win.goBack(); ok(sec()==='sec-tax','back#1 wrong: '+sec());
win.goBack(); ok(sec()==='sec-invest','back#2 wrong: '+sec());
win.goBack(); ok(sec()==='sec-home','back#3 wrong: '+sec());
// (4th back legitimately returns to earlier history — not asserted)

// 10) Inflation tool hostile
win.showSec('inflation');
['0','-100','1e15','abc',''].forEach(v=>{setI($('#infAmt'),v);scanDOM(`inflation amt=${v}`);});
['#infChips [data-h="5"]','#infChips [data-h="30"]'].forEach(s=>click($(s)));

// 11) Credit calculator hostile
win.showSec('credit');
[['0','12'],['10000000','48'],['1000','12']].forEach(([b,a])=>{setI($('#ccBal'),b);setI($('#ccApr'),a);scanDOM(`credit bal=${b} apr=${a}`);});
click($('#ccModeChips [data-cm="fixed"]')); ['0','1','99999999','-5'].forEach(v=>{setI($('#ccPay'),v);scanDOM(`credit pay=${v}`);});
click($('#ccModeChips [data-cm="min"]'));

// 12) Clamp-on-blur actually clamps
win.resetAll(); win.showSec('how'); const la=$('#lumpAmt');
const mv=el=>+String(el.value).replace(/,/g,'');   // money fields render with commas
setI(la,'-999'); blur(la); ok(mv(la)>=1000,'lumpAmt negative not clamped: '+la.value);
setI(la,'1e15'); blur(la); ok(mv(la)<=1000000000,'lumpAmt huge not clamped: '+la.value);

// 13) Toggle all on then all off (stress) — no NaN, total 0
win.resetAll(); win.showSec('choose');
$$('#plist .tgl').forEach(t=>{if(!t.classList.contains('on'))click(t);});
win.showSec('results'); scanDOM('all 31 active');
win.showSec('choose'); $$('#plist .tgl').forEach(t=>{if(t.classList.contains('on'))click(t);});
win.showSec('results'); ok($('#totalPct').textContent==='0%','all-off total not 0: '+$('#totalPct').textContent); scanDOM('all off');

// 14) Reset truly blank after chaos
win.resetAll();
ok($$('#plist .tgl.on').length===0,'reset left products active');
ok(parseInt($('#totalPct')&&$('#totalPct').textContent||'0')===0,'reset total not 0');

// 15b) Navigation churn through every section — no NaN/errors, content intact
win.resetAll();
['home','invest','tax','credit','tryit','inflation','how','choose','results','home'].forEach(s=>win.showSec(s));
win.showSec('invest'); click($('[data-lhead="fd"]'));
const krow=$('[data-lrow="fd"]');
ok(krow&&krow.querySelector('.foodie'),'food analogy missing in lesson');
ok(krow&&krow.querySelectorAll('.lsec').length>=2,'lesson sections missing after churn');
activate('index',100); win.showSec('results'); scanDOM('post-churn results');
click($('#exitChips [data-exit="1"]')); scanDOM('churn + exit-early'); click($('#exitChips [data-exit="0"]'));

// 15c) Combo edge cases not hit elsewhere
// SWP + exit-early
win.resetAll(); activate('ppf',100); click($('#modeChips [data-m="swp"]')); setI($('#swpCorpus'),'2000000'); setI($('#swpWd'),'15000');
win.showSec('results'); click($('#exitChips [data-exit="1"]')); scanDOM('SWP + exit-early'); click($('#exitChips [data-exit="0"]'));
// All 31 active + exit-all-early + inflation today's-money 30y
win.resetAll(); win.showSec('choose'); $$('#plist .tgl').forEach(t=>{if(!t.classList.contains('on'))click(t);});
win.showSec('results'); click($('#exitChips [data-exit="1"]')); click($('#adjChips [data-adj="1"]')); click($('#adjYrsChips [data-iy="30"]'));
scanDOM('all-31 + exit-all + today-money 30y');
// per-product exit on a result card + then master exit (no double-count crash)
win.resetAll(); activate('index',100); win.showSec('results');
const rb=$('[data-rbrk="index"]'); if(rb){click(rb); scanDOM('per-product exit on card'); click($('#exitChips [data-exit="1"]')); scanDOM('per-product + master exit'); }
ok(true,'combo edge cases ran');

// 15d) SALARY CALCULATOR — hostile inputs, regime/age/metro combos, monotonicity, bounds
const num=s=>parseInt(String(s).replace(/[^0-9]/g,''))||0;
win.showSec('takehome');
const thOut=()=>[ '#thNet','#thNetYr','#thBreak','#thCompare','#thVerdict' ].map(s=>$(s)?$(s).textContent:'').join(' | ');
const fields=[['thCtc',['','-5','0','0.5','1e15','99999999999','abc','  ']],['thBasic',['0','100','-10']],['thEpfRate',['0','100','999','-5']],
  ['thHraPct',['0','100','999']],['thGrat',['0','100','-1']],['thEmpNps',['0','14','99']],['thPt',['0','999999','-100']],
  ['thRent',['0','-5','100000000']],['thC',['9999999']],['thD',['9999999']],['thNps',['9999999']],['thHome',['9999999']]];
for(const [id,vals] of fields){ for(const v of vals){ setI($('#'+id),v);
  for(const m of ['compare','new','old']){ click($(`#thRegChips [data-thr="${m}"]`));
    if(bad(thOut())){ fails++; console.log(`❌ salary ${id}="${v}" regime ${m} → BAD: ${thOut().slice(0,90)}`); }
  } } }
// restore sane defaults
[['thCtc','1200000'],['thBasic','40'],['thEpfRate','12'],['thHraPct','50'],['thGrat','4.81'],['thEmpNps','0'],['thPt','2400'],['thRent','240000'],['thC','150000'],['thD','25000'],['thNps','50000'],['thHome','0']].forEach(([id,v])=>setI($('#'+id),v));
// age + metro combos
for(const a of ['lt60','60','80']){ click($(`#thAgeChips [data-age="${a}"]`)); click($('#thRegChips [data-thr="old"]')); if(bad(thOut())){fails++;console.log('❌ salary age '+a+' BAD');} }
for(const mt of ['1','0']){ click($(`#thMetroChips [data-metro="${mt}"]`)); if(bad(thOut())){fails++;console.log('❌ salary metro '+mt+' BAD');} }
click($('#thAgeChips [data-age="lt60"]'));
// monotonic: higher CTC → higher annual in-hand (catches tax cliffs / broken marginal relief)
click($('#thRegChips [data-thr="compare"]'));
let prev=-1, mono=true;
for(let c=300000;c<=80000000;c+=(c<3000000?100000:5000000)){ setI($('#thCtc'),String(c)); const yr=num($('#thNetYr').textContent);
  if(yr<prev-1){ mono=false; console.log('❌ in-hand DROPPED at CTC '+c+': '+yr+' < '+prev+' (tax cliff)'); break; } prev=yr; }
ok(mono,'salary in-hand not monotonic with CTC');
// bounds: 0 < in-hand ≤ CTC
setI($('#thCtc'),'5000000'); const yr=num($('#thNetYr').textContent);
ok(yr>0 && yr<=5000000,'salary in-hand out of bounds: '+yr);
// compare always renders 2 cards
ok($$('#thCompare .pcard').length===2,'compare did not render 2 regime cards');
setI($('#thCtc'),'1200000');

// 15) Runtime errors captured?
if(errors.length){fails+=errors.length; console.log('❌ RUNTIME ERRORS:'); errors.slice(0,8).forEach(e=>console.log('   • '+e));}

console.log('-----------------------------------');
console.log(fails===0?`✅ NO BREAKS FOUND (${probes} explicit probes + DOM scans)`:`❌ ${fails} ISSUE(S) FOUND`);
process.exit(fails?1:0);
