(function(){
if(window.__p31)return;window.__p31=1;
const TRK=[
{n:'Neonowe miasto',bpm:126,root:57,sc:[0,3,5,7,10],prog:[0,-4,-2,-5],lead:'sawtooth',bass:'square',
 k:[1,0,1,0,1,0,1,0],s:[0,0,1,0,0,0,1,0],h:[0,1,0,1,0,1,0,1],b:[1,0,1,1,1,0,1,0],l:[4,null,2,null,3,null,5,null]},
{n:'Dziki Zachód',bpm:104,root:52,sc:[0,2,4,7,9],prog:[0,5,0,-5],lead:'triangle',bass:'triangle',
 k:[1,0,0,0,1,0,0,1],s:[0,0,1,0,0,0,1,0],h:[1,0,1,0,1,0,1,0],b:[1,0,0,1,1,0,0,1],l:[0,null,2,3,null,2,null,4]},
{n:'Kosmiczna dżungla',bpm:112,root:59,sc:[0,2,3,7,8],prog:[0,-2,-4,-7],lead:'square',bass:'sawtooth',
 k:[1,0,0,1,0,0,1,0],s:[0,0,1,0,0,1,0,0],h:[0,1,1,0,1,1,0,1],b:[1,1,0,1,0,1,1,0],l:[5,3,null,4,2,null,3,1]},
{n:'Plażowy chill',bpm:92,root:60,sc:[0,2,4,7,9],prog:[0,-3,-5,-7],lead:'sine',bass:'sine',
 k:[1,0,0,0,0,0,1,0],s:[0,0,0,0,1,0,0,0],h:[0,1,0,1,0,1,0,1],b:[1,0,0,0,1,0,1,0],l:[2,null,4,null,3,null,null,1]},
{n:'Walka z bossem',bpm:144,root:50,sc:[0,1,4,5,7],prog:[0,0,1,-2],lead:'sawtooth',bass:'sawtooth',
 k:[1,0,1,0,1,0,1,1],s:[0,0,1,0,0,0,1,0],h:[1,1,1,1,1,1,1,1],b:[1,1,1,0,1,1,1,0],l:[4,3,2,3,4,3,2,0]}
];
const KM='brawlMusic2',KS='brawlMusicSel';
let on=localStorage.getItem(KM)!=='0',pick=localStorage.getItem(KS)||'auto';
let master=null,nb=null,next=0,stp=0,cur=-1;
const mtof=m=>440*Math.pow(2,(m-69)/12);

function ens(){
 if(master||!AC)return;
 master=AC.createGain();master.gain.value=.07;master.connect(AC.destination);
 nb=AC.createBuffer(1,Math.floor(AC.sampleRate*.08),AC.sampleRate);
 const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
}
function osc(f,t,d,type,v){
 const o=AC.createOscillator(),g=AC.createGain();
 o.type=type;o.frequency.value=f;
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);
}
function kick(t){
 const o=AC.createOscillator(),g=AC.createGain();
 o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);
 g.gain.setValueAtTime(.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+.17);
}
function noise(t,hp,v,d){
 const s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();
 s.buffer=nb;f.type='highpass';f.frequency.value=hp;
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 s.connect(f);f.connect(g);g.connect(master);s.start(t);
}
function play(t,T){
 const i=stp%8,bar=(stp>>3)%4,pr=T.prog[bar];
 if(T.k[i])kick(t);
 if(T.s[i])noise(t,1800,.22,.1);
 if(T.h[i])noise(t,7000,.1,.04);
 if(T.b[i])osc(mtof(T.root-24+pr),t,.2,T.bass,.5);
 const d=T.l[(i+bar*2)%8];
 if(d!==null&&d!==undefined){
  const n=T.sc.length,deg=T.sc[((d%n)+n)%n],oct=12*Math.floor(d/n);
  osc(mtof(T.root+pr+deg+oct+12),t,.16,T.lead,.2);
 }
 if(i===0)for(const x of[0,T.sc[2]])osc(mtof(T.root+pr+x),t,60/T.bpm*3.6,'sine',.12);
}
function auto(){
 const inM=typeof G!=='undefined'&&G&&(state==='play'||state==='over'||state==='pause'||state==='result');
 if(!inM)return 0;
 if(G.sd||G.sdc||G.kn)return 4;
 if(G.bb||G.hz)return 3;
 return ARENAS.indexOf(G.A)===2?2:1;
}
const idx=()=>pick==='auto'?auto():Math.max(0,Math.min(4,+pick));
function sched(){
 if(!AC||!on||AC.state!=='running')return;
 ens();
 const i=idx(),T=TRK[i];
 if(i!==cur){cur=i;stp=0;next=AC.currentTime+.1;}
 if(next<AC.currentTime-.5)next=AC.currentTime+.05;
 while(next<AC.currentTime+.2){play(next,T);next+=60/T.bpm/2;stp++;}
}
setInterval(sched,60);

/* ---------- PRZYCISKI ---------- */
const tsEl=document.createElement('div');
tsEl.style.cssText='position:fixed;top:50px;right:8px;z-index:200;background:rgba(0,0,0,.85);color:#fff;font:700 13px Arial,sans-serif;padding:6px 10px;border-radius:10px;display:none';
document.body.appendChild(tsEl);
let tT=0;
function toast(s){tsEl.textContent=s;tsEl.style.display='block';clearTimeout(tT);tT=setTimeout(()=>{tsEl.style.display='none';},1800);}
const CSS='position:fixed;top:6px;z-index:60;font-size:22px;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;cursor:pointer';
let old=[...document.body.children].find(x=>x.textContent==='🔊'&&x.style&&x.style.position==='fixed');
if(old){old.click();}
else{old=document.createElement('div');old.style.cssText=CSS+';right:8px';document.body.appendChild(old);old.addEventListener('pointerdown',e=>e.stopPropagation());}
old.textContent=on?'🔊':'🔇';
old.onclick=e=>{e.stopPropagation();on=!on;try{localStorage.setItem(KM,on?'1':'0');}catch(x){}old.textContent=on?'🔊':'🔇';if(on)next=0;};
const mb=document.createElement('div');
mb.style.cssText=CSS+';right:54px';mb.textContent='🎵';
mb.addEventListener('pointerdown',e=>e.stopPropagation());
mb.onclick=e=>{
 e.stopPropagation();
 pick=pick==='auto'?'0':(+pick>=4?'auto':String(+pick+1));
 try{localStorage.setItem(KS,pick);}catch(x){}
 cur=-1;
 toast(pick==='auto'?'Muzyka: AUTO':'Muzyka '+(+pick+1)+'/5: '+TRK[+pick].n);
};
document.body.appendChild(mb);
})();
