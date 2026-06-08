const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const URL = 'file://' + path.join(__dirname, 'learn-money.html');
const SHOT = path.join(__dirname, 'shots'); fs.mkdirSync(SHOT,{recursive:true});

const results=[]; const consoleErrs=[]; const pageErrs=[];
function ck(name,ok,note){ results.push([ok?'PASS':'FAIL',name,note||'']); }

(async()=>{
  const browser = await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--force-color-profile=srgb']});
  const page = await browser.newPage();
  page.on('console',m=>{ if(m.type()==='error') consoleErrs.push(m.text()); });
  page.on('pageerror',e=>pageErrs.push(e.message));
  // force any rAF-driven chart animation to finish synchronously (headless throttles rAF)
  const drawSync = (fn)=>page.evaluate((f)=>{const o=window.requestAnimationFrame;window.requestAnimationFrame=cb=>{cb(performance.now());return 0;};window[f]&&window[f]();window.requestAnimationFrame=o;},fn);

  // ---------- DESKTOP ----------
  await page.setViewport({width:1120,height:920,deviceScaleFactor:2});
  await page.goto(URL,{waitUntil:'networkidle0',timeout:60000});
  await page.evaluate(()=>{try{localStorage.setItem("lm_seen","1")}catch(e){} var c=document.getElementById("coach"); if(c)c.style.display="none";});
  await page.evaluate(()=>document.fonts.ready);
  await new Promise(r=>setTimeout(r,500));

  ck('No pageerror exceptions on load', pageErrs.length===0, pageErrs.join(' | '));
  ck('No console errors on load', consoleErrs.length===0, consoleErrs.slice(0,3).join(' | '));

  // Fonts actually loaded
  const fontLoaded = await page.evaluate(()=>document.fonts.check('700 30px "Space Grotesk"'));
  ck('Space Grotesk font loaded', fontLoaded, fontLoaded?'':'not loaded');
  const heroFont = await page.evaluate(()=>getComputedStyle(document.querySelector('.hero h1')).fontFamily);
  ck('Hero uses Space Grotesk', /Space Grotesk/.test(heroFont), heroFont);

  // Cash-green applied to a primary CTA
  const btnBg = await page.evaluate(()=>{const b=document.querySelector('.nextbtn');return b?getComputedStyle(b).backgroundColor:'';});
  ck('CTA button is Cash green', btnBg.replace(/\s/g,'')==='rgb(0,213,75)', btnBg);

  // Path card arrow is NOT a green circle anymore
  const arrow = await page.evaluate(()=>{const a=document.querySelector('.pathcard .arr');const s=getComputedStyle(a);return{bg:s.backgroundColor,radius:s.borderRadius};});
  ck('Path arrow has no green circle bg', /rgba?\(0, 0, 0, 0\)|transparent/.test(arrow.bg), JSON.stringify(arrow));

  await page.screenshot({path:`${SHOT}/01-home-desktop.png`,fullPage:true});

  // Explainer behaviour line populated (replaced the old abstract animations)
  const behavText = await page.evaluate(()=>{const el=document.querySelector('.behav [data-behav]');return el?el.textContent.trim():'';});
  ck('Product behaviour caption populated', behavText.length>10, '"'+behavText.slice(0,40)+'"');

  // Navigate to Setup, screenshot
  await page.evaluate(()=>showSec('how'));
  await new Promise(r=>setTimeout(r,400));
  await page.screenshot({path:`${SHOT}/02-setup-desktop.png`,fullPage:true});

  // Choose: advanced category + expand crypto explainer
  await page.evaluate(()=>{showSec('choose');});
  await new Promise(r=>setTimeout(r,200));
  await page.evaluate(()=>{document.querySelector('.cattab[data-cat="advanced"]').click();
    document.querySelector('[data-elitog="crypto"]').click();});
  await new Promise(r=>setTimeout(r,500));
  const behShown = await page.evaluate(()=>{const w=document.querySelector('[data-eli-wrap="crypto"]');const b=w.querySelector('.behav [data-behav]');return w.classList.contains('show') && !!b && b.textContent.trim().length>10;});
  ck('Explainer shows behaviour line when expanded', behShown, '');
  await page.screenshot({path:`${SHOT}/03-choose-crypto-desktop.png`,fullPage:true});

  // Inflation chart renders (non-blank pixels)
  await page.evaluate(()=>showSec('inflation'));
  await new Promise(r=>setTimeout(r,700));
  const infPix = await page.evaluate(()=>{const c=document.getElementById('infChart');if(!c)return -1;if(c.width===0)return 0;const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<x.length;i+=4)if(x[i])n++;return n;});
  ck('Inflation chart actually drew', infPix>500, infPix+' non-transparent px');
  await page.evaluate(()=>{window.__noAnim=true;renderInflation();});
  await page.screenshot({path:`${SHOT}/04-inflation-desktop.png`,fullPage:true});

  // Results: growth chart renders + count-up animation runs
  // (blank slate by default — activate a product so there's something to chart/tween)
  await page.evaluate(()=>{const t=document.querySelector('[data-tgl="index"]'); if(!t.classList.contains('on'))t.click(); const s=document.querySelector('[data-pct="index"]'); s.value=100; s.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.evaluate(()=>showSec('results'));
  await new Promise(r=>setTimeout(r,800));
  const growPix = await page.evaluate(()=>{const c=document.getElementById('growth');if(!c)return -1;if(c.width===0)return 0;const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<x.length;i+=4)if(x[i])n++;return n;});
  ck('Growth chart actually drew', growPix>500, growPix+' non-transparent px');

  await page.evaluate(()=>{window.__noAnim=false;});
  const series = await page.evaluate(async()=>{
    const el=document.getElementById('num1');
    const inc=document.getElementById('inc'); inc.value=700; inc.dispatchEvent(new Event('input',{bubbles:true}));
    const vals=[]; const t0=performance.now();
    return await new Promise(res=>{(function poll(){vals.push(el.textContent); if(performance.now()-t0<700)requestAnimationFrame(poll); else res(vals);})();});
  });
  const distinct=[...new Set(series)];
  ck('Count-up animation tweens through values', distinct.length>=2, distinct.length+' distinct frames; final '+series[series.length-1]);
  await page.evaluate(()=>{window.__noAnim=true;render();});
  await new Promise(r=>setTimeout(r,150));
  await page.screenshot({path:`${SHOT}/05-results-desktop.png`,fullPage:true});

  // Home pillars + Investing library render (new IA)
  await page.evaluate(()=>showSec('home'));
  await new Promise(r=>setTimeout(r,300));
  const pillars = await page.evaluate(()=>document.querySelectorAll('#pillargrid .pathcard').length);
  const simCta = await page.evaluate(()=>!!document.querySelector('#simcard .simcta'));
  ck('Home: 4 reading pillars + distinct simulator CTA', pillars===4 && simCta, pillars+' pillars, simCTA='+simCta);
  await page.screenshot({path:`${SHOT}/06-home-pillars-desktop.png`,fullPage:true});
  await page.evaluate(()=>{showSec('invest');document.querySelector('[data-lhead="ppf"]').click();});
  await new Promise(r=>setTimeout(r,300));
  const lessons = await page.evaluate(()=>document.querySelectorAll('#invlist .lrow').length);
  ck('Investing library renders 32 lessons', lessons===32, lessons+' lessons');
  await page.screenshot({path:`${SHOT}/10-investing-library.png`,fullPage:true});
  await page.evaluate(()=>showSec('tax'));
  await new Promise(r=>setTimeout(r,300));
  const slabRows = await page.evaluate(()=>document.querySelectorAll('#slabNewBody tr').length + document.querySelectorAll('#slabOldBody tr').length);
  ck('Tax slab tables render (new+old)', slabRows===11, slabRows+' slab rows');
  await page.screenshot({path:`${SHOT}/11-tax-takehome.png`,fullPage:true});
  await page.evaluate(()=>showSec('credit'));
  await new Promise(r=>setTimeout(r,300));
  const ccText = await page.evaluate(()=>document.getElementById('ccResult').textContent);
  ck('Credit calculator renders a result', /month|never|₹/i.test(ccText) && !/NaN/.test(ccText), ccText.slice(0,46));
  await page.screenshot({path:`${SHOT}/12-credit.png`,fullPage:true});

  // ---------- MOBILE ----------
  await page.setViewport({width:390,height:844,deviceScaleFactor:3});
  await page.goto(URL,{waitUntil:'networkidle0',timeout:60000});
  await page.evaluate(()=>{try{localStorage.setItem("lm_seen","1")}catch(e){} var c=document.getElementById("coach"); if(c)c.style.display="none";});
  await page.evaluate(()=>document.fonts.ready);
  await new Promise(r=>setTimeout(r,500));

  const overflow = await page.evaluate(()=>({sw:document.documentElement.scrollWidth, iw:window.innerWidth}));
  ck('No horizontal overflow on mobile (home)', overflow.sw<=overflow.iw+1, `scrollW ${overflow.sw} vs ${overflow.iw}`);
  await page.screenshot({path:`${SHOT}/07-home-mobile.png`,fullPage:true});

  await page.evaluate(()=>showSec('choose'));
  await new Promise(r=>setTimeout(r,300));
  const overflow2 = await page.evaluate(()=>({sw:document.documentElement.scrollWidth, iw:window.innerWidth}));
  ck('No horizontal overflow on mobile (choose)', overflow2.sw<=overflow2.iw+1, `scrollW ${overflow2.sw} vs ${overflow2.iw}`);
  await page.screenshot({path:`${SHOT}/08-choose-mobile.png`,fullPage:true});

  await page.evaluate(()=>showSec('results'));
  await page.evaluate(()=>{window.__noAnim=true;render();});
  await new Promise(r=>setTimeout(r,400));
  const overflow3 = await page.evaluate(()=>({sw:document.documentElement.scrollWidth, iw:window.innerWidth}));
  ck('No horizontal overflow on mobile (results)', overflow3.sw<=overflow3.iw+1, `scrollW ${overflow3.sw} vs ${overflow3.iw}`);

  for(const s of ['invest','tax','takehome','credit','tryit']){
    await page.evaluate(x=>showSec(x), s);
    await new Promise(r=>setTimeout(r,200));
    const o = await page.evaluate(()=>({sw:document.documentElement.scrollWidth, iw:window.innerWidth}));
    ck('No horizontal overflow on mobile ('+s+')', o.sw<=o.iw+1, `scrollW ${o.sw} vs ${o.iw}`);
  }
  await page.screenshot({path:`${SHOT}/09-results-mobile.png`,fullPage:true});

  await browser.close();

  // report
  const pass=results.filter(r=>r[0]==='PASS').length, fail=results.length-pass;
  console.log('\n============== FULL UI TEST (headless Chrome) ==============');
  results.forEach(([s,n,note])=>console.log((s==='PASS'?'✅':'❌')+' '+n+(note?'  —  '+note:'')));
  console.log('-----------------------------------------------------------');
  console.log(`TOTAL: ${pass} passed, ${fail} failed`);
  if(consoleErrs.length){console.log('\nconsole errors:');consoleErrs.slice(0,6).forEach(e=>console.log('  • '+e));}
  if(pageErrs.length){console.log('\npage errors:');pageErrs.slice(0,6).forEach(e=>console.log('  • '+e));}
  process.exit(fail?1:0);
})();
