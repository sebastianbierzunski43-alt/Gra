(function(){
if(window.__p15)return;window.__p15=1;
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const solid=(x,y)=>x<0||y<0||x>=COLS||y>=ROWS||isSolid(G.grid[y][x]);
function clear(e,x2,y2){
 const d=Math.hypot(x2-e.x,y2-e.y),n=Math.ceil(d/14);
 for(let i=1;i<=n;i++)if(hitsSolid(e.x+(x2-e.x)*i/n,e.y+(y2-e.y)*i/n,e.r-2))return false;
 return true;
}
const gnv=e=>e.nv||(e.nv={t:0,wp:null,gx:0,gy:0,lx:e.x,ly:e.y,st:0,nu:0,na:0});
function nav(e,gx,gy){
 if(clear(e,gx,gy))return[gx,gy];
 const a=gnv(e);
 if(a.wp&&a.t>0&&Math.hypot(gx-a.gx,gy-a.gy)<TS*2)return a.wp;
 a.t=.25;a.gx=gx;a.gy=gy;
 let tx=clamp(gx/TS|0,0,COLS-1),ty=clamp(gy/TS|0,0,ROWS-1);
 if(solid(tx,ty)){
  let f=false;
  for(let r=1;r<=3&&!f;r++)for(let dy=-r;dy<=r&&!f;dy++)for(let dx=-r;dx<=r&&!f;dx++)if(!solid(tx+dx,ty+dy)){tx+=dx;ty+=dy;f=true;}
 }
 const D=new Int16Array(COLS*ROWS).fill(-1),q=[tx+ty*COLS];D[q[0]]=0;
 for(let h=0;h<q.length;h++){
  const c=q[h],cx=c%COLS,cy=c/COLS|0;
  for(const[dx,dy]of DIRS){
   const nx=cx+dx,ny=cy+dy;
   if(solid(nx,ny)||D[nx+ny*COLS]>=0)continue;
   D[nx+ny*COLS]=D[c]+1;q.push(nx+ny*COLS);
  }
 }
 let cx=clamp(e.x/TS|0,0,COLS-1),cy=clamp(e.y/TS|0,0,ROWS-1);
 if(D[cx+cy*COLS]<0){a.wp=[gx,gy];return a.wp;}
 const pts=[];
 for(let i=0;i<8;i++){
  let bx=-1,by=-1,bd=D[cx+cy*COLS];
  for(const[dx,dy]of DIRS){
   const nx=cx+dx,ny=cy+dy;
   if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;
   const v=D[nx+ny*COLS];
   if(v>=0&&v<bd){bd=v;bx=nx;by=ny;}
  }
  if(bx<0)break;
  cx=bx;cy=by;pts.push([cx*TS+TS/2,cy*TS+TS/2]);
 }
 let w=pts[0]||[gx,gy];
 for(const p of pts)if(clear(e,p[0],p[1]))w=p;
 a.wp=w;return w;
}
function mv(e,gx,gy,dt,stop){
 const a=gnv(e);a.t-=dt;a.nu-=dt;a.st+=dt;
 if(Math.hypot(gx-e.x,gy-e.y)<stop){step(e,0,0,dt);a.lx=e.x;a.ly=e.y;a.st=0;return;}
 let vx,vy;
 if(a.nu>0){vx=Math.cos(a.na);vy=Math.sin(a.na);}
 else{const w=nav(e,gx,gy),l=Math.hypot(w[0]-e.x,w[1]-e.y)||1;vx=(w[0]-e.x)/l;vy=(w[1]-e.y)/l;}
 if(a.st>=.6){
  if(Math.hypot(e.x-a.lx,e.y-a.ly)<14){a.nu=.5;a.na=Math.random()*6.28;a.wp=null;}
  a.lx=e.x;a.ly=e.y;a.st=0;
 }
 const s=steer(e,vx,vy);step(e,s[0],s[1],dt);
 if(s[0]||s[1])e.ang=Math.atan2(s[1],s[0]);
}
function fight(e,t,dt){
 const dd=dist(e,t),an=Math.atan2(t.y-e.y,t.x-e.x),ai=e.ai;
 ai.sdT-=dt;if(ai.sdT<=0){ai.sd=Math.random()<.5?1:-1;ai.sdT=rand(.8,2);}
 e.ang=an;
 const ideal=e.d.rng*.6;
 const f=dd>ideal+40?1:dd<ideal-60?-1:0;
 let vx=Math.cos(an)*f+Math.cos(an+1.57)*ai.sd*.7,vy=Math.sin(an)*f+Math.sin(an+1.57)*ai.sd*.7;
 const l=Math.hypot(vx,vy)||1;
 const s=steer(e,vx/l,vy/l);step(e,s[0],s[1],dt);
 if(e.atkCd<=0&&dd<e.d.rng*.95&&los(e.x,e.y,t.x,t.y)){
  if(e.sup>=100&&superOk(e,dd)){trySuper(e,an,dd);e.atkCd=.6;}
  else if(e.ammo>=1&&tryAttack(e,an,dd))e.atkCd=rand(.4,.9);
 }
}
function nearEnemy(e,r){
 let en=null,ed=r;
 for(const o of G.ents)if(o.team!==e.team&&!o.dead&&vis(o,e.team)){const d=dist(o,e);if(d<ed){ed=d;en=o;}}
 return en;
}
function ballBot(e,dt){
 const b=G.ball,tgX=e.team?75:MW-75,ownX=e.team?MW-75:75;
 let best=null,bd=1e9;
 for(const o of G.ents)if(o.team===e.team&&!o.dead&&!o.human){const d=dist(o,b);if(d<bd){bd=d;best=o;}}
 const en=nearEnemy(e,220);
 if(best!==e&&en)return fight(e,en,dt);
 if(best===e){
  const dx=tgX-b.x,dy=500-b.y,dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl;
  const tb=dist(e,b),rel=(e.x-b.x)*-ux+(e.y-b.y)*-uy;
  const ab=Math.atan2(b.y-e.y,b.x-e.x),ag=Math.atan2(dy,dx);
  const aligned=rel>0&&Math.cos(ab-ag)>.7;
  if(aligned){
   if(tb<e.d.rng*.6&&e.atkCd<=0&&e.ammo>=1&&tryAttack(e,ab,tb))e.atkCd=rand(.4,.9);
   mv(e,b.x,b.y,dt,8);
  }else mv(e,b.x-ux*38,b.y-uy*38,dt,6);
  return;
 }
 mv(e,ownX+(b.x-ownX)*.35,500+(b.y-500)*.5+(e.i-1)*50,dt,20);
}
function zoneBot(e,dt){
 const en=nearEnemy(e,320);
 if(en)return fight(e,en,dt);
 mv(e,MW/2+(e.team?40:-40),MH/2+(e.i-1)*50,dt,45);
}
const _b=botAI;
botAI=function(e,dt){
 if(!G||e.remote||e.dash||!(G.bb||G.hz))return _b(e,dt);
 if(G.bb)return ballBot(e,dt);
 return zoneBot(e,dt);
};
})();
