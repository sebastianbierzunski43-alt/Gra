(function(){
if(window.__p26)return;window.__p26=1;
const SB_URL='https://yrgtufmvihgpjrfgtdyb.supabase.co';
const SB_KEY='sb_publishable_DVZQDDrMjlL_ZhxtCuMZkQ_S57O0Vej';
const KA='qAdmAuth1';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
let A=jget(KA,null);
const hdr=t=>{const h={'apikey':SB_KEY,'Content-Type':'application/json'};if(t)h['Authorization']='Bearer '+t;return h;};
async function api(path,opt){
 const r=await fetch(SB_URL+path,opt);let j=null;try{j=await r.json();}catch(e){}
 if(!r.ok)throw new Error((j&&(j.msg||j.error_description||j.message||j.error))||('HTTP '+r.status));
 return j;
}
function setS(j){A={at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000};localStorage.setItem(KA,JSON.stringify(A));}
async function tok(){
 if(!A)throw new Error('Zaloguj się');
 if(Date.now()>A.exp-60000){
  try{setS(await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:hdr(),body:JSON.stringify({refresh_token:A.rt})}));}
  catch(e){A=null;localStorage.removeItem(KA);throw new Error('Sesja wygasła, zaloguj się');}
 }
 return A.at;
}
const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:190;background:rgba(0,0,0,.9);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center;max-width:80vw';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},3000);}
function tr(m){
 m=String(m||'');
 if(/Invalid login/i.test(m))return 'Zły email lub hasło';
 if(/row-level|policy|permission|403/i.test(m))return 'Brak uprawnień: to konto nie jest adminem';
 if(/Failed to fetch|Load failed/i.test(m))return 'Brak połączenia z serwerem';
 return m||'Błąd';
}

const sc=document.createElement('div');sc.id='admo';sc.className='screen glow';
sc.style.justifyContent='flex-start';
sc.innerHTML='<div class="bar"><button class="btn red small" id="aoback">◀</button><div class="h2 ol">ADMIN ONLINE</div></div><div id="aobody" style="width:100%;max-width:640px;overflow:auto;max-height:84vh;display:flex;flex-direction:column;gap:10px"></div>';
document.body.appendChild(sc);
sc.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
const body=()=>document.getElementById('aobody');
function el(t,css,txt,par){const x=document.createElement(t);if(css)x.style.cssText=css;if(txt)x.textContent=txt;(par||body()).appendChild(x);return x;}
const TX='font:700 min(3.8vh,15px) Arial,sans-serif;color:#fff;text-shadow:1px 1px 0 #14102b';
function card(title){
 const c=el('div','background:rgba(0,0,0,.38);border:3px solid #14102b;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:6px');
 el('div','font:900 min(4.4vh,17px) "Arial Black",Impact,sans-serif;color:#ffd93b',title,c);return c;
}
function inp(par,ph,type,val){
 const i=el('input','font:inherit;font-size:17px;border-radius:10px;border:4px solid #14102b;padding:5px 9px;-webkit-user-select:text;user-select:text','',par);
 i.placeholder=ph;i.type=type||'text';i.autocomplete='off';i.autocapitalize='none';if(val!==undefined)i.value=val;
 ['keydown','keyup'].forEach(ev=>i.addEventListener(ev,e=>e.stopPropagation()));return i;
}
let busy=false;
function bt(par,txt,cls,fn){
 const b=el('button','font-size:min(3.8vh,14px);padding:.25em .6em;border-bottom-width:5px',txt,par);b.className='btn small '+cls;
 b.onclick=async()=>{if(busy)return;busy=true;b.style.opacity=.6;try{await fn();}catch(e){toast(tr(e.message));}busy=false;b.style.opacity=1;};
 return b;
}

async function render(){
 if(!sc.classList.contains('on'))return;
 body().innerHTML='';
 if(!A){
  const c=card('LOGOWANIE ADMINA');
  const em=inp(c,'Email admina','email'),pw=inp(c,'Hasło','password');
  bt(c,'ZALOGUJ','green',async()=>{
   if(!em.value.trim()||!pw.value)throw new Error('Wpisz email i hasło');
   setS(await api('/auth/v1/token?grant_type=password',{method:'POST',headers:hdr(),body:JSON.stringify({email:em.value.trim(),password:pw.value})}));
   render();
  });
  return;
 }
 const b=card('BAN GRACZA');
 const id=inp(b,'ID gracza (6 znaków)','text');id.maxLength=6;id.style.textTransform='uppercase';
 const rs=inp(b,'Powód','text');
 const hr=inp(b,'Na ile godzin? (0 = bezterminowo)','number','0');
 bt(b,'⛔ ZBANUJ','red',async()=>{
  const q=id.value.trim().toUpperCase();
  if(!/^[A-Z0-9]{6}$/.test(q))throw new Error('ID ma 6 znaków');
  const h=parseFloat(hr.value)||0;
  const until=h>0?new Date(Date.now()+h*3600000).toISOString():null;
  const t=await tok();
  await api('/rest/v1/bans?on_conflict=qid',{method:'POST',headers:Object.assign(hdr(t),{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({qid:q,reason:rs.value.trim().slice(0,100)||null,until})});
  toast('Zbanowano '+q);render();
 });
 const l=card('AKTYWNE BANY');
 try{
  const t=await tok();
  const r=await api('/rest/v1/bans?select=qid,reason,until&order=created_at.desc&limit=50',{headers:hdr(t)});
  if(!r.length)el('div',TX,'Brak banów.',l);
  r.forEach(x=>{
   const row=el('div','display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.3);border-radius:8px;padding:4px 8px',null,l);
   const exp=x.until&&new Date(x.until).getTime()<=Date.now();
   el('div',TX+';flex:1;word-break:break-word',x.qid+' • '+(x.reason||'bez powodu')+' • '+(x.until?'do '+new Date(x.until).toLocaleString():'bezterminowo')+(exp?' (wygasł)':''),row);
   bt(row,'ODBANUJ','green',async()=>{
    const t2=await tok();
    await api('/rest/v1/bans?qid=eq.'+encodeURIComponent(x.qid),{method:'DELETE',headers:hdr(t2)});
    toast('Odbanowano '+x.qid);render();
   });
  });
 }catch(e){el('div',TX,'Nie udało się pobrać: '+tr(e.message),l);}
 const n=card('NAGRODY W 🏆 ZA RUNDĘ');
 let cur={win:8,loss:-4,draw:0,sd:[10,6,3,0,-2,-3,-4,-5,-6,-6,-6,-6]};
 try{
  const r=await api('/rest/v1/settings?key=eq.trophies&select=value&limit=1',{headers:hdr(await tok())});
  if(r&&r[0]&&r[0].value)cur=Object.assign(cur,r[0].value);
 }catch(e){}
 el('div',TX+';font-size:min(3.2vh,12px);opacity:.85','3 vs 3 i inne tryby bez miejsc: wygrana, porażka, remis. Showdown: miejsca 1-12 po przecinku.',n);
 const w=inp(n,'Wygrana (🏆)','number',cur.win),lo=inp(n,'Porażka (🏆, np. -4)','number',cur.loss),d=inp(n,'Remis (🏆)','number',cur.draw);
 const sd=inp(n,'Showdown: miejsca 1-12 po przecinku','text',(cur.sd||[]).join(','));
 bt(n,'💾 ZAPISZ NAGRODY','green',async()=>{
  const arr=sd.value.split(',').map(s=>parseInt(s,10)).filter(v=>isFinite(v));
  if(arr.length<4)throw new Error('Showdown: podaj co najmniej 4 wartości');
  const val={win:parseInt(w.value,10),loss:parseInt(lo.value,10),draw:parseInt(d.value,10),sd:arr.slice(0,12)};
  if(![val.win,val.loss,val.draw].every(isFinite))throw new Error('Wpisz liczby w polach 3v3');
  if(Math.abs(val.win)>100||Math.abs(val.loss)>100||Math.abs(val.draw)>100||arr.some(v=>Math.abs(v)>100))throw new Error('Maksymalnie ±100');
  const t=await tok();
  await api('/rest/v1/settings?on_conflict=key',{method:'POST',headers:Object.assign(hdr(t),{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({key:'trophies',value:val})});
  toast('Zapisano. Gracze pobiorą nagrody w ciągu 10 minut lub po odświeżeniu gry.');
 });
 bt(body(),'WYLOGUJ','blue',async()=>{A=null;localStorage.removeItem(KA);render();});
}

document.getElementById('aoback').onclick=()=>{state='select';show('adm');};
const bar=document.querySelector('#adm .bar');
if(bar){
 const b=document.createElement('button');
 b.className='btn blue small';b.style.marginLeft='auto';b.textContent='🌐 ONLINE';
 b.onclick=()=>{state='select';show('admo');render();};
 bar.appendChild(b);
}
})();
