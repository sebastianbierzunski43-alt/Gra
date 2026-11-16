const NET={role:'solo',peer:null,conns:[],host:null,code:'',snapT:0,inpT:0};
const CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PID=c=>'brawl-arena-'+c;
const st=s=>{$('#mpst').textContent=s;};
const PCFG={debug:0,config:{iceTransportPolicy:'all',iceCandidatePoolSize:4,iceServers:[
 {urls:'stun:stun.l.google.com:19302'},
 {urls:'stun:stun1.l.google.com:19302'},
 {urls:'stun:global.stun.twilio.com:3478'},
 {urls:'turn:openrelay.metered.ca:80',username:'openrelayproject',credential:'openrelayproject'},
 {urls:'turn:openrelay.metered.ca:443',username:'openrelayproject',credential:'openrelayproject'},
 {urls:'turn:openrelay.metered.ca:443?transport=tcp',username:'openrelayproject',credential:'openrelayproject'}
]}};

/* UI */
const mp=document.createElement('div');mp.id='mp2';mp.className='screen glow';
mp.innerHTML='<div class="bar"><button class="btn red small" id="mpback">◀</button><div class="h2 ol">ONLINE</div></div>'+
'<button class="btn green" id="mphost">ZAŁÓŻ POKÓJ</button>'+
'<div class="row"><input id="mpcode" maxlength="4" autocapitalize="characters" autocomplete="off" placeholder="KOD" style="width:6em;font:inherit;font-size:24px;text-align:center;text-transform:uppercase;border-radius:12px;border:4px solid #14102b"><button class="btn blue" id="mpjoin">DOŁĄCZ</button></div>'+
'<div class="sub ol" id="mpst" style="white-space:pre-line;text-align:center"></div>'+
'<button class="btn green" id="mpstart" style="display:none">START</button>';
document.body.appendChild(mp);
const ob=document.createElement('button');ob.className='btn blue small';ob.textContent='ONLINE';
$('#go').after(ob);
ob.onclick=()=>{state='mp';st('');show('mp2');};
$('#mpback').onclick=()=>{netStop();state='select';show('sel');};
$('#mphost').onclick=hostRoom;
$('#mpjoin').onclick=joinRoom;
$('#mpstart').onclick=()=>hostStart();
$('#go').onclick=()=>{netStop();startGame();};
$('#quit').onclick=$('#tomenu').onclick=()=>{netStop();G=null;state='menu';show('menu');};
$('#again').onclick=()=>{if(NET.role==='host')hostStart();else if(NET.role==='client')$('#rs').textContent='Czekam na hosta...';else startGame();};

function netStop(){
 try{NET.conns.forEach(o=>o.c.close());if(NET.host)NET.host.close();if(NET.peer)NET.peer.destroy();}catch(e){}
 NET.peer=null;NET.host=null;NET.conns=[];NET.role='solo';
 $('#mpstart').style.display='none';
}
function players(){return 1+NET.conns.filter(o=>!o.gone).length;}
function roomTxt(){return 'KOD POKOJU: '+NET.code+'\nGracze: '+players()+'/6\nNie wygaszaj ekranu!';}

/* HOST */
function hostRoom(){
 if(typeof Peer==='undefined'){st('Brak PeerJS (sprawdź internet)');return;}
 netStop();NET.role='host';
 NET.code=Array.from({length:4},()=>CH[Math.random()*CH.length|0]).join('');
 const p=new Peer(PID(NET.code),PCFG);NET.peer=p;st('Łączenie z serwerem...');
 p.on('open',()=>{st(roomTxt());$('#mpstart').style.display='';});
 p.on('disconnected',()=>{try{p.reconnect();}catch(e){}});
 p.on('error',e=>{if(e.type==='unavailable-id')hostRoom();else st('Błąd hosta: '+e.type);});
 p.on('connection',c=>{
  if(NET.conns.length>=5){c.on('open',()=>c.close());return;}
  const o={c,slot:NET.conns.length+1,bi:0,gone:false};NET.conns.push(o);
  c.on('open',()=>{st(roomTxt());});
  c.on('error',()=>{});
  c.on('data',d=>{
   if(!d)return;
   if(d.t==='hello'){o.bi=BR[d.sel]?d.sel:0;st(roomTxt());}
   else if(d.t==='in'){const e=G&&G.ents[o.slot];if(e)e.inp=d;}
   else if(d.t==='f'){
    const e=G&&G.ents[o.slot];
    if(e&&!G.over&&G.count<=0&&!e.dead){const a=+d.a||0,r=+d.r||300;if(d.k==='atk')tryAttack(e,a,r);else trySuper(e,a,r);}
   }
  });
  c.on('close',()=>{o.gone=true;const e=G&&G.ents[o.slot];if(e)e.remote=false;if(state==='mp')st(roomTxt());});
 });
}
function hostStart(){
 if(NET.role!=='host')return;
 startGame();
 const bis=G.ents.map(e=>BR.indexOf(e.d));
 NET.conns.forEach(o=>{if(!o.gone&&o.c.open)o.c.send({t:'start',arena:arenaSel,bis,slot:o.slot});});
}
startGame=function(){
 initAudio();
 const A=ARENAS[arenaSel],host=NET.role==='host';
 G={A,grid:genMap(A),ents:[],bullets:[],gems:[],fx:[],txt:[],zones:[],time:180,count:3.6,gemT:1.5,ctd:[15,15],over:false,overT:0,winner:-1,cx:0,cy:0};
 for(let t=0;t<2;t++)for(let i=0;i<3;i++){
  const slot=t*3+i,human=slot===0,o=host?NET.conns.find(o=>o.slot===slot&&!o.gone):null;
  const e=mkEnt(t,i,human?sel:(o?o.bi:(Math.random()*BR.length|0)),human);
  if(o)e.remote=true;
  G.ents.push(e);
 }
 P=G.ents[0];G.cx=P.x-W/S/2;G.cy=P.y-CAM_H/2;
 aim.on=false;joy.on=false;joy.x=joy.y=0;
 state='play';show(null);
};
const _bot=botAI;
botAI=function(e,dt){
 if(!e.remote)return _bot(e,dt);
 const i=e.inp||{x:0,y:0,a:e.ang};let mx=+i.x||0,my=+i.y||0;const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m;}
 step(e,mx,my,dt);e.ang=+i.a||0;
};
function snap(){
 const r=Math.round,f=(v,n)=>+v.toFixed(n);
 return{t:'s',tm:G.time,c:G.count,ct:G.ctd,o:G.over?1:0,w:G.winner,
  e:G.ents.map(e=>[r(e.x),r(e.y),r(e.hp),r(e.sup),f(e.ammo,2),e.gems,e.dead?1:0,f(e.ang,2),e.flash>0?1:0,e.reveal>0?1:0,e.inv>0?1:0,Math.ceil(e.rs),e.gt,e.kills]),
  b:G.bullets.filter(b=>b.delay<=0).map(b=>[r(b.x),r(b.y),f(b.a,2),b.sp,r(b.left),b.r,b.col,b.shape]),
  g:G.gems.map(g=>[r(g.x),r(g.y)]),
  z:G.zones.map(z=>[r(z.x),r(z.y),f(z.t,2),f(z.m,2),z.r])};
}
const _upd=update;
update=function(dt){
 if(NET.role==='client'){clientUpdate(dt);return;}
 _upd(dt);
 if(NET.role==='host'&&G){
  NET.snapT-=dt;
  if(NET.snapT<=0){NET.snapT=.05;const s=snap();for(const o of NET.conns)if(!o.gone&&o.c.open)o.c.send(s);}
 }
};

/* KLIENT */
function joinRoom(){
 if(typeof Peer==='undefined'){st('Brak PeerJS (sprawdź internet)');return;}
 const code=$('#mpcode').value.trim().toUpperCase();
 if(code.length!==4){st('Wpisz 4-znakowy kod');return;}
 netStop();NET.role='client';st('Łączenie z serwerem...');
 const p=new Peer(undefined,PCFG);NET.peer=p;
 p.on('disconnected',()=>{try{p.reconnect();}catch(e){}});
 p.on('error',e=>{
  if(e.type==='peer-unavailable')st('Nie ma takiego pokoju. Sprawdź kod i czy host go założył.');
  else st('Błąd: '+e.type);
 });
 p.on('open',()=>{
  st('Łączenie z hostem '+code+'...');
  const c=p.connect(PID(code),{reliable:true,serialization:'json'});NET.host=c;
  c.on('open',()=>{st('Połączono! Czekam na start hosta...');c.send({t:'hello',sel});});
  c.on('error',e=>st('Błąd połączenia: '+(e.type||e)));
  c.on('data',d=>{if(!d)return;if(d.t==='start')clientStart(d);else if(d.t==='s')applySnap(d);});
  c.on('close',()=>{if(NET.role==='client'){netStop();G=null;state='menu';show('menu');alert('Host się rozłączył');}});
 });
 setTimeout(()=>{if(NET.role==='client'&&(!NET.host||!NET.host.open))st('Nie udało się połączyć w 25 s.\nSprawdź kod, ten sam adres z ?v= i spróbuj na tym samym Wi-Fi.');},25000);
}
function clientStart(d){
 arenaSel=d.arena;const A=ARENAS[d.arena];
 G={A,grid:genMap(A),ents:[],bullets:[],gems:[],fx:[],txt:[],zones:[],time:180,count:3.6,gemT:0,ctd:[15,15],over:false,overT:0,winner:-1,cx:0,cy:0};
 for(let t=0;t<2;t++)for(let i=0;i<3;i++){const e=mkEnt(t,i,d.bis[t*3+i],false);e.tx=e.x;e.ty=e.y;G.ents.push(e);}
 P=G.ents[d.slot];G.cx=P.x-W/S/2;G.cy=P.y-CAM_H/2;
 aim.on=false;joy.on=false;joy.x=joy.y=0;
 state='play';show(null);
}
function applySnap(d){
 if(!G)return;
 G.time=d.tm;G.count=d.c;G.ctd=d.ct;
 d.e.forEach((a,k)=>{
  const e=G.ents[k];if(!e)return;const wasDead=e.dead;
  e.tx=a[0];e.ty=a[1];e.hp=a[2];e.sup=a[3];e.ammo=a[4];e.gems=a[5];e.dead=!!a[6];e.ang=a[7];
  e.flash=a[8]?.1:0;e.reveal=a[9]?1:0;e.inv=a[10]?1:0;e.rs=a[11];e.gt=a[12];e.kills=a[13];
  if(Math.hypot(e.tx-e.x,e.ty-e.y)>150||(wasDead&&!e.dead)){e.x=e.tx;e.y=e.ty;}
 });
 G.bullets=d.b.map(a=>({x:a[0],y:a[1],a:a[2],sp:a[3],left:a[4],r:a[5],col:a[6],shape:a[7],delay:0}));
 G.gems=d.g.map(a=>({x:a[0],y:a[1],age:1,vx:0,vy:0}));
 G.zones=d.z.map(a=>({x:a[0],y:a[1],t:a[2],m:a[3],r:a[4]}));
 if(d.o&&!G.over){G.over=true;G.winner=d.w;G.overT=2.4;state='over';}
}
function clientUpdate(dt){
 if(!G)return;
 const k=Math.min(1,dt*14);
 for(const e of G.ents){const px=e.x,py=e.y;e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k;e.walk+=Math.hypot(e.x-px,e.y-py)*.06;}
 for(const b of G.bullets){const m=b.sp*dt;b.x+=Math.cos(b.a)*m;b.y+=Math.sin(b.a)*m;}
 for(const z of G.zones)z.t-=dt;
 if(G.over){G.overT-=dt;if(G.overT<=0&&state==='over')showResult();return;}
 NET.inpT-=dt;
 if(NET.inpT<=0){
  NET.inpT=.05;
  if(!NET.host||!NET.host.open||!P)return;
  let mx=joy.x,my=joy.y;
  if(keys.arrowleft||keys.a)mx-=1;if(keys.arrowright||keys.d)mx+=1;if(keys.arrowup||keys.w)my-=1;if(keys.arrowdown||keys.s)my+=1;
  const m=Math.hypot(mx,my);if(m>=.12){mx/=m;my/=m;}else{mx=my=0;}
  const ang=aim.on?aim.ang:(m>=.12?Math.atan2(my,mx):P.ang);
  NET.host.send({t:'in',x:+mx.toFixed(2),y:+my.toFixed(2),a:+ang.toFixed(2)});
 }
}
const _fire=doFire;
doFire=function(kind,drag,ang,rg){
 if(NET.role!=='client')return _fire(kind,drag,ang,rg);
 if(!G||G.over||G.count>0||P.dead||!NET.host||!NET.host.open)return;
 if(!drag){
  const t=autoTarget(P);
  if(t){ang=Math.atan2(t.y-P.y,t.x-P.x);rg=dist(P,t);}
  else{rg=P.d.rng*.7;ang=Math.hypot(joy.x,joy.y)>.12?Math.atan2(joy.y,joy.x):P.ang;}
 }
 NET.host.send({t:'f',k:kind,a:+ang,r:+rg});
};
const _pause=pauseGame;
pauseGame=function(){
 if(NET.role==='solo')return _pause();
 if(state!=='play')return;
 joy.on=false;joy.x=joy.y=0;aim.on=false;show('pause');
};
