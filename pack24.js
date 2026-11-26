(function(){
if(window.__p24)return;window.__p24=1;
const PASS='212121';
const K1='brawlArenaSave1',K2='brawlArenaSave2',K3='brawlArenaSave3',KP='brawlPass1',KF='brawlFriends1';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const jset=(k,o)=>{try{localStorage.setItem(k,JSON.stringify(o));}catch(e){}};
const ALLPINS=['🔥','💀','🤡','🥳','😱','🤬','🥺','💪','🏆','👏','🤝','💎','⭐','❤️','🙏','🤔','😴','🤩','👋','🎉','🧠','👀','💥','🍀'];
let ok=false;
const F={god:false,sup:false,ammo:false,spd:1};

const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:180;background:rgba(0,0,0,.88);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center;max-width:80vw';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2400);}
function num(msg){const v=parseInt(prompt(msg),10);return isFinite(v)?v:null;}

/* ---------- DZIAŁANIA NA ZAPISIE ---------- */
const A={
 coins:()=>{
  const n=num('Ile monet dodać? (może być ujemne)');if(n===null)return;
  if(window.__COIN){window.__COIN.add(n);toast('Monety: '+window.__COIN.get());}
  else{const s=jget(K2,{coins:0});s.coins=(s.coins||0)+n;jset(K2,s);toast('Dodano, odśwież grę');}
  render();
 },
 trophies:()=>{
  const n=num('Ustaw liczbę pucharów:');if(n===null)return;
  const s=jget(K1,{});s.tr=Math.max(0,n);jset(K1,s);location.reload();
 },
 pass:()=>{
  const n=num('Ile punktów karnetu dodać? (1000 = 1 poziom)');if(n===null)return;
  const s=jget(KP,{pts:0,cl:{}});s.pts=Math.max(0,Math.min(30000,(s.pts||0)+n));jset(KP,s);location.reload();
 },
 unlock:()=>{
  const s=jget(K1,{});s.tr=Math.max(s.tr||0,1000);jset(K1,s);location.reload();
 },
 maxall:()=>{
  const s=jget(K2,{coins:100});s.lv=s.lv||{};s.g=s.g||{};s.s=s.s||{};
  BR.forEach(b=>{s.lv[b.id]=7;s.g[b.id]=1;s.s[b.id]=1;});
  jset(K2,s);location.reload();
 },
 cosm:()=>{
  const s=jget(K3,{});s.own=s.own||{};
  BR.forEach(b=>{s.own[b.id]=[1,2,3,4,5];});
  s.pins=ALLPINS.slice();jset(K3,s);location.reload();
 },
 creator:()=>{localStorage.removeItem('brawlCreatorCodes1');toast('Kod twórcy znowu działa');},
 nick:()=>{
  const f=jget(KF,{});
  const n=prompt('Nowy nick (max 16 znaków):',f.name||'');
  if(n&&n.trim()){f.name=n.trim().slice(0,16);jset(KF,f);location.reload();}
 },
 qid:()=>{
  const f=jget(KF,{});
  const n=(prompt('Nowe ID (6 znaków: litery i cyfry):',f.id||'')||'').trim().toUpperCase();
  if(!n)return;
  if(!/^[A-Z0-9]{6}$/.test(n))return toast('ID ma 6 znaków');
  f.id=n;jset(KF,f);location.reload();
 },
 info:()=>{
  const a=jget(K1,{}),b=jget(K2,{}),c=jget(KP,{}),f=jget(KF,{});
  alert('ID: '+f.id+'\nNick: '+f.name+'\nPuchary: '+(a.tr||0)+'\nMecze: '+(a.m||0)+' • Wygrane: '+(a.w||0)+'\nMonety: '+(b.coins||0)+'\nKarnet: '+(c.pts||0)+' pkt\nZnajomi: '+((f.fr||[]).length));
 },
 reset:()=>{
  if(!confirm('Skasować CAŁY postęp na tym telefonie?'))return;
  if(!confirm('Na pewno? Tego nie da się cofnąć.'))return;
  const del=[];
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^brawl/.test(k)||k==='qAuth1'||k==='qAvatar1')del.push(k);}
  del.forEach(k=>localStorage.removeItem(k));
  location.reload();
 }
};

/* ---------- EKRAN ---------- */
const sc=document.createElement('div');sc.id='adm';sc.className='screen glow';
sc.style.justifyContent='flex-start';
sc.innerHTML='<div class="bar"><button class="btn red small" id="admback">◀</button><div class="h2 ol">PANEL ADMINA</div></div><div id="admbody" style="width:100%;max-width:900px;overflow:auto;max-height:84vh;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px"></div>';
document.body.appendChild(sc);
sc.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
const body=()=>document.getElementById('admbody');
function btn(txt,cls,fn){
 const b=document.createElement('button');b.className='btn small '+cls;
 b.style.cssText='font-size:min(3.8vh,14px);padding:.3em .5em;border-bottom-width:5px';
 b.textContent=txt;b.onclick=fn;body().appendChild(b);return b;
}
function render(){
 if(!sc.classList.contains('on'))return;
 body().innerHTML='';
 const coins=window.__COIN?window.__COIN.get():(jget(K2,{}).coins||0);
 btn('🪙 Monety: '+coins+' (dodaj)','green',A.coins);
 btn('🏆 Ustaw puchary','green',A.trophies);
 btn('🎫 Dodaj punkty karnetu','green',A.pass);
 btn('🔓 Odblokuj wszystkie postacie','blue',A.unlock);
 btn('⭐ Poziom 7 + gadżety + star powery','blue',A.maxall);
 btn('🛍️ Wszystkie skiny i emotki','blue',A.cosm);
 btn('🎁 Zeruj czas kodu twórcy','blue',A.creator);
 btn('✏️ Zmień nick','blue',A.nick);
 btn('🆔 Zmień ID','blue',A.qid);
 btn('📋 Podsumowanie zapisu','gray',A.info);
 const t=(l,k)=>btn(l+': '+(F[k]?'WŁ':'WYŁ'),F[k]?'green':'blue',()=>{F[k]=!F[k];render();});
 t('🛡️ Nieśmiertelność','god');t('★ Zawsze pełny super','sup');t('🔫 Nieskończona amunicja','ammo');
 btn('⚡ Prędkość: x'+F.spd,'blue',()=>{
  const v=parseFloat((prompt('Mnożnik prędkości (0.5 - 3):',F.spd)||'').replace(',','.'));
  if(isFinite(v)&&v>=.5&&v<=3){F.spd=v;render();}else toast('Podaj liczbę od 0.5 do 3');
 });
 btn('🗑️ RESET CAŁEGO POSTĘPU','red',A.reset);
}
document.getElementById('admback').onclick=()=>{state='menu';show('menu');};

/* ---------- WEJŚCIE: 5 stuknięć w lewy dolny róg menu ---------- */
const hs=document.createElement('div');
hs.style.cssText='position:absolute;left:0;bottom:0;width:70px;height:70px;z-index:7;';
document.getElementById('menu').appendChild(hs);
let n=0,tm=0;
hs.addEventListener('click',()=>{
 n++;clearTimeout(tm);tm=setTimeout(()=>{n=0;},1800);
 if(n<5)return;n=0;
 if(!ok){
  const p=prompt('Hasło admina:');
  if(p===null)return;
  if(p!==PASS)return alert('Złe hasło');
  ok=true;wb.style.display='';
 }
 state='select';show('adm');render();
});

/* ---------- WYGRAJ MECZ (menu pauzy) ---------- */
const wb=document.createElement('button');
wb.className='btn blue';wb.textContent='🛠️ WYGRAJ MECZ';wb.style.display='none';
const prow=document.querySelector('#pause .row');
if(prow)prow.appendChild(wb);
wb.onclick=()=>{
 if(!G||!P||G.over)return;
 if(typeof NET!=='undefined'&&NET.role!=='solo')return toast('Tylko w grze offline');
 if(G.sd||G.sdc)G.place=1;
 state='play';show(null);
 endGame(P.team);
};

/* ---------- TRYBY W MECZU ---------- */
const _st=step;
step=function(e,mx,my,dt){
 const m=(ok&&e===P)?F.spd:1;
 _st(e,mx*m,my*m,dt);
};
const _u=update;
update=function(dt){
 if(ok&&G&&P&&!G.over&&!(typeof NET!=='undefined'&&NET.role==='client')){
  if(F.god&&!P.dead)P.inv=Math.max(P.inv||0,.3);
  if(F.sup)P.sup=100;
  if(F.ammo)P.ammo=3;
 }
 _u(dt);
};
})();
