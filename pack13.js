(function(){
if(window.__p13)return;window.__p13=1;
const KEY='brawlFriends1',PRE='brawl-arena-u-',CS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let SV={id:'',name:'',fr:[]};
try{Object.assign(SV,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
if(!SV.id||SV.id.length!==6)SV.id=Array.from({length:6},()=>CS[Math.random()*CS.length|0]).join('');
if(!SV.name)SV.name='Gracz'+SV.id.slice(-3);
if(!Array.isArray(SV.fr))SV.fr=[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(SV));}catch(e){}};
save();
const ST={};

const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:130;background:rgba(0,0,0,.85);color:#fff;font:700 14px Arial,sans-serif;padding:8px 14px;border-radius:12px;display:none;text-align:center';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},2400);}

/* ---------- OBECNOŚĆ ---------- */
let pp=null,tries=0;
function initPP(){
 if(typeof Peer==='undefined'||typeof PCFG==='undefined')return;
 if(pp&&!pp.destroyed&&!pp.disconnected)return;
 try{if(pp)pp.destroy();}catch(e){}
 pp=new Peer(PRE+SV.id,PCFG);
 pp.on('open',()=>{tries=0;setTimeout(ping,500);});
 pp.on('disconnected',()=>{try{pp.reconnect();}catch(e){}});
 pp.on('error',e=>{
  if(e.type==='unavailable-id'&&tries<6){tries++;setTimeout(()=>{try{pp.destroy();}catch(x){}pp=null;initPP();},5000);}
 });
 pp.on('connection',c=>{
  c.on('open',()=>{try{c.send({t:'hi',name:SV.name,id:SV.id});}catch(e){}});
  c.on('data',d=>{
   if(!d)return;
   if(d.t==='hi'&&d.id){const f=SV.fr.find(x=>x.id===d.id);if(f&&d.name){f.name=String(d.name).slice(0,16);save();}}
   if(d.t==='inv'&&/^[A-Z0-9]{4}$/.test(String(d.code))&&/^[A-Z0-9]{6}$/.test(String(d.id))){
    showInv(String(d.name||'Gracz').slice(0,16),String(d.code));
   }
  });
 });
}
initPP();
setInterval(initPP,15000);

function ping(){
 if(!pp||!pp.open)return;
 SV.fr.forEach(f=>{
  let ok=false;
  const c=pp.connect(PRE+f.id);
  c.on('open',()=>{ok=true;ST[f.id]=true;try{c.send({t:'hi',name:SV.name,id:SV.id});}catch(e){}setTimeout(()=>{try{c.close();}catch(e){}},900);draw();});
  c.on('data',d=>{if(d&&d.t==='hi'&&d.name){f.name=String(d.name).slice(0,16);save();draw();}});
  setTimeout(()=>{if(!ok){ST[f.id]=false;try{c.close();}catch(e){}draw();}},5000);
 });
}
setInterval(ping,10000);

/* ---------- ZAPROSZENIE (okienko) ---------- */
const iv=document.createElement('div');
iv.style.cssText='position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center';
iv.innerHTML='<div class="glow" style="border:4px solid #14102b;border-radius:16px;padding:16px 20px;text-align:center;max-width:80vw"><div class="sub ol" id="ivt" style="margin-bottom:10px"></div><div class="row" style="justify-content:center"><button class="btn green small" id="ivy">DOŁĄCZ</button><button class="btn red small" id="ivn">ODRZUĆ</button></div></div>';
document.body.appendChild(iv);
let invCode='';
function showInv(name,code){
 invCode=code;
 $('#ivt').textContent=name+' zaprasza Cię do gry!';
 iv.style.display='flex';
}
$('#ivn').onclick=()=>{iv.style.display='none';};
$('#ivy').onclick=()=>{
 iv.style.display='none';
 if(state==='play'||state==='over')return toast('Dokończ najpierw mecz');
 $('#mpcode').value=invCode;
 state='mp';show('mp2');
 $('#mpjoin').click();
};

/* ---------- EKRAN ZNAJOMYCH ---------- */
const fs=document.createElement('div');fs.id='fr';fs.className='screen glow';
fs.innerHTML='<div class="bar"><button class="btn red small" id="frback">◀</button><div class="h2 ol">ZNAJOMI</div><button class="btn blue small" id="frroom" style="margin-left:auto">🚪 DO POKOJU</button></div>'+
'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center"><span class="ol" style="font-size:min(4vh,16px)">Twoje ID: <b id="frid" style="color:#ffd93b"></b></span><button class="btn blue small" id="frcp">KOPIUJ</button><span class="ol" style="font-size:min(3.6vh,14px)">Nick: <b id="frnm"></b></span><button class="btn blue small" id="frnn">ZMIEŃ</button></div>'+
'<div style="display:flex;gap:8px;align-items:center"><input id="fradd" maxlength="6" autocapitalize="characters" autocomplete="off" placeholder="ID ZNAJOMEGO" style="width:9em;font:inherit;font-size:20px;text-align:center;text-transform:uppercase;border-radius:12px;border:4px solid #14102b;-webkit-user-select:text;user-select:text"><button class="btn green small" id="fradbt">DODAJ</button></div>'+
'<div id="frlist" style="width:100%;max-width:700px;overflow:auto;max-height:46vh"></div>';
document.body.appendChild(fs);
fs.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});

function draw(){
 if(!fs.classList.contains('on'))return;
 $('#frid').textContent=SV.id;$('#frnm').textContent=SV.name;
 const b=$('#frlist');b.innerHTML='';
 if(!SV.fr.length)b.innerHTML='<div class="sub ol" style="text-align:center;padding:1vh">Brak znajomych. Wpisz ID kolegi i kliknij DODAJ.</div>';
 SV.fr.forEach((f,i)=>{
  const on=!!ST[f.id];
  const r=document.createElement('div');
  r.style.cssText='display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.35);border:3px solid #14102b;border-radius:10px;padding:5px 8px;margin-bottom:5px';
  r.innerHTML='<span style="width:14px;height:14px;border-radius:50%;flex:none;background:'+(on?'#4cd964':'#777')+'"></span><div class="ol" style="flex:1;font-size:min(4vh,16px)"></div>';
  r.children[1].textContent=f.name+' ('+f.id+')';
  const inv=document.createElement('button');inv.className='btn small '+(on?'green':'blue');inv.style.cssText='font-size:min(3.8vh,14px);padding:.2em .6em;border-bottom-width:5px';
  inv.textContent='ZAPROŚ';inv.onclick=()=>invite(f);
  const del=document.createElement('button');del.className='btn small red';del.style.cssText='font-size:min(3.8vh,14px);padding:.2em .6em;border-bottom-width:5px';
  del.textContent='🗑️';del.onclick=()=>{if(confirm('Usunąć znajomego '+f.name+'?')){SV.fr.splice(i,1);save();draw();}};
  r.appendChild(inv);r.appendChild(del);b.appendChild(r);
 });
}
function invite(f){
 if(!ST[f.id])return toast(f.name+' nie ma teraz otwartej gry');
 if(!pp||!pp.open)return toast('Brak połączenia z serwerem');
 if(NET.role!=='host')hostRoom();
 toast('Zakładam pokój...');
 let n=0;
 const t=setInterval(()=>{
  n++;
  if(NET.role==='host'&&NET.peer&&NET.peer.open){
   clearInterval(t);
   const c=pp.connect(PRE+f.id);
   c.on('open',()=>{try{c.send({t:'inv',name:SV.name,id:SV.id,code:NET.code});}catch(e){}setTimeout(()=>{try{c.close();}catch(e){}},900);});
   toast('Zaproszenie wysłane do '+f.name);
   state='mp';show('mp2');
  }else if(n>40){clearInterval(t);toast('Nie udało się założyć pokoju');}
 },250);
}
$('#frback').onclick=()=>{state='menu';show('menu');};
$('#frroom').onclick=()=>{state='mp';show('mp2');};
$('#frcp').onclick=()=>{
 const done=()=>toast('Skopiowano ID: '+SV.id);
 try{navigator.clipboard.writeText(SV.id).then(done,()=>prompt('Skopiuj ID:',SV.id));}catch(e){prompt('Skopiuj ID:',SV.id);}
};
$('#frnn').onclick=()=>{
 const n=prompt('Twój nick (max 16 znaków):',SV.name);
 if(n&&n.trim()){SV.name=n.trim().slice(0,16);save();draw();}
};
$('#fradbt').onclick=()=>{
 const id=$('#fradd').value.trim().toUpperCase();
 if(!/^[A-Z0-9]{6}$/.test(id))return toast('ID ma 6 znaków (litery i cyfry)');
 if(id===SV.id)return toast('To Twoje własne ID');
 if(SV.fr.some(f=>f.id===id))return toast('Już masz tego znajomego');
 if(SV.fr.length>=30)return toast('Maksymalnie 30 znajomych');
 SV.fr.push({id,name:'Gracz'+id.slice(-3)});save();$('#fradd').value='';
 draw();ping();toast('Dodano znajomego');
};

/* ---------- PRZYCISK W MENU: środek, prawa strona ---------- */
const mb=document.createElement('button');
mb.className='btn blue small';mb.textContent='👥 ZNAJOMI';
mb.style.cssText='position:absolute;right:max(env(safe-area-inset-right),12px);top:50%;transform:translateY(-50%);z-index:6;font-size:min(4.6vh,17px)';
$('#menu').appendChild(mb);
mb.onclick=()=>{state='select';show('fr');draw();ping();};
})();
