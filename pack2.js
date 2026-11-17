(function(){
const MODES=[['3v3','3 vs 3',6,3],['solo','SOLO x10',10,1],['duo','DUO x10',10,2],['trio','TRIO x12',12,3]];
let MI=0,PREF=0;

/* ---------- PRZYCISK TRYBU ---------- */
const mb=document.createElement('button');
mb.className='btn blue small';mb.style.marginLeft='auto';
const lab=()=>{mb.textContent='TRYB: '+MODES[MI][1];};lab();
mb.onclick=()=>{MI=(MI+1)%MODES.length;lab();};
$('#sel .bar').appendChild(mb);

/* ---------- START SHOWDOWN ---------- */
function spawnPts(n){
 const pts=[];
 for(let k=0;k<n;k++){
  const a=k/n*6.2832+.3;
  let x=MW/2+Math.cos(a)*620,y=MH/2+Math.sin(a)*380;
  for(let t=0;t<80&&hitsSolid(x,y,26);t++){x=MW/2+Math.cos(a)*rand(300,640);y=MH/2+Math.sin(a)*rand(180,390);}
  if(hitsSolid(x,y,26)){x=MW/2+Math.cos(a)*600;y=MH/2;}
  pts.push([x,y]);
 }
 return pts;
}
function startSD(){
 initAudio();
 const A=ARENAS[arenaSel],N=MODES[MI][2],T=MODES[MI][3];
 G={A,grid:genMap(A),ents:[],bullets:[],gems:[],fx:[],txt:[],zones:[],time:9999,count:3.6,gemT:1e9,ctd:[15,15],over:false,overT:0,winner:-1,cx:0,cy:0,sd:true,sdT:0,gasR:960,gasTick:.5,place:1};
 const pts=spawnPts(N);
 for(let k=0;k<N;k++){
  const human=k===0,e=mkEnt(Math.floor(k/T),k%3,human?sel:(Math.random()*BR.length|0),human);
  e.x=e.sx=pts[k][0];e.y=e.sy=pts[k][1];e.ang=Math.atan2(MH/2-e.y,MW/2-e.x);
  G.ents.push(e);
 }
 P=G.ents[0];G.cx=P.x-W/S/2;G.cy=P.y-CAM_H/2;
 aim.on=false;joy.on=false;joy.x=joy.y=0;
 state='play';show(null);
}
const _sg=startGame;
startGame=function(){
 if(MI>0&&NET.role==='solo')return startSD();
 return _sg.apply(this,arguments);
};

/* brak odradzania w showdown */
const _rs=respawn;
respawn=function(e){
 if(G&&G.sd){e.rs=1e9;return;}
 _rs(e);
};

/* ---------- GAZ I KONIEC GRY ---------- */
const _u=update;
update=function(dt){
 _u(dt);
 if(!G||!G.sd||G.over||G.count>0)return;
 G.sdT+=dt;const t=G.sdT,R0=960,R1=110,delay=15,dur=100;
 G.gasR=t<delay?R0:Math.max(R1,R0-(R0-R1)*(t-delay)/dur);
 G.gasTick-=dt;
 if(G.gasTick<=0){
  G.gasTick=.5;const lvl=Math.min(5,t/30);
  for(const e of G.ents)if(!e.dead&&Math.hypot(e.x-MW/2,e.y-MH/2)>G.gasR)hurt(e,150+lvl*90,null,0,0);
 }
 const alive=new Set();for(const e of G.ents)if(!e.dead)alive.add(e.team);
 if(!alive.has(0)){G.place=alive.size+1;endGame(alive.size?[...alive][0]:-1);}
 else if(alive.size===1){G.place=1;endGame(0);}
 else if(G.sdT>360){G.place=alive.size;endGame(-1);}
};
const _sr=showResult;
showResult=function(){
 _sr();
 if(G&&G.sd)$('#rs').textContent='Miejsce: '+G.place+' • Eliminacje: '+P.kills;
};

/* boty uciekają przed gazem */
const _b=botAI;
botAI=function(e,dt){
 if(G&&G.sd&&!e.dash&&!e.remote){
  const dx=MW/2-e.x,dy=MH/2-e.y,l=Math.hypot(dx,dy)||1;
  if(l>G.gasR-50){
   const s=steer(e,dx/l,dy/l);step(e,s[0],s[1],dt);e.ang=Math.atan2(dy,dx);return;
  }
 }
 _b(e,dt);
};

/* ---------- RYSOWANIE GAZU I HUD ---------- */
const _bush=drawBushes;
drawBushes=function(a,b,c,d){
 _bush(a,b,c,d);
 if(!G||!G.sd)return;
 ctx.save();
 ctx.beginPath();ctx.rect(-300,-300,MW+600,MH+600);
 ctx.moveTo(MW/2+G.gasR,MH/2);ctx.arc(MW/2,MH/2,G.gasR,0,Math.PI*2);
 ctx.fillStyle='rgba(70,210,60,'+(.28+.06*Math.sin(TIME*4))+')';ctx.fill('evenodd');
 ctx.beginPath();ctx.arc(MW/2,MH/2,G.gasR,0,Math.PI*2);
 ctx.strokeStyle='#8dff5a';ctx.lineWidth=5;ctx.stroke();
 ctx.restore();
};
const _hud=drawHUD;
drawHUD=function(){
 if(!G||!G.sd)return _hud();
 const cxm=W/2;let n=0;for(const e of G.ents)if(!e.dead)n++;
 rr(ctx,cxm-80,8,160,34,10);ctx.fillStyle='#e8a21f';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#14102b';ctx.stroke();
 tx(ctx,'ŻYWI: '+n+'/'+G.ents.length,cxm,26,16);
 ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.arc(btn.px,btn.py,btn.pr,0,7);ctx.fill();
 ctx.fillStyle='#fff';ctx.fillRect(btn.px-6,btn.py-7,4,14);ctx.fillRect(btn.px+2,btn.py-7,4,14);
 if(!P.dead&&Math.hypot(P.x-MW/2,P.y-MH/2)>G.gasR)tx(ctx,'WEJDŹ DO STREFY!',cxm,H*.25,22,'#8dff5a');
 if(G.count>0){const k=Math.ceil(G.count-.6);tx(ctx,k>0?k+'':'WALKA!',cxm,H*.4,k>0?90:64,'#ffd93b');}
 if(P.dead)tx(ctx,'Wyeliminowany',cxm,H*.45,34,'#fff');
 if(G.over)tx(ctx,G.winner===-1?'REMIS':G.winner===0?'ZWYCIĘSTWO!':'PORAŻKA',cxm,H*.4,70,G.winner===0?'#ffd93b':G.winner===-1?'#fff':'#ff6a6a');
};

/* ---------- ONLINE: WYBÓR DRUŻYNY ---------- */
const tb=document.createElement('button');
tb.className='btn blue small';
const tlab=()=>{tb.textContent=PREF?'PRZECIWKO HOSTOWI':'W DRUŻYNIE HOSTA';};tlab();
$('#mpjoin').parentNode.after(tb);
tb.onclick=()=>{
 PREF^=1;tlab();
 if(NET.role==='client'&&NET.host&&NET.host.open)NET.host.send({t:'team',team:PREF});
};
roomTxt=function(){
 const live=NET.conns.filter(o=>!o.gone),b=live.filter(o=>o.pref).length;
 return 'KOD POKOJU: '+NET.code+'\nGracze: '+players()+'/6\nZ tobą: '+(live.length-b)+' • Przeciw: '+b+'\nOnline tylko 3 vs 3';
};
setInterval(()=>{
 if(NET.role==='client'&&NET.host&&NET.host.open&&state==='mp')NET.host.send({t:'team',team:PREF});
 if(NET.role==='host')for(const o of NET.conns){
  if(o._tm)continue;o._tm=1;
  o.c.on('data',d=>{if(d&&d.t==='team'){const p=d.team?1:0;if(o.pref!==p){o.pref=p;if(state==='mp')st(roomTxt());}}});
 }
},400);
const _hs=hostStart;
hostStart=function(){
 if(NET.role!=='host')return;
 const live=NET.conns.filter(o=>!o.gone),A=[1,2],B=[3,4,5];
 for(const o of live.filter(o=>!o.pref))o.slot=A.length?A.shift():B.shift();
 for(const o of live.filter(o=>o.pref))o.slot=B.length?B.shift():A.shift();
 _hs();
};
})();
