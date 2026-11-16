(function(){
const EM=['😄','😂','😡','😭','👍','😎'];
let mx=0,my=0,mouseActive=false,mouseDown=false,click=false,supQ=false,wheel=false,cd=0;
const blk=e=>{e.preventDefault();e.stopImmediatePropagation();};
const pauseOn=()=>$('#pause').classList.contains('on');
const live=()=>G&&P&&state==='play'&&!pauseOn();
function aimM(){const ox=(P.x-G.cx)*S,oy=(P.y-G.cy)*S,dx=mx-ox,dy=my-oy;return{a:Math.atan2(dy,dx),r:clamp(Math.hypot(dx,dy)/S,100,P.d.rng)};}
function ebtn(){return{x:btn.ax-btn.ar*2.2,y:btn.ay+btn.ar*.15,r:btn.ar*.4};}
function wl(){const sp=Math.min(76,(W-60)/6);return{sp,r:sp*.43,y:H*.5,x0:W/2-sp*2.5};}
function slotAt(x,y){const w=wl();for(let i=0;i<6;i++)if(Math.hypot(x-(w.x0+i*w.sp),y-w.y)<w.r+6)return i;return -1;}
function sendEmote(i){
 if(!G||!P||P.dead)return;
 if(P.emote&&P.emote.t>1.9)return;
 P.emote={i,t:2.5};
 if(typeof NET!=='undefined'&&NET.role==='client'&&NET.host&&NET.host.open)NET.host.send({t:'em',i});
}

/* wejście */
window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){mouseActive=true;mx=e.clientX;my=e.clientY;}},true);
window.addEventListener('pointerdown',e=>{
 if(e.target!==cv||!live())return;
 initAudio();
 const x=e.clientX,y=e.clientY;
 if(e.pointerType==='mouse'){mouseActive=true;mx=x;my=y;}
 if(wheel){const i=slotAt(x,y);wheel=false;if(i>=0)sendEmote(i);blk(e);return;}
 if(e.pointerType!=='mouse'){
  const b=ebtn();
  if(Math.hypot(x-b.x,y-b.y)<b.r+10){wheel=true;blk(e);return;}
  return;
 }
 blk(e);
 if(Math.hypot(x-btn.px,y-btn.py)<btn.pr+10){pauseGame();return;}
 if(e.button===2)supQ=true;else{mouseDown=true;click=true;}
},true);
window.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button!==2)mouseDown=false;},true);
window.addEventListener('pointercancel',()=>{mouseDown=false;},true);
window.addEventListener('blur',()=>{mouseDown=false;});
window.addEventListener('keydown',e=>{
 const t=e.target;if(t&&t.tagName==='INPUT')return;
 const k=e.key.toLowerCase();
 if(k==='escape'){
  if(pauseOn()){$('#resume').click();blk(e);return;}
  if(wheel){wheel=false;blk(e);return;}
  if(G&&P&&state==='play'){pauseGame();blk(e);}
  return;
 }
 if(!live())return;
 if(k==='x'){blk(e);if(!e.repeat)wheel=!wheel;return;}
 if(wheel&&k.length===1&&k>='1'&&k<='6'){blk(e);wheel=false;sendEmote(+k-1);return;}
 if(k==='e'||k==='k'){blk(e);if(!e.repeat)supQ=true;return;}
 if(k===' '){blk(e);if(!e.repeat)click=true;}
},true);

/* co klatkę */
function tick(dt){
 if(!G)return;
 const isClient=typeof NET!=='undefined'&&NET.role==='client';
 for(const e of G.ents){
  if(e.emote){e.emote.t-=dt;if(e.emote.t<=0)e.emote=null;}
  else if(!isClient&&!e.human&&!e.remote&&!e.dead&&state==='play'&&Math.random()<dt/25)e.emote={i:Math.random()*6|0,t:2.5};
 }
 if(typeof NET!=='undefined'&&NET.role==='host'){
  for(const o of NET.conns){
   if(o._em)continue;o._em=1;
   o.c.on('data',d=>{
    if(d&&d.t==='em'&&G){const e=G.ents[o.slot],i=d.i|0;
     if(e&&i>=0&&i<6&&(!e.emote||e.emote.t<1.9))e.emote={i,t:2.5};}
   });
  }
 }
 cd-=dt;
 if(live()){
  if(mouseActive&&!P.dead&&!wheel){
   const m=aimM();
   aim.on=true;aim.id=-999;aim.kind='atk';aim.mode='mouse';aim.ang=m.a;aim.dist=m.r;aim.drag=true;
   if(click||(mouseDown&&cd<=0)){doFire('atk',true,m.a,m.r);click=false;cd=.12;}
   if(supQ){doFire('sup',true,m.a,m.r);supQ=false;}
  }else{
   if(aim.id===-999){aim.on=false;aim.id=-1;}
   if(!wheel){if(click)doFire('atk',false,0,0);if(supQ)doFire('sup',false,0,0);}
   click=false;supQ=false;
  }
 }else{
  if(aim.id===-999){aim.on=false;aim.id=-1;}
  click=false;supQ=false;wheel=false;
 }
}
const _u=update;
update=function(dt){tick(dt);_u(dt);};

/* synchronizacja emotek w multiplayerze */
const _snap=snap;
snap=function(){
 const s=_snap();s.em=[];
 G.ents.forEach((e,k)=>{if(e.emote&&e.emote.t>0)s.em.push([k,e.emote.i,+e.emote.t.toFixed(2)]);});
 return s;
};
const _as=applySnap;
applySnap=function(d){
 _as(d);
 if(d.em&&G)for(const a of d.em){
  const e=G.ents[a[0]];if(!e)continue;const c=e.emote;
  if(!c||c.t<=0||(c.i!==a[1]&&a[2]>c.t+.3))e.emote={i:a[1],t:a[2]};
 }
};

/* rysowanie */
function bubble(e){
 const m=e.emote,age=2.5-m.t;
 const sc=age<.2?.3+age/.2*.9:age<.3?1.2-(age-.2)*2:1;
 ctx.save();ctx.globalAlpha=m.t<.4?m.t/.4:1;
 ctx.translate(e.x,e.y-e.r*2.3-56);ctx.scale(sc,sc);
 ctx.lineWidth=4;ctx.lineJoin='round';ctx.strokeStyle='#14102b';ctx.fillStyle='#fff';
 rr(ctx,-28,-24,56,48,14);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-8,23);ctx.lineTo(0,34);ctx.lineTo(8,23);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#fff';ctx.fillRect(-7,20,14,6);
 ctx.font='30px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';
 ctx.fillText(EM[m.i],0,2);
 ctx.restore();
}
const _db=drawBushes;
drawBushes=function(a,b,c,d){
 _db(a,b,c,d);
 for(const e of G.ents)if(e.emote&&e.emote.t>0&&!e.dead&&vis(e,P.team))bubble(e);
};
function superBar(){
 const w=180,x=W/2-w/2,y=H-30,f=clamp(P.sup/100,0,1),rdy=P.sup>=100;
 rr(ctx,x-3,y-3,w+6,20,8);ctx.fillStyle='#14102b';ctx.fill();
 rr(ctx,x,y,Math.max(6,w*f),14,6);ctx.fillStyle=rdy?'#ffd93b':'#a24bff';ctx.fill();
 tx(ctx,rdy?'SUPER GOTOWY [E]':'SUPER',W/2,y-12,13,rdy?'#ffd93b':'#fff');
 tx(ctx,'X: emotki',W-56,H-14,12);
}
function emoteBtn(){
 const b=ebtn();
 ctx.fillStyle='#ffd93b';circ(b.x,b.y,b.r);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#14102b';ctx.stroke();
 ctx.font=(b.r*1.25)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';
 ctx.fillText('😄',b.x,b.y+2);
}
function drawWheel(){
 const w=wl();
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,W,H);
 rr(ctx,w.x0-w.sp*.6,w.y-w.r-34,w.sp*6.2,w.r*2+58,18);ctx.fillStyle='rgba(27,17,64,.92)';ctx.fill();
 ctx.lineWidth=4;ctx.strokeStyle='#14102b';ctx.stroke();
 tx(ctx,'EMOTKI',W/2,w.y-w.r-16,15,'#ffd93b');
 for(let i=0;i<6;i++){
  const x=w.x0+i*w.sp;
  ctx.fillStyle='#fff';circ(x,w.y,w.r);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#14102b';ctx.stroke();
  ctx.font=(w.r*1.3)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';
  ctx.fillText(EM[i],x,w.y+2);
  if(mouseActive)tx(ctx,''+(i+1),x,w.y+w.r+14,12);
 }
}
const _dc=drawControls;
drawControls=function(){
 if(!G||G.over||!P)return;
 if(mouseActive)superBar();else{_dc();emoteBtn();}
 if(wheel)drawWheel();
};

const h=document.querySelector('.hint');
if(h)h.innerHTML+='<br>PC: WASD ruch • mysz: celowanie • LPM: strzał • E / PPM: super • X: emotki • Esc: pauza';
})();
