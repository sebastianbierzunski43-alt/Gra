(function(){
if(window.__p28)return;window.__p28=1;
const fix=(id,o)=>{const b=BR.find(x=>x.id===id);if(b)Object.assign(b,o);};
fix('kostka',{rng:400,reload:1.2,atk:'Kilof leci do przodu i wraca, rani wrogów w obie strony.',ac:{t:'line',w:24,len:400}});
fix('pam',{rng:440,reload:1.1,atk:'5 odłamków złomu w wachlarzu, przebijają wrogów.',sup:'Stawia stację leczącą, którą wrogowie mogą zniszczyć.',ac:{t:'cone',h:.17,len:440},sc:{t:'circ',r:200,len:420}});
fix('rico',{atk:'5 szybkich pocisków, które odbijają się od ścian.',sup:'Salwa 12 odbijających się pocisków.'});
fix('primo',{rng:175,atk:'Dwa szybkie ciosy pięściami.'});

const rnd=(a,b)=>a+Math.random()*(b-a);
const angd=(a,b)=>{let d=a-b;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;return Math.abs(d);};
const solidB=(x,y)=>{const t=tileAt(x,y);return t===1||t===4;};

/* ---------- KOSTKA: kilof ---------- */
function throwPick(e,a,rg){
 const L=clamp(rg||400,160,400);
 (G.pk=G.pk||[]).push({o:e,x:e.x,y:e.y,a:a,max:L,d:0,ph:0,h0:new Set(),h1:new Set(),rot:0});
}
function stepPick(p,dt){
 const e=p.o,sp=680*dt;
 if(p.ph===0){
  const nx=p.x+Math.cos(p.a)*sp,ny=p.y+Math.sin(p.a)*sp;
  if(solidB(nx,ny)||p.d+sp>=p.max)p.ph=1;
  else{p.x=nx;p.y=ny;p.d+=sp;}
 }
 if(p.ph===1){
  const dx=e.x-p.x,dy=e.y-p.y,l=Math.hypot(dx,dy);
  if(l<30||e.dead)return true;
  const m=Math.min(l,sp*1.1);p.x+=dx/l*m;p.y+=dy/l*m;
 }
 p.rot+=dt*18;
 const set=p.ph?p.h1:p.h0;
 for(const o of G.ents){
  if(o.dead||o.team===e.team||set.has(o)||o.inv>0)continue;
  if(Math.hypot(o.x-p.x,o.y-p.y)<o.r+16){set.add(o);hurt(o,820,e,Math.atan2(o.y-p.y,o.x-p.x),0);}
 }
 return false;
}

/* ---------- PAM ---------- */
function pamAtk(e,a){for(let i=0;i<5;i++)shot(e,a+(i-2)*.085,{sp:850,rng:440,dmg:270,r:5,col:'#ffb066',pierce:1});}
function pamSup(e,a,rg){
 const L=clamp(rg||0,0,420);
 let x=e.x+Math.cos(a)*L,y=e.y+Math.sin(a)*L;
 if(hitsSolid(x,y,14)){x=e.x;y=e.y;}
 (G.pt=G.pt||[]).push({x:x,y:y,r:200,hp:2600,mx:2600,t:7,cd:.3,team:e.team,o:e});
}

/* ---------- RICO ---------- */
const sb=(e,a,o,bn)=>{shot(e,a,o);const b=G.bullets[G.bullets.length-1];if(b)b.bn=bn;};
const ricoAtk=(e,a)=>{for(let i=0;i<5;i++)sb(e,a+rnd(-.03,.03),{sp:1000,rng:560,dmg:330,r:5,col:'#7dffd6',delay:i*.06},3);};
const ricoSup=(e,a)=>{for(let i=0;i<12;i++)sb(e,a+(i-5.5)*.09,{sp:1000,rng:520,dmg:380,r:5,col:'#7dffd6',delay:i*.03},4);};
const _ub=updBullets;
updBullets=function(dt){
 if(G)for(const b of G.bullets){
  if(!b.bn||b.delay>0)continue;
  const mv=b.sp*dt,nx=b.x+Math.cos(b.a)*mv,ny=b.y+Math.sin(b.a)*mv;
  if(solidB(nx,ny)){
   const sx=solidB(nx,b.y),sy=solidB(b.x,ny);
   if(sx&&!sy)b.a=Math.PI-b.a;
   else if(sy&&!sx)b.a=-b.a;
   else b.a+=Math.PI;
   b.bn--;
  }
 }
 return _ub.apply(this,arguments);
};

/* ---------- EL PRIMO: pięści ---------- */
function punch(e,a){
 e.pn=.22;e.pa=a;e.ps=-(e.ps||1);
 G.fx.push({k:'ring',x:e.x+Math.cos(a)*e.r*1.6,y:e.y+Math.sin(a)*e.r*1.6,r:50,t:.2,m:.2,col:'#ffe08a'});
 for(const o of G.ents){
  if(o.dead||o.team===e.team||o.inv>0)continue;
  if(dist(o,e)>185+o.r)continue;
  if(angd(Math.atan2(o.y-e.y,o.x-e.x),a)>.65)continue;
  if(!los(e.x,e.y,o.x,o.y))continue;
  hurt(o,560,e,a,170);
 }
}

/* ---------- PODMIANA ATAKÓW ---------- */
const OWN={
 kostka:(e,a,rg)=>throwPick(e,a,rg),
 pam:pamAtk,
 rico:ricoAtk,
 primo:(e,a)=>{punch(e,a);(G.mel=G.mel||[]).push({e:e,a:a,t:.13});}
};
const _ta=tryAttack;
tryAttack=function(e,ang,rg){
 const f=OWN[e.d.id];
 if(!f)return _ta.apply(this,arguments);
 if(e.dead||e.ammo<1||e.atkCd>0)return false;
 e.ammo-=1;e.atkCd=.2;e.ang=ang;e.reveal=.9;
 f(e,ang,rg);
 if(P&&dist(e,P)<650)sfx(e.d.id==='primo'?180:e.d.id==='kostka'?420:e.d.id==='rico'?1000:480,.1,'square',.04,-200);
 return true;
};
const OWNS={pam:pamSup,rico:ricoSup};
const _ts=trySuper;
trySuper=function(e,ang,rg){
 const f=OWNS[e.d.id];
 if(!f)return _ts.apply(this,arguments);
 if(e.dead||e.sup<100)return false;
 e.sup=0;e.ang=ang;e.reveal=1.2;
 f(e,ang,rg);
 sfx(240,.4,'sawtooth',.06,300);
 return true;
};

/* ---------- AKTUALIZACJA ---------- */
const _u=update;
update=function(dt){
 _u(dt);
 if(!G||G.over)return;
 for(const e of G.ents)if(e.pn>0)e.pn-=dt;
 if(G.count>0)return;
 if(typeof NET!=='undefined'&&NET.role==='client')return;
 if(G.mel)for(let i=G.mel.length-1;i>=0;i--){
  const m=G.mel[i];m.t-=dt;
  if(m.t<=0){if(!m.e.dead)punch(m.e,m.a);G.mel.splice(i,1);}
 }
 if(G.pk)for(let i=G.pk.length-1;i>=0;i--)if(stepPick(G.pk[i],dt))G.pk.splice(i,1);
 if(G.pt)for(let i=G.pt.length-1;i>=0;i--){
  const t=G.pt[i];t.t-=dt;t.cd-=dt;
  for(const b of G.bullets){
   if(b.team===t.team||b.delay>0||b.splash||(b.hit&&b.hit.has(t)))continue;
   if(Math.hypot(b.x-t.x,b.y-t.y)<b.r+20){t.hp-=b.dmg*((b.o&&b.o.dm)||1);if(b.hit)b.hit.add(t);else b.left=0;}
  }
  if(t.hp<=0||t.t<=0){G.pt.splice(i,1);continue;}
  if(t.cd<=0){t.cd=.5;for(const o of G.ents)if(!o.dead&&o.team===t.team&&Math.hypot(o.x-t.x,o.y-t.y)<t.r+o.r)heal(o,380);}
 }
};

/* ---------- RYSOWANIE ---------- */
const _dw=drawBushes;
drawBushes=function(a,b,c,d){
 _dw(a,b,c,d);
 if(!G)return;
 for(const t of G.pt||[]){
  ctx.fillStyle='rgba(80,255,120,'+(.12+.05*Math.sin(TIME*5))+')';ctx.strokeStyle='rgba(60,200,90,.8)';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d9803a';ctx.strokeStyle='#14102b';ctx.lineWidth=3;
  rr(ctx,t.x-16,t.y-16,32,32,8);ctx.fill();ctx.stroke();
  tx(ctx,'✚',t.x,t.y,22,'#7dff7d');
  const w=44,bx=t.x-w/2,by=t.y-30;
  rr(ctx,bx-2,by-2,w+4,9,4);ctx.fillStyle='#14102b';ctx.fill();
  rr(ctx,bx,by,Math.max(3,w*clamp(t.hp/t.mx,0,1)),5,2);ctx.fillStyle=(P&&t.team===P.team)?'#4cff5c':'#ff4a4a';ctx.fill();
 }
 for(const p of G.pk||[]){
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.lineCap='round';
  ctx.strokeStyle='#14102b';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-3,18);ctx.lineTo(0,-18);ctx.stroke();
  ctx.strokeStyle='#8a5a2a';ctx.lineWidth=5;ctx.stroke();
  ctx.strokeStyle='#14102b';ctx.lineWidth=11;ctx.beginPath();ctx.arc(0,-14,18,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
  ctx.strokeStyle='#b8bec6';ctx.lineWidth=6;ctx.stroke();
  ctx.restore();
 }
};

/* wygląd El Primo: bez broni, z rękawicami */
let curE=null;
const _de=drawEnt;
drawEnt=function(e){curE=e;try{_de(e);}finally{curE=null;}};
const _db=drawBrawler;
drawBrawler=function(c,x,y,d,ang,o){
 if(d.id!=='primo')return _db.apply(this,arguments);
 o=o||{};
 const s=o.s||1,r=d.r*s,f=!!o.flash,gx=Math.cos(ang),gy=Math.sin(ang),px=-gy,py=gx;
 let ext=0,side=1;
 if(curE&&curE.pn>0){ext=Math.sin(Math.min(1,curE.pn/.22)*Math.PI)*r*.9;side=curE.ps||1;}
 c.save();c.translate(x,y);c.lineJoin='round';c.lineCap='round';c.strokeStyle='#14102b';c.lineWidth=3*s;
 c.fillStyle=f?'#fff':d.col;c.beginPath();c.ellipse(0,r*.4,r*.95,r*.8,0,0,7);c.fill();c.stroke();
 if(!f){c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(-r*.3,r*.2,r*.3,r*.22,0,0,7);c.fill();}
 for(const k of[-1,1]){
  const out=(k===side)?ext:0;
  const fx=px*k*r*.95+gx*(r*.7+out),fy=r*.4+py*k*r*.95+gy*(r*.7+out);
  c.fillStyle=f?'#fff':'#d93a2a';c.beginPath();c.arc(fx,fy,r*.42,0,7);c.fill();c.stroke();
  if(!f){c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(fx-r*.1,fy-r*.12,r*.12,0,7);c.fill();}
 }
 c.fillStyle=f?'#fff':d.skin;c.beginPath();c.arc(0,-r*.38,r*.78,0,7);c.fill();c.stroke();
 if(!f){
  c.fillStyle='#d93a2a';c.beginPath();c.arc(0,-r*.42,r*.8,Math.PI,Math.PI*2);c.closePath();c.fill();c.stroke();
  for(const k of[-1,1]){
   const ex=k*r*.28+gx*r*.12,ey=-r*.3+gy*r*.1;
   c.fillStyle='#fff';c.lineWidth=2*s;c.beginPath();c.ellipse(ex,ey,r*.17,r*.21,0,0,7);c.fill();c.stroke();
   c.fillStyle='#14102b';c.beginPath();c.arc(ex+gx*r*.06,ey+gy*r*.07,r*.08,0,7);c.fill();
  }
 }
 c.restore();
};

try{buildSelect();}catch(e){}
})();
