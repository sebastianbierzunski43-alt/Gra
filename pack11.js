(function(){
if(window.__p11)return;window.__p11=1;
const CFG=[null,{N:10,T:1},{N:10,T:2},{N:12,T:3}];
const NAMES=['3 vs 3','SOLO','DUO','TRIO'];
function mode(){
 const b=[...document.querySelectorAll('#sel .bar .btn')].find(x=>/TRYB/.test(x.textContent));
 if(!b)return 0;const t=b.textContent;
 return /SOLO/.test(t)?1:/DUO/.test(t)?2:/TRIO/.test(t)?3:0;
}
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
const mkG=(A,N,T)=>({A,grid:genMap(A),ents:[],bullets:[],gems:[],fx:[],txt:[],zones:[],time:9999,count:3.6,gemT:1e9,ctd:[15,15],over:false,overT:0,winner:-1,cx:0,cy:0,sdc:true,sd:false,sdT:0,gasR:960,gasTick:.5,place:1,out:[],pl:null,N,T});

/* ---------- HOST ---------- */
function assign(N,T){
 const live=NET.conns.filter(o=>!o.gone),used=new Set([0]);
 const take=arr=>{for(const s of arr)if(!used.has(s)){used.add(s);return s;}return -1;};
 const team=t=>Array.from({length:T},(_,i)=>t*T+i);
 const all=Array.from({length:N},(_,i)=>i);
 const others=[];for(let t=1;t<N/T;t++)others.push(...team(t));
 for(const o of live.filter(o=>!o.pref)){let s=take(team(0));if(s<0)s=take(all);o.slot=s;}
 for(const o of live.filter(o=>o.pref)){let s=take(others);if(s<0)s=take(all);o.slot=s;}
}
function startOnline(m){
 initAudio();
 const{N,T}=CFG[m];
 assign(N,T);
 const A=ARENAS[arenaSel]||ARENAS[0];
 G=mkG(A,N,T);
 const pts=spawnPts(N);
 for(let k=0;k<N;k++){
  const human=k===0,o=NET.conns.find(c=>c.slot===k&&!c.gone);
  const e=mkEnt(Math.floor(k/T),k%3,human?sel:(o?o.bi:(Math.random()*BR.length|0)),human);
  if(o)e.remote=true;
  e.x=e.sx=pts[k][0];e.y=e.sy=pts[k][1];e.ang=Math.atan2(MH/2-e.y,MW/2-e.x);
  G.ents.push(e);
 }
 P=G.ents[0];G.cx=P.x-W/S/2;G.cy=P.y-CAM_H/2;
 aim.on=false;joy.on=false;joy.x=joy.y=0;
 state='play';show(null);
 const bis=G.ents.map(e=>BR.indexOf(e.d));
 NET.conns.forEach(o=>{if(!o.gone&&o.c.open)o.c.send({t:'sdstart',arena:arenaSel,bis,slot:o.slot,N,T});});
}
const _hs=hostStart;
hostStart=function(){
 const m=mode();
 if(NET.role!=='host'||m===0)return _hs.apply(this,arguments);
 startOnline(m);
};
roomTxt=function(){
 const live=NET.conns.filter(o=>!o.gone),b=live.filter(o=>o.pref).length,m=mode();
 return 'KOD POKOJU: '+NET.code+'\nGracze: '+players()+'/6\nTryb: '+NAMES[m]+(m>1?'\nZ tobą: '+(live.length-b)+' • Osobno: '+b:'')+(m?' (reszta to boty)':'');
};
setInterval(()=>{if(NET.role==='host'&&state==='mp')st(roomTxt());},1000);

/* ---------- KLIENT ---------- */
function clientStartSD(d){
 arenaSel=d.arena;
 const A=ARENAS[d.arena]||ARENAS[0],T=d.T;
 G=mkG(A,d.N,T);
 for(let k=0;k<d.N;k++){
  const e=mkEnt(Math.floor(k/T),k%3,d.bis[k],false);
  e.tx=e.x;e.ty=e.y;G.ents.push(e);
 }
 P=G.ents[d.slot];G.cx=P.x-W/S/2;G.cy=P.y-CAM_H/2;
 aim.on=false;joy.on=false;joy.x=joy.y=0;
 state='play';show(null);
}
setInterval(()=>{
 if(NET.role==='client'&&NET.host&&!NET.host.__sd){
  NET.host.__sd=1;
  NET.host.on('data',d=>{if(d&&d.t==='sdstart'&&Array.isArray(d.bis))clientStartSD(d);});
 }
},150);

const _snap=snap;
snap=function(){
 const s=_snap();
 if(G&&G.sdc){s.gr=Math.round(G.gasR);if(G.pl)s.pl=G.pl;}
 return s;
};
const _as=applySnap;
applySnap=function(d){
 _as(d);
 if(!G||!G.sdc||!P)return;
 if(d.gr!==undefined)G.gasR=d.gr;
 if(d.pl){G.pl=d.pl;G.place=d.pl[P.team]||1;}
 if(d.o&&G.over){const w=d.w;G.winner=w===-1?-1:(w===P.team?0:1);}
};

/* ---------- GAZ I KONIEC (tylko host) ---------- */
const _rs=respawn;
respawn=function(e){if(G&&G.sdc){e.rs=1e9;return;}_rs(e);};

const _u=update;
update=function(dt){
 _u(dt);
 if(!G||!G.sdc||NET.role==='client'||G.over||G.count>0)return;
 G.sdT+=dt;const t=G.sdT,R0=960,R1=110,delay=15,dur=100;
 G.gasR=t<delay?R0:Math.max(R1,R0-(R0-R1)*(t-delay)/dur);
 G.gasTick-=dt;
 if(G.gasTick<=0){
  G.gasTick=.5;const lvl=Math.min(5,t/30);
  for(const e of G.ents)if(!e.dead&&Math.hypot(e.x-MW/2,e.y-MH/2)>G.gasR)hurt(e,150+lvl*90,null,0,0);
 }
 const alive=new Set(),teams=new Set();
 for(const e of G.ents){teams.add(e.team);if(!e.dead)alive.add(e.team);}
 for(const tm of teams)if(!alive.has(tm)&&!G.out.includes(tm))G.out.push(tm);
 const humanAlive=G.ents.some(e=>(e.human||e.remote)&&!e.dead);
 if(alive.size<=1||!humanAlive||G.sdT>360){
  let w;
  if(alive.size===1)w=[...alive][0];
  else if(alive.size===0||G.sdT>360)w=-1;
  else w=[...alive][0];
  const pl=[];
  for(const tm of teams){
   if(alive.has(tm))pl[tm]=1;
   else pl[tm]=alive.size+(G.out.length-G.out.indexOf(tm));
  }
  G.pl=pl;G.place=pl[0]||1;
  endGame(w);
 }
};

/* boty uciekają przed gazem */
const _b=botAI;
botAI=function(e,dt){
 if(G&&G.sdc&&!e.dash&&!e.remote){
  const dx=MW/2-e.x,dy=MH/2-e.y,l=Math.hypot(dx,dy)||1;
  if(l>G.gasR-50){
   const s=steer(e,dx/l,dy/l);step(e,s[0],s[1],dt);e.ang=Math.atan2(dy,dx);return;
  }
 }
 _b(e,dt);
};

/* rysowanie i wynik używają wersji z trybu Showdown */
const sw=fn=>function(){
 if(G&&G.sdc){const o=G.sd;G.sd=true;try{return fn.apply(this,arguments);}finally{G.sd=o;}}
 return fn.apply(this,arguments);
};
drawHUD=sw(drawHUD);
drawBushes=sw(drawBushes);
showResult=sw(showResult);
})();
