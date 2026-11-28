(function(){
if(window.__p30)return;window.__p30=1;
const KEY='brawlModeSel1';
const MODES=[
{k:'gem',ic:'💎',n:'Zbiór klejnotów',sub:'ZBIÓR KLEJNOTÓW • 3 vs 3',d:'Zbierz 10 klejnotów w kopalni i utrzymaj je 15 s.',p:'6 graczy',on:true,tr:/3 vs 3/,mc:/DIAMENTY/,ko:false},
{k:'solo',ic:'🌵',n:'Showdown Solo',sub:'SHOWDOWN • SOLO',d:'Każdy sam. Ostatni żywy wygrywa, gaz zawęża mapę.',p:'10 graczy',on:true,tr:/SOLO/,mc:/DIAMENTY/,ko:false},
{k:'duo',ic:'🤝',n:'Showdown Duo',sub:'SHOWDOWN • DUO',d:'5 par. Przetrwajcie razem z partnerem.',p:'10 graczy',on:true,tr:/DUO/,mc:/DIAMENTY/,ko:false},
{k:'trio',ic:'👥',n:'Showdown Trio',sub:'SHOWDOWN • TRIO',d:'4 trzyosobowe drużyny, ostatnia stoi.',p:'12 graczy',on:true,tr:/TRIO/,mc:/DIAMENTY/,ko:false},
{k:'ball',ic:'⚽',n:'Brawl Ball',sub:'BRAWL BALL • 3 vs 3',d:'Wepchnij piłkę do bramy rywala. Do 3 goli.',p:'6 graczy',on:false,tr:/3 vs 3/,mc:/PIŁKA/,ko:false},
{k:'zone',ic:'🎯',n:'Strefa',sub:'STREFA • 3 vs 3',d:'Utrzymaj strefę na środku przez 60 s.',p:'6 graczy',on:false,tr:/3 vs 3/,mc:/STREFA/,ko:false},
{k:'ko',ic:'🥊',n:'Nokaut',sub:'NOKAUT • 3 vs 3',d:'Bez odradzania. Wygraj 2 rundy.',p:'6 graczy',on:false,tr:/3 vs 3/,mc:/DIAMENTY/,ko:true}
];
const btnTxt=re=>[...document.querySelectorAll('#sel .bar .btn')].find(x=>!x.dataset.q&&re.test(x.textContent));
function cyc(re,want,n){const b=btnTxt(re);if(!b)return;let i=0;while(!want.test(b.textContent)&&i++<(n||5))b.click();}
function derive(){
 const t=btnTxt(/TRYB/),m=btnTxt(/MECZ/),k=btnTxt(/NOKAUT/);
 const tt=t?t.textContent:'';
 if(/SOLO/.test(tt))return 'solo';
 if(/DUO/.test(tt))return 'duo';
 if(/TRIO/.test(tt))return 'trio';
 if(k&&/WŁ/.test(k.textContent))return 'ko';
 const mt=m?m.textContent:'';
 if(/PIŁKA/.test(mt))return 'ball';
 if(/STREFA/.test(mt))return 'zone';
 return 'gem';
}
const cur=()=>MODES.find(x=>x.k===derive())||MODES[0];

const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:200;background:rgba(0,0,0,.88);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center;max-width:80vw';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2600);}

/* ---------- EKRAN TRYBÓW ---------- */
const st=document.createElement('style');
st.textContent='#mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(30vh,190px),1fr));gap:10px;width:100%;max-width:900px;overflow:auto;max-height:80vh;padding:4px}.mc{border:4px solid #14102b;border-radius:14px;background:linear-gradient(#4d7bff,#25409e);padding:8px;display:flex;flex-direction:column;gap:4px;cursor:pointer;text-shadow:1px 1px 0 #14102b}.mc.sel{outline:4px solid #ffd93b;background:linear-gradient(#ffd93b,#ff9a1f);color:#14102b;text-shadow:none}.mc .ic{font-size:min(8vh,34px)}.mc .n{font:900 min(4.4vh,17px) "Arial Black",Impact,sans-serif}.mc .d{font:700 min(3.2vh,12px)/1.25 Arial,sans-serif}.mc .b{font:700 min(3vh,11px) Arial,sans-serif;opacity:.9}';
document.head.appendChild(st);
const sc=document.createElement('div');sc.id='modes';sc.className='screen glow';
sc.style.justifyContent='flex-start';
sc.innerHTML='<div class="bar"><button class="btn red small" id="mback">◀</button><div class="h2 ol">TRYBY GRY</div></div><div id="mgrid"></div>';
document.body.appendChild(sc);
sc.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
let from='menu',lastK='';
function back(){state=from==='menu'?'menu':'select';show(from==='menu'?'menu':'sel');}
function render(){
 const g=document.getElementById('mgrid');g.innerHTML='';const c=derive();
 MODES.forEach(m=>{
  const d=document.createElement('div');d.className='mc'+(m.k===c?' sel':'');
  d.innerHTML='<div class="ic"></div><div class="n"></div><div class="d"></div><div class="b"></div>';
  d.children[0].textContent=m.ic;d.children[1].textContent=m.n;d.children[2].textContent=m.d;
  d.children[3].textContent=m.p+(m.on?' • online':' • tylko z botami');
  d.onclick=()=>{setMode(m.k);back();};
  g.appendChild(d);
 });
}
function openModes(f){from=f;render();state='select';show('modes');}
document.getElementById('mback').onclick=back;

/* ---------- USTAWIANIE TRYBU ---------- */
function setMode(k){
 const m=MODES.find(x=>x.k===k)||MODES[0];
 cyc(/TRYB/,m.tr,5);
 cyc(/MECZ/,m.mc,4);
 cyc(/NOKAUT/,m.ko?/WŁ/:/WYŁ/,2);
 try{localStorage.setItem(KEY,m.k);}catch(e){}
 try{buildSelect();}catch(e){}
 ui();
}
const bar=document.querySelector('#sel .bar');
const sb=document.createElement('button');
sb.className='btn blue small';sb.dataset.q='1';
sb.style.cssText='font-size:min(4vh,15px);padding:.2em .6em;margin-left:8px';
sb.onclick=()=>openModes('select');
if(bar){bar.style.flexWrap='wrap';bar.appendChild(sb);}
const mb=document.createElement('button');
mb.className='btn blue small tl';mb.textContent='🎮 TRYBY';
const ref=[...document.querySelectorAll('#menu .btn')].find(x=>/ALEJA|ULEPSZENIA|SKINY|KARNET|PROFIL/.test(x.textContent));
(ref?ref.parentElement:document.getElementById('menu')).appendChild(mb);
mb.onclick=()=>openModes('menu');
[/TRYB/,/MECZ/,/NOKAUT/].forEach(re=>{const b=btnTxt(re);if(b)b.style.display='none';});

function ui(){
 const m=cur();
 sb.textContent='🎮 '+m.n+' ▸';
 const s=document.querySelector('#menu .sub');if(s)s.textContent=m.sub;
 if(m.k!==lastK){lastK=m.k;if(sc.classList.contains('on'))render();}
}
setInterval(ui,700);

/* ---------- ONLINE: tylko klejnoty i Showdown ---------- */
const _hs=hostStart;
hostStart=function(){
 if(NET.role==='host'&&!cur().on){setMode('gem');toast('Online: tylko klejnoty i Showdown. Przełączono na klejnoty.');}
 return _hs.apply(this,arguments);
};

/* ---------- KLEJNOTY TYLKO W ZBIORZE KLEJNOTÓW ---------- */
const gemMode=g=>!g.sd&&!g.sdc&&!g.bb&&!g.hz&&!g.kn;
const _u=update;
update=function(dt){
 if(G&&!G.over&&!gemMode(G)){if(G.gems&&G.gems.length)G.gems.length=0;G.gemT=1e9;}
 return _u.apply(this,arguments);
};
const _dm=drawMine;
drawMine=function(){if(G&&!gemMode(G))return;return _dm.apply(this,arguments);};

setMode(localStorage.getItem(KEY)||'gem');
})();
