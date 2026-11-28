(function(){
if(window.__p32)return;window.__p32=1;
const menu=document.getElementById('menu');
if(!menu)return;
const KEY='brawlLobbyBg';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const TH=[
{n:'Fiolet',bg:'radial-gradient(circle at 50% 35%,#6a3df0 0,#2b1a7a 55%,#150c3d 100%)',c:'#6a3df0',p:['✨','💎','✦']},
{n:'Zachód słońca',bg:'linear-gradient(#2b1055,#7a2a8a 40%,#ff6a3d 80%,#ffd06a 100%)',c:'#ff6a3d',p:['☁️','✨','🌅']},
{n:'Ocean',bg:'linear-gradient(#0a3a6a,#0f6fb0 50%,#2fc2d9 100%)',c:'#2fc2d9',p:['🫧','🐠','💧']},
{n:'Las',bg:'linear-gradient(#0d3b2a,#1f7a3a 55%,#7ccb52 100%)',c:'#4cb04a',p:['🍃','🌿','🍀']},
{n:'Noc',bg:'radial-gradient(circle at 50% 120%,#3a2f8a,#0b0b2e 70%)',c:'#1b1b5a',p:['⭐','🌙','✨']},
{n:'Lawa',bg:'linear-gradient(#2a0a0a,#7a1a10 50%,#ff6a1a 100%)',c:'#e0501a',p:['🔥','✨','🌋']},
{n:'Cukier',bg:'linear-gradient(#ff9ad0,#c47aff 55%,#6ad0ff 100%)',c:'#ff9ad0',p:['🍬','🍭','🎀']},
{n:'Złoto',bg:'radial-gradient(circle at 50% 30%,#ffe27a 0,#c98a1a 45%,#4a2a05 100%)',c:'#e0a82a',p:['✨','🪙','👑']}
];
let sel=localStorage.getItem(KEY);
if(sel===null)sel='0';
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- STYLE ---------- */
const st=document.createElement('style');
st.textContent=
'#menu .title{font-size:min(17vh,76px)!important;background:linear-gradient(#fff6b0,#ffd93b 55%,#ff9a1f);-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent;-webkit-text-stroke:2px #14102b;text-shadow:none!important;filter:drop-shadow(0 4px 0 #14102b) drop-shadow(0 0 14px rgba(255,200,60,.45))}'+
'#menu .title.chg{background:linear-gradient(#d9ffb0,#8aff56 55%,#2bc22b)}'+
'#menu .sub{background:rgba(0,0,0,.3);padding:.2em 1em;border-radius:20px;letter-spacing:1px;border:2px solid rgba(255,255,255,.2)}'+
'#menu #mp{filter:drop-shadow(0 0 20px rgba(255,255,255,.35))}'+
'#menu #play{font-size:min(9.5vh,38px)!important;padding:.3em 2.2em!important;border-radius:20px!important;animation:qpulse 1.8s infinite}'+
'@keyframes qpulse{0%{box-shadow:0 0 0 0 rgba(138,255,86,.55)}70%{box-shadow:0 0 0 18px rgba(138,255,86,0)}100%{box-shadow:0 0 0 0 rgba(138,255,86,0)}}'+
'#menu .tl{background:rgba(255,255,255,.14)!important;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:2px solid rgba(255,255,255,.35)!important;border-bottom-width:4px!important;border-radius:14px!important;text-shadow:1px 1px 0 rgba(20,16,43,.85)!important;font-size:min(3.6vh,13px)!important}'+
'#qpills{position:absolute;top:max(env(safe-area-inset-top),8px);left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:6}'+
'.qpl{background:rgba(0,0,0,.4);border:2px solid rgba(255,255,255,.3);border-radius:20px;padding:.2em .8em;font:900 min(3.6vh,13px) "Arial Black",Impact,sans-serif;cursor:pointer;white-space:nowrap;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}'+
'#qpart{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:-1}'+
'.qp{position:absolute;bottom:-12%;opacity:0;animation:qfl linear infinite}'+
'@keyframes qfl{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:.7}90%{opacity:.45}100%{transform:translateY(-125vh) rotate(180deg);opacity:0}}'+
'#qbgb{position:absolute;right:max(env(safe-area-inset-right),12px);bottom:max(env(safe-area-inset-bottom),10px);z-index:6}'+
'#qpick{position:absolute;right:max(env(safe-area-inset-right),12px);bottom:calc(max(env(safe-area-inset-bottom),10px) + 52px);z-index:7;display:none;gap:8px;flex-wrap:wrap;max-width:240px;justify-content:flex-end;background:rgba(0,0,0,.55);border:2px solid rgba(255,255,255,.3);border-radius:14px;padding:8px}'+
'.qsw{width:32px;height:32px;border-radius:50%;border:3px solid #14102b;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}'+
'.qsw.on{outline:3px solid #ffd93b}';
document.head.appendChild(st);

/* ---------- TŁO I OZDOBY ---------- */
const layer=document.createElement('div');layer.id='qpart';
menu.insertBefore(layer,menu.firstChild);
let curI=0;
function pickIdx(){return sel==='r'?Math.floor(Math.random()*TH.length):Math.max(0,Math.min(TH.length-1,+sel||0));}
function apply(i){
 curI=i;const t=TH[i];
 menu.style.setProperty('background',t.bg,'important');
 layer.innerHTML='';
 if(reduce)return;
 for(let k=0;k<14;k++){
  const s=document.createElement('span');s.className='qp';
  s.textContent=t.p[k%t.p.length];
  s.style.left=(Math.random()*96)+'%';
  s.style.fontSize=(14+Math.random()*22)+'px';
  s.style.animationDuration=(9+Math.random()*10)+'s';
  s.style.animationDelay=(-Math.random()*16)+'s';
  layer.appendChild(s);
 }
}
apply(pickIdx());

/* ---------- WYBÓR TŁA ---------- */
const bb=document.createElement('button');
bb.id='qbgb';bb.className='btn blue small tl';bb.textContent='🎨 TŁO';
menu.appendChild(bb);
const pk=document.createElement('div');pk.id='qpick';menu.appendChild(pk);
function drawPick(){
 pk.innerHTML='';
 TH.forEach((t,i)=>{
  const d=document.createElement('div');d.className='qsw'+(sel!=='r'&&+sel===i?' on':'');
  d.style.background=t.bg;d.title=t.n;
  d.onclick=()=>{sel=String(i);try{localStorage.setItem(KEY,sel);}catch(e){}apply(i);drawPick();};
  pk.appendChild(d);
 });
 const r=document.createElement('div');r.className='qsw'+(sel==='r'?' on':'');
 r.style.background='#3a2a7a';r.textContent='🎲';r.title='Losowe';
 r.onclick=()=>{sel='r';try{localStorage.setItem(KEY,'r');}catch(e){}apply(pickIdx());drawPick();};
 pk.appendChild(r);
}
bb.onclick=e=>{e.stopPropagation();drawPick();pk.style.display=pk.style.display==='flex'?'none':'flex';};
document.addEventListener('pointerdown',e=>{if(pk.style.display==='flex'&&!pk.contains(e.target)&&e.target!==bb)pk.style.display='none';});

/* ---------- PASEK PROFILU ---------- */
const bar=document.createElement('div');bar.id='qpills';
const mk=()=>{const d=document.createElement('div');d.className='qpl';bar.appendChild(d);return d;};
const pn=mk(),pt=mk(),pc=mk();
menu.appendChild(bar);
const findB=re=>[...menu.querySelectorAll('button')].find(x=>re.test(x.textContent));
pn.onclick=()=>{const b=findB(/PROFIL/);if(b)b.click();};
pt.onclick=()=>{const b=findB(/ALEJA/);if(b)b.click();};
pc.onclick=()=>{const b=findB(/ULEPSZENIA/);if(b)b.click();};
function pills(){
 const f=jget('brawlFriends1',{}),a=jget('brawlArenaSave1',{}),b=jget('brawlArenaSave2',{});
 const coins=window.__COIN?window.__COIN.get():(typeof b.coins==='number'?b.coins:100);
 pn.textContent='👤 '+(f.name||'Gracz');
 pt.textContent='🏆 '+(a.tr||0);
 pc.textContent='🪙 '+coins;
}
pills();setInterval(pills,1500);

/* ---------- RESZTA ---------- */
const fb=findB(/ZNAJOMI/);if(fb)fb.classList.add('tl');
const ti=menu.querySelector('.title');
if(ti&&localStorage.getItem('brawlCheatOn')==='1')ti.classList.add('chg');
})();
