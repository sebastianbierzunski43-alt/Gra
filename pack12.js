(function(){
if(window.__p12)return;window.__p12=1;
const KEY='brawlPass1',K3='brawlArenaSave3',PTS=500,PER=1000,MAXL=30;
let SV={pts:0,cl:{}};
try{Object.assign(SV,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
SV.cl=SV.cl||{};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(SV));}catch(e){}};
const lvl=()=>Math.min(MAXL,Math.floor(SV.pts/PER));
const SKN=['','Złoty','Neon','Mroczny','Cukierkowy','Lodowy'];
const R=[
{c:50},{c:50},{e:'🔥'},{c:75},{s:['colt',1]},
{c:75},{e:'💀'},{c:100},{c:100},{s:['shelly',2]},
{c:100},{e:'🤡'},{c:125},{c:125},{s:['leon',3]},
{c:150},{e:'🥳'},{c:150},{c:150},{s:['poco',4]},
{c:200},{e:'💎'},{c:200},{c:200},{s:['crow',5]},
{c:250},{e:'🏆'},{c:250},{c:300},{s:['dynamike',1],c:500}
];

const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:95;background:rgba(0,0,0,.85);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2200);}

/* ---------- EKRAN KARNETU ---------- */
const pn=document.createElement('div');pn.id='pass';pn.className='screen glow';
pn.innerHTML='<div class="bar"><button class="btn red small" id="pback">◀</button><div class="h2 ol">KARNET</div><div class="h2 ol" id="plv" style="margin-left:auto"></div></div>'+
'<div id="pbar" style="width:100%;max-width:920px;height:3.4vh;min-height:14px;background:#14102b;border-radius:10px;border:3px solid #14102b;overflow:hidden"><div id="pfill" style="height:100%;width:0;background:linear-gradient(#ffd93b,#ff9a1f)"></div></div>'+
'<div id="ptxt" class="sub ol" style="text-align:center;font-size:min(3.4vh,13px)"></div>'+
'<div id="plist" style="display:flex;gap:8px;width:100%;max-width:920px;overflow-x:auto;padding:6px 2px;-webkit-overflow-scrolling:touch"></div>'+
'<button class="btn green small" id="pall">ODBIERZ WSZYSTKO</button>';
document.body.appendChild(pn);
pn.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});

function label(r){
 if(r.s){const b=BR.find(x=>x.id===r.s[0]);return '🎨 '+(b?b.name:r.s[0])+'<br>'+SKN[r.s[1]]+(r.c?'<br>+🪙'+r.c:'');}
 if(r.e)return '<span style="font-size:1.8em">'+r.e+'</span><br>Emotka';
 return '<span style="font-size:1.6em">🪙</span><br>'+r.c;
}
function render(){
 const L=lvl(),rem=L>=MAXL?PER:SV.pts%PER;
 $('#plv').textContent='Poziom '+L+'/'+MAXL;
 $('#pfill').style.width=(rem/PER*100)+'%';
 $('#ptxt').textContent=L>=MAXL?'Karnet ukończony!':'Do poziomu '+(L+1)+': '+(PER-rem)+' pkt • Runda = +'+PTS+' pkt';
 const box=$('#plist');box.innerHTML='';
 R.forEach((r,i)=>{
  const n=i+1,done=!!SV.cl[n],can=!done&&L>=n;
  const d=document.createElement('div');
  d.className='card'+(can?' sel':'');
  d.style.cssText='flex:none;width:min(20vh,96px);font-size:min(3.4vh,13px);padding:6px 4px;'+(!done&&!can?'filter:grayscale(.8) brightness(.7);':'');
  d.innerHTML='<div style="color:'+(can?'#14102b':'#ffd93b')+'">Lv '+n+'</div><div style="min-height:7em;display:flex;flex-direction:column;justify-content:center">'+label(r)+'</div><div>'+(done?'✔ ODEBRANO':can?'ODBIERZ':'🔒')+'</div>';
  d.onclick=()=>claim(n);
  box.appendChild(d);
 });
 const cur=box.children[Math.max(0,Math.min(MAXL-1,L))];
 if(cur&&cur.scrollIntoView)setTimeout(()=>{try{box.scrollLeft=Math.max(0,cur.offsetLeft-box.clientWidth/2);}catch(e){}},0);
}
function claim(n,quiet){
 const r=R[n-1];
 if(SV.cl[n])return false;
 if(lvl()<n){if(!quiet)toast('Poziom '+n+' jeszcze zablokowany');return false;}
 if(r.c){
  if(!window.__COIN){toast('Brakuje linijki window.__COIN w pack4.js');return false;}
  window.__COIN.add(r.c);
 }
 let reload=false;
 if(r.s||r.e){
  let o={};try{o=JSON.parse(localStorage.getItem(K3)||'{}')||{};}catch(e){}
  o.own=o.own||{};o.pins=o.pins||[];
  if(r.s){const a=o.own[r.s[0]]=o.own[r.s[0]]||[];if(!a.includes(r.s[1]))a.push(r.s[1]);}
  if(r.e&&!o.pins.includes(r.e))o.pins.push(r.e);
  try{localStorage.setItem(K3,JSON.stringify(o));}catch(e){}
  reload=true;
 }
 SV.cl[n]=1;save();
 return reload?'reload':true;
}
function doClaim(n){
 const x=claim(n);
 if(x==='reload'){alert('Nagroda odebrana! Gra się teraz odświeży.');location.reload();}
 else if(x){toast('Odebrano nagrodę!');render();}
}
function claimAll(){
 let any=false,rl=false;
 for(let n=1;n<=lvl();n++){const x=claim(n,true);if(x)any=true;if(x==='reload')rl=true;}
 if(rl){alert('Nagrody odebrane! Gra się teraz odświeży.');location.reload();return;}
 toast(any?'Odebrano wszystkie nagrody!':'Brak nagród do odebrania');render();
}
$('#pall').onclick=claimAll;
$('#pback').onclick=()=>{state='menu';show('menu');refreshBtn();};
const _c=claim;
claim=null;
window.__PASS={add:n=>{SV.pts+=n;save();refreshBtn();}};
// klikanie kart używa doClaim
document.getElementById('plist').addEventListener('click',()=>{},true);
const _render=render;
render=function(){_render();[...$('#plist').children].forEach((d,i)=>{d.onclick=()=>doClaim(i+1);});};
claim=_c;

/* ---------- PRZYCISK W MENU ---------- */
const mb=document.createElement('button');
mb.className='btn blue small tl';
function refreshBtn(){
 let free=0;for(let n=1;n<=lvl();n++)if(!SV.cl[n])free++;
 mb.textContent='🎫 KARNET Lv'+lvl()+(free?' ('+free+' do odbioru)':'');
}
const ref=[...document.querySelectorAll('#menu .btn')].find(x=>/ULEPSZENIA|SKINY|ALEJA/.test(x.textContent));
(ref?ref.parentElement:$('#menu')).appendChild(mb);
mb.onclick=()=>{render();state='select';show('pass');};
refreshBtn();

/* ---------- PUNKTY PO MECZU ---------- */
const pe=document.createElement('div');pe.className='sub ol';pe.style.cssText='color:#8fd8ff;text-align:center';
$('#rs').after(pe);
const _sr=showResult;
showResult=function(){
 pe.innerHTML='';
 _sr.apply(this,arguments);
 try{
  if(G&&!G.vr&&!G.passd){
   G.passd=true;
   const before=lvl();
   SV.pts=Math.min(MAXL*PER,SV.pts+PTS);save();refreshBtn();
   const after=lvl();
   pe.innerHTML='🎫 +'+PTS+' pkt karnetu'+(after>before?'<br>⬆️ Poziom karnetu '+after+'! Odbierz nagrodę w menu.':'');
  }
 }catch(e){}
};
})();
