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
'
