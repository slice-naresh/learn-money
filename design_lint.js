// design_lint.js — automated UI/UX & usability checks (headless Chrome).
// Catches the machine-checkable design failures; semantic judgment stays human.
const puppeteer=require('puppeteer');const path=require('path');
const URL='file://'+path.join(__dirname,'learn-money.html');
const results=[];const ck=(n,ok,note)=>results.push([ok?'PASS':'FAIL',n,note||'']);

// WCAG relative luminance + contrast
function lum([r,g,b]){const f=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);}
function contrast(a,b){const[l1,l2]=[lum(a),lum(b)].sort((x,y)=>y-x);return (l1+0.05)/(l2+0.05);}
const px=s=>{const m=String(s).match(/rgba?\(([\d.]+), ?([\d.]+), ?([\d.]+)(?:, ?([\d.]+))?\)/);return m?[+m[1],+m[2],+m[3],m[4]==null?1:+m[4]]:null;};

(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  const page=await browser.newPage();
  await page.setViewport({width:1120,height:900,deviceScaleFactor:1});
  await page.goto(URL,{waitUntil:'networkidle0',timeout:60000});
  await page.evaluate(()=>{try{localStorage.setItem('lm_seen','1')}catch(e){}var c=document.getElementById('coach');if(c)c.style.display='none';window.__noAnim=true;document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));});

  const SECS=['home','tryit','invest','tax','takehome','credit','goals','inflation','how','choose','results'];

  // -------- 1) No browser-default-styled controls (the unstyled-input regression class) --------
  let plain=[];
  for(const s of SECS){
    await page.evaluate(x=>{showSec(x);if(window.render)render();document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));},s);
    const found=await page.evaluate(sec=>{
      const bad=[];
      document.querySelectorAll(`#sec-${sec} input[type=text],#sec-${sec} input[type=number],#sec-${sec} button`).forEach(el=>{
        if(el.offsetParent===null) return;                       // hidden
        const cs=getComputedStyle(el);
        // default chrome look: ~2px outset/inset border or buttonface bg, square corners
        const defaultish=(parseFloat(cs.borderRadius)<4 && el.tagName==='INPUT')
          || cs.backgroundColor==='rgb(239, 239, 239)'           // buttonface
          || cs.borderStyle==='outset' || cs.borderStyle==='inset';
        if(defaultish) bad.push(sec+': '+(el.id||el.className||el.tagName));
      });
      return bad;
    },s);
    plain.push(...found);
  }
  ck('No browser-default-styled inputs/buttons on any screen', plain.length===0, plain.slice(0,4).join(' | '));

  // -------- 2) Every visible interactive element has an accessible name --------
  let unnamed=[];
  for(const s of SECS){
    await page.evaluate(x=>showSec(x),s);
    const found=await page.evaluate(sec=>{
      const bad=[];
      document.querySelectorAll(`#sec-${sec} button, #sec-${sec} [role=button], #sec-${sec} input`).forEach(el=>{
        if(el.offsetParent===null) return;
        const name=(el.innerText||'').trim()||el.getAttribute('aria-label')||el.getAttribute('title')
          ||(el.labels&&el.labels[0]&&el.labels[0].innerText)||el.getAttribute('placeholder');
        if(!name) bad.push(sec+': '+(el.id||el.className||el.tagName));
      });
      return bad;
    },s);
    unnamed.push(...found);
  }
  ck('Every interactive element has an accessible name', unnamed.length===0, unnamed.slice(0,4).join(' | '));

  // -------- 3) Choice-cards carry descriptions (no bare unexplained pills) --------
  await page.evaluate(()=>showSec('tryit'));
  const presetDesc=await page.evaluate(()=>[...document.querySelectorAll('.preset')].every(p=>{const sm=p.querySelector('small');return sm&&sm.textContent.trim().length>20;}));
  ck('Preset mixes each carry a plain-language description', presetDesc, '');
  await page.evaluate(()=>showSec('home'));
  const pillarDesc=await page.evaluate(()=>[...document.querySelectorAll('#pillargrid .pathcard')].every(c=>{const p=c.querySelector('p');return p&&p.textContent.trim().length>20;}));
  ck('Home pillars each carry a description', pillarDesc, '');

  // -------- 4) WCAG contrast on body text & key captions (≥4.5:1) --------
  const lows=await page.evaluate(()=>{
    function lum(c){const f=x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);}
    const px=s=>{const m=String(s).match(/rgba?\(([\d.]+), ?([\d.]+), ?([\d.]+)(?:, ?([\d.]+))?\)/);return m?[+m[1],+m[2],+m[3],m[4]==null?1:+m[4]]:null;};
    function bgOf(el){let n=el;while(n&&n!==document.documentElement){const b=px(getComputedStyle(n).backgroundColor);if(b&&b[3]>0.6)return b;n=n.parentElement;}return [245,244,251];}
    const bad=[];
    showSec('home');
    document.querySelectorAll('.hero p,.card .hint,label.l,.pathcard p,.privacy-note,.disc').forEach(el=>{
      if(el.offsetParent===null)return;const fg=px(getComputedStyle(el).color);if(!fg)return;const bg=bgOf(el);
      const L=[lum(fg),lum(bg)].sort((a,b)=>b-a);const r=(L[0]+0.05)/(L[1]+0.05);
      if(r<4.5) bad.push((el.className||el.tagName)+' '+r.toFixed(2));
    });
    return bad;
  });
  ck('Body text meets WCAG AA contrast (≥4.5:1)', lows.length===0, lows.slice(0,4).join(' | '));

  // -------- 5) Tap targets ≥40px on mobile --------
  await page.setViewport({width:390,height:844,deviceScaleFactor:1});
  await page.goto(URL,{waitUntil:'networkidle0'});
  await page.evaluate(()=>{try{localStorage.setItem('lm_seen','1')}catch(e){}var c=document.getElementById('coach');if(c)c.style.display='none';});
  let smalls=[];
  for(const s of ['home','choose','goals','takehome']){
    await page.evaluate(x=>showSec(x),s);
    const found=await page.evaluate(sec=>{
      const bad=[];
      document.querySelectorAll(`#sec-${sec} button, #sec-${sec} .chip, #sec-${sec} .cattab`).forEach(el=>{
        if(el.offsetParent===null) return;
        const r=el.getBoundingClientRect();
        if(r.height>0 && r.height<30) bad.push(sec+': '+(el.id||el.textContent.slice(0,14))+' h='+Math.round(r.height));
      });
      return bad;
    },s);
    smalls.push(...found);
  }
  ck('Tap targets ≥30px tall on mobile (key screens)', smalls.length===0, smalls.slice(0,4).join(' | '));

  // -------- 6) Jargon used in UI exists in the glossary --------
  const jargonMiss=await page.evaluate(()=>{
    const JARGON=['SIP','SWP','LTCG','STCG','ELSS','NPS','PPF','EPF','CAGR','REIT','ULIP'];
    const gl=typeof GLOSS!=='undefined'?Object.keys(GLOSS).map(k=>k.toUpperCase()):[];
    const text=document.body.innerText;
    return JARGON.filter(j=>text.includes(j) && !gl.some(g=>g.includes(j)));
  });
  ck('All jargon on the page is covered by the glossary', jargonMiss.length===0, jargonMiss.join(', '));

  // -------- 7) Collapsible result panels: opening reveals VISIBLE content (catch scroll-reveal stuck at opacity:0) --------
  await page.setViewport({width:1120,height:900,deviceScaleFactor:1});
  await page.goto(URL,{waitUntil:'networkidle0'});
  await page.evaluate(()=>{var c=document.getElementById('coach');if(c)c.style.display='none';
    setMode('lumpsum');showSec('choose');const t=document.querySelector('[data-tgl="index"]');if(t&&!t.classList.contains('on'))t.click();const s=document.querySelector('[data-pct="index"]');if(s){s.value=100;s.dispatchEvent(new Event('input',{bubbles:true}));}
    showSec('results');render();});
  const stuck=await page.evaluate(()=>{
    const bad=[];
    ['inc','whatif','bdown'].forEach(w=>{ toggleResSection(w);
      const p=document.getElementById({inc:'incPanel',whatif:'whatifPanel',bdown:'bdownPanel'}[w]);
      if(!p) {bad.push(w+':no panel');return;}
      // any child with measurable size but opacity 0 = stuck reveal
      p.querySelectorAll('*').forEach(el=>{ const r=el.getBoundingClientRect(); if(r.height>4 && +getComputedStyle(el).opacity===0) bad.push(w+':'+(el.className||el.tagName)); });
    });
    return [...new Set(bad)];
  });
  ck('Expanded panels show visible content (no stuck opacity:0)', stuck.length===0, stuck.slice(0,4).join(' | '));

  // -------- 8) Every expandable toggle exposes aria-expanded --------
  const noAria=await page.evaluate(()=>[...document.querySelectorAll('.restog,.lr-break-tog')].filter(b=>b.offsetParent!==null && !b.hasAttribute('aria-expanded')).map(b=>b.id||b.textContent.slice(0,20)));
  ck('Expandable toggles expose aria-expanded', noAria.length===0, noAria.slice(0,4).join(' | '));

  await browser.close();
  const pass=results.filter(r=>r[0]==='PASS').length, fail=results.length-pass;
  console.log('\n========== DESIGN / USABILITY LINT ==========');
  results.forEach(([s,n,note])=>console.log((s==='PASS'?'✅':'❌')+' '+n+(note?'  —  '+note:'')));
  console.log('---------------------------------------------');
  console.log(`TOTAL: ${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
