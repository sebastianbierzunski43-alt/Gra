(function(){
if(window.__p14)return;window.__p14=1;
let GM=0;
const LB=['DIAMENTY','⚽ PIŁKA','🎯 STREFA'];

/* ---------- PRZYCISK WYBORU TRYBU ---------- */
const bar=document.querySelector('#sel .bar');
if(bar){
 bar.style.flexWrap='wrap';
 const mb=document.createElement('button');
 mb.className='btn blue small';
 mb.style.cssText='font-size:min(4vh,15px);padding:.2em .6em;margin-left:8px';
 const lab=()=>{mb.textContent='MECZ: '+LB[GM];};lab();
 mb.onclick=()=>{GM=(GM+1)%3;lab();};
 bar.appendChild(mb);
}

/* ---------- START ---------- */
function init(){
 G.gm=GM;G.gemT=1e9;G.time=9999;G.gems.length=0;
 G.msg='';G.msgT=0;
 if(GM===1){G.bb=true;G.sc=[0,0];G.ot=false;G.bbT=120;G.ball={x:MW/2,y:MH/2,vx:0,vy:0,r:14,rot:0};}
 else{G.hz=true;G.hzp=[0,0];G.zr=170;G.zc=[0,0];G.bbT=150;}
 for(const e of G.ents){e.px=e.x;e.py=e.y;e.mv=[0,0];}
}
const _sg=startGame;
startGame=function(){
 _sg.apply(this,arguments);
 if(GM&&G&&!G.sd&&!G.sdc&&NET.role==='solo')init();
};

/* ---------- LOGIKA ---------- */
function goal(t){
 G.sc[t]++;
 G.msg='GOL! '+(t===0?'Niebiescy':'Czerwoni');G.msgT=2;
 sfx(660,.5,'triangle',.07,400);
 const b=G.ball;b.x=MW/2;b.y=MH/2;b.vx=b.vy=0;
 G.bullets.length=0;G.zones.length=0;
 for(const e of G.ents){respawn(e);e.px=e.x;e.py=e.y;e.mv=[0,0];}
 if(G.sc[t]>=3||G.ot){endGame(t);return;}
 G.count=2.2;
}
function ballStep(dt){
 const b=G.ball;
 for(const e of G.ents){
  if(e.dead)continue;
  const dx=b.x-e.x,dy=b.y-e.y,d=Math.hypot(dx,dy),m=e.r+b.r;
  if(d<m){
   const nx=d?dx/d:1,ny=d?dy/d:0,ox=b.x,oy=b.y;
   b.x=e.x+nx*m;b.y=e.y+ny*m;
   if(hitsSolid(b.x,b.y,b.r)){b.x=ox;b.y=oy;}
   b.vx=b.vx*.3+(e.mv[0]*1.1+nx*170)*.7;
   b.vy=b.vy*.3+(e.mv[1]*1.1+ny*170)*.7;
  }
 }
 for(const q of G.bullets){
  if(q.delay>0||q.bk)continue;
  if(Math.hypot(q.x-b.x,q.y-b.y)<q.r+b.r+4){
   q.bk=1;const k=q.splash?220:q.pierce?110:240;
   b.vx+=Math.cos(q.a)*k;b.vy+=Math.sin(q.a)*k;
  }
 }
 const sp=Math.hypot(b.vx,b.vy);
 if(sp>800){b.vx*=800/sp;b.vy*=800/sp;}
 const nx=b.x+b.vx*dt;
 if(hitsSolid(nx,b.y,b.r))b.vx=-b.vx*.6;else b.x=nx;
 const ny=b.y+b.vy*dt;
 if(hitsSolid(b.x,ny,b.r))b.vy=-b.vy*.6;else b.y=ny;
 const f=Math.pow(.25,dt);b.vx*=f;b.vy*=f;
 b.rot+=sp*dt*.02;
 if(b.y>380&&b.y<620){
  if(b.x<100){goal(1);return;}
  if(b.x>MW-100){goal(0);return;}
 }
 if(G.bbT<=0){
  if(G.sc[0]!==G.sc[1]){endGame(G.sc[0]>G.sc[1]?0:1);return;}
  if(!G.ot){G.ot=true;G.msg='DOGRYWKA!';G.msgT=2.5;}
  else if(G.bbT<-60)endGame(-1);
 }
}
function zoneStep(dt){
 const c=[0,0];
 for(const e of G.ents)if(!e.dead&&Math.hypot(e.x-MW/2,e.y-MH/2)<G.zr)c[e.team]++;
 G.zc=c;
 if(c[0]>0&&c[1]===0)G.hzp[0]+=dt;
 else if(c[1]>0&&c[0]===0)G.hzp[1]+=dt;
 for(let t=0;t<2;t++)if(G.hzp[t]>=60){endGame(t);return;}
 if(G.bbT<=0)endGame(G.hzp[0]>G.hzp[1]+.5?0:G.hzp[1]>G.hzp[0]+.5?1:-1);
}
const _u=update;
update=function(dt){
 _u(dt);
 if(!G||G.over||G.count>0||!G.gm)return;
 for(const e of G.ents){
  let vx=(e.x-e.px)/dt,vy=(e.y-e.py)/dt;
  if(Math.hypot(vx,vy)>450){vx=0;vy=0;}
  e.mv=[vx,vy];e.px=e.x;e.py=e.y;
 }
 G.bbT-=dt;if(G.msgT>0)G.msgT-=dt;
 if(G.bb)ballStep(dt);else zoneStep(dt);
};

/* ---------- AUTOCELOWANIE W PIŁKĘ ---------- */
const _fire=doFire;
doFire=function(kind,drag,ang,rg){
 if(G&&G.bb&&kind==='atk'&&!drag&&P&&!P.dead&&G.count<=0){
  const b=G.ball,d=dist(P,b);
  if(d<Math.min(P.d.rng,260))return _fire(kind,true,Math.atan2(b.y-P.y,b.x-P.x),d);
 }
 return _fire(kind,drag,ang,rg);
};

/* ---------- BOTY W BRAWL BALL ---------- */
function go(e,x,y,dt,stop){
 const dx=x-e.x,dy=y-e.y,l=Math.hypot(dx,dy);
 if(l<stop){step(e,0,0,dt);return;}
 const s=steer(e,dx/l,dy/l);step(e,s[0],s[1],dt);
 e.ang=Math.atan2(dy,dx);
}
const _bot=botAI;
botAI=function(e,dt){
 if(!G||!G.bb||e.remote||e.dash)return _bot(e,dt);
 const b=G.ball,tgX=e.team?75:MW-75,ownX=e.team?MW-75:75;
 let best=null,bd=1e9;
 for(const o of G.ents)if(o.team===e.team&&!o.dead&&!o.human){const d=dist(o,b);if(d<bd){bd=d;best=o;}}
 if(best===e){
  const dx=tgX-b.x,dy=500-b.y,dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl;
  const tb=dist(e,b),rel=(e.x-b.x)*-ux+(e.y-b.y)*-uy;
  const ab=Math.atan2(b.y-e.y,b.x-e.x),ag=Math.atan2(dy,dx);
  const aligned=rel>0&&Math.cos(ab-ag)>.7;
  e.atkCd-=0;
  if(aligned){
   if(tb<e.d.rng*.6&&e.atkCd<=0&&e.ammo>=1&&tryAttack(e,ab,tb))e.atkCd=rand(.4,.9);
   go(e,b.x,b.y,dt,8);
  }else go(e,b.x-ux*38,b.y-uy*38,dt,6);
  return;
 }
 let en=null,ed=1e9;
 for(const o of G.ents)if(o.team!==e.team&&!o.dead&&vis(o,e.team)){const d=dist(o,e);if(d<ed){ed=d;en=o;}}
 if(en&&ed<200)return _bot(e,dt);
 go(e,ownX+(b.x-ownX)*.35,500+(b.y-500)*.5+(e.i-1)*50,dt,20);
};

/* ---------- RYSOWANIE ---------- */
const _db=drawBushes;
drawBushes=function(a,b,c,d){
 _db(a,b,c,d);
 if(!G||!G.gm)return;
 ctx.save();
 if(G.hz){
  const c2=G.zc||[0,0];
  const col=c2[0]&&!c2[1]?'60,130,255':c2[1]&&!c2[0]?'255,70,70':c2[0]&&c2[1]?'190,90,255':'255,220,60';
  ctx.fillStyle='rgba('+col+','+(.18+.06*Math.sin(TIME*4))+')';
  ctx.strokeStyle='rgba('+col+',.9)';ctx.lineWidth=5;
  ctx.beginPath();ctx.arc(MW/2,MH/2,G.zr,0,7);ctx.fill();ctx.stroke();
 }
 if(G.bb){
  for(const t of[0,1]){
   const x=t?MW-100:50,col=t?'255,70,70':'60,130,255';
   ctx.fillStyle='rgba('+col+',.3)';ctx.fillRect(x,380,50,240);
   ctx.strokeStyle='rgba('+col+',.9)';ctx.lineWidth=4;ctx.strokeRect(x,380,50,240);
   ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.5)';ctx.beginPath();
   for(let i=0;i<=50;i+=12){ctx.moveTo(x+i,380);ctx.lineTo(x+i,620);}
   for(let j=0;j<=240;j+=20){ctx.moveTo(x,380+j);ctx.lineTo(x+50,380+j);}
   ctx.stroke();
  }
  const bl=G.ball;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(bl.x,bl.y+bl.r*.9,bl.r,bl.r*.5,0,0,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.strokeStyle='#14102b';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(bl.x,bl.y,bl.r,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#14102b';ctx.beginPath();ctx.arc(bl.x,bl.y,bl.r*.38,0,7);ctx.fill();
  ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<5;i++){const an=bl.rot+i*1.2566;ctx.moveTo(bl.x+Math.cos(an)*bl.r*.38,bl.y+Math.sin(an)*bl.r*.38);ctx.lineTo(bl.x+Math.cos(an)*bl.r*.95,bl.y+Math.sin(an)*bl.r*.95);}
  ctx.stroke();
 }
 ctx.restore();
};

const _hud=drawHUD;
drawHUD=function(){
 if(!G||!G.gm)return _hud();
 const cxm=W/2;
 for(const t of[0,1]){
  const x=t?cxm+36:cxm-36-96;
  rr(ctx,x,8,96,34,10);ctx.fillStyle=t?'#e83c3c':'#2f7dff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#14102b';ctx.stroke();
  tx(ctx,G.bb?'⚽ '+G.sc[t]:'🎯 '+Math.floor(G.hzp[t])+'/60',x+48,26,18);
 }
 const s=Math.max(0,Math.ceil(G.bbT)),ot=G.bb&&G.bbT<=0;
 tx(ctx,ot?'DOGRYWKA':((s/60|0)+':'+('0'+s%60).slice(-2)),cxm,26,ot?13:17);
 ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.arc(btn.px,btn.py,btn.pr,0,7);ctx.fill();
 ctx.fillStyle='#fff';ctx.fillRect(btn.px-6,btn.py-7,4,14);ctx.fillRect(btn.px+2,btn.py-7,4,14);
 if(G.count>0){
  const n=Math.ceil(G.count-.6);
  tx(ctx,n>0?n+'':'WALKA!',cxm,H*.4,n>0?90:64,'#ffd93b');
  tx(ctx,G.bb?'Wepchnij piłkę do bramy rywala (do 3 goli)':'Utrzymaj strefę przez 60 s',cxm,H*.58,16);
 }
 if(G.msgT>0)tx(ctx,G.msg,cxm,H*.28,40,'#ffd93b');
 if(P.dead)tx(ctx,'Odrodzenie za '+Math.ceil(P.rs),cxm,H*.45,34,'#fff');
 if(G.over)tx(ctx,G.winner===-1?'REMIS':G.winner===0?'ZWYCIĘSTWO!':'PORAŻKA',cxm,H*.4,70,G.winner===0?'#ffd93b':G.winner===-1?'#fff':'#ff6a6a');
};

const _sr=showResult;
showResult=function(){
 _sr.apply(this,arguments);
 try{
  if(G&&G.gm){
   $('#rs').textContent=G.bb?'Wynik: '+G.sc[0]+' : '+G.sc[1]+' • Eliminacje: '+P.kills:'Strefa: '+Math.floor(G.hzp[0])+' : '+Math.floor(G.hzp[1])+' s • Eliminacje: '+P.kills;
  }
 }catch(e){}
};
})();
