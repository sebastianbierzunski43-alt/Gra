(function(){
if(window.__p29)return;window.__p29=1;
let KN=localStorage.getItem('brawlKN')==='1';

/* ---------- PRZYCISK ---------- */
const bar=document.querySelector('#sel .bar');
const kb=document.createElement('button');
kb.className='btn blue small';
kb.style.cssText='font-size:min(4vh,15px);padding:.2em .6em;margin-left:8px';
const lab=()=>{kb.textContent='NOKAUT: '+(KN?'WŁ':'WYŁ');kb.style.outline=KN?'3px solid #ffd93b':'none';};lab();
kb.onclick=()=>{KN=!KN;try{localStorage.setItem('brawlKN',KN?'1':'0');}catch(e){}lab();};
if(bar){bar.style.flexWrap='wrap';bar.appendChild(kb);}

const btnTxt=re=>[...document.querySelectorAll('#sel .bar .btn')].find(x=>re.test(x.textContent));

/* ---------- START ---------- */
const _sg=startGame;
startGame=function(){
 const tb=btnTxt(/TRYB/);
 const on=KN&&NET.role==='solo'&&tb&&/3 vs 3/.test(tb.textContent);
 if(on){
  const mb=btnTxt(/MECZ:/);let n=0;
  while(mb&&!/DIAMENTY/.test(mb.textContent)&&n++<3)mb.click();
 }
 _sg.apply(this,arguments);
 if(on&&G&&!G.sd&&!G.sdc&&!G.gm){
  G.kn=true;G.gemT=1e9;G.gems.length=0;G.time=9999;
  G.rw=[0,0];G.rn=0;G.rt=90;G.rb=0;G.msg='';
 }
};

/* brak odradzania */
const _rs=respawn;
respawn=function(e){if(G&&G.kn){e.rs=1e9;return;}_rs(e);};

/* ---------- RUNDY ---------- */
function resetRound(){
 for(const k of['bullets','zones','fx','txt','dyn','fields','jmp','pk','pt','hf','tur','mel'])if(G[k])G[k].length=0;
 for(const e of G.ents){
  e.dead=false;e.hp=e.max;e.ammo=3;e.sup=0;e.gems=0;
  e.x=e.sx;e.y=e.sy;e.inv=1;e.kx=e.ky=0;e.lh=0;e.dash=null;e.rs=0;
  e.invis=0;e.pz=0;e.slow=0;e.boost=0;e.atkCd=0;e.flash=0;
  if(e.ai)e.ai.tgt=null;
  if(e.ai2)e.ai2.tgt=null;
 }
 G.rt=90;G.count=2.2;G.msg='';
}
function endRound(al,hp){
 let w=-1,timeout=false;
 if(al[0]&&!al[1])w=0;
 else if(al[1]&&!al[0])w=1;
 else if(al[0]&&al[1]){timeout=true;w=hp[0]>hp[1]?0:hp[1]>hp[0]?1:-1;}
 G.rn++;
 if(w>=0)G.rw[w]++;
 const nm=['Niebiescy','Czerwoni'];
 G.msg=w<0?'REMIS W RUNDZIE':(timeout?'CZAS! ':'')+'Runda dla: '+nm[w];
 sfx(w===0?660:300,.4,'triangle',.06,w===0?300:-100);
 if(G.rw[0]>=2||G.rw[1]>=2||G.rn>=5){
  const f=G.rw[0]>G.rw[1]?0:G.rw[1]>G.rw[0]?1:-1;
  endGame(f);return;
 }
 G.rb=2.6;
}
const _u=update;
update=function(dt){
 if(!G||!G.kn||G.over)return _u.apply(this,arguments);
 if(G.rb>0){G.rb-=dt;updFx(dt);if(G.rb<=0)resetRound();return;}
 _u(dt);
 if(G.over||G.count>0)return;
 G.rt-=dt;
 const al=[0,0],hp=[0,0];
 for(const e of G.ents)if(!e.dead){al[e.team]++;hp[e.team]+=e.hp;}
 if(al[0]&&al[1]&&G.rt>0)return;
 endRound(al,hp);
};

/* ---------- HUD ---------- */
const _hud=drawHUD;
drawHUD=function(){
 if(!G||!G.kn)return _hud();
 const cxm=W/2,al=[0,0];
 for(const e of G.ents)if(!e.dead)al[e.team]++;
 for(const t of[0,1]){
  const x=t?cxm+36:cxm-36-96;
  rr(ctx,x,8,96,34,10);ctx.fillStyle=t?'#e83c3c':'#2f7dff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#14102b';ctx.stroke();
  tx(ctx,'👤 '+al[t],x+48,26,18);
  for(let i=0;i<2;i++){
   ctx.fillStyle=i<G.rw[t]?'#ffd93b':'rgba(0,0,0,.45)';ctx.strokeStyle='#14102b';ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(x+34+i*28,54,9,0,7);ctx.fill();ctx.stroke();
  }
 }
 const s=Math.max(0,Math.ceil(G.rt));
 tx(ctx,((s/60)|0)+':'+('0'+s%60).slice(-2),cxm,26,17);
 tx(ctx,'RUNDA '+Math.min(5,G.rn+1),cxm,50,11);
 ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.arc(btn.px,btn.py,btn.pr,0,7);ctx.fill();
 ctx.fillStyle='#fff';ctx.fillRect(btn.px-6,btn.py-7,4,14);ctx.fillRect(btn.px+2,btn.py-7,4,14);
 if(G.count>0){
  const n=Math.ceil(G.count-.6);
  tx(ctx,n>0?n+'':'WALKA!',cxm,H*.4,n>0?90:64,'#ffd93b');
  tx(ctx,'Nokaut: wygraj 2 rundy',cxm,H*.58,16);
 }
 if(G.rb>0&&G.msg)tx(ctx,G.msg,cxm,H*.35,32,'#ffd93b');
 if(P.dead&&!G.over&&G.rb<=0)tx(ctx,'Wyeliminowany',cxm,H*.45,30,'#fff');
 if(G.over)tx(ctx,G.winner===-1?'REMIS':G.winner===0?'ZWYCIĘSTWO!':'PORAŻKA',cxm,H*.4,70,G.winner===0?'#ffd93b':G.winner===-1?'#fff':'#ff6a6a');
};

/* ---------- WYNIK ---------- */
const _sr=showResult;
showResult=function(){
 _sr.apply(this,arguments);
 try{if(G&&G.kn)$('#rs').textContent='Rundy: '+G.rw[0]+' : '+G.rw[1]+' • Eliminacje: '+P.kills;}catch(e){}
};
})();
