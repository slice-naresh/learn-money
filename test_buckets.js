const fs=require('fs'); const path=require('path'); const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'learn-money.html'),'utf8');
const errors=[];
const vc=new VirtualConsole(); vc.on('jsdomError',e=>errors.push(e.detail&&e.detail.message||e.message));
const dom=new JSDOM(html,{runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.scrollTo=()=>{};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.devicePixelRatio=1;
  const ctx=new Proxy({},{get(_,p){if(p==='createLinearGradient')return()=>({addColorStop(){}});return()=>{};},set(){return true;}});
  w.HTMLCanvasElement.prototype.getContext=()=>ctx;
}});
const win=dom.window,doc=win.document,$=s=>doc.querySelector(s),$$=s=>[...doc.querySelectorAll(s)];
const click=el=>el.dispatchEvent(new win.Event('click',{bubbles:true}));
const setInput=(el,v)=>{el.value=v;el.dispatchEvent(new win.Event('input',{bubbles:true}));};

// turn OFF the 4 defaults, then allocate 20% each across one product per bucket
['fd','index','ppf','gold_etf'].forEach(id=>{const t=$(`[data-tgl="${id}"]`); if(t.classList.contains('on'))click(t);});
const picks={fd:'slab', index:'flat', ppf:'exempt', gold_etf:'mixed', crypto:'crypto'};
for(const id of Object.keys(picks)){ const t=$(`[data-tgl="${id}"]`); if(!t.classList.contains('on'))click(t);
  setInput($(`[data-pct="${id}"]`),'20'); }
setInput($('#lumpAmt'),'1000000'); // 10L lump
win.showSec('results');

function pcardVals(){ // map name->{tax,net}
  const out={};
  $$('#pcards .pcard').forEach(c=>{const name=c.querySelector('.top').textContent;
    const v=[...c.querySelectorAll('.v')].map(x=>x.textContent);
    out[name]={inv:v[0],chg:v[1],tax:v[2],net:v[3]};});
  return out;
}
const fin=s=>/NaN|Infinity|undefined/.test(s);

// 1) every bucket finite, tax>=0
let pass=0,fail=0; const log=[];
function ck(n,cond,note){ if(cond){pass++;log.push('✅ '+n+(note?'  —  '+note:''));} else {fail++;log.push('❌ '+n+(note?'  —  '+note:''));} }

const lowInc=()=>{ setInput($('#inc'),'0'); win.showSec('results'); return pcardVals(); }; // 3L
const hiInc =()=>{ setInput($('#inc'),'1000'); win.showSec('results'); return pcardVals(); }; // 50Cr

const lo=lowInc();
ck('All 5 buckets render a card', Object.keys(lo).length===5, Object.keys(lo).length+' cards');
for(const name of Object.keys(lo)){ const c=lo[name];
  ck('No NaN/Inf: '+name.slice(0,18), !(fin(c.tax)||fin(c.net)||fin(c.inv)), `tax ${c.tax}, net ${c.net}`);
}

// 2) Income sensitivity: slab(FD) tax should RISE from 3L to 50Cr; flat(index) & exempt(ppf) should NOT.
const hi=hiInc();
const num=s=>parseInt(s.replace(/[^0-9-]/g,''))||0;
const fdName=Object.keys(lo).find(n=>/Fixed Deposit/.test(n));
const idxName=Object.keys(lo).find(n=>/Index/.test(n));
const ppfName=Object.keys(lo).find(n=>/PPF/.test(n));
const cryName=Object.keys(lo).find(n=>/Crypto/.test(n));
ck('Slab tax (FD) RISES with income', num(hi[fdName].tax) > num(lo[fdName].tax), `3L:${lo[fdName].tax} -> 50Cr:${hi[fdName].tax}`);
const idxRatio = num(hi[idxName].tax)/num(lo[idxName].tax);
ck('Flat tax (Index) rises only by capped CG surcharge (~15%)', idxRatio>1.10 && idxRatio<1.17, `3L:${lo[idxName].tax} -> 50Cr:${hi[idxName].tax} (x${idxRatio.toFixed(2)})`);
ck('Exempt (PPF) tax is ZERO', num(lo[ppfName].tax)===0 && num(hi[ppfName].tax)===0, `tax ${lo[ppfName].tax}`);
ck('Crypto tax > 0 even at low income', num(lo[cryName].tax) > 0, `3L tax ${lo[cryName].tax}`);
ck('Crypto tax RISES with income (surcharge)', num(hi[cryName].tax) > num(lo[cryName].tax), `3L:${lo[cryName].tax} -> 50Cr:${hi[cryName].tax}`);

console.log('\n========= TAX-BUCKET RUNTIME TESTS =========');
log.forEach(l=>console.log(l));
console.log('--------------------------------------------');
console.log(`TOTAL: ${pass} passed, ${fail} failed`);
if(errors.length){console.log('runtime errors:');errors.forEach(e=>console.log(' • '+e));}
process.exit(fail||errors.length?1:0);
