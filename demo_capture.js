// Demo screenshot reel — drives the app through the story for a presentation.
// Run: node demo_capture.js   → images land in ./shots/demo/
const puppeteer = require('puppeteer');
const fs = require('fs'); const path = require('path');
const URL = 'file://' + path.join(__dirname, 'learn-money.html');
const DIR = path.join(__dirname, 'shots', 'demo'); fs.mkdirSync(DIR, {recursive:true});
const wait = ms => new Promise(r=>setTimeout(r,ms));
const shots = [];
async function shot(page,name,label){ const p=`${DIR}/${name}.png`; await page.screenshot({path:p,fullPage:true}); shots.push([name,label]); console.log('📸 '+name+' — '+label); }

(async()=>{
  const browser = await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--force-color-profile=srgb']});
  const page = await browser.newPage();
  await page.setViewport({width:1140,height:900,deviceScaleFactor:2});

  // 1) First-time welcome coachmark
  await page.goto(URL,{waitUntil:'networkidle0',timeout:60000});
  await page.evaluate(()=>document.fonts.ready); await wait(600);
  await shot(page,'00-welcome','First-time coachmark — guides new users');

  // dismiss + Home
  await page.evaluate(()=>window.dismissCoach && dismissCoach()); await wait(300);
  await shot(page,'01-home','Home — literacy pillars + animated "Start the simulator" play button');

  // 2) Investing lesson (food analogy + deep sections + glossary)
  await page.evaluate(()=>showSec('invest')); await wait(300);
  await page.evaluate(()=>document.querySelector('[data-lhead="fd"]').click()); await wait(300);
  await shot(page,'02-lesson','Investing lesson — food analogy, behaviour, deep sections, tap-to-define jargon');

  // 3) Kid mode — same lesson, simplified
  await page.evaluate(()=>toggleKid()); await wait(300);
  await shot(page,'03-kid-lesson','Kid mode — lesson stripped to food analogy + behaviour + example');
  await page.evaluate(()=>showSec('tax')); await wait(300);
  await shot(page,'04-kid-tax','Kid mode — Tax pillar becomes one friendly card');
  await page.evaluate(()=>toggleKid()); await wait(200);

  // 4) Tax pillar (grown-up)
  await page.evaluate(()=>showSec('tax')); await wait(300);
  await shot(page,'05-tax','Tax & take-home — slab tables, deductions, per-bucket taxation');

  // 5) Setup
  await page.evaluate(()=>showSec('how')); await wait(300);
  await shot(page,'06-setup','Setup — invest once / monthly / take money out + income & regime');

  // 6) Choose — build a portfolio (equal split) + live panel
  await page.evaluate(()=>{['fd','index','ppf','gold_etf'].forEach(id=>{const t=document.querySelector(`[data-tgl="${id}"]`); if(!t.classList.contains('on'))t.click();});});
  await wait(300);
  await shot(page,'07-choose','Choose — pick products, auto equal-split, live "what you keep" panel');

  // 7) Results — verdict, flow, exit-early lens
  await page.evaluate(()=>proceedToResults()); await wait(400);
  await page.evaluate(()=>{window.__noAnim=true;render();}); await wait(300);
  await shot(page,'08-results','Results — what you keep, flow bar, beat-inflation verdict, growth chart');
  await page.evaluate(()=>{document.querySelector('#exitChips [data-exit="1"]').click();}); await wait(300);
  await shot(page,'09-results-exit','Exit-early lens — penalties + lost tax breaks, with the cost calculation');
  await page.evaluate(()=>{document.querySelector('#exitChips [data-exit="0"]').click();document.querySelector('#adjChips [data-adj="1"]').click();}); await wait(300);
  await shot(page,'10-results-inflation',"Inflation lens — value in today's money, with a years toggle");

  // 8) Credit calculator — the minimum-due trap
  await page.evaluate(()=>showSec('credit')); await wait(300);
  await page.evaluate(()=>{const b=document.getElementById('ccBal');b.value=50000;b.dispatchEvent(new Event('input',{bubbles:true}));}); await wait(300);
  await shot(page,'11-credit','Credit — how a card works + "cost of carrying a balance" calculator');

  // 9) Inflation tool
  await page.evaluate(()=>showSec('inflation')); await wait(700);
  await shot(page,'12-inflation','Inflation — what doing nothing costs, animated chart');

  // 10) Mobile home
  await page.setViewport({width:390,height:844,deviceScaleFactor:3});
  await page.goto(URL,{waitUntil:'networkidle0',timeout:60000}); await wait(500);
  await page.evaluate(()=>window.dismissCoach && dismissCoach()); await wait(300);
  await shot(page,'13-home-mobile','Mobile — responsive, no horizontal overflow');

  await browser.close();
  console.log('\n✅ '+shots.length+' demo screenshots in ./shots/demo/');
})();
