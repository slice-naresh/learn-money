// Records a narrated, cursor-driven demo (3 flows) → ./shots/learn-money-demo.mp4
// Captures frames during the run, encodes with ffmpeg-static (no puppeteer screencast).
// Run: node demo_video.js
const puppeteer = require('puppeteer');
const path = require('path'); const fs = require('fs');
const { spawnSync } = require('child_process');
const ff = require('ffmpeg-static');
const URL = 'file://' + path.join(__dirname, 'learn-money.html');
const FRAMES = path.join(__dirname, 'shots', '_frames');
const OUT = path.join(__dirname, 'shots', 'learn-money-demo.mp4');
fs.rmSync(FRAMES,{recursive:true,force:true}); fs.mkdirSync(FRAMES,{recursive:true});
const W=1100,H=740, FPS=5;

(async()=>{
  const browser = await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--force-color-profile=srgb']});
  const page = await browser.newPage();
  await page.setViewport({width:W,height:H,deviceScaleFactor:1});
  let n=0;
  const snap = async()=>{ try{ await page.screenshot({path:`${FRAMES}/f${String(n).padStart(5,'0')}.jpg`,type:'jpeg',quality:80}); n++; }catch(e){} };
  const hold = async ms=>{ const end=Date.now()+ms; do{ await snap(); await new Promise(r=>setTimeout(r,Math.max(0,1000/FPS - 60))); }while(Date.now()<end); };

  async function chrome(){ await page.evaluate(()=>{
    if(!document.getElementById('democur')){const c=document.createElement('div');c.id='democur';
      c.style.cssText='position:fixed;width:20px;height:20px;border-radius:50%;background:#ff463c;border:2px solid #fff;box-shadow:0 2px 8px #0006;z-index:99999;transition:left .5s cubic-bezier(.4,0,.2,1),top .5s cubic-bezier(.4,0,.2,1);pointer-events:none;left:560px;top:380px';document.body.appendChild(c);}
    if(!document.getElementById('democap')){const b=document.createElement('div');b.id='democap';
      b.style.cssText='position:fixed;left:0;right:0;top:0;z-index:99998;background:rgba(10,15,12,.92);color:#fff;font-family:Outfit,sans-serif;font-weight:600;font-size:15px;padding:11px 16px;text-align:center';document.body.appendChild(b);}
  }); }
  const cap = async t=>{ await page.evaluate(x=>{const e=document.getElementById('democap'); if(e)e.textContent=x;},t); };
  async function moveTo(sel){ const box=await page.$eval(sel,el=>{el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}).catch(()=>null); if(!box)return; await page.evaluate((x,y)=>{const c=document.getElementById('democur');if(c){c.style.left=x+'px';c.style.top=y+'px';}},box.x,box.y); await hold(650); }
  async function tap(sel){ await moveTo(sel); await page.evaluate(s=>{const el=document.querySelector(s); if(el)el.click();},sel); await hold(600); }

  await page.goto(URL,{waitUntil:'networkidle0',timeout:60000});
  await page.evaluate(()=>{try{localStorage.removeItem('lm_seen');localStorage.removeItem('lm_state');}catch(e){}});
  await page.reload({waitUntil:'networkidle0'});
  await page.evaluate(()=>document.fonts.ready); await new Promise(r=>setTimeout(r,500));
  await chrome();

  await cap('Learn Money — how money works, for ages 12–60'); await hold(1600);
  await cap('First-time guide welcomes you'); await hold(1500);
  await tap('#coach .nextbtn');

  await cap('Flow 1 — Build a pretend portfolio'); await hold(1100);
  await tap('#simcard .simcta');
  await cap('Pick how you invest'); await hold(900);
  await tap('#pathgrid .pathcard:nth-child(2)');
  await page.evaluate(()=>showSec('choose')); await hold(700);
  await cap('Tap products — they auto-split to 100%'); await hold(600);
  await tap('[data-tgl="index"]'); await tap('[data-tgl="stocks"]'); await tap('[data-tgl="equity_mf"]');
  await cap('Live panel shows what you keep'); await hold(1300);
  await tap('#toResults');
  await page.evaluate(()=>{window.__noAnim=false;render();}); await cap('Results — what you keep after tax, charges & inflation'); await hold(2000);

  await cap('Flow 2 — Kid mode for beginners'); await hold(1000);
  await tap('#kidBtn');
  await page.evaluate(()=>showSec('invest')); await hold(500);
  await tap('[data-lhead="fd"]');
  await cap('Every product explained with a food analogy 🍱'); await hold(2100);
  await page.evaluate(()=>showSec('tax')); await cap('Even Tax becomes one friendly card'); await hold(2000);
  await tap('#kidBtn');

  await cap('Flow 3 — Credit cards & the minimum-due trap'); await hold(1000);
  await page.evaluate(()=>showSec('credit')); await hold(700);
  await page.evaluate(()=>{const b=document.getElementById('ccBal');b.value=50000;b.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('ccResult').scrollIntoView({block:'center'});});
  await cap('₹50,000 at 42%, paying only the minimum…'); await hold(1600);
  await cap('…takes 142 months. Learn Money makes it click.'); await hold(2200);

  await browser.close();

  console.log('🎞  '+n+' frames → encoding…');
  const r = spawnSync(ff, ['-y','-framerate',String(FPS),'-i',`${FRAMES}/f%05d.jpg`,'-c:v','libx264','-pix_fmt','yuv420p','-vf',`scale=${W}:-2`,'-movflags','+faststart',OUT],{stdio:'inherit'});
  if(r.status!==0){ console.log('ffmpeg failed'); process.exit(1); }
  fs.rmSync(FRAMES,{recursive:true,force:true});
  console.log('✅ video →', OUT, (fs.statSync(OUT).size/1e6).toFixed(1),'MB,', (n/FPS).toFixed(0),'s');
})();
