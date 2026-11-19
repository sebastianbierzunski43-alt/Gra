(function(){
if(window.__p19)return;window.__p19=1;
const KF='brawlFriends1',KB='brawlQidLast',KP='brawlPreImport',PRE='brawl-arena-q-',CS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const me=()=>jget(KF,{id:'------',name:'Gracz'});
const okKey=k=>/^brawl/.test(k)&&!/^brawlCheat/.test(k)&&k!=='brawlClubChat1'&&k!==KP&&k!==KB;
const cheat=()=>localStorage.getItem('brawlCheatOn')==='1';

function pack(){
 const o={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(okKey(k))o[k]=localStorage.getItem(k);}
 const s=JSON.stringify({v:1,ts:Date.now(),d:o});
 return 'QID1:'+btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g,(m,p)=>String.fromCharCode(parseInt(p,16))));
}
function unpack(str){
 try{
  str=String(str||'').replace(/\s+/g,'');
  if(str.indexOf('QID1:')!==0)return null;
  const b=atob(str.slice(5));
  const j=decodeURIComponent(b.split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  const o=JSON.parse(j);
  if(!o||typeof o.d!=='object'||!o.d)return null;
  return o;
 }catch(e){return null;}
}
function apply(o){
 try{localStorage.setItem(KP,pack());}catch(e){}
 for(const k in o.d){if(okKey(k)&&typeof o.d[k]==='string'){try{localStorage.setItem(k,o.d[k]);}catch(e){}}}
 location.reload();
}

/* ---------- TOAST ---------- */
const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:160;background:rgba(0,0,0,.85);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center;max-width:80vw';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2600);}

/* ---------- EKRAN ---------- */
const sc=document.createElement('div');sc.id='qid';sc.className='screen glow';
sc.style.justifyContent='flex-start';
sc.innerHTML='<div class="bar"><button class="btn red small" id="qback">◀</button><div class="h2 ol">QUOREK ID</div></div>'+
'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%;max-width:900px;overflow:auto;max-height:84vh">'+
'<div style="flex:1 1 260px;min-width:240px;background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:6px">'+
'<div style="font:900 min(5vh,20px) \'Arial Black\',Impact,sans-serif;color:#ffd93b">TWOJE KONTO</div>'+
'<div class="ol" style="font-size:min(6vh,24px)">ID: <b id="qid_id" style="color:#8aff56"></b></div>'+
'<div class="ol" style="font-size:min(3.8vh,15px)">Nick: <b id="qid_nm"></b></div>'+
'<div class="ol" style="font-size:min(3.4vh,13px);opacity:.85" id="qid_lb"></div>'+
'<div class="ol" style="font-size:min(3vh,11px);opacity:.75">To nie konto w chmurze. Postęp jest w tej przeglądarce, więc zrób kopię albo przenieś go na drugi telefon.</div></div>'+
'<div style="flex:1 1 260px;min-width:240px;background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:6px" id="qid_btns"></div>'+
'<div id="qid_box" style="display:none;flex:1 1 100%;background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:12px;padding:8px 10px;flex-direction:column;gap:6px"></div></div>';
document.body.appendChild(sc);
sc.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
const q=id=>document.getElementById(id);

function bt(txt,cls,fn,par){
 const b=document.createElement('button');b.className='btn small '+cls;
 b.style.cssText='font-size:min(3.8vh,14px);padding:.25em .6em;border-bottom-width:5px;width:100%';
 b.textContent=txt;b.onclick=fn;par.appendChild(b);return b;
}
function box(html){const b=q('qid_box');b.style.display='flex';b.innerHTML='';return b;}
function line(par,txt,css){const d=document.createElement('div');d.className='ol';d.style.cssText=(css||'font-size:min(3.6vh,14px)')+';white-space:pre-line;word-break:break-all';d.textContent=txt;par.appendChild(d);return d;}
function area(par,val,ro){
 const t=document.createElement('textarea');
 t.style.cssText='width:100%;height:20vh;font:12px monospace;border-radius:8px;border:3px solid #14102b;-webkit-user-select:text;user-select:text';
 t.value=val||'';t.readOnly=!!ro;
 ['keydown','keyup'].forEach(ev=>t.addEventListener(ev,e=>e.stopPropagation()));
 par.appendChild(t);return t;
}

function refresh(){
 const m=me();
 q('qid_id').textContent=m.id;q('qid_nm').textContent=m.name;
 const l=parseInt(localStorage.getItem(KB)||'0',10);
 q('qid_lb').textContent=l?'Ostatnia kopia: '+new Date(l).toLocaleString():'Nie robiłeś jeszcze kopii.';
}

/* ---------- KOPIA ---------- */
function doExport(){
 if(cheat())return toast('Wyłącz najpierw kod Quorek, potem zrób kopię');
 const code=pack();
 try{localStorage.setItem(KB,String(Date.now()));}catch(e){}
 refresh();
 const b=box();
 line(b,'Twoja kopia. Skopiuj cały kod i zapisz go np. w Notatkach.');
 const t=area(b,code,true);
 bt('KOPIUJ KOD','green',()=>{
  t.select();
  try{navigator.clipboard.writeText(code).then(()=>toast('Skopiowano'),()=>{document.execCommand('copy');toast('Skopiowano');});}
  catch(e){try{document.execCommand('copy');toast('Skopiowano');}catch(x){toast('Zaznacz tekst i skopiuj ręcznie');}}
 },b);
}

/* ---------- WCZYTANIE ---------- */
function importStr(str){
 const o=unpack(str);
 if(!o)return toast('Nieprawidłowy kod kopii');
 const n=Object.keys(o.d).length;
 if(!confirm('Wczytać zapis? Obecny postęp na tym telefonie zostanie zastąpiony (zostanie kopia awaryjna). Pozycji do wczytania: '+n))return;
 apply(o);
}
function doImport(){
 const b=box();
 line(b,'Wklej kod kopii (zaczyna się od QID1:).');
 const t=area(b,'',false);
 bt('WCZYTAJ','green',()=>importStr(t.value),b);
}

/* ---------- PRZENOSZENIE MIĘDZY URZĄDZENIAMI ---------- */
let sp=null,stT=0;
function stopSend(){clearTimeout(stT);try{if(sp)sp.destroy();}catch(e){}sp=null;}
function doSend(){
 if(typeof Peer==='undefined'||typeof PCFG==='undefined')return toast('Brak PeerJS (sprawdź internet)');
 if(cheat())return toast('Wyłącz najpierw kod Quorek');
 stopSend();
 const code=Array.from({length:6},()=>CS[Math.random()*CS.length|0]).join('');
 const data=pack();
 const b=box();const st=line(b,'Łączenie z serwerem...');
 sp=new Peer(PRE+code,PCFG);
 sp.on('open',()=>{
  st.textContent='KOD PRZENOSZENIA: '+code+'\nNa drugim telefonie wybierz ODBIERZ i wpisz ten kod.\nKod jest ważny 3 minuty. Nie zamykaj gry.';
  st.style.fontSize='min(4.6vh,18px)';
  stT=setTimeout(()=>{stopSend();st.textContent='Kod wygasł. Wygeneruj nowy.';},180000);
 });
 sp.on('error',e=>{st.textContent='Błąd: '+e.type;});
 sp.on('connection',c=>{
  c.on('open',()=>{
   try{c.send({t:'save',d:data});}catch(e){}
   st.textContent='Wysłano! Sprawdź drugi telefon.';
   try{localStorage.setItem(KB,String(Date.now()));}catch(e){}refresh();
   setTimeout(stopSend,3000);
  });
 });
}
function doRecv(){
 if(typeof Peer==='undefined'||typeof PCFG==='undefined')return toast('Brak PeerJS (sprawdź internet)');
 const code=(prompt('Wpisz kod przenoszenia z drugiego telefonu:')||'').trim().toUpperCase();
 if(!code)return;
 if(!/^[A-Z0-9]{6}$/.test(code))return toast('Kod ma 6 znaków');
 const b=box();const st=line(b,'Łączenie...');
 const p=new Peer(undefined,PCFG);let got=false;
 p.on('open',()=>{
  const c=p.connect(PRE+code,{reliable:true});
  c.on('data',d=>{
   if(got||!d||d.t!=='save'||typeof d.d!=='string')return;
   got=true;try{p.destroy();}catch(e){}
   st.textContent='Odebrano dane.';
   importStr(d.d);
  });
 });
 p.on('error',e=>{if(!got)st.textContent='Błąd: '+e.type+' (sprawdź kod)';});
 setTimeout(()=>{if(!got){try{p.destroy();}catch(e){}st.textContent='Nie udało się połączyć. Sprawdź kod i czy drugi telefon ma otwartą grę.';}},15000);
}

const bb=q('qid_btns');
bt('📤 ZRÓB KOPIĘ (KOD)','green',doExport,bb);
bt('📥 WCZYTAJ KOPIĘ','blue',doImport,bb);
bt('📱 WYŚLIJ NA INNY TELEFON','blue',doSend,bb);
bt('📲 ODBIERZ Z INNEGO TELEFONU','blue',doRecv,bb);
const hint=document.createElement('div');hint.className='ol';hint.style.cssText='font-size:min(3vh,11px);opacity:.75';
hint.textContent='Uwaga: nie graj na dwóch telefonach naraz z tym samym ID, bo znajomi i klub mogą się mylić.';
bb.appendChild(hint);
q('qback').onclick=()=>{stopSend();q('qid_box').style.display='none';state='menu';show('menu');};

/* ---------- PRZYCISK W MENU ---------- */
const mb=document.createElement('button');
mb.className='btn blue small tl';mb.textContent='🆔 QUOREK ID';
const ref=[...document.querySelectorAll('#menu .btn')].find(x=>/PROFIL|KARNET|ULEPSZENIA|SKINY|ALEJA/.test(x.textContent));
(ref?ref.parentElement:document.getElementById('menu')).appendChild(mb);
mb.onclick=()=>{refresh();q('qid_box').style.display='none';state='select';show('qid');};
refresh();

/* ---------- NAZWA W EKRANIE ZNAJOMYCH ---------- */
const fr=document.getElementById('fr');
if(fr){
 const w=document.createTreeWalker(fr,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode()))if(n.nodeValue.indexOf('Twoje ID')>=0)n.nodeValue=n.nodeValue.replace('Twoje ID','Quorek ID');
}
})();
