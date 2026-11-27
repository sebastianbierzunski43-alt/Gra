(function(){
if(window.__p27)return;window.__p27=1;
const NEW=[
{id:'piper',name:'PIPER',role:'SNAJPER',hp:3200,spd:220,rng:720,reload:1.4,r:17,col:'#ff8fd0',skin:'#f6d5b8',hair:'#ffd93b',gun:'#ffb3e6',bsp:1000,
 atk:'Strzał, który rani mocniej z dużej odległości.',sup:'Bomby: 4 granaty spadają we wskazanym miejscu.',ac:{t:'line',w:10,len:720},sc:{t:'circ',r:120,len:560}},
{id:'pam',name:'PAM',role:'WSPARCIE',hp:4400,spd:215,rng:380,reload:1.1,r:18,col:'#d9803a',skin:'#c98a5b',hair:'#ff9a3a',gun:'#b0b4bc',bsp:800,
 atk:'Śrut z wiatrówki, szeroki rozrzut.',sup:'Stawia strefę, która leczy sojuszników przez 6 s.',ac:{t:'cone',h:.3,len:380},sc:{t:'ring',r:60}},
{id:'primo',name:'EL PRIMO',role:'ZAPAŚNIK',hp:7600,spd:235,rng:170,reload:1.2,r:22,col:'#e8a020',skin:'#e0a070',hair:null,gun:'#c33',bsp:700,
 atk:'Seria szybkich ciosów z bliska.',sup:'Skok: lądujesz w wybranym miejscu i robisz wybuch.',ac:{t:'cone',h:.5,len:170},sc:{t:'circ',r:130,len:360}},
{id:'rico',name:'RICO',role:'ROBOT',hp:3600,spd:225,rng:520,reload:1,r:17,col:'#2fd9c0',skin:'#d0d8e0',hair:null,gun:'#4a4a5a',bsp:1000,
 atk:'Seria 5 szybkich pocisków.',sup:'Salwa 12 pocisków w szerokim wachlarzu.',ac:{t:'line',w:12,len:520},sc:{t:'cone',h:.5,len:480}},
{id:'kostka',name:'KOSTKA',role:'BUDOWNICZY',hp:4600,spd:225,rng:260,reload:1.1,r:18,col:'#3a9bd9',skin:'#c68e5f',hair:'#4a2e1a',gun:'#8a5a2a',bsp:760,
 atk:'Kilof: wachlarz odłamków z odpychaniem.',sup:'Buduje mur z 3 klocków na 6 s, blokuje ruch i pociski.',ac:{t:'cone',h:.35,len:260},sc:{t:'circ',r:60,len:120}}
].filter(b=>!BR.some(x=>x.id===b.id));
if(!NEW.length)return;
BR.push(...NEW);

const st=document.createElement('style');
st.textContent='#cards,#upcards{grid-template-columns:repeat(7,1fr)!important}';
document.head.appendChild(st);

const rnd=(a,b)=>a+Math.random()*(b-a);
const at=(e,a,L)=>[e.x+Math.cos(a)*L,e.y+Math.sin(a)*L];
const bomb=(e,px,py,t,dmg,r)=>{(G.dyn=G.dyn||[]).push({sx:e.x,sy:e.y,tx:px,ty:py,t:t,m:t,o:e,team:e.team,dmg:dmg,r:r});};

function wall(e,a){
 const px=e.x+Math.cos(a)*90,py=e.y+Math.sin(a)*90,nx=-Math.sin(a),ny=Math.cos(a);
 for(let k=-1;k<=1;k++){
  const x=px+nx*k*TS,y=py+ny*k*TS,tx=x/TS|0,ty=y/TS|0;
  if(tx<1||ty<1||tx>=COLS-1||ty>=ROWS-1)continue;
  if(G.grid[ty][tx]!==0)continue;
  if(G.ents.some(o=>!o.dead&&Math.hypot(o.x-(tx*TS+25),o.y-(ty*TS+25))<TS*.5+o.r))continue;
  G.grid[ty][tx]=1;(G.blk=G.blk||[]).push({tx:tx,ty:ty,t:6});
 }
}

const NA={
 piper:(e,a,rg)=>shot(e,a,{sp:1000,rng:720,dmg:450+Math.min(rg||400,720)*1.6,r:6,col:'#ffb3e6'}),
 pam:(e,a)=>{for(let i=0;i<6;i++)shot(e,a+(i-2.5)*.1,{sp:800,rng:380,dmg:280,r:5,col:'#ffb066'});},
 primo:(e,a)=>{for(let i=0;i<5;i++)shot(e,a+(i-2)*.25,{sp:700,rng:170,dmg:420,r:8,col:'#ffd23f',kb:200});},
 rico:(e,a)=>{for(let i=0;i<5;i++)shot(e,a+rnd(-.04,.04),{sp:1000,rng:520,dmg:330,r:5,col:'#7dffd6',delay:i*.06});},
 kostka:(e,a)=>{for(let i=0;i<5;i++)shot(e,a+(i-2)*.16,{sp:760,rng:260,dmg:380,r:6,col:'#d9a066',kb:220});}
};
const NS={
 piper:(e,a,rg)=>{const p=at(e,a,clamp(rg,150,560));for(let i=0;i<4;i++)bomb(e,p[0]+rnd(-70,70),p[1]+rnd(-70,70),.7+i*.15,800,90);},
 pam:e=>{(G.hf=G.hf||[]).push({x:e.x,y:e.y,r:200,t:6,cd:.3,team:e.team});},
 primo:(e,a,rg)=>{const p=at(e,a,clamp(rg,100,360));(G.jmp=G.jmp||[]).push({e:e,px:p[0],py:p[1],t:.55});e.inv=Math.max(e.inv||0,.6);},
 rico:(e,a)=>{for(let i=0;i<12;i++)shot(e,a+(i-5.5)*.09,{sp:1000,rng:480,dmg:380,r:5,col:'#7dffd6',delay:i*.03});},
 kostka:(e,a)=>wall(e,a)
};
const SN={piper:1200,pam:480,primo:180,rico:1000,kostka:260};

const _ta=tryAttack;
tryAttack=function(e,ang,rg){
 const f=NA[e.d.id];
 if(!f)return _ta.apply(this,arguments);
 if(e.dead||e.ammo<1||e.atkCd>0)return false;
 e.ammo-=1;e.atkCd=.2;e.ang=ang;e.reveal=.9;
 f(e,ang,rg);
 if(P&&dist(e,P)<650)sfx(SN[e.d.id],.1,'square',.04,-200);
 return true;
};
const _ts=trySuper;
trySuper=function(e,ang,rg){
 const f=NS[e.d.id];
 if(!f)return _ts.apply(this,arguments);
 if(e.dead||e.sup<100)return false;
 e.sup=0;e.ang=ang;e.reveal=1.2;
 f(e,ang,rg);
 sfx(240,.4,'sawtooth',.06,300);
 return true;
};

/* boty */
const _so=superOk;
superOk=function(e,dd){
 switch(e.d.id){case'piper':return dd<600;case'primo':return dd>100&&dd<340;case'rico':return dd<460;case'pam':return false;case'kostka':return false;}
 return _so(e,dd);
};
const _bai=botAI;
botAI=function(e,dt){
 if(e.d.id==='pam'&&e.sup>=100&&!e.dead&&e.atkCd<=0){
  let n=0;for(const o of G.ents)if(o.team===e.team&&!o.dead&&dist(o,e)<200&&o.hp<o.max*.6)n++;
  if(n)trySuper(e,e.ang,0);
 }
 if(e.d.id==='kostka'&&e.sup>=100&&!e.dead&&e.atkCd<=0&&e.ai&&e.ai.tgt&&!e.ai.tgt.dead&&dist(e,e.ai.tgt)<300)trySuper(e,e.ang,0);
 return _bai.apply(this,arguments);
};

/* efekty: skok, strefa leczenia, mur */
const _u=update;
update=function(dt){
 _u(dt);
 if(!G||G.over||G.count>0)return;
 if(typeof NET!=='undefined'&&NET.role==='client')return;
 if(G.jmp)for(let i=G.jmp.length-1;i>=0;i--){
  const j=G.jmp[i],e=j.e;j.t-=dt;
  if(e.dead){G.jmp.splice(i,1);continue;}
  e.inv=Math.max(e.inv||0,.2);
  if(j.t<=0){
   if(!hitsSolid(j.px,j.py,e.r)){e.x=j.px;e.y=j.py;}
   boom(e.x,e.y,130,1800,e,e.team);G.jmp.splice(i,1);
  }
 }
 if(G.hf)for(let i=G.hf.length-1;i>=0;i--){
  const f=G.hf[i];f.t-=dt;f.cd-=dt;
  if(f.t<=0){G.hf.splice(i,1);continue;}
  if(f.cd<=0){f.cd=.5;for(const o of G.ents)if(!o.dead&&o.team===f.team&&Math.hypot(o.x-f.x,o.y-f.y)<f.r+o.r)heal(o,400);}
 }
 if(G.blk)for(let i=G.blk.length-1;i>=0;i--){
  const b=G.blk[i];b.t-=dt;
  if(b.t<=0){if(G.grid[b.ty]&&G.grid[b.ty][b.tx]===1)G.grid[b.ty][b.tx]=0;G.blk.splice(i,1);}
 }
};

/* rysowanie efektów */
const _db=drawBushes;
drawBushes=function(a,b,c,d){
 _db(a,b,c,d);
 if(!G)return;
 for(const f of G.hf||[]){
  ctx.fillStyle='rgba(80,255,120,'+(.15+.06*Math.sin(TIME*5))+')';ctx.strokeStyle='rgba(60,200,90,.85)';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();ctx.stroke();
  tx(ctx,'✚',f.x,f.y,28,'#7dff7d');
 }
 for(const j of G.jmp||[]){
  ctx.fillStyle='rgba(255,60,60,.2)';ctx.strokeStyle='rgba(255,60,60,.8)';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(j.px,j.py,130,0,7);ctx.fill();ctx.stroke();
 }
};

/* wygląd Kostki: kwadratowa głowa */
const _dbk=drawBrawler;
drawBrawler=function(c,x,y,d,ang,o){
 if(d.id!=='kostka')return _dbk.apply(this,arguments);
 o=o||{};const s=o.s||1,r=d.r*s,f=!!o.flash,gx=Math.cos(ang),gy=Math.sin(ang);
 c.save();c.translate(x,y);c.lineJoin='miter';c.strokeStyle='#14102b';c.lineWidth=3*s;
 const box=(col,bx,by,w,h)=>{c.fillStyle=f?'#fff':col;c.fillRect(bx,by,w,h);c.strokeRect(bx,by,w,h);};
 box('#3b3b8a',-r*.75,r*.75,r*.7,r*.4);box('#3b3b8a',r*.05,r*.75,r*.7,r*.4);
 box('#3a9bd9',-r*.75,-r*.1,r*1.5,r*.95);
 c.lineCap='butt';c.strokeStyle='#14102b';c.lineWidth=9*s;
 c.beginPath();c.moveTo(gx*r*.2,r*.35+gy*r*.2);c.lineTo(gx*r*1.5,r*.35+gy*r*1.5);c.stroke();
 c.strokeStyle=f?'#fff':'#8a5a2a';c.lineWidth=5*s;c.stroke();
 c.save();c.translate(gx*r*1.5,r*.35+gy*r*1.5);c.rotate(ang);
 c.fillStyle=f?'#fff':'#9aa0a8';c.strokeStyle='#14102b';c.lineWidth=2*s;c.fillRect(-r*.1,-r*.5,r*.25,r);c.strokeRect(-r*.1,-r*.5,r*.25,r);
 c.restore();
 c.strokeStyle='#14102b';c.lineWidth=3*s;
 box('#c68e5f',-r*.7,-r*1.35,r*1.4,r*1.4);
 box('#4a2e1a',-r*.7,-r*1.35,r*1.4,r*.4);
 if(!f)for(const k of[-1,1]){
  const ex=k*r*.35-r*.14,ey=-r*.75;
  c.fillStyle='#fff';c.fillRect(ex,ey,r*.28,r*.2);
  c.fillStyle='#3a5fd9';c.fillRect(ex+r*.07+gx*r*.05,ey+r*.04,r*.14,r*.14);
 }
 if(!f){c.fillStyle='#7a4a2a';c.fillRect(-r*.2,-r*.35,r*.4,r*.12);}
 c.restore();
};
})();
