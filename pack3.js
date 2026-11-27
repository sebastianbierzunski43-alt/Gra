(function(){
if(window.__p3)return;window.__p3=1;
for(let i=BR.length-1;i>=0;i--)if(BR.findIndex(b=>b.id===BR[i].id)!==i)BR.splice(i,1);

const KEY='brawlArenaSave1';
const REQ={colt:0,shelly:0,poco:16,bull:40,brock:80,leon:130,crow:190,spike:260,dynamike:350,pam:60,rico:100,piper:150,primo:200,kostka:250};
const need=b=>REQ[b.id]||0;
let SV={tr:0,sel:0,arena:0,m:0,w:0};
try{Object.assign(SV,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(SV));}catch(e){}};
const isOpen=i=>!!BR[i]&&SV.tr>=need(BR[i]);

/* ---------- STYLE I TOAST ---------- */
const stl=document.createElement('style');
stl.textContent='.card{position:relative}.lkov{position:absolute;inset:0;background:rgba(10,5,30,.72);border-radius:8px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:min(4vh,16px);pointer-events:none}'+
'#trgrid{display:grid;gap:.8vh;width:100%;max-width:920px}.tn{border:4px solid #14102b;border-radius:12px;background:linear-gradient(#4d7bff,#25409e);text-align:center;padding:2px;font-size:min(2.8vh,10px);text-shadow:1px 1px 0 #14102b}.tn.lk{filter:grayscale(.9) brightness(.6)}.tn.nx{outline:4px solid #ffd93b}.tn canvas{width:100%;aspect-ratio:1;display:block}'+
'#trbar{width:100%;max-width:920px;height:3.4vh;min-height:14px;background:#14102b;border-radius:10px;border:3px solid #14102b;overflow:hidden}#trfill{height:100%;width:0;background:linear-gradient(#ffd93b,#ff9a1f)}#trst{font:700 min(3vh,12px) Arial,sans-serif;opacity:.85;text-align:center}';
document.head.appendChild(stl);
const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:80;background:rgba(0,0,0,.82);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2200);}

/* ---------- BLOKADY NA EKRANIE WYBORU ---------- */
function decorate(){
 const cs=$('#cards').children;
 BR.forEach((b,i)=>{
  const c=cs[i];if(!c||isOpen(i))return;
  const l=document.createElement('div');l.className='lkov';l.innerHTML='🔒<br>🏆'+need(b);c.appendChild(l);
  c.onclick=()=>toast(b.name+': odblokujesz za '+need(b)+' 🏆 (masz '+SV.tr+')');
 });
}
const _bs=buildSelect;
buildSelect=function(){_bs.apply(this,arguments);decorate();SV.sel=sel;SV.arena=arenaSel;save();};
const _sg=startGame;
startGame=function(){if(!isOpen(sel))sel=0;return _sg.apply(this,arguments);};
setInterval(()=>{if(!isOpen(sel)){sel=0;buildSelect();}},500);

const bp=$('#bwpick');
if(bp&&bp.onclick){
 const o=bp.onclick;
 bp.onclick=function(ev){
  const k=[...$('#bwcards').children].findIndex(c=>c.classList.contains('sel'));
  if(k>=0&&!isOpen(k)){toast(BR[k].name+' zablokowany: potrzeba '+need(BR[k])+' 🏆');return;}
  return o.call(this,ev);
 };
}

/* ---------- EKRAN: ALEJA PUCHARÓW ---------- */
const trs=document.createElement('div');trs.id='tr';trs.className='screen glow';
trs.innerHTML='<div class="bar"><button class="btn red small" id="trback">◀</button><div class="h2 ol">ALEJA PUCHARÓW</div><div class="h2 ol" id="trtot" style="margin-left:auto"></div></div>'+
'<div class="sub ol" id="trtxt"></div><div id="trbar"><div id="trfill"></div></div><div id="trgrid"></div><div id="trst"></div>'+
'<button class="btn red small" id="trreset">RESET POSTĘPU</button>';
document.body.appendChild(trs);

function renderTR(){
 $('#trtot').textContent='🏆 '+SV.tr;
 const g=$('#trgrid');g.innerHTML='';g.style.gridTemplateColumns='repeat('+Math.min(BR.length,7)+',1fr)';
 const ord=BR.map((b,i)=>i).sort((a,b)=>need(BR[a])-need(BR[b]));
 let nx=-1;ord.forEach(i=>{if(nx<0&&!isOpen(i))nx=i;});
 ord.forEach(i=>{
  const b=BR[i],u=isOpen(i),d=document.createElement('div');
  d.className='tn'+(u?'':' lk')+(i===nx?' nx':'');
  d.innerHTML='<canvas width="96" height="96"></canvas><div>'+b.name+'</div><div style="color:'+(u?'#7dff7d':'#ffd93b')+'">'+(u?'✔':'🏆'+need(b))+'</div>';
  drawBrawler(d.querySelector('canvas').getContext('2d'),48,54,b,.4,{s:1.55});
  g.appendChild(d);
 });
 let prev=0;ord.forEach(i=>{if(isOpen(i))prev=Math.max(prev,need(BR[i]));});
 if(nx<0){$('#trtxt').textContent='Wszystkie postacie odblokowane!';$('#trfill').style.width='100%';}
 else{
  const nxt=need(BR[nx]),f=Math.max(0,Math.min(1,(SV.tr-prev)/Math.max(1,nxt-prev)));
  $('#trtxt').textContent='Następna: '+BR[nx].name+' za '+(nxt-SV.tr)+' 🏆 (masz '+SV.tr+'/'+nxt+')';
  $('#trfill').style.width=(f*100)+'%';
 }
 $('#trst').textContent='Mecze: '+SV.m+' • Wygrane: '+SV.w;
}
const mbtn=document.createElement('button');mbtn.className='btn blue small';
$('#play').after(mbtn);
function refresh(){mbtn.textContent='🏆 ALEJA PUCHARÓW: '+SV.tr;}
mbtn.onclick=()=>{renderTR();state='select';show('tr');};
$('#trback').onclick=()=>{state='menu';refresh();show('menu');};
$('#trreset').onclick=()=>{
 if(confirm('Zresetować cały postęp i puchary?')){
  SV={tr:0,sel:0,arena:0,m:0,w:0};save();sel=0;arenaSel=0;buildSelect();renderTR();refresh();
 }
};

/* ---------- PUCHARY PO MECZU ---------- */
const rtr=document.createElement('div');rtr.className='sub ol';rtr.style.color='#ffd93b';rtr.style.textAlign='center';
$('#rs').after(rtr);
const DS=[10,6,3,0,-2,-3,-4,-5,-6,-6,-6,-6];
function award(){
 if(!G||!P||G.awarded)return;G.awarded=true;
 let d,win;
 if(G.sd){const T=window.__TR||{},D2=T.sd||DS;const pl=Math.max(1,Math.min(D2.length,G.place|0));d=D2[pl-1];win=pl===1;}
 else{const T=window.__TR||{};d=G.winner===-1?(T.draw||0):(G.winner===P.team?(T.win===undefined?8:T.win):(T.loss===undefined?-4:T.loss));win=G.winner===P.team;}
 const before=SV.tr;SV.tr=Math.max(0,before+d);d=SV.tr-before;
 SV.m++;if(win)SV.w++;
 const nw=BR.filter(b=>need(b)>before&&need(b)<=SV.tr).map(b=>b.name);
 save();refresh();
 rtr.innerHTML='🏆 '+(d>=0?'+':'')+d+' (razem '+SV.tr+')'+(nw.length?'<br>🔓 Nowa postać: '+nw.join(', '):'');
 buildSelect();
}
const _sr=showResult;
showResult=function(){rtr.innerHTML='';_sr.apply(this,arguments);try{award();}catch(e){}};

/* ---------- START: wczytaj zapis ---------- */
if(SV.sel>=0&&SV.sel<BR.length&&isOpen(SV.sel))sel=SV.sel;
if(SV.arena>=0&&SV.arena<ARENAS.length)arenaSel=SV.arena;
refresh();buildSelect();
})();
