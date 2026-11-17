(function(){
if(window.__p8)return;window.__p8=1;
const K='brawlArenaSave3';
let SV={own:{},eq:{},pins:[],slots:[]};
try{Object.assign(SV,JSON.parse(localStorage.getItem(K)||'{}'));}catch(e){}
SV.own=SV.own||{};SV.eq=SV.eq||{};SV.pins=SV.pins||[];
const DEF=['😄','😂','😡','😭','👍','😎'];
if(!Array.isArray(SV.slots)||SV.slots.length!==6)SV.slots=DEF.slice();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(SV));}catch(e){}};

const SK=[
 {n:'Klasyczny',p:0},
 {n:'Złoty',p:150,c:{col:'#ffcf3a',gun:'#fff2b0',hair:'#ffb300'},a:'👑'},
 {n:'Neon',p:200,c:{col:'#19e6c1',hair:'#ff2fd0',gun:'#b8fff2'},a:'🎧'},
 {n:'Mroczny',p:250,c:{col:'#2a2a35',skin:'#c9c9d9',hair:'#ff3030',gun:'#555566'},a:'🦇'},
 {n:'Cukierkowy',p:300,c:{col:'#ff8fd0',hair:'#8fe3ff',gun:'#ffffff'},a:'🎀'},
 {n:'Lodowy',p:350,c:{col:'#8fd8ff',skin:'#e6f6ff',hair:'#ffffff',gun:'#5aa9ff'},a:'❄️'}
];
const PINS=[['🔥',30],['💀',40],['🤡',40],['🥳',50],['😱',50],['🤬',30],['🥺',30],['💪',60],['🏆',80],['👏',30],['🤝',40],['💎',100],['⭐',60],['❤️',30],['🙏',40],['🤔',20],['😴',20],['🤩',50],['👋',20],['🎉',50],['🧠',70],['👀',25],['💥',60],['🍀',40]];

/* ---------- MONETY (wspólne z pack4) ---------- */
const coins=()=>window.__COIN?window.__COIN.get():0;
const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:90;background:rgba(0,0,0,.85);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2200);}
function pay(n){
 if(!window.__COIN){toast('Brakuje linijki w pack4.js (Krok 1)');return false;}
 if(coins()<n){toast('Za mało monet! Masz 🪙'+coins());return false;}
 window.__COIN.add(-n);return true;
}

/* ---------- SKINY: rysowanie ---------- */
const _db=drawBrawler;
function skd(d,si){
 const s=SK[si];if(!si||!s||!s.c)return d;
 const o=Object.assign({},d);
 for(const k in s.c){if(k==='hair'&&!d.hair)continue;o[k]=s.c[k];}
 return o;
}
function drawSk(c,x,y,d,ang,o,si){
 _db(c,x,y,skd(d,si),ang,o);
 const s=SK[si];
 if(si&&s&&s.a&&!(o&&o.flash)){
  const sc=(o&&o.s)||1,r=d.r*sc;
  c.save();c.font=Math.round(r*1.1)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillText(s.a,x,y-r*1.3);c.restore();
 }
}
let cur=null;
const _de=drawEnt;
drawEnt=function(e){cur=e;try{_de(e);}finally{cur=null;}};
drawBrawler=function(c,x,y,d,ang,o){
 let si=0;
 if(cur){if(cur===P)si=SV.eq[d.id]|0;}else si=SV.eq[d.id]|0;
 drawSk(c,x,y,d,ang,o,si);
};

/* ---------- EMOTKI: podmiana ---------- */
const MAP=Object.create(null);
function remap(){DEF.forEach((d,i)=>{MAP[d]=SV.slots[i]||d;});}
remap();
const _ft=CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText=function(t,x,y,w){
 if(typeof t==='string'&&t.length<=2&&MAP[t])t=MAP[t];
 return _ft.call(this,t,x,y,w);
};

/* ---------- SKLEP ---------- */
const sh=document.createElement('div');sh.id='sh';sh.className='screen glow';
sh.innerHTML='<div class="bar"><button class="btn red small" id="shback">◀</button><button class="btn blue small" id="shsk">SKINY</button><button class="btn blue small" id="shpn">EMOTKI</button><div class="h2 ol" id="shc" style="margin-left:auto"></div></div><div id="shbody" style="width:100%;max-width:920px;overflow:auto;max-height:76vh"></div>';
document.body.appendChild(sh);
let bi=0,tab=0,slotSel=0;

function render(){
 $('#shc').textContent='🪙 '+coins();
 const b=$('#shbody');b.innerHTML='';
 if(tab===0)renderSk(b);else renderPn(b);
}
function renderSk(b){
 const row=document.createElement('div');
 row.style.cssText='display:grid;grid-template-columns:repeat('+BR.length+',1fr);gap:.8vh;margin-bottom:1vh';
 BR.forEach((br,i)=>{
  const d=document.createElement('div');d.className='card'+(i===bi?' sel':'');
  d.innerHTML='<canvas width="96" height="96"></canvas><div>'+br.name+'</div>';
  drawSk(d.querySelector('canvas').getContext('2d'),48,54,br,.4,{s:1.55},SV.eq[br.id]|0);
  d.onclick=()=>{bi=i;render();};row.appendChild(d);
 });
 b.appendChild(row);
 const br=BR[bi],g=document.createElement('div');
 g.style.cssText='display:grid;grid-template-columns:repeat('+SK.length+',1fr);gap:1vh';
 SK.forEach((s,k)=>{
  const own=k===0||(SV.own[br.id]||[]).includes(k),eq=(SV.eq[br.id]|0)===k;
  const d=document.createElement('div');d.className='card'+(eq?' sel':'');
  d.innerHTML='<canvas width="96" height="96"></canvas><div>'+s.n+'</div><div style="color:'+(eq?'#14102b':'#ffd93b')+'">'+(eq?'✔ WYBRANY':own?'WYBIERZ':'🪙'+s.p)+'</div>';
  drawSk(d.querySelector('canvas').getContext('2d'),48,54,br,.4,{s:1.55},k);
  d.onclick=()=>{
   if(!own){if(!pay(s.p))return;(SV.own[br.id]=SV.own[br.id]||[]).push(k);}
   SV.eq[br.id]=k;save();buildSelect();render();
  };
  g.appendChild(d);
 });
 b.appendChild(g);
}
const ownedPin=e=>DEF.includes(e)||SV.pins.includes(e);
function renderPn(b){
 const sl=document.createElement('div');
 sl.style.cssText='display:flex;gap:1vh;justify-content:center;align-items:center;margin-bottom:1.2vh';
 sl.innerHTML='<span class="ol" style="font-size:min(3.4vh,14px)">Twoje sloty:</span>';
 for(let i=0;i<6;i++){
  const d=document.createElement('div');d.className='card'+(i===slotSel?' sel':'');
  d.style.cssText='width:min(10vh,56px);font-size:min(6vh,30px);line-height:1.5';
  d.textContent=SV.slots[i];d.onclick=()=>{slotSel=i;render();};sl.appendChild(d);
 }
 b.appendChild(sl);
 const info=document.createElement('div');
 info.className='sub ol';info.style.cssText='text-align:center;margin-bottom:1vh;font-size:min(3.2vh,13px)';
 info.textContent='Wybierz slot, potem kliknij emotkę, którą chcesz w nim mieć.';
 b.appendChild(info);
 const g=document.createElement('div');
 g.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(min(11vh,64px),1fr));gap:1vh';
 DEF.map(e=>[e,0]).concat(PINS).forEach(([e,p])=>{
  const own=ownedPin(e),used=SV.slots.includes(e);
  const d=document.createElement('div');d.className='card'+(used?' sel':'');
  d.style.cssText='font-size:min(6vh,30px);line-height:1.4';
  d.innerHTML=e+'<div style="font-size:min(2.8vh,11px);color:'+(used?'#14102b':'#ffd93b')+'">'+(own?(used?'✔':'MASZ'):'🪙'+p)+'</div>';
  d.onclick=()=>{
   if(!own){if(!pay(p))return;SV.pins.push(e);}
   SV.slots[slotSel]=e;remap();save();render();
  };
  g.appendChild(d);
 });
 b.appendChild(g);
}
$('#shsk').onclick=()=>{tab=0;render();};
$('#shpn').onclick=()=>{tab=1;render();};
$('#shback').onclick=()=>{state='menu';show('menu');};

/* ---------- PRZYCISK W MENU ---------- */
const mb=document.createElement('button');
mb.className='btn blue small tl';mb.textContent='🛍️ SKINY I EMOTKI';
const ref=[...document.querySelectorAll('#menu .btn')].find(x=>/ULEPSZENIA/.test(x.textContent));
(ref?ref.parentElement:$('#menu')).appendChild(mb);
mb.onclick=()=>{tab=0;render();state='select';show('sh');};
buildSelect();
})();
