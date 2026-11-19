(function(){
if(window.__p20)return;window.__p20=1;
const SB_URL='https://qexlzzrnkeojwknjqcxi.supabase.co/rest/v1/';
const SB_KEY='sb_publishable_5N8zXgzGj6Z74itV7gKmnA_LO3SkCaj';
const KA='qAuth1',KP='brawlPreImport';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const cheat=()=>localStorage.getItem('brawlCheatOn')==='1';
const okKey=k=>/^brawl/.test(k)&&!/^brawlCheat/.test(k)&&k!=='brawlClubChat1'&&k!==KP&&k!=='brawlQidLast'&&k!=='brawlPreImport';
let A=jget(KA,null);
const saveA=()=>{try{if(A)localStorage.setItem(KA,JSON.stringify(A));else localStorage.removeItem(KA);}catch(e){}};
const cfg=()=>/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SB_URL)&&SB_KEY.length>20;

const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:170;background:rgba(0,0,0,.88);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center;max-width:80vw';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},3200);}
function tr(m){
 m=String(m||'');
 if(/Invalid login/i.test(m))return 'Zły email lub hasło';
 if(/already registered|already been registered/i.test(m))return 'Konto z tym emailem już istnieje';
 if(/not confirmed/i.test(m))return 'Potwierdź email (link w mailu)';
 if(/at least 6|too short|weak/i.test(m))return 'Hasło musi mieć min. 6 znaków';
 if(/valid email|invalid format|Unable to validate email/i.test(m))return 'Nieprawidłowy email';
 if(/rate limit|too many/i.test(m))return 'Za dużo prób, poczekaj chwilę';
 if(/Failed to fetch|Load failed|NetworkError/i.test(m))return 'Brak połączenia z serwerem';
 return m||'Błąd';
}
const hdr=t=>{const h={'apikey':SB_KEY,'Content-Type':'application/json'};if(t)h['Authorization']='Bearer '+t;return h;};
async function api(path,opt){
 const r=await fetch(SB_URL+path,opt);
 let j=null;try{j=await r.json();}catch(e){}
 if(!r.ok)throw new Error((j&&(j.msg||j.error_description||j.message||j.error))||('HTTP '+r.status));
 return j;
}
function setSession(j){
 A={at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,email:(j.user&&j.user.email)||(A&&A.email)||'',uid:(j.user&&j.user.id)||(A&&A.uid)||''};
 saveA();
}
async function tok(){
 if(!A)return null;
 if(Date.now()>A.exp-60000){
  try{setSession(await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:hdr(),body:JSON.stringify({refresh_token:A.rt})}));}
  catch(e){A=null;saveA();return null;}
 }
 return A.at;
}

/* ---------- ZAPIS ---------- */
function pack(){
 const o={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(okKey(k))o[k]=localStorage.getItem(k);}
 return JSON.stringify({v:1,d:o});
}
async function getCloud(){
 const t=await tok();if(!t)throw new Error('Wylogowano');
 const r=await api('/rest/v1/saves?select=data,updated_at&limit=1',{headers:hdr(t)});
 return Array.isArray(r)&&r[0]?r[0]:null;
}
let last='',lastT=0;
async function put(s){
 if(cheat())throw new Error('Wyłącz najpierw kod Quorek');
 const t=await tok();if(!t)throw new Error('Wylogowano');
 s=s||pack();
 await api('/rest/v1/saves?on_conflict=user_id',{method:'POST',headers:Object.assign(hdr(t),{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({user_id:A.uid,data:s,updated_at:new Date().toISOString()})});
 last=s;lastT=Date.now();
}
function applyStr(str){
 let o;try{o=JSON.parse(str);}catch(e){return toast('Uszkodzony zapis');}
 if(!o||!o.d||typeof o.d!=='object')return toast('Uszkodzony zapis');
 try{localStorage.setItem(KP,pack());}catch(e){}
 for(const k in o.d)if(okKey(k)&&typeof o.d[k]==='string'){try{localStorage.setItem(k,o.d[k]);}catch(e){}}
 location.reload();
}
function autosave(){
 if(!A||cheat())return;
 const s=pack();if(s===last)return;
 put(s).catch(()=>{});
}
setInterval(autosave,120000);
const _sr=showResult;
showResult=function(){_sr.apply(this,arguments);setTimeout(autosave,2500);};

/* ---------- EKRAN ---------- */
const sc=document.createElement('div');sc.id='acc';sc.className='screen glow';
sc.style.justifyContent='flex-start';
sc.innerHTML='<div class="bar"><button class="btn red small" id="aback">◀</button><div class="h2 ol">KONTO QUOREK</div></div><div id="abody" style="width:100%;max-width:520px;display:flex;flex-direction:column;gap:8px;overflow:auto;max-height:84vh"></div>';
document.body.appendChild(sc);
sc.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
const body=()=>document.getElementById('abody');
function el(t,css,txt,par){const x=document.createElement(t);if(css)x.style.cssText=css;if(txt)x.textContent=txt;(par||body()).appendChild(x);return x;}
function inp(type,ph,ac){
 const i=el('input','font:inherit;font-size:18px;border-radius:10px;border:4px solid #14102b;padding:6px 10px;-webkit-user-select:text;user-select:text');
 i.type=type;i.placeholder=ph;i.autocomplete=ac;i.autocapitalize='none';i.spellcheck=false;
 ['keydown','keyup'].forEach(ev=>i.addEventListener(ev,e=>e.stopPropagation()));
 return i;
}
let busy=false;
function bt(txt,cls,fn){
 const b=el('button','font-size:min(4vh,15px);padding:.25em .6em;border-bottom-width:5px',txt);
 b.className='btn small '+cls;
 b.onclick=async()=>{
  if(busy)return;busy=true;b.style.opacity=.6;
  try{await fn();}catch(e){toast(tr(e.message));}
  busy=false;b.style.opacity=1;
 };
 return b;
}
const TXT='font:700 min(3.8vh,15px) Arial,sans-serif;color:#fff;text-shadow:1px 1px 0 #14102b';

function render(){
 if(!sc.classList.contains('on'))return;
 body().innerHTML='';
 if(!cfg()){
  el('div',TXT,'Brak konfiguracji serwera. Wpisz Project URL i klucz anon na górze pliku pack20.js.');
  return;
 }
 if(!A){
  el('div',TXT,'Zaloguj się lub załóż konto, żeby Twój postęp zapisywał się w chmurze.');
  const em=inp('email','Email','email'),pw=inp('password','Hasło (min. 6 znaków)','current-password');
  bt('ZALOGUJ','green',async()=>{
   const e=em.value.trim(),p=pw.value;
   if(!e||!p)throw new Error('Wpisz email i hasło');
   setSession(await api('/auth/v1/token?grant_type=password',{method:'POST',headers:hdr(),body:JSON.stringify({email:e,password:p})}));
   await afterLogin();
  });
  bt('ZAŁÓŻ KONTO','blue',async()=>{
   const e=em.value.trim(),p=pw.value;
   if(!e||!p)throw new Error('Wpisz email i hasło');
   if(p.length<6)throw new Error('Hasło musi mieć min. 6 znaków');
   const j=await api('/auth/v1/signup',{method:'POST',headers:hdr(),body:JSON.stringify({email:e,password:p})});
   if(j&&j.access_token){setSession(j);await put();toast('Konto założone, postęp zapisany');render();}
   else toast('Sprawdź email i potwierdź konto, potem zaloguj się');
  });
  bt('NIE PAMIĘTAM HASŁA','blue',async()=>{
   const e=em.value.trim();
   if(!e)throw new Error('Wpisz email');
   await api('/auth/v1/recover',{method:'POST',headers:hdr(),body:JSON.stringify({email:e})});
   toast('Wysłano link do zmiany hasła na '+e);
  });
 }else{
  el('div',TXT+';font-size:min(4.4vh,17px)','Zalogowano: '+A.email);
  el('div',TXT+';opacity:.85',lastT?'Ostatni zapis: '+new Date(lastT).toLocaleTimeString():'Zapis automatyczny po każdym meczu.');
  bt('☁️ ZAPISZ TERAZ','green',async()=>{await put();toast('Zapisano w chmurze');render();});
  bt('⬇️ POBIERZ Z CHMURY','blue',async()=>{
   const c=await getCloud();
   if(!c)return toast('W chmurze nie ma jeszcze zapisu');
   if(confirm('Wczytać zapis z chmury ('+new Date(c.updated_at).toLocaleString()+')? Dane na tym telefonie zostaną zastąpione (zostanie kopia awaryjna).'))applyStr(c.data);
  });
  bt('WYLOGUJ','red',async()=>{A=null;saveA();toast('Wylogowano');render();});
  el('div',TXT+';font-size:min(3vh,11px);opacity:.75','Gdy grasz na dwóch telefonach, wygrywa ostatni zapis. Hasło trzyma serwer Supabase, nie gra.');
 }
}
async function afterLogin(){
 const c=await getCloud();
 if(c){
  if(confirm('W chmurze jest zapis z '+new Date(c.updated_at).toLocaleString()+'.\nOK = wczytaj go (zastąpi dane na tym telefonie, zrobię kopię awaryjną).\nAnuluj = zostaw dane z tego telefonu.')){applyStr(c.data);return;}
  if(confirm('Nadpisać zapis w chmurze danymi z tego telefonu?'))await put();
 }else{await put();toast('Zalogowano, postęp zapisany w chmurze');}
 render();
}
document.getElementById('aback').onclick=()=>{state='menu';show('menu');};

/* ---------- PRZYCISK W MENU ---------- */
const mb=document.createElement('button');
mb.className='btn blue small tl';mb.textContent='☁️ KONTO';
const ref=[...document.querySelectorAll('#menu .btn')].find(x=>/QUOREK|PROFIL|KARNET|ULEPSZENIA|SKINY|ALEJA/.test(x.textContent));
(ref?ref.parentElement:document.getElementById('menu')).appendChild(mb);
mb.onclick=()=>{state='select';show('acc');render();};

/* ---------- RESET HASŁA Z LINKU W MAILU ---------- */
(function(){
 const h=location.hash;
 if(h.indexOf('type=recovery')<0)return;
 const t=new URLSearchParams(h.slice(1)).get('access_token');
 if(!t)return;
 try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
 setTimeout(async()=>{
  const np=prompt('Nowe hasło (min. 6 znaków):');
  if(!np||np.length<6)return toast('Hasło musi mieć min. 6 znaków');
  try{await api('/auth/v1/user',{method:'PUT',headers:hdr(t),body:JSON.stringify({password:np})});toast('Hasło zmienione. Zaloguj się.');}
  catch(e){toast(tr(e.message));}
 },800);
})();
})();
