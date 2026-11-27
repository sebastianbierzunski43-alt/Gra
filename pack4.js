(function(){
if(window.__p4)return;window.__p4=1;
const K='brawlArenaSave2',K1='brawlArenaSave1';
const UP=[20,30,50,80,120,180],GC=150,SC=250,GREQ=3,SREQ=5,MAXL=7;
const REQ={colt:0,shelly:0,poco:16,bull:40,brock:80,leon:130,crow:190,spike:260,dynamike:350,pam:60,rico:100,piper:150,primo:200,kostka:250};
let SV={coins:100,lv:{},g:{},s:{}};
try{const o=JSON.parse(localStorage.getItem(K)||'null');if(o)SV=Object.assign(SV,o);}catch(e){}
SV.lv=SV.lv||{};SV.g=SV.g||{};SV.s=SV.s||{};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(SV));}catch(e){}};
const lvOf=id=>SV.lv[id]||1;
const open=b=>{try{const r=localStorage.getItem(K1);if(!r)return true;return(JSON.parse(r).tr||0)>=(REQ[b.id]||0);}catch(e){return true;}};
const isClient=()=>typeof NET!=='undefined'&&NET.role==='client';

/* ---------- GADŻETY I STAR POWERY ---------- */
const ring=(e,r,dmg,kb,sl)=>{
 G.fx.push({k:'ring',x:e.x,y:e.y,r,t:.4,m:.4,col:'#fff'});
 for(const o of G.ents)if(!o.dead&&o.team!==e.team&&dist(o,e)<r+o.r){hurt(o,dmg,e,Math.atan2(o.y-e.y,o.x-e.x),kb);if(sl)o.slow=sl;}
};
const GD={
 colt:['Szybki magazynek','Natychmiast przeładowuje 3 naboje.',e=>{e.ammo=3;}],
 shelly:['Fala uderzeniowa','Odpycha wrogów w pobliżu i rani ich.',e=>ring(e,170,400,500,0)],
 bull:['Mikstura','Leczy 1800 zdrowia.',e=>heal(e,1800)],
 brock:['Rakietowe buty','Szybszy bieg przez 3 s.',e=>{e.boost=3;}],
 poco:['Leczenie','Leczy Ciebie i sojuszników w pobliżu o 1200.',e=>{for(const o of G.ents)if(o.team===e.team&&!o.dead&&dist(o,e)<280)heal(o,1200);G.fx.push({k:'ring',x:e.x,y:e.y,r:280,t:.5,m:.5,col:'#7dff7d'});}],
 leon:['Sprint','Bardzo szybki bieg przez 4 s.',e=>{e.boost=4;}],
 crow:['Trucizna spowalniająca','Spowalnia wrogów w pobliżu na 3 s.',e=>ring(e,260,0,0,3)],
 spike:['Popcorn','Rani i spowalnia wrogów wokół.',e=>ring(e,200,500,0,1.5)],
 dynamike:['Granat','Wybuch przy sobie, rani i odrzuca wrogów.',e=>boom(e.x,e.y,120,900,e,e.team)]
};
const SPD={
 colt:['Magnum','+15% obrażeń.'],
 shelly:['Plasterek','Raz na życie leczy 1500, gdy zdrowie spadnie poniżej 40%.'],
 bull:['Szał','+20% prędkości, gdy masz mniej niż połowę zdrowia.'],
 brock:['Szybkie ładowanie','Amunicja ładuje się o 25% szybciej.'],
 poco:['Regeneracja','Odnawia 3% zdrowia na sekundę.'],
 leon:['Lekkie stopy','+8% prędkości.'],
 crow:['Mocna trucizna','Trucizna działa 5 s zamiast 3 s.'],
 spike:['Twarda skóra','Otrzymujesz o 12% mniej obrażeń.'],
 dynamike:['Burzyciel','+20% obrażeń.']
};

/* ---------- POZIOMY: nowe encje ---------- */
const _mk=mkEnt;
mkEnt=function(team,i,bi,human){
 const e=_mk(team,i,bi,human),id=e.d.id;
 const L=human?lvOf(id):Math.max(1,Math.min(MAXL,lvOf(BR[sel].id)+((Math.random()*3|0)-1)));
 e.lv=L;e.dm=1+.07*(L-1);e.max=e.hp=Math.round(e.d.hp*e.dm);
 e.gd=0;e.hasG=false;e.sp=null;
 if(human){
  if(SV.s[id]&&L>=SREQ)e.sp=id;
  if(SV.g[id]&&L>=GREQ&&GD[id]){e.hasG=true;e.gd=3;}
 }
 return e;
};

/* ---------- OBRAŻENIA I STAR POWERY ---------- */
const _h=hurt;
hurt=function(e,dmg,src,ang,kb){
 if(src&&src.dm)dmg*=src.dm;
 if(src&&src.sp==='colt')dmg*=1.15;
 if(src&&src.sp==='dynamike')dmg*=1.2;
 if(e.sp==='spike')dmg*=.88;
 _h.call(this,e,dmg,src,ang,kb);
 if(e.dead)return;
 if(e.sp==='shelly'&&!e.band&&e.hp<e.max*.4){e.band=1;heal(e,1500);}
 if(src&&src.sp==='crow'&&e.pz>0)e.pz=5;
};
const _rsp=respawn;
respawn=function(e){_rsp(e);e.band=0;};
const _st=step;
step=function(e,mx,my,dt){
 let m=1;
 if(e.boost>0)m*=1.4;
 if(e.sp==='bull'&&e.hp<e.max*.5)m*=1.2;
 if(e.sp==='leon')m*=1.08;
 _st(e,mx*m,my*m,dt);
};
const _upd=update;
update=function(dt){
 _upd(dt);
 if(!G||G.over||G.count>0||isClient())return;
 for(const e of G.ents){
  if(e.dead)continue;
  if(e.boost>0)e.boost-=dt;
  if(e.gcd>0)e.gcd-=dt;
  if(e.sp==='brock')e.ammo=Math.min(3,e.ammo+dt/e.d.reload*.25);
  if(e.sp==='poco'&&e.hp<e.max)e.hp=Math.min(e.max,e.hp+e.max*.03*dt);
 }
};

/* ---------- UŻYCIE GADŻETU ---------- */
function useG(){
 if(!G||!P||state!=='play'||G.count>0||G.over||P.dead||!P.hasG||P.gd<=0||P.gcd>0||isClient())return;
 const g=GD[P.d.id];if(!g)return;
 g[2](P);P.gd--;P.gcd=1;sfx(500,.25,'triangle',.06,300);
}
let mouseOn=false;
const gb=()=>({x:btn.sx-btn.sr*2.4,y:btn.sy+btn.sr*.1,r:btn.sr*.8});
window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')mouseOn=true;},true);
window.addEventListener('pointerdown',e=>{
 mouseOn=e.pointerType==='mouse';
 if(e.target!==cv||state!=='play'||!G||!P||mouseOn||!P.hasG)return;
 const b=gb();
 if(Math.hypot(e.clientX-b.x,e.clientY-b.y)<b.r+8){e.preventDefault();e.stopImmediatePropagation();useG();}
},true);
window.addEventListener('keydown',e=>{
 if(e.target&&e.target.tagName==='INPUT')return;
 if(e.key.toLowerCase()==='q'&&!e.repeat)useG();
},true);
const _dc=drawControls;
drawControls=function(){
 _dc.apply(this,arguments);
 if(!G||!P||G.over||!P.hasG)return;
 if(mouseOn){tx(ctx,'Q: gadżet ('+P.gd+')',W-72,H-34,12,P.gd>0?'#8aff56':'#aaa');return;}
 const b=gb(),on=P.gd>0;
 ctx.fillStyle=on?'#4cd964':'#5a4f7a';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();
 ctx.lineWidth=4;ctx.strokeStyle='#14102b';ctx.stroke();
 ctx.font=(b.r*1.1)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';ctx.fillText('⚙️',b.x,b.y+2);
 tx(ctx,''+P.gd,b.x+b.r*.75,b.y+b.r*.75,14);
};

/* ---------- STYLE I TOAST ---------- */
const stl=document.createElement('style');
stl.textContent='#menu #mp{height:19vh}#upcards{flex:1.25;display:grid;grid-template-columns:repeat(5,1fr);gap:1vh;align-content:start}#upinfo{background:rgba(0,0,0,.4);border:3px solid #14102b;border-radius:12px;padding:1vh 1.4vh;font:700 min(3.2vh,13px)/1.3 Arial,sans-serif}#upinfo .nm{font:900 min(5.5vh,22px) "Arial Black",Impact,sans-serif;color:#ffd93b}.ub{font-size:min(3.6vh,14px)!important;padding:.15em .7em!important;margin:.4vh 0}.lvb{position:absolute;top:2px;left:4px;font-size:min(3vh,11px);color:#ffd93b;text-shadow:1px 1px 0 #14102b}';
document.head.appendChild(stl);
const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:85;background:rgba(0,0,0,.85);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2000);}

/* ---------- EKRAN ULEPSZEŃ ---------- */
const up=document.createElement('div');up.id='up';up.className='screen glow';
up.innerHTML='<div class="bar"><button class="btn red small" id="upback">◀</button><div class="h2 ol">ULEPSZENIA</div><div class="h2 ol" id="upcoins" style="margin-left:auto"></div></div><div class="wrap"><div id="upcards"></div><div class="side"><div id="upinfo"></div></div></div>';
document.body.appendChild(up);
let us=0;
function renderUp(){
 $('#upcoins').textContent='🪙 '+SV.coins;
 const box=$('#upcards');box.innerHTML='';
 BR.forEach((b,i)=>{
  const d=document.createElement('div');d.className='card'+(i===us?' sel':'');d.style.position='relative';
  d.innerHTML='<canvas width="96" height="96"></canvas><div>'+b.name+'</div><div style="color:#ffd93b">'+(open(b)?'Lv '+lvOf(b.id):'🔒')+'</div>';
  drawBrawler(d.querySelector('canvas').getContext('2d'),48,54,b,.4,{s:1.55});
  d.onclick=()=>{us=i;renderUp();};box.appendChild(d);
 });
 const b=BR[us],id=b.id,L=lvOf(id),info=$('#upinfo');
 if(!open(b)){info.innerHTML='<div class="nm">'+b.name+'</div>Postać zablokowana. Odblokuj ją w Alei Pucharów.';return;}
 const hp=Math.round(b.hp*(1+.07*(L-1))),pc=(L-1)*7;
 let h='<div class="nm">'+b.name+' <span style="font-size:.5em;color:#fff">Poziom '+L+'/'+MAXL+'</span></div>❤ '+hp+' • obrażenia +'+pc+'%<br>';
 h+=L<MAXL?'<button class="btn green small ub" id="bUp">ULEPSZ 🪙'+UP[L-1]+'</button>':'<b style="color:#7dff7d">MAKSYMALNY POZIOM</b>';
 const g=GD[id]||['Brak gadżetu','Wkrótce.',()=>{}],s=SPD[id]||['Brak star powera','Wkrótce.'];
 const hasG=!!GD[id],hasS=!!SPD[id];
 h+='<br><b style="color:#8aff56">GADŻET:</b> '+g[0]+' – '+g[1]+'<br>';
 h+=!hasG?'<span style="color:#aaa">Niedostępny</span>':SV.g[id]?'<b style="color:#7dff7d">✔ Posiadany</b>':(L>=GREQ?'<button class="btn blue small ub" id="bG">KUP 🪙'+GC+'</button>':'<span style="color:#ffd93b">Wymaga poziomu '+GREQ+'</span>');
 h+='<br><b style="color:#ffd93b">STAR POWER:</b> '+s[0]+' – '+s[1]+'<br>';
 h+=!hasS?'<span style="color:#aaa">Niedostępny</span>':SV.s[id]?'<b style="color:#7dff7d">✔ Posiadany</b>':(L>=SREQ?'<button class="btn blue small ub" id="bS">KUP 🪙'+SC+'</button>':'<span style="color:#ffd93b">Wymaga poziomu '+SREQ+'</span>');
 info.innerHTML=h;
 const buy=(cost,fn)=>{if(SV.coins<cost){toast('Za mało monet! Masz 🪙'+SV.coins);return;}SV.coins-=cost;fn();save();refresh();renderUp();};
 const bu=$('#bUp');if(bu)bu.onclick=()=>buy(UP[L-1],()=>{SV.lv[id]=L+1;});
 const bg=$('#bG');if(bg)bg.onclick=()=>buy(GC,()=>{SV.g[id]=1;});
 const bs=$('#bS');if(bs)bs.onclick=()=>buy(SC,()=>{SV.s[id]=1;});
}
const ubtn=document.createElement('button');ubtn.className='btn blue small';
$('#play').after(ubtn);
function refresh(){ubtn.textContent='⭐ ULEPSZENIA 🪙'+SV.coins;}
ubtn.onclick=()=>{us=sel;renderUp();state='select';show('up');};
$('#upback').onclick=()=>{state='menu';refresh();show('menu');};
refresh();

/* ---------- ZNACZNIKI POZIOMU NA WYBORZE POSTACI ---------- */
const _bs=buildSelect;
buildSelect=function(){
 _bs.apply(this,arguments);
 const cs=$('#cards').children;
 BR.forEach((b,i)=>{
  const c=cs[i];if(!c||!open(b))return;
  c.style.position='relative';
  const l=document.createElement('div');l.className='lvb';l.textContent='Lv'+lvOf(b.id);c.appendChild(l);
 });
};
buildSelect();

/* ---------- MONETY PO MECZU ---------- */
const cel=document.createElement('div');cel.className='sub ol';cel.style.cssText='color:#ffd93b;text-align:center';
$('#rs').after(cel);
const CS=[40,25,15,8,5,5,5,5,5,5,5,5];
function award(){
 if(!G||!P||G.awarded2)return;G.awarded2=true;
 let n;
 if(G.sd)n=CS[Math.max(1,Math.min(CS.length,G.place|0))-1];
 else n=G.winner===-1?12:(G.winner===P.team?30:8);
 SV.coins+=n;save();refresh();
 cel.innerHTML='🪙 +'+n+' monet (razem '+SV.coins+')';
}
const _sr=showResult;
showResult=function(){cel.innerHTML='';_sr.apply(this,arguments);try{award();}catch(e){}};
window.__COIN={get:()=>SV.coins,add:n=>{SV.coins+=n;save();refresh();}};
})();
