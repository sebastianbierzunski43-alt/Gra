(function(){
if(window.__p17)return;window.__p17=1;
const KF='brawlFriends1',KC='brawlClub1',KH='brawlClubChat1',PRE='brawl-arena-m-';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const me=()=>jget(KF,{id:'',name:'Gracz'});
const club=()=>{const c=jget(KC,null);return c&&c.owner?c:null;};
let H={owner:'',msgs:[]};
const saveH=()=>{try{localStorage.setItem(KH,JSON.stringify(H));}catch(e){}};
function loadH(c){H=jget(KH,{owner:'',msgs:[]});if(H.owner!==c.owner)H={owner:c.owner,msgs:[]};}
const cl=m=>({id:String((m&&m.id)||'').slice(0,6),n:String((m&&m.n)||'Gracz').slice(0,16),t:String((m&&m.t)||'').slice(0,120),ts:+(m&&m.ts)||0});

const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:150;background:rgba(0,0,0,.85);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2200);}

/* ---------- EKRAN CZATU ---------- */
const sc=document.createElement('div');sc.id='cchat';sc.className='screen glow';
sc.style.justifyContent='flex-start';
sc.innerHTML='<div class="bar"><button class="btn red small" id="ccback">◀</button><div class="h2 ol" id="ccttl">CZAT KLUBU</div></div>'+
'<div id="ccst" class="sub ol" style="font-size:min(3.2vh,12px);text-align:center"></div>'+
'<div id="cclist" style="width:100%;max-width:760px;flex:1;min-height:0;overflow:auto;background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:12px;padding:6px 8px"></div>'+
'<div style="display:flex;gap:8px;width:100%;max-width:760px"><input id="ccin" maxlength="120" placeholder="Napisz wiadomość..." autocomplete="off" style="flex:1;font:inherit;font-size:18px;border-radius:10px;border:4px solid #14102b;padding:4px 8px;-webkit-user-select:text;user-select:text"><button class="btn green small" id="ccsend">WYŚLIJ</button></div>';
document.body.appendChild(sc);
sc.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
const $c=id=>document.getElementById(id);
const inp=$c('ccin');
['keydown','keyup'].forEach(ev=>inp.addEventListener(ev,e=>e.stopPropagation()));
const setS=s=>{$c('ccst').textContent=s;};

function render(){
 if(!sc.classList.contains('on'))return;
 const b=$c('cclist');b.innerHTML='';
 const mid=me().id;
 if(!H.msgs.length){const d=document.createElement('div');d.className='ol';d.style.cssText='text-align:center;font-size:min(3.6vh,14px);padding:8px';d.textContent='Brak wiadomości. Napisz pierwszą!';b.appendChild(d);}
 H.msgs.forEach(m=>{
  const r=document.createElement('div');
  r.style.cssText='margin-bottom:4px;font:700 min(3.8vh,15px) Arial,sans-serif;word-break:break-word';
  const n=document.createElement('span');
  n.style.color=m.id===mid?'#8aff56':'#ffd93b';
  const dt=m.ts?new Date(m.ts):null;
  n.textContent=(dt?('0'+dt.getHours()).slice(-2)+':'+('0'+dt.getMinutes()).slice(-2)+' ':'')+m.n+': ';
  const t=document.createElement('span');t.style.color='#fff';t.textContent=m.t;
  r.appendChild(n);r.appendChild(t);b.appendChild(r);
 });
 b.scrollTop=b.scrollHeight;
}

/* ---------- ZAŁOŻYCIEL ---------- */
let op=null,oc=[];const LR={};
function pushMsg(m,bc){
 H.msgs.push(m);if(H.msgs.length>60)H.msgs=H.msgs.slice(-60);
 saveH();render();
 if(bc)for(const c of oc)if(c.open){try{c.send({t:'msg',m});}catch(e){}}
}
function startOwner(){
 if(typeof Peer==='undefined'||typeof PCFG==='undefined')return;
 if(op&&!op.destroyed)return;
 op=new Peer(PRE+me().id,PCFG);
 op.on('disconnected',()=>{try{op.reconnect();}catch(e){}});
 op.on('error',e=>{if(e.type==='unavailable-id'){try{op.destroy();}catch(x){}op=null;}});
 op.on('connection',c=>{
  oc.push(c);
  c.on('close',()=>{oc=oc.filter(x=>x!==c);});
  c.on('data',d=>{
   const cb=club();
   if(!d||!cb||cb.owner!==me().id)return;
   const id=String(d.id||'').slice(0,6);
   if(!cb.members.some(m=>m.id===id))return;
   if(d.t==='hello'){try{c.send({t:'hist',m:H.msgs});}catch(e){}return;}
   if(d.t==='msg'){
    const now=Date.now();
    if(LR[id]&&now-LR[id]<700)return;
    LR[id]=now;
    const t=String(d.text||'').trim().slice(0,120);
    if(!t)return;
    pushMsg({id,n:String(d.name||'Gracz').slice(0,16),t,ts:now},true);
   }
  });
 });
}
setInterval(()=>{
 const c=club();
 if(c&&c.owner===me().id){if(H.owner!==c.owner)loadH(c);startOwner();}
 else if(op){try{op.destroy();}catch(e){}op=null;oc=[];}
},5000);

/* ---------- CZŁONEK ---------- */
let mp=null,mc=null;
function closeM(){try{if(mc)mc.close();if(mp)mp.destroy();}catch(e){}mp=null;mc=null;}
function connectM(c){
 closeM();
 if(typeof Peer==='undefined'||typeof PCFG==='undefined'){setS('Brak PeerJS (sprawdź internet)');return;}
 setS('Łączenie z założycielem...');
 mp=new Peer(undefined,PCFG);
 mp.on('error',e=>setS('Założyciel jest offline (widzisz zapisane wiadomości)'));
 mp.on('open',()=>{
  mc=mp.connect(PRE+c.owner,{reliable:true});
  mc.on('open',()=>{setS('Połączono z klubem');try{mc.send({t:'hello',id:me().id,name:me().name});}catch(e){}});
  mc.on('data',d=>{
   if(!d)return;
   if(d.t==='hist'&&Array.isArray(d.m)){H.msgs=d.m.map(cl).slice(-60);H.owner=c.owner;saveH();render();}
   else if(d.t==='msg'&&d.m){pushMsg(cl(d.m),false);}
  });
  mc.on('close',()=>setS('Rozłączono z założycielem'));
 });
}

/* ---------- WYSYŁANIE ---------- */
function send(){
 const c=club();if(!c)return;
 const t=inp.value.trim().slice(0,120);if(!t)return;
 const m=me();
 if(c.owner===m.id){pushMsg({id:m.id,n:m.name,t,ts:Date.now()},true);}
 else if(mc&&mc.open){try{mc.send({t:'msg',id:m.id,name:m.name,text:t});}catch(e){return toast('Nie udało się wysłać');}}
 else return toast('Brak połączenia z założycielem');
 inp.value='';
}
$c('ccsend').onclick=send;
inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();send();}});
$c('ccback').onclick=()=>{closeM();state='select';show('prof');};

function openChat(){
 const c=club();
 if(!c)return toast('Najpierw dołącz do klubu lub go załóż');
 loadH(c);
 $c('ccttl').textContent='CZAT ['+c.name+']';
 state='select';show('cchat');render();
 if(c.owner===me().id){startOwner();setS('Jesteś założycielem. Czat działa, gdy masz otwartą grę.');}
 else connectM(c);
}

/* ---------- PRZYCISK W PROFILU ---------- */
const bar=document.querySelector('#prof .bar');
if(bar){
 const b=document.createElement('button');
 b.className='btn blue small';b.style.marginLeft='auto';b.textContent='💬 CZAT KLUBU';
 b.onclick=openChat;bar.appendChild(b);
}
})();
