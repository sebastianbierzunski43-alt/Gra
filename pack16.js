(function(){
if(window.__p16)return;window.__p16=1;
const KF='brawlFriends1',K1='brawlArenaSave1',KC='brawlClub1',PRE='brawl-arena-c-',CS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const BN=['Smyk','Tytan','Cień','Pixel','Rakieta','Kajtek','Zyzio','Burza','Mruk','Fenix','Gruby','Lisek','Orzeł','Wilk','Czaja','Dżem','Kornik','Blask','Szpil','Tornado','Kometa','Ryś','Pancer','Iskra','Mglak','Sokół','Kaktus','Bąbel','Żuk','Zorro'];
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
function F(){
 const f=jget(KF,{});
 if(!f.id||f.id.length!==6)f.id=Array.from({length:6},()=>CS[Math.random()*CS.length|0]).join('');
 if(!f.name)f.name='Gracz'+f.id.slice(-3);
 return f;
}
(function(){const r=jget(KF,{}),f=F();if(r.id!==f.id||r.name!==f.name){r.id=f.id;r.name=f.name;try{localStorage.setItem(KF,JSON.stringify(r));}catch(e){}}})();
const myId=()=>F().id,myName=()=>F().name;
let CL=jget(KC,null);
const saveC=()=>{try{if(CL)localStorage.setItem(KC,JSON.stringify(CL));else localStorage.removeItem(KC);}catch(e){}};
const ON={};

/* ---------- TOAST ---------- */
const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:140;background:rgba(0,0,0,.85);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center;max-width:80vw';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2600);}

/* ---------- POMOCNICZE ---------- */
function norm(c){
 if(!c||typeof c!=='object')return null;
 const owner=String(c.owner||'');
 if(!/^[A-Z0-9]{6}$/.test(owner))return null;
 const ms=(Array.isArray(c.members)?c.members:[]).filter(m=>m&&/^[A-Z0-9]{6}$/.test(String(m.id))).slice(0,30).map(m=>({id:String(m.id),name:String(m.name||'Gracz').slice(0,16)}));
 return{code:owner,name:String(c.name||'Klub').slice(0,10),owner,members:ms};
}
function refreshSelf(){
 if(!CL)return;
 const m=CL.members.find(x=>x.id===myId());
 if(m&&m.name!==myName()){m.name=myName();saveC();}
}
refreshSelf();

/* ---------- POŁĄCZENIE KLUBOWE ---------- */
let pp=null,tries=0;
function rep(c,x){try{c.send(x);}catch(e){}}
function initPP(){
 if(typeof Peer==='undefined'||typeof PCFG==='undefined')return;
 if(pp&&!pp.destroyed&&!pp.disconnected)return;
 try{if(pp)pp.destroy();}catch(e){}
 pp=new Peer(PRE+myId(),PCFG);
 pp.on('open',()=>{tries=0;setTimeout(()=>sync(false),800);});
 pp.on('disconnected',()=>{try{pp.reconnect();}catch(e){}});
 pp.on('error',e=>{
  if(e.type==='unavailable-id'&&tries<6){tries++;setTimeout(()=>{try{pp.destroy();}catch(x){}pp=null;initPP();},5000);}
 });
 pp.on('connection',c=>{
  c.on('data',d=>{
   if(!d||!d.t)return;
   const id=String(d.id||'');
   if(!/^[A-Z0-9]{6}$/.test(id))return;
   const nm=String(d.name||'Gracz').slice(0,16);
   const own=!!CL&&CL.owner===myId();
   if(d.t==='ping')return rep(c,{t:'pong'});
   if(d.t==='join'){
    if(!own)return rep(c,{t:'no',m:'Ten gracz nie ma klubu'});
    if(!CL.members.some(m=>m.id===id)){
     if(CL.members.length>=30)return rep(c,{t:'no',m:'Klub jest pełny'});
     CL.members.push({id,name:nm});saveC();
    }
    drawP();
    return rep(c,{t:'club',club:CL});
   }
   if(d.t==='sync'){
    if(!own)return rep(c,{t:'kicked'});
    const m=CL.members.find(x=>x.id===id);
    if(!m)return rep(c,{t:'kicked'});
    m.name=nm;saveC();
    return rep(c,{t:'club',club:CL});
   }
   if(d.t==='leave'&&own){CL.members=CL.members.filter(x=>x.id!==id);saveC();drawP();}
  });
 });
}
initPP();
setInterval(initPP,15000);

function ask(code,msg,cb,ms){
 if(!pp||!pp.open){cb(null,'Brak połączenia z serwerem');return;}
 let done=false;
 const c=pp.connect(PRE+code);
 const fin=(r,e)=>{if(done)return;done=true;try{c.close();}catch(x){}cb(r,e);};
 c.on('open',()=>{try{c.send(Object.assign({id:myId(),name:myName()},msg));}catch(e){}});
 c.on('data',d=>{if(d)fin(d);});
 c.on('error',()=>fin(null,'Błąd połączenia'));
 setTimeout(()=>fin(null,'Brak odpowiedzi (założyciel musi mieć otwartą grę)'),ms||6000);
}
function sync(manual){
 if(!CL||CL.owner===myId())return;
 ask(CL.owner,{t:'sync'},(d,e)=>{
  if(d&&d.t==='club'){const c2=norm(d.club);if(c2){CL=c2;saveC();if(manual)toast('Lista klubu odświeżona');}}
  else if(d&&d.t==='kicked'){CL=null;saveC();toast('Nie jesteś już w klubie');}
  else if(manual)toast(e||'Nie udało się odświeżyć');
  drawP();
 });
}
setInterval(()=>sync(false),60000);
function pingAll(){
 if(!CL||!pf.classList.contains('on'))return;
 CL.members.forEach(m=>{
  if(m.id===myId())return;
  ask(m.id,{t:'ping'},d=>{ON[m.id]=!!(d&&d.t==='pong');drawP();},4000);
 });
}
setInterval(pingAll,10000);

/* ---------- EKRAN PROFILU ---------- */
const pf=document.createElement('div');pf.id='prof';pf.className='screen glow';
pf.style.justifyContent='flex-start';
pf.innerHTML='<div class="bar"><button class="btn red small" id="pfback">◀</button><div class="h2 ol">PROFIL I KLUB</div></div><div id="pfbody" style="width:100%;max-width:920px;overflow:auto;max-height:84vh;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:flex-start"></div>';
document.body.appendChild(pf);
pf.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
function el(t,css,txt,par){const x=document.createElement(t);if(css)x.style.cssText=css;if(txt)x.textContent=txt;if(par)par.appendChild(x);return x;}
function bt(txt,cls,fn,par){const b=el('button','font-size:min(3.8vh,14px);padding:.2em .6em;border-bottom-width:5px',txt,par);b.className='btn small '+cls;b.onclick=fn;return b;}
function inp(ph,max,up,par){
 const i=el('input','width:8em;font:inherit;font-size:18px;text-align:center;border-radius:10px;border:4px solid #14102b;-webkit-user-select:text;user-select:text'+(up?';text-transform:uppercase':''),'',par);
 i.placeholder=ph;i.maxLength=max;i.autocomplete='off';if(up)i.autocapitalize='characters';return i;
}
const CARD='flex:1 1 280px;min-width:250px;background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:6px';
const HD='font:900 min(5vh,20px) "Arial Black",Impact,sans-serif;color:#ffd93b';
const TX='font:700 min(3.8vh,15px) Arial,sans-serif;color:#fff';
const RW='display:flex;gap:8px;align-items:center;flex-wrap:wrap';

function drawP(){
 if(!pf.classList.contains('on'))return;
 refreshSelf();
 const b=document.getElementById('pfbody');b.innerHTML='';
 /* gracz */
 const a=el('div',CARD,'',b);
 el('div',HD,'GRACZ',a);
 const r1=el('div',RW,'',a);
 el('span',TX,'Nick: '+myName(),r1);
 bt('ZMIEŃ','blue',()=>{
  const n=prompt('Twój nick (max 16 znaków):',myName());
  if(n&&n.trim()){const r=jget(KF,{});r.id=myId();r.name=n.trim().slice(0,16);try{localStorage.setItem(KF,JSON.stringify(r));}catch(e){}location.reload();}
 },r1);
 const r2=el('div',RW,'',a);
 el('span',TX,'ID: '+myId(),r2);
 bt('KOPIUJ','blue',()=>{
  const ok=()=>toast('Skopiowano ID: '+myId());
  try{navigator.clipboard.writeText(myId()).then(ok,()=>prompt('Skopiuj ID:',myId()));}catch(e){prompt('Skopiuj ID:',myId());}
 },r2);
 const S=jget(K1,{});
 el('div',TX,'🏆 '+(S.tr||0)+' • Mecze: '+(S.m||0)+' • Wygrane: '+(S.w||0),a);
 el('div',TX,'Klub: '+(CL?'['+CL.name+']':'brak'),a);
 /* klub */
 const c=el('div',CARD,'',b);
 el('div',HD,'KLUB',c);
 if(!CL){
  el('div',TX,'Nie jesteś w żadnym klubie.',c);
  const q1=el('div',RW,'',c);
  const n=inp('NAZWA KLUBU',10,false,q1);
  bt('ZAŁÓŻ','green',()=>{
   const nm=n.value.trim();
   if(nm.length<2)return toast('Nazwa klubu: 2-10 znaków');
   CL={code:myId(),name:nm,owner:myId(),members:[{id:myId(),name:myName()}]};
   saveC();toast('Klub założony!');drawP();
  },q1);
  const q2=el('div',RW,'',c);
  const k=inp('KOD KLUBU',6,true,q2);
  bt('DOŁĄCZ','blue',()=>{
   const code=k.value.trim().toUpperCase();
   if(!/^[A-Z0-9]{6}$/.test(code))return toast('Kod klubu ma 6 znaków');
   if(code===myId())return toast('To Twoje własne ID');
   toast('Łączenie...');
   ask(code,{t:'join',code},(d,e)=>{
    if(!d)return toast(e||'Nie udało się dołączyć');
    if(d.t==='club'){const c2=norm(d.club);if(c2){CL=c2;saveC();toast('Dołączono do klubu '+c2.name);}else toast('Błędna odpowiedź');}
    else toast(d.m||'Odmowa');
    drawP();
   });
  },q2);
  el('div','font:700 min(3.2vh,12px) Arial,sans-serif;opacity:.8','Kodem klubu jest ID jego założyciela. Założyciel musi mieć włączoną grę.',c);
 }else{
  const own=CL.owner===myId();
  el('div',TX,'['+CL.name+'] • Kod klubu: '+CL.code+(own?' (Ty jesteś założycielem)':''),c);
  const lst=el('div','max-height:30vh;overflow:auto',' ',c);lst.textContent='';
  CL.members.forEach(m=>{
   const r=el('div','display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.3);border-radius:8px;padding:3px 6px;margin-bottom:3px',' ',lst);r.textContent='';
   const on=m.id===myId()||!!ON[m.id];
   el('span','width:12px;height:12px;border-radius:50%;flex:none;background:'+(on?'#4cd964':'#777'),'',r);
   el('div',TX+';flex:1',(m.id===CL.owner?'👑 ':'')+m.name+' ('+m.id+')',r);
   if(own&&m.id!==myId())bt('🗑️','red',()=>{
    if(confirm('Wyrzucić '+m.name+' z klubu?')){CL.members=CL.members.filter(x=>x.id!==m.id);saveC();drawP();}
   },r);
  });
  const r3=el('div',RW,'',c);
  if(own)bt('ROZWIĄŻ KLUB','red',()=>{if(confirm('Rozwiązać klub '+CL.name+'?')){CL=null;saveC();drawP();}},r3);
  else{
   bt('ODŚWIEŻ','blue',()=>sync(true),r3);
   bt('ODEJDŹ','red',()=>{
    if(confirm('Opuścić klub '+CL.name+'?')){const o=CL.owner;ask(o,{t:'leave'},()=>{},3000);CL=null;saveC();drawP();}
   },r3);
  }
 }
}
document.getElementById('pfback').onclick=()=>{state='menu';show('menu');};

/* ---------- PRZYCISK W MENU ---------- */
const mb=document.createElement('button');
mb.className='btn blue small tl';mb.textContent='👤 PROFIL I KLUB';
const ref=[...document.querySelectorAll('#menu .btn')].find(x=>/KARNET|ULEPSZENIA|SKINY|ALEJA/.test(x.textContent));
const par=ref?ref.parentElement:document.getElementById('menu');
par.appendChild(mb);
if(ref){par.style.maxHeight='calc(100% - 20px)';par.style.flexWrap='wrap';par.style.alignContent='flex-start';par.style.columnGap='6px';}
mb.onclick=()=>{state='select';show('prof');drawP();sync(false);pingAll();};

/* ---------- NICKI W GRZE ---------- */
const _mk=mkEnt;
mkEnt=function(team,i,bi,human){
 const e=_mk(team,i,bi,human);
 if(human){e.nick=myName();e.club=CL?CL.name:'';}
 else e.nick=BN[Math.random()*BN.length|0];
 return e;
};
const _de=drawEnt;
drawEnt=function(e){
 _de.apply(this,arguments);
 if(!e||!e.nick||e.dead||!P||!vis(e,P.team))return;
 const s=(e.club?'['+e.club+'] ':'')+e.nick;
 tx(ctx,s,e.x,e.y-e.r*2.3-24,12,e===P?'#8aff56':e.team===P.team?'#9ccaff':'#ff9a9a');
};

/* ---------- NICKI ONLINE ---------- */
setInterval(()=>{
 if(typeof NET==='undefined')return;
 if(NET.role==='host'){
  for(const o of NET.conns){
   if(o._nk)continue;o._nk=1;
   o.c.on('data',d=>{if(d&&d.t==='nick'){o.nick=String(d.n||'').slice(0,14);o.club=String(d.c||'').slice(0,10);}});
  }
  if(G&&G.ents)for(const o of NET.conns){
   if(o.gone||o.slot===undefined||!o.nick)continue;
   const e=G.ents[o.slot];if(e&&e.remote){e.nick=o.nick;e.club=o.club;}
  }
 }
},500);
setInterval(()=>{
 if(typeof NET==='undefined'||!G||!G.ents)return;
 if(NET.role==='host'){
  const a=G.ents.map(e=>[e.nick||'',e.club||'']);
  for(const o of NET.conns)if(!o.gone&&o.c.open)o.c.send({t:'nicks',a});
 }
},2000);
setInterval(()=>{
 if(typeof NET==='undefined'||NET.role!=='client'||!NET.host||!NET.host.open)return;
 if(!NET.host.__nk){
  NET.host.__nk=1;
  NET.host.on('data',d=>{
   if(d&&d.t==='nicks'&&Array.isArray(d.a)&&G&&G.ents)d.a.forEach((x,k)=>{
    const e=G.ents[k];
    if(e&&Array.isArray(x)){e.nick=String(x[0]).slice(0,14);e.club=String(x[1]).slice(0,10);}
   });
  });
 }
 NET.host.send({t:'nick',n:myName(),c:CL?CL.name:''});
},1500);
})();
