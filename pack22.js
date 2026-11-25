(function(){
if(window.__p22)return;window.__p22=1;
if(BR.some(b=>b.id==='sowa'))return;
BR.push(
{id:'sowa',name:'SOWA',role:'SNAJPER',hp:2600,spd:215,rng:760,reload:1.6,r:16,col:'#8a6a4a',skin:'#f2c9a0',hair:'#e8e8e8',gun:'#3a3a4a',bsp:1100,
 atk:'Jeden potężny strzał na bardzo duży dystans.',sup:'Przebijający pocisk, który trafia wszystkich na linii.',ac:{t:'line',w:10,len:760},sc:{t:'line',w:22,len:840}},
{id:'mlot',name:'MŁOT',role:'CIĘŻKI',hp:7200,spd:205,rng:210,reload:1.3,r:22,col:'#6a6f7a',skin:'#d9a07a',hair:null,gun:'#b0b4bc',bsp:600,
 atk:'Uderzenie w szerokim stożku, odpycha wrogów.',sup:'Wstrząs: rani i spowalnia wrogów wokół.',ac:{t:'cone',h:.4,len:210},sc:{t:'ring',r:190}},
{id:'doktor',name:'DOKTOR',role:'MEDYK',hp:3400,spd:225,rng:420,reload:1,r:17,col:'#f2f2f2',skin:'#f6d5b8',hair:'#3a8a5a',gun:'#4cd964',bsp:620,
 atk:'Kula, która rani wrogów i leczy sojuszników.',sup:'Wielkie leczenie: sojusznicy w pobliżu dostają życie i chwilową nietykalność.',ac:{t:'cone',h:.18,len:420},sc:{t:'ring',r:260}},
{id:'turbo',name:'TURBO',role:'SZYBKI',hp:3100,spd:250,rng:330,reload:1,r:16,col:'#ff5a2a',skin:'#c98a5b',hair:'#ffd93b',gun:'#555555',bsp:900,
 atk:'4 szybkie noże w wachlarzu.',sup:'Szarża przez wrogów z obrażeniami.',ac:{t:'cone',h:.28,len:330},sc:{t:'line',w:40,len:360}}
);

const st=document.createElement('style');
st.textContent='#cards,#upcards{grid-template-columns:repeat(7,1fr)!important}';
document.head.appendChild(st);

const NA={
 sowa:(e,a)=>shot(e,a,{sp:1100,rng:760,dmg:1300,r:5,col:'#bfe9ff'}),
 mlot:(e,a)=>{for(let i=0;i<5;i++)shot(e,a+(i-2)*.2,{sp:600,rng:210,dmg:480,r:7,col:'#ffb066',kb:260});},
 doktor:(e,a)=>shot(e,a,{sp:620,rng:420,dmg:520,r:14,col:'#7dffb0',pierce:1,heal:520,shape:'wave'}),
 turbo:(e,a)=>{for(let i=0;i<4;i++)shot(e,a+(i-1.5)*.13,{sp:900,rng:330,dmg:300,r:5,col:'#ffe06a'});}
};
const NS={
 sowa:(e,a)=>shot(e,a,{sp:1200,rng:840,dmg:2200,r:9,col:'#ffffff',pierce:1}),
 mlot:e=>{
  G.fx.push({k:'ring',x:e.x,y:e.y,r:190,t:.45,m:.45,col:'#ffb066'});
  for(const o of G.ents)if(!o.dead&&o.team!==e.team&&dist(o,e)<190+o.r){hurt(o,1500,e,Math.atan2(o.y-e.y,o.x-e.x),500);o.slow=2;}
 },
 doktor:e=>{
  G.fx.push({k:'ring',x:e.x,y:e.y,r:260,t:.6,m:.6,col:'#7dff7d'});
  for(const o of G.ents)if(o.team===e.team&&!o.dead&&dist(o,e)<260){heal(o,1800);o.inv=Math.max(o.inv||0,1.2);}
 },
 turbo:(e,a)=>{e.dash={t:.55,a:a,hit:new Set()};}
};
const SN={sowa:520,mlot:200,doktor:700,turbo:1100};

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
 switch(e.d.id){case'sowa':return dd<780;case'mlot':return dd<190;case'turbo':return dd>100&&dd<340;case'doktor':return false;}
 return _so(e,dd);
};
const _bai=botAI;
botAI=function(e,dt){
 if(e.d.id==='doktor'&&e.sup>=100&&!e.dead&&e.atkCd<=0){
  let n=0;for(const o of G.ents)if(o.team===e.team&&!o.dead&&dist(o,e)<240&&o.hp<o.max*.55)n++;
  if(n)trySuper(e,e.ang,0);
 }
 return _bai.apply(this,arguments);
};

/* star powery */
const _h=hurt;
hurt=function(e,dmg,src,ang,kb){
 if(src&&src.sp==='sowa')dmg*=1.15;
 if(e.sp==='mlot')dmg*=.88;
 return _h.call(this,e,dmg,src,ang,kb);
};
const _st=step;
step=function(e,mx,my,dt){const m=e.sp==='turbo'?1.08:1;_st(e,mx*m,my*m,dt);};
const _u=update;
update=function(dt){
 _u(dt);
 if(!G||G.over||G.count>0)return;
 if(typeof NET!=='undefined'&&NET.role==='client')return;
 for(const e of G.ents)if(!e.dead&&e.sp==='doktor'&&e.hp<e.max)e.hp=Math.min(e.max,e.hp+e.max*.03*dt);
};
})();
