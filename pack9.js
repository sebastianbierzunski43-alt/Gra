(function(){
if(window.__p9)return;window.__p9=1;
const KEY='brawlMaps1';
const TH=[
 {n:'Łąka',c:ARENAS[0].c},
 {n:'Pustynia',c:ARENAS[1].c},
 {n:'Lód',c:ARENAS[2].c},
 {n:'Cukier',c:{f1:'#ffd1ec',f2:'#ffc2e4',deco:'#ff9fd0',wall:'#ff6fb5',wallD:'#c03a85',bush:'#8fe3c0',bushD:'#4fb58a',water:'#9ad7ff',edge:'#ff8cc6',edgeD:'#b34a88'}},
 {n:'Noc',c:{f1:'#2b2f5e',f2:'#262a54',deco:'#3a3f78',wall:'#6a6fd0',wallD:'#363a8a',bush:'#2f9d7a',bushD:'#1b6b52',water:'#1f6fd0',edge:'#4a4fa8',edgeD:'#272a6a'}}
];
const LBL=['3 vs 3','SOLO','DUO','TRIO'];
const BASE={5:1,6:1,7:1,8:3,9:1,10:0,11:0,12:0};
const VC={5:'#b8793a',6:'#8a5a2a',7:'#8d949c',8:'#ff6a1a',9:'#2f7a2f',10:'#d8b878',11:'#ff9fd0',12:'#bfe6ff'};
const EMO={5:'📦',6:'🛢️',7:'🪨',8:'🌋',9:'🌳',11:'🌸'};
let maps=[];try{maps=JSON.parse(localStorage.getItem(KEY)||'[]')||[];}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(maps));}catch(e){}};
let ACT=null,PEND=null;

/* ---------- LOGIKA MAPY ---------- */
const forced=(x,y)=>(y>=5&&y<=14&&((x>=1&&x<=4)||(x>=27&&x<=30)))||(x>=14&&x<=17&&y>=8&&y<=11);
const dec=g=>g.map(r=>r.split('').map(c=>parseInt(c,36)||0));
function build(m){
 const v=dec(m.g),g=[];
 for(let y=0;y<ROWS;y++){
  if(!v[y])v[y]=[];
  const row=[];
  for(let x=0;x<COLS;x++){
   let t=v[y][x]||0;
   if(x===0||y===0||x===COLS-1||y===ROWS-1)t=4;
   else if(forced(x,y))t=0;
   v[y][x]=t;
   row.push(BASE[t]!==undefined?BASE[t]:t);
  }
  g.push(row);
 }
 const th=TH[m.th]||TH[0];
 return{grid:g,vr:v,arena:{name:m.name,seed:1,cnt:0,pw:0,pb:0,c:th.c}};
}
function connected(m){
 const g=build(m).grid,seen=new Set([3+10*COLS]),q=[[3,10]];
 const sol=t=>t===1||t===3||t===4;
 while(q.length){
  const p=q.pop();
  for(const d of[[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=p[0]+d[0],ny=p[1]+d[1];
   if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;
   const k=nx+ny*COLS;
   if(seen.has(k)||sol(g[ny][nx]))continue;
   seen.add(k);q.push([nx,ny]);
  }
 }
 return seen.has(16+10*COLS)&&seen.has(28+10*COLS);
}
const _gm=genMap;
genMap=function(A){
 if(PEND)return PEND.grid.map(r=>r.slice());
 return _gm.apply(this,arguments);
};

/* ---------- RYSOWANIE NOWYCH BLOKÓW W GRZE ---------- */
function sprite(px,py,t){
 const c=ctx;c.lineWidth=3;c.strokeStyle='#14102b';c.lineJoin='round';c.lineCap='round';
 if(t===5){
  c.fillStyle=VC[5];rr(c,px+2,py+2,TS-4,TS-4,6);c.fill();c.stroke();
  c.strokeStyle='#6b3f14';c.lineWidth=3;c.beginPath();c.moveTo(px+8,py+8);c.lineTo(px+TS-8,py+TS-8);c.moveTo(px+TS-8,py+8);c.lineTo(px+8,py+TS-8);c.stroke();
 }else if(t===6){
  c.fillStyle=VC[6];c.beginPath();c.ellipse(px+TS/2,py+TS/2,TS*.4,TS*.46,0,0,7);c.fill();c.stroke();
  c.strokeStyle='#3d2510';c.lineWidth=3;c.beginPath();c.moveTo(px+TS*.12,py+TS*.34);c.lineTo(px+TS*.88,py+TS*.34);c.moveTo(px+TS*.12,py+TS*.66);c.lineTo(px+TS*.88,py+TS*.66);c.stroke();
 }else if(t===7){
  c.fillStyle=VC[7];c.beginPath();c.moveTo(px+6,py+TS-6);c.lineTo(px+4,py+TS*.45);c.lineTo(px+TS*.3,py+6);c.lineTo(px+TS*.72,py+8);c.lineTo(px+TS-5,py+TS*.5);c.lineTo(px+TS-8,py+TS-6);c.closePath();c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.3)';c.fillRect(px+TS*.3,py+TS*.25,TS*.2,4);
 }else if(t===8){
  c.fillStyle=VC[8];c.fillRect(px,py,TS+1,TS+1);
  c.strokeStyle='#ffe45c';c.lineWidth=3;c.beginPath();const o=Math.sin(TIME*3+px*.1)*3;
  c.moveTo(px+6,py+20+o);c.quadraticCurveTo(px+16,py+12+o,px+25,py+20+o);c.quadraticCurveTo(px+34,py+28+o,px+44,py+20+o);c.stroke();
 }else if(t===9){
  c.fillStyle='#6b3f14';c.fillRect(px+TS*.4,py+TS*.55,TS*.2,TS*.4);c.strokeRect(px+TS*.4,py+TS*.55,TS*.2,TS*.4);
  c.fillStyle=VC[9];c.beginPath();c.arc(px+TS/2,py+TS*.38,TS*.36,0,7);c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.arc(px+TS*.4,py+TS*.3,TS*.12,0,7);c.fill();
 }else if(t===10){
  c.globalAlpha=.7;c.fillStyle=VC[10];c.fillRect(px,py,TS+1,TS+1);c.globalAlpha=1;
 }else if(t===11){
  const cs=['#ff9fd0','#fff06a','#ffffff','#ff7a7a'];
  for(let i=0;i<5;i++){c.fillStyle=cs[i%4];c.beginPath();c.arc(px+8+(i*11)%36,py+10+(i*17)%30,4,0,7);c.fill();}
 }else if(t===12){
  c.globalAlpha=.65;c.fillStyle=VC[12];c.fillRect(px,py,TS+1,TS+1);c.globalAlpha=.8;
  c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(px+8,py+TS-10);c.lineTo(px+TS*.5,py+10);c.moveTo(px+TS*.5,py+TS-8);c.lineTo(px+TS-8,py+16);c.stroke();c.globalAlpha=1;
 }
}
const _dt=drawTiles;
drawTiles=function(cx,cy,vw,vh){
 _dt.apply(this,arguments);
 if(!G||!G.vr)return;
 const x0=Math.max(0,cx/TS|0),x1=Math.min(COLS-1,(cx+vw)/TS|0),y0=Math.max(0,cy/TS|0),y1=Math.min(ROWS-1,(cy+vh)/TS|0);
 ctx.save();
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=G.vr[y]&&G.vr[y][x];if(t>=5)sprite(x*TS,y*TS,t);}
 ctx.restore();
};

/* ---------- START GRY NA WŁASNEJ MAPIE ---------- */
const _sg=startGame;
startGame=function(){
 if(!ACT)return _sg.apply(this,arguments);
 PEND=build(ACT);
 try{_sg.apply(this,arguments);}
 finally{
  if(G&&PEND){G.A=PEND.arena;G.vr=PEND.vr;G.awarded=true;G.awarded2=true;}
  PEND=null;
 }
};
const _hs=hostStart;
hostStart=function(){
 if(ACT&&NET.role==='host'){
  const m={t:'cmap',g:ACT.g,th:ACT.th||0,n:ACT.name};
  NET.conns.forEach(o=>{if(!o.gone&&o.c.open)o.c.send(m);});
 }
 return _hs.apply(this,arguments);
};
const _cs=clientStart;
clientStart=function(){
 try{_cs.apply(this,arguments);}
 finally{
  if(PEND&&G){G.A=PEND.arena;G.vr=PEND.vr;G.awarded=true;G.awarded2=true;}
  PEND=null;
 }
};
setInterval(()=>{
 if(NET.role==='client'&&NET.host&&!NET.host.__cm){
  NET.host.__cm=1;
  NET.host.on('data',d=>{
   if(d&&d.t==='cmap'&&Array.isArray(d.g)&&d.g.length===ROWS){
    PEND=build({name:String(d.n||'Mapa'),th:d.th|0,g:d.g.map(String)});
   }
  });
 }
},150);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#sel'))ACT=null;},true);

function setMode(k){
 const b=[...document.querySelectorAll('#sel .bar .btn')].find(x=>/TRYB/.test(x.textContent));
 if(!b)return;
 for(let i=0;i<4&&b.textContent.indexOf(LBL[k])<0;i++)b.click();
}

/* ---------- STYLE ---------- */
const stl=document.createElement('style');
stl.textContent='.mmb{font-size:min(3.6vh,12px)!important;padding:.25em .2em!important;border-bottom-width:4px!important;width:100%}.g2{display:grid;grid-template-columns:1fr 1fr;gap:4px}#mmbs{width:100%;accent-color:#ffd93b}';
document.head.appendChild(stl);

/* ---------- EKRAN: LISTA MAP ---------- */
const ml=document.createElement('div');ml.id='ml';ml.className='screen glow';
ml.innerHTML='<div class="bar"><button class="btn red small" id="mlback">◀</button><div class="h2 ol">MAP MAKER</div><button class="btn green small" id="mlnew" style="margin-left:auto">+ NOWA MAPA</button></div><div id="mlb" style="width:100%;max-width:760px;overflow:auto;max-height:78vh"></div>';
document.body.appendChild(ml);
ml.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});

function thumb(c,m){
 const b=build(m),th=(TH[m.th]||TH[0]).c;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const v=b.vr[y][x],g=b.grid[y][x];
  c.fillStyle=v>=5?VC[v]:g===1?th.wall:g===4?th.edge:g===3?th.water:g===2?th.bush:((x+y)&1?th.f1:th.f2);
  c.fillRect(x*3,y*3,3,3);
 }
}
function renderList(){
 const b=$('#mlb');b.innerHTML='';
 if(!maps.length)b.innerHTML='<div class="sub ol" style="text-align:center;padding:2vh">Nie masz jeszcze map. Kliknij NOWA MAPA.</div>';
 maps.forEach((m,i)=>{
  const r=document.createElement('div');
  r.style.cssText='display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:10px;padding:5px 8px;margin-bottom:6px';
  const tc=document.createElement('canvas');tc.width=96;tc.height=60;tc.style.cssText='width:96px;height:60px;border-radius:4px;flex:none';
  thumb(tc.getContext('2d'),m);
  const nm=document.createElement('div');nm.className='ol';nm.style.cssText='flex:1;font-size:min(4vh,16px);overflow:hidden';
  nm.innerHTML='';nm.appendChild(document.createTextNode(m.name));
  const tg=document.createElement('div');tg.style.cssText='font-size:min(3vh,11px);color:#ffd93b';tg.textContent=LBL[m.mode|0];nm.appendChild(tg);
  r.appendChild(tc);r.appendChild(nm);
  [['GRAJ','green',()=>playMap(i,false)],['ONLINE','blue',()=>playMap(i,true)],['✏️','blue',()=>edit(i)],['🗑️','red',()=>del(i)]].forEach(a=>{
   const bt=document.createElement('button');bt.className='btn small '+a[1];bt.style.cssText='font-size:min(3.8vh,14px);padding:.2em .5em;border-bottom-width:5px';
   bt.textContent=a[0];bt.onclick=a[2];r.appendChild(bt);
  });
  b.appendChild(r);
 });
}
function playMap(i,online){
 const m=maps[i];
 setMode(online?0:(m.mode|0));
 ACT=m;
 if(online){
  state='mp';$('#mpst').textContent='Mapa: '+m.name+' (online tylko 3 vs 3)\nZałóż pokój albo wpisz kod.';show('mp2');
 }else startGame();
}
function del(i){if(confirm('Usunąć mapę "'+maps[i].name+'"?')){maps.splice(i,1);save();renderList();}}
$('#mlback').onclick=()=>{state='menu';show('menu');};
$('#mlnew').onclick=()=>{if(maps.length>=20){alert('Maksymalnie 20 map');return;}edIdx=-1;edTh=0;edMode=0;newEd();openEd();};

/* ---------- EDYTOR ---------- */
const mm=document.createElement('div');mm.id='mm';mm.className='screen glow';
mm.style.cssText='flex-direction:row;gap:8px;justify-content:center;align-items:center';
const mmc=document.createElement('canvas');mmc.style.cssText='touch-action:none;border:3px solid #14102b;border-radius:6px;flex:none';
const mmt=document.createElement('div');mmt.style.cssText='display:flex;flex-direction:column;gap:4px;width:178px;max-height:96vh;overflow:auto;flex:none;-webkit-overflow-scrolling:touch';
mm.appendChild(mmc);mm.appendChild(mmt);document.body.appendChild(mm);
mm.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
const mx=mmc.getContext('2d');
let ed=[],edTh=0,edIdx=-1,edMode=0,tool=1,sym=2,bs=1,ts=16,dp=1,hist=[],redo=[];

function newEd(){
 ed=[];hist=[];redo=[];
 for(let y=0;y<ROWS;y++){const r=[];for(let x=0;x<COLS;x++)r.push((x===0||y===0||x===COLS-1||y===ROWS-1)?4:0);ed.push(r);}
}
const snap=()=>ed.map(r=>r.slice());
function pushH(){hist.push(snap());if(hist.length>60)hist.shift();redo=[];bar();}
function undo(){if(!hist.length)return;redo.push(snap());ed=hist.pop();drawEd();bar();}
function redoF(){if(!redo.length)return;hist.push(snap());ed=redo.pop();drawEd();bar();}
function setT(x,y,t){
 if(x<=0||y<=0||x>=COLS-1||y>=ROWS-1||forced(x,y))return;
 ed[y][x]=t;
}
function paintT(x,y,t){
 setT(x,y,t);
 if(sym>=1)setT(COLS-1-x,y,t);
 if(sym>=2){setT(x,ROWS-1-y,t);setT(COLS-1-x,ROWS-1-y,t);}
}
function brush(x,y){
 const a=(bs-1)>>1,b=bs>>1;
 for(let dy=-a;dy<=b;dy++)for(let dx=-a;dx<=b;dx++)paintT(x+dx,y+dy,tool);
}
function fit(){
 dp=Math.min(window.devicePixelRatio||1,2);
 ts=Math.max(8,Math.floor(Math.min((innerWidth-210)/COLS,(innerHeight-20)/ROWS)));
 mmc.style.width=COLS*ts+'px';mmc.style.height=ROWS*ts+'px';
 mmc.width=COLS*ts*dp;mmc.height=ROWS*ts*dp;
}
function drawEd(){
 const th=TH[edTh].c,t=ts;
 mx.setTransform(dp,0,0,dp,0,0);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const v=ed[y][x],px=x*t,py=y*t;
  mx.fillStyle=((x+y)&1)?th.f1:th.f2;mx.fillRect(px,py,t,t);
  if(v===1||v===4){
   mx.fillStyle=v===4?th.edge:th.wall;mx.fillRect(px+1,py+1,t-2,t-2);
   mx.fillStyle=v===4?th.edgeD:th.wallD;mx.fillRect(px+1,py+t*.6,t-2,t*.4-1);
  }else if(v===3){mx.fillStyle=th.water;mx.fillRect(px,py,t,t);}
  else if(v===2){
   mx.fillStyle=th.bushD;mx.beginPath();mx.arc(px+t/2,py+t/2,t*.45,0,7);mx.fill();
   mx.fillStyle=th.bush;mx.beginPath();mx.arc(px+t/2,py+t/2-1,t*.32,0,7);mx.fill();
  }else if(v>=5){
   mx.fillStyle=VC[v];mx.fillRect(px,py,t,t);
   if(EMO[v]){mx.font=Math.round(t*.8)+'px sans-serif';mx.textAlign='center';mx.textBaseline='middle';mx.fillStyle='#000';mx.fillText(EMO[v],px+t/2,py+t/2+1);}
  }
  if(forced(x,y)){
   mx.fillStyle=(x>=14&&x<=17)?'rgba(180,90,255,.38)':x<=4?'rgba(60,130,255,.38)':'rgba(255,70,70,.38)';
   mx.fillRect(px,py,t,t);
  }
 }
 mx.strokeStyle='rgba(0,0,0,.12)';mx.lineWidth=1;mx.beginPath();
 for(let x=0;x<=COLS;x++){mx.moveTo(x*t,0);mx.lineTo(x*t,ROWS*t);}
 for(let y=0;y<=ROWS;y++){mx.moveTo(0,y*t);mx.lineTo(COLS*t,y*t);}
 mx.stroke();
}
let painting=false,lx=-1,ly=-1;
function paintAt(e){
 const r=mmc.getBoundingClientRect();
 const x=Math.floor((e.clientX-r.left)/r.width*COLS),y=Math.floor((e.clientY-r.top)/r.height*ROWS);
 if(x<0||y<0||x>=COLS||y>=ROWS)return;
 if(lx<0)brush(x,y);
 else{
  const n=Math.max(Math.abs(x-lx),Math.abs(y-ly),1);
  for(let i=1;i<=n;i++)brush(Math.round(lx+(x-lx)*i/n),Math.round(ly+(y-ly)*i/n));
 }
 lx=x;ly=y;drawEd();
}
mmc.addEventListener('pointerdown',e=>{e.preventDefault();try{mmc.setPointerCapture(e.pointerId);}catch(x){}pushH();painting=true;lx=-1;paintAt(e);});
mmc.addEventListener('pointermove',e=>{if(painting){e.preventDefault();paintAt(e);}});
const stop=()=>{painting=false;lx=-1;};
mmc.addEventListener('pointerup',stop);mmc.addEventListener('pointercancel',stop);

/* ---------- PASEK NARZĘDZI ---------- */
function mk(txt,cls,fn,par){const b=document.createElement('button');b.className='btn small mmb '+cls;b.textContent=txt;b.onclick=fn;(par||mmt).appendChild(b);return b;}
function grid(){const d=document.createElement('div');d.className='g2';mmt.appendChild(d);return d;}
const top=grid();
mk('◀ WRÓĆ','red',()=>{renderList();show('ml');},top);
mk('✅ ZATWIERDŹ','green',saveEd,top);
const ur=grid();
const bUn=mk('↶ COFNIJ','blue',undo,ur);
const bRe=mk('↷ PONÓW','blue',redoF,ur);
const tg=grid();
const tools=[[0,'🟩 TRAWA'],[1,'🧱 ŚCIANA'],[2,'🌿 KRZAK'],[3,'💧 WODA'],[5,'📦 SKRZYNIA'],[6,'🛢️ BECZKA'],[7,'🪨 KAMIEŃ'],[8,'🌋 LAWA'],[9,'🌳 DRZEWO'],[10,'🟫 ŚCIEŻKA'],[11,'🌸 KWIATY'],[12,'🧊 LÓD']].map(a=>[a[0],mk(a[1],'blue',()=>{tool=a[0];bar();},tg)]);
const sw=document.createElement('div');sw.style.cssText='background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:10px;padding:4px 6px;text-align:center';
const sl=document.createElement('div');sl.className='ol';sl.style.fontSize='12px';
const rg=document.createElement('input');rg.type='range';rg.min=1;rg.max=5;rg.value=1;rg.id='mmbs';
rg.oninput=()=>{bs=+rg.value;bar();};
sw.appendChild(sl);sw.appendChild(rg);mmt.appendChild(sw);
const bSym=mk('','blue',()=>{sym=(sym+1)%3;bar();});
const bTh=mk('','blue',()=>{edTh=(edTh+1)%TH.length;bar();drawEd();});
const bMode=mk('','blue',()=>{edMode=(edMode+1)%4;bar();});
const lr=grid();
mk('🎲 LOSUJ','blue',()=>{
 pushH();
 const xe=sym>=1?16:COLS-1,ye=sym>=2?10:ROWS-1;
 for(let y=1;y<ye;y++)for(let x=1;x<xe;x++){
  const q=Math.random();
  paintT(x,y,q<.11?1:q<.17?2:q<.2?3:0);
 }
 drawEd();
},lr);
mk('🧹 WYCZYŚĆ','red',()=>{if(confirm('Wyczyścić całą mapę?')){pushH();const h=hist,r=redo;newEd();hist=h;redo=r;drawEd();}},lr);
const hn=document.createElement('div');hn.className='hint';hn.style.cssText='font:700 11px Arial,sans-serif;opacity:.85;text-align:center';
hn.textContent='Dotykaj i przeciągaj. Kolorowe pola to bazy i kopalnia, zostają puste. SOLO/DUO/TRIO działają tylko offline.';
mmt.appendChild(hn);
function bar(){
 tools.forEach(t=>{t[1].style.outline=tool===t[0]?'3px solid #ffd93b':'none';});
 sl.textContent='PĘDZEL: '+bs+'×'+bs;
 bUn.style.opacity=hist.length?1:.45;bRe.style.opacity=redo.length?1:.45;
 bSym.textContent='SYMETRIA: '+['BRAK','↔','✥'][sym];
 bTh.textContent='MOTYW: '+TH[edTh].n;
 bMode.textContent='TRYB: '+LBL[edMode];
}
function openEd(){state='select';show('mm');fit();bar();drawEd();}
function edit(i){
 const m=maps[i];edIdx=i;edTh=m.th|0;edMode=m.mode|0;
 ed=dec(m.g);hist=[];redo=[];
 for(let y=0;y<ROWS;y++){if(!ed[y])ed[y]=[];for(let x=0;x<COLS;x++){ed[y][x]=ed[y][x]||0;if(x===0||y===0||x===COLS-1||y===ROWS-1)ed[y][x]=4;}}
 openEd();
}
function saveEd(){
 const g=ed.map(r=>r.map(n=>n.toString(36)).join(''));
 let name=prompt('Zatwierdź mapę. Nazwa mapy:',edIdx>=0?maps[edIdx].name:'Moja mapa '+(maps.length+1));
 if(name===null)return;
 name=(name.trim()||'Mapa').slice(0,18);
 const m={name,th:edTh,g,mode:edMode};
 if(!connected(m)&&!confirm('Drużyny nie mogą do siebie dojść (ściany, woda albo lawa blokują drogę do środka). Zapisać mimo to?'))return;
 if(edIdx>=0)maps[edIdx]=m;else{maps.push(m);edIdx=maps.length-1;}
 save();renderList();show('ml');
}
addEventListener('resize',()=>{if(mm.classList.contains('on')){fit();drawEd();}});

/* ---------- PRZYCISK W MENU ---------- */
const mb=document.createElement('button');
mb.className='btn blue small tl';mb.textContent='🛠️ MAP MAKER';
const ref=[...document.querySelectorAll('#menu .btn')].find(x=>/ULEPSZENIA|SKINY/.test(x.textContent));
(ref?ref.parentElement:$('#menu')).appendChild(mb);
mb.onclick=()=>{renderList();state='select';show('ml');};
})();
