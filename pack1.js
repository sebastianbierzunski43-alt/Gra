(function(){
/* ---------- NOWE POSTACIE I OSŁABIENIA ---------- */
const fix=(id,o)=>Object.assign(BR.find(b=>b.id===id),o);
fix('brock',{hp:2900,reload:1.5,atk:'Rakieta z obrażeniami obszarowymi (osłabiona).'});
fix('poco',{hp:3900,atk:'Fala dźwięku: rani wrogów, leczy sojuszników (słabiej).',sup:'Impuls leczący sojuszników w pobliżu.'});
BR.push(
{id:'leon',name:'LEON',role:'ZABÓJCA',hp:3600,spd:240,rng:450,reload:1.1,r:17,col:'#38c26b',skin:'#f2c9a0',hair:'#3b2a1a',gun:'#bdbdbd',bsp:850,
 atk:'4 ostrza w wachlarzu.',sup:'Niewidzialność na 5 s i szybszy bieg. Atak ją przerywa.',ac:{t:'cone',h:.2,len:450},sc:{t:'ring',r:40}},
{id:'crow',name:'CROW',role:'TRUCICIEL',hp:3000,spd:245,rng:500,reload:1,r:16,col:'#2b2b44',skin:'#a9a3c9',hair:'#1a1a2a',gun:'#7b2bd0',bsp:900,
 atk:'3 zatrute sztylety. Trucizna rani przez 3 s.',sup:'Wachlarz 9 zatrutych sztyletów.',ac:{t:'cone',h:.14,len:500},sc:{t:'cone',h:.4,len:520}},
{id:'spike',name:'SPIKE',role:'KAKTUS',hp:3200,spd:220,rng:480,reload:1.15,r:17,col:'#2faa3a',skin:'#7bd35a',hair:'#ff5fa2',gun:'#2d7d2d',bsp:760,
 atk:'7 kolców w stożku.',sup:'Kaktusowe pole: rani i spowalnia wrogów.',ac:{t:'cone',h:.22,len:480},sc:{t:'circ',r:130,len:560}},
{id:'dynamike',name:'DYNAMIKE',role:'SAPER',hp:3000,spd:215,rng:600,reload:1.5,r:17,col:'#e8c53a',skin:'#c98a5b',hair:'#f2f2f2',gun:'#a33',bsp:600,
 atk:'2 laski dynamitu, lecą nad ścianami.',sup:'Wielka bomba z dużym wybuchem.',ac:{t:'circ',r:80,len:600},sc:{t:'circ',r:170,len:600}}
);

/* ---------- DŹWIĘKI POSTACI ---------- */
const SF={colt:[700,.07,'square',-300],shelly:[260,.12,'sawtooth',-150],bull:[150,.15,'sawtooth',-80],brock:[340,.18,'sine',200],poco:[520,.12,'triangle',250],leon:[1000,.09,'triangle',-400],crow:[1300,.05,'sawtooth',-600],spike:[900,.06,'square',-500],dynamike:[200,.15,'sine',300]};
function snd(e,id,sup){
 if(!G||!P||!AC)return;const d=dist(e,P);if(d>650)return;const s=SF[id];if(!s)return;const v=.05*(1-d/700);
 if(sup){sfx(s[0]*.6,.35,'sawtooth',v*1.3,300);sfx(s[0]*1.5,.2,'square',v,-200);}else sfx(s[0],s[1],s[2],v,s[3]);
}

/* ---------- ATAKI ---------- */
function dyn(e,ang,rg,off,dmg,r,t){
 const L=clamp(rg,120,600);
 (G.dyn=G.dyn||[]).push({sx:e.x,sy:e.y,tx:e.x+Math.cos(ang)*L-Math.sin(ang)*off,ty:e.y+Math.sin(ang)*L+Math.cos(ang)*off,t,m:t,o:e,team:e.team,dmg,r});
}
const MA={
 brock:(e,a,rg)=>shot(e,a,{sp:640,rng:clamp(rg,160,720),dmg:850,r:10,col:'#ff9a1f',splash:65,shape:'rocket'}),
 poco:(e,a)=>{for(let i=0;i<3;i++)shot(e,a+(i-1)*.22,{sp:700,rng:400,dmg:380,r:15,col:'#ff7ad9',pierce:1,heal:350,shape:'wave'});},
 leon:(e,a)=>{e.invis=0;for(let i=0;i<4;i++)shot(e,a+(i-1.5)*.1,{sp:850,rng:450,dmg:330,r:5,col:'#9fe6ff'});},
 crow:(e,a)=>{for(let i=0;i<3;i++)shot(e,a+(i-1)*.12,{sp:900,rng:500,dmg:300,r:5,col:'#b46bff'});},
 spike:(e,a)=>{for(let i=0;i<7;i++)shot(e,a+(i-3)*.07,{sp:760,rng:480,dmg:240,r:5,col:'#7dff5a'});},
 dynamike:(e,a,rg)=>{dyn(e,a,rg,-30,560,80,.6);dyn(e,a,rg,30,560,80,.7);}
};
const MS={
 brock:(e,a,rg)=>{const L=clamp(rg,150,720),px=e.x+Math.cos(a)*L,py=e.y+Math.sin(a)*L;
  for(let i=0;i<6;i++){const q=Math.random()*6.28,rd=Math.sqrt(Math.random())*110,t=.5+i*.13;G.zones.push({x:px+Math.cos(q)*rd,y:py+Math.sin(q)*rd,t,m:t,r:70,dmg:800,o:e,team:e.team});}},
 poco:(e)=>{for(const o of G.ents)if(o.team===e.team&&!o.dead&&dist(o,e)<230)heal(o,1500);G.fx.push({k:'ring',x:e.x,y:e.y,r:230,t:.6,m:.6,col:'#7dff7d'});},
 leon:(e)=>{e.invis=5;e.reveal=0;},
 crow:(e,a)=>{for(let i=0;i<9;i++)shot(e,a+(i-4)*.09,{sp:900,rng:520,dmg:300,r:6,col:'#b46bff'});},
 spike:(e,a,rg)=>{const L=clamp(rg,100,560);(G.fields=G.fields||[]).push({x:e.x+Math.cos(a)*L,y:e.y+Math.sin(a)*L,r:130,t:4.5,tick:.2,team:e.team,o:e});},
 dynamike:(e,a,rg)=>dyn(e,a,rg,0,1400,170,.8)
};
const _ta=tryAttack;
tryAttack=function(e,ang,rg){
 const id=e.d.id;
 if(!MA[id]){const r=_ta(e,ang,rg);if(r)snd(e,id,false);return r;}
 if(e.dead||e.ammo<1||e.atkCd>0)return false;
 e.ammo-=1;e.atkCd=.2;e.ang=ang;e.reveal=.9;
 MA[id](e,ang,rg);snd(e,id,false);return true;
};
const _ts=trySuper;
trySuper=function(e,ang,rg){
 const id=e.d.id;
 if(!MS[id]){const r=_ts(e,ang,rg);if(r)snd(e,id,true);return r;}
 if(e.dead||e.sup<100)return false;
 e.sup=0;e.ang=ang;e.reveal=1.2;
 MS[id](e,ang,rg);snd(e,id,true);return true;
};

/* ---------- EFEKTY: trucizna, niewidzialność, spowolnienie ---------- */
let inPoison=false;
const _h=hurt;
hurt=function(e,dmg,src,ang,kb){
 _h(e,dmg,src,ang,kb);
 if(!inPoison&&src&&src.d&&src.d.id==='crow'&&!e.dead&&e.team!==src.team){e.pz=3;e.pzSrc=src;e.pt=.5;}
};
const _vis=vis;
vis=function(t,team){
 if(t.invis>0&&t.team!==team&&!t.dead){
  for(const o of G.ents)if(o.team===team&&!o.dead&&dist(o,t)<110)return true;
  return false;
 }
 return _vis(t,team);
};
const _st=step;
step=function(e,mx,my,dt){let m=1;if(e.invis>0)m*=1.2;if(e.slow>0)m*=.55;_st(e,mx*m,my*m,dt);};
const _rs=respawn;
respawn=function(e){_rs(e);e.pz=0;e.invis=0;e.slow=0;};
const _so=superOk;
superOk=function(e,dd){
 switch(e.d.id){case'crow':return dd<500;case'spike':return dd>120&&dd<540;case'dynamike':return dd>150&&dd<560;case'leon':return false;}
 return _so(e,dd);
};

const _upd=update;
update=function(dt){
 _upd(dt);
 if(!G||G.over||G.count>0)return;
 if(typeof NET!=='undefined'&&NET.role==='client')return;
 for(const e of G.ents){
  if(e.invis>0)e.invis-=dt;
  if(e.slow>0)e.slow-=dt;
  if(e.dead){e.pz=0;continue;}
  if(e.pz>0){e.pz-=dt;e.pt-=dt;if(e.pt<=0){e.pt=.5;inPoison=true;hurt(e,70,e.pzSrc,0,0);inPoison=false;}}
 }
 if(G.dyn)for(let i=G.dyn.length-1;i>=0;i--){const d=G.dyn[i];d.t-=dt;if(d.t<=0){boom(d.tx,d.ty,d.r,d.dmg,d.o,d.team);G.dyn.splice(i,1);}}
 if(G.fields)for(let i=G.fields.length-1;i>=0;i--){
  const f=G.fields[i];f.t-=dt;f.tick-=dt;
  for(const e of G.ents)if(!e.dead&&e.team!==f.team&&dist(e,f)<f.r+e.r)e.slow=.3;
  if(f.tick<=0){f.tick=.5;for(const e of G.ents)if(!e.dead&&e.team!==f.team&&dist(e,f)<f.r+e.r)hurt(e,170,f.o,0,0);}
  if(f.t<=0)G.fields.splice(i,1);
 }
};

/* ---------- RYSOWANIE EFEKTÓW ---------- */
const _db=drawBushes;
drawBushes=function(a,b,c,d){
 _db(a,b,c,d);
 for(const f of G.fields||[]){
  ctx.fillStyle='rgba(80,200,60,'+(.18+.07*Math.sin(TIME*5))+')';ctx.strokeStyle='rgba(40,140,40,.8)';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();ctx.stroke();
  for(let k=0;k<8;k++){const an=k*Math.PI/4,x=f.x+Math.cos(an)*f.r*.6,y=f.y+Math.sin(an)*f.r*.6;ctx.fillStyle='#2faa3a';ctx.strokeStyle='#14102b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x+7,y+6);ctx.lineTo(x-7,y+6);ctx.closePath();ctx.fill();ctx.stroke();}
 }
 for(const d of G.dyn||[]){
  const f=1-d.t/d.m,x=d.sx+(d.tx-d.sx)*f,y=d.sy+(d.ty-d.sy)*f-Math.sin(f*Math.PI)*70;
  ctx.fillStyle='rgba(255,60,60,.18)';ctx.strokeStyle='rgba(255,60,60,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(d.tx,d.ty,d.r,0,7);ctx.fill();ctx.stroke();
  ctx.save();ctx.translate(x,y);ctx.rotate(f*12);ctx.fillStyle='#d33';ctx.strokeStyle='#14102b';ctx.lineWidth=3;ctx.fillRect(-6,-12,12,24);ctx.strokeRect(-6,-12,12,24);ctx.fillStyle='#ffd93b';ctx.beginPath();ctx.arc(0,-15,4,0,7);ctx.fill();ctx.restore();
 }
 for(const e of G.ents){
  if(e.dead)continue;
  if(e.invis>0&&e.team===P.team){ctx.setLineDash([6,6]);ctx.strokeStyle='#9fe6ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,e.r+8,0,7);ctx.stroke();ctx.setLineDash([]);}
  if(e.pz>0&&_vis(e,P.team)){ctx.fillStyle='#7dff5a';ctx.strokeStyle='#14102b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y-e.r*2.9,5,0,7);ctx.fill();ctx.stroke();}
 }
};

/* ---------- BOTY: dwa cele (walka i kryształy) ---------- */
const _bai=botAI;
botAI=function(e,dt){
 if(e.greedy===undefined)e.greedy=Math.random();
 if(!e.remote&&!e.dash&&e.ai2&&!G.over){
  const a=e.ai2;let gem=null,gd=420,near=false;
  for(const q of G.gems){const x=dist(e,q);if(x<gd){gd=x;gem=q;}}
  for(const t of G.ents){if(t.team===e.team||t.dead||!vis(t,e.team))continue;if(dist(e,t)<230){near=true;break;}}
  if(gem&&!near&&e.greedy>.35&&teamGems(e.team)<NEED&&teamGems(1-e.team)<NEED&&e.hp>e.max*.35){a.tgt=null;a.gem=gem;a.t=.25;}
 }
 if(e.d.id==='leon'&&e.sup>=100&&!e.invis&&e.ai2&&e.ai2.tgt&&!e.ai2.tgt.dead&&dist(e,e.ai2.tgt)<450)trySuper(e,e.ang,0);
 _bai(e,dt);
};

/* ---------- MUZYKA ---------- */
const TH=[
 {bpm:128,root:60,sc:[0,2,4,5,7,9,11],prog:[0,-3,-5,-1]},
 {bpm:112,root:57,sc:[0,1,4,5,7,8,10],prog:[0,0,-2,-4]},
 {bpm:96,root:64,sc:[0,2,3,7,9],prog:[0,-4,-2,-5]},
 {bpm:104,root:55,sc:[0,2,4,7,9],prog:[0,-3,-5,-3]}
];
let master=null,nextT=0,stepN=0,musicOn=true,noiseBuf=null;
const mtof=m=>440*Math.pow(2,(m-69)/12);
function note(f,t,d,type,v){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);}
function kick(t){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g);g.connect(master);o.start(t);o.stop(t+.17);}
function hat(t){const s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();s.buffer=noiseBuf;f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);s.connect(f);f.connect(g);g.connect(master);s.start(t);}
function theme(){
 if(G&&(state==='play'||state==='over'||state==='pause')){const i=ARENAS.indexOf(G.A);return TH[i<0?0:i];}
 return TH[3];
}
function playStep(t,th){
 const bar=stepN>>3,i=stepN&7,pr=th.prog[bar&3];
 if(i%2===0)note(mtof(th.root-12+pr),t,.22,'triangle',.5);
 if(i%4===0)kick(t);
 if(i%2===1)hat(t);
 if([1,0,1,1,0,1,1,0][i]){const deg=th.sc[(stepN*5+bar*2)%th.sc.length],oct=(stepN%7===0)?12:0;note(mtof(th.root+pr+deg+oct),t,.18,'square',.22);}
}
setInterval(()=>{
 if(!AC||!musicOn||AC.state!=='running')return;
 if(!master){master=AC.createGain();master.gain.value=.06;master.connect(AC.destination);nextT=AC.currentTime+.1;
  noiseBuf=AC.createBuffer(1,AC.sampleRate*.05,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
 if(nextT<AC.currentTime-.5)nextT=AC.currentTime+.05;
 const th=theme();
 while(nextT<AC.currentTime+.2){playStep(nextT,th);nextT+=60/th.bpm/2;stepN++;}
},60);

const mb=document.createElement('div');
mb.textContent='🔊';mb.style.cssText='position:fixed;top:6px;right:8px;z-index:60;font-size:22px;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;cursor:pointer';
mb.onclick=e=>{e.stopPropagation();musicOn=!musicOn;mb.textContent=musicOn?'🔊':'🔇';if(musicOn&&master)nextT=AC.currentTime+.1;};
mb.addEventListener('pointerdown',e=>e.stopPropagation());
document.body.appendChild(mb);
const unlock=()=>{initAudio();};
document.addEventListener('click',unlock);document.addEventListener('touchend',unlock);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.btn,.card,.ar'))sfx(660,.05,'square',.03,200);});

/* ---------- ZAKŁADKA POSTACI ---------- */
const stl=document.createElement('style');
stl.textContent='#bwinfo{background:rgba(0,0,0,.4);border:3px solid #14102b;border-radius:12px;padding:1vh 1.4vh;font:700 min(3.3vh,13px)/1.35 Arial,sans-serif}#bwinfo .nm{font:900 min(6vh,24px) "Arial Black",Impact,sans-serif;color:#ffd93b}#bwcards{flex:1.25;display:grid;grid-template-columns:repeat(5,1fr);gap:1vh;align-content:start}';
document.head.appendChild(stl);
const bw=document.createElement('div');bw.id='bw';bw.className='screen glow';
bw.innerHTML='<div class="bar"><button class="btn red small" id="bwback">◀</button><div class="h2 ol">POSTACIE</div></div><div class="wrap"><div id="bwcards"></div><div class="side"><div id="bwinfo"></div><button class="btn green small" id="bwpick">WYBIERZ</button></div></div>';
document.body.appendChild(bw);
let bwSel=0;
function buildBw(){
 const box=$('#bwcards');box.innerHTML='';
 BR.forEach((b,i)=>{
  const d=document.createElement('div');d.className='card'+(i===bwSel?' sel':'');
  d.innerHTML='<canvas width="96" height="96"></canvas><div>'+b.name+'</div>';
  drawBrawler(d.querySelector('canvas').getContext('2d'),48,54,b,.4,{s:1.55});
  d.onclick=()=>{bwSel=i;buildBw();};box.appendChild(d);
 });
 const b=BR[bwSel];
 $('#bwinfo').innerHTML='<div class="nm">'+b.name+' <span style="font-size:.5em;color:#fff">'+b.role+'</span></div>❤ '+b.hp+' &nbsp; ⚡ '+b.spd+' &nbsp; 🎯 '+b.rng+'<br><b style="color:#ff8a8a">ATAK:</b> '+b.atk+'<br><b style="color:#ffd93b">SUPER:</b> '+b.sup;
}
const pb=document.createElement('button');pb.className='btn blue small';pb.textContent='POSTACIE';
$('#play').after(pb);
pb.onclick=()=>{bwSel=sel;buildBw();state='select';show('bw');};
$('#bwback').onclick=()=>{state='menu';show('menu');};
$('#bwpick').onclick=()=>{sel=bwSel;buildSelect();state='menu';show('menu');};
buildSelect();
})();

