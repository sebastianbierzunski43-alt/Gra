(function(){
if(window.__p33)return;window.__p33=1;
const KS='brawlTrRoad1',K1='brawlArenaSave1',K3='brawlArenaSave3';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const REQ={poco:16,bull:40,pam:60,brock:80,rico:100,leon:130,piper:150,crow:190,primo:200,kostka:250,spike:260,dynamike:350};
const SKN=['','Złoty','Neon','Mroczny','Cukierkowy','Lodowy'];
const R=[
{t:10,c:50},{t:20,p:500},{t:30,c:80},{t:50,e:'🔥'},{t:70,c:100},{t:90,p:500},{t:120,c:120},
{t:160,s:['colt',1]},{t:180,c:150},{t:220,p:1000},{t:240,c:150},{t:280,e:'💀'},{t:300,c:200},
{t:330,p:1000},{t:380,s:['shelly',2]},{t:420,c:250},{t:460,c:250},{t:500,p:1500},{t:550,e:'🤡'},
{t:600,c:300},{t:700,s:['leon',3]},{t:800,c:400},{t:900,p:1500},{t:1000,s:['bull',5]},{t:1100,c:500},
{t:1250,e:'🥳'},{t:1400,c:500},{t:1600,p:2000},{t:1800,s:['poco',4]},{t:2000,c:800},{t:2200,c:800},
{t:2400,e:'💎'},{t:2600,s:['crow',5]},{t:2800,c:1000},{t:3000,p:3000},{t:3250,c:1000},
{t:3500,s:['spike',3]},{t:3750,e:'🏆'},{t:4000,c:1500},{t:4250,s:['pam',2]},{t:4500,c:2000},
{t:4750,s:['rico',5]},{t:5000,c:3000,s:['dynamike',1]}
];
const nodes=[];
R.forEach((r,i)=>{
 const n=Object.assign({},r,{k:'r'+i});
 if(n.s&&!BR.some(b=>b.id===n.s[0])){delete n.s;n.c=(n.c||0)+200;}
 nodes.push(n);
});
Object.keys(REQ).forEach(id=>{if(BR.some(b=>b.id===id))nodes.push({t:REQ[id],b:id,k:'b'+id});});
nodes.sort((a,b)=>a.t-b.t||(a.b?-1:1));
let CL=jget(KS,{});
const save=()=>{try{localStorage.setItem(KS,JSON.stringify(CL));}catch(e){}};
const cheat=()=>localStorage.getItem('brawlCheatOn')==='1';
const tr=()=>jget(K1,{}).tr||0;

const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:210;background:rgba(0,0,0,.88);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center;max-width:80vw';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2600);}

const st=document.createElement('style');
st.textContent='#t2list{display:flex;gap:10px;width:100%;max-width:960px;overflow-x:auto;padding:10px 4px 14px;-webkit-overflow-scrolling:touch}'+
'.t2c{flex:none;width:min(24vh,104px);border:4px solid #14102b;border-radius:14px;background:linear-gradient(#4d7bff,#25409e);display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 4px 6px;text-align:center;text-shadow:1px 1px 0 #14102b;cursor:pointer;overflow:hidden}'+
'.t2c.lk{filter:grayscale(.85) brightness(.7)}.t2c.dn{background:linear-gradient(#3a9a4a,#1f5a2a)}'+
'.t2c.can{background:linear-gradient(#ffd93b,#ff9a1f);color:#14102b;text-shadow:none;animation:t2p 1.4s infinite}'+
'@keyframes t2p{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}'+
'.t2s{width:calc(100% + 8px);height:10px;background:#14102b;margin:0 -4px}.t2s i{display:block;height:100%;background:linear-gradient(#ffe27a,#ffb12a)}'+
'.t2t{font:900 min(3.8vh,14px) "Arial Black",Impact,sans-serif}'+
'.t2r{min-height:min(15vh,70px);display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 min(3.4vh,12px)/1.25 Arial,sans-serif;gap:2px}'+
'.t2r canvas{width:min(12vh,56px);height:min(12vh,56px)}.t2e{font-size:min(8vh,34px)}'+
'.t2b{font:900 min(3vh,11px) Arial,sans-serif}';
document.head.appendChild(st);

const sc=document.createElement('div');sc.id='tr2';sc.className='screen glow';
sc.style.justifyContent='flex-start';
sc.innerHTML='<div class="bar"><button class="btn red small" id="t2back">◀</button><div class="h2 ol">ALEJA PUCHARÓW</div><div class="h2 ol" id="t2tot" style="margin-left:auto"></div></div>'+
'<div class="sub ol" id="t2nx" style="text-align:center;font-size:min(3.8vh,14px)"></div><div id="t2list"></div><button class="btn green small" id="t2all">ODBIERZ WSZYSTKO</button>';
document.body.appendChild(sc);
sc.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
const q=id=>document.getElementById(id);

function lbl(n){
 const a=[];
 if(n.c)a.push('🪙 '+n.c);
 if(n.p)a.push('🎫 '+n.p+' pkt');
 if(n.e)a.push('Emotka '+n.e);
 if(n.s){const b=BR.find(x=>x.id===n.s[0]);a.push('🎨 '+(b?b.name:n.s[0])+' ('+SKN[n.s[1]]+')');}
 return a.join(' + ');
}
function el(t,cls,txt,par){const x=document.createElement(t);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;if(par)par.appendChild(x);return x;}

function render(){
 if(!sc.classList.contains('on'))return;
 const T=tr(),box=q('t2list');box.innerHTML='';
 q('t2tot').textContent='🏆 '+T;
 let prev=0,focus=null,can=0,nextN=null;
 nodes.forEach(n=>{
  const reached=T>=n.t,done=n.b?reached:!!CL[n.k],cn=!n.b&&!done&&reached;
  if(cn)can++;
  if(!reached&&!nextN&&!n.b)nextN=n;
  const d=el('div','t2c'+(cn?' can':'')+(done?' dn':'')+(!reached?' lk':''));
  const s=el('div','t2s',undefined,d),f=el('i','',undefined,s);
  f.style.width=Math.round(Math.max(0,Math.min(1,(T-prev)/Math.max(1,n.t-prev)))*100)+'%';
  el('div','t2t','🏆 '+n.t,d);
  const r=el('div','t2r',undefined,d);
  if(n.b){
   const b=BR.find(x=>x.id===n.b),c=document.createElement('canvas');c.width=96;c.height=96;r.appendChild(c);
   try{drawBrawler(c.getContext('2d'),48,54,b,.4,{s:1.55});}catch(e){}
   el('div','',b.name,r);
  }else{
   if(n.e)el('div','t2e',n.e,r);
   el('div','',lbl(n),r);
  }
  el('div','t2b',n.b?(reached?'🔓 ODBLOKOWANA':'🔒 POSTAĆ'):done?'✔ ODEBRANO':cn?'ODBIERZ':'🔒',d);
  d.onclick=()=>{if(n.b)toast(reached?n.b.toUpperCase()+' jest odblokowana':'Postać odblokuje się przy '+n.t+' 🏆');else one(n);};
  box.appendChild(d);
  if(cn&&!focus)focus=d;
  if(reached&&!cn)focus=focus||null;
  prev=n.t;
 });
 if(!focus){const kids=[...box.children];let last=null;nodes.forEach((n,i)=>{if(T>=n.t)last=kids[i];});focus=last||kids[0];}
 setTimeout(()=>{try{box.scrollLeft=Math.max(0,focus.offsetLeft-box.clientWidth/2+focus.offsetWidth/2);}catch(e){}},0);
 q('t2nx').textContent=nextN?'Następna nagroda za '+(nextN.t-T)+' 🏆: '+lbl(nextN):'Zdobyłeś wszystkie nagrody drogi!';
 q('t2all').textContent='ODBIERZ WSZYSTKO'+(can?' ('+can+')':'');
}

function claim(n){
 if(n.b||CL[n.k])return false;
 if(tr()<n.t){toast('Potrzeba '+n.t+' 🏆');return false;}
 if(cheat()){toast('Wyłącz kod Quorek, żeby odbierać nagrody');return false;}
 if(n.c&&!window.__COIN){toast('Brakuje linijki window.__COIN w pack4.js');return false;}
 if(n.p&&!window.__PASS){toast('Brakuje pack12.js (karnet)');return false;}
 if(n.c)window.__COIN.add(n.c);
 if(n.p)window.__PASS.add(n.p);
 let rl=false;
 if(n.e||n.s){
  const o=jget(K3,{});o.own=o.own||{};o.pins=o.pins||[];
  if(n.s){const a=o.own[n.s[0]]=o.own[n.s[0]]||[];if(!a.includes(n.s[1]))a.push(n.s[1]);}
  if(n.e&&!o.pins.includes(n.e))o.pins.push(n.e);
  try{localStorage.setItem(K3,JSON.stringify(o));}catch(e){}
  rl=true;
 }
 CL[n.k]=1;save();
 return rl?'reload':true;
}
function one(n){
 const x=claim(n);
 if(x==='reload'){alert('Nagroda odebrana! Gra się teraz odświeży.');location.reload();}
 else if(x){toast('Odebrano: '+lbl(n));render();}
}
q('t2all').onclick=()=>{
 let any=false,rl=false;
 nodes.forEach(n=>{if(!n.b&&tr()>=n.t&&!CL[n.k]){const x=claim(n);if(x)any=true;if(x==='reload')rl=true;}});
 if(rl){alert('Nagrody odebrane! Gra się teraz odświeży.');location.reload();return;}
 toast(any?'Odebrano wszystkie nagrody!':'Brak nagród do odebrania');render();
};
q('t2back').onclick=()=>{state='menu';show('menu');};

const btn=[...document.querySelectorAll('button')].find(b=>/ALEJA/.test(b.textContent));
if(btn)btn.onclick=()=>{state='select';show('tr2');render();};
})();
