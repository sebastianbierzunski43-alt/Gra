(function(){
if(window.__p6)return;window.__p6=1;
const PAL=[
['#5a2a2a','#4f2424','#3d1b1b','#c9552b','#7a2a10','#d9822b','#a05a10','#ff7a1a','#8a3a1a','#4a1c0a'],
['#ffd1ec','#ffc2e4','#ff9fd0','#ff6fb5','#c03a85','#8fe3c0','#4fb58a','#9ad7ff','#ff8cc6','#b34a88'],
['#2b2f5e','#262a54','#3a3f78','#6a6fd0','#363a8a','#2f9d7a','#1b6b52','#1f6fd0','#4a4fa8','#272a6a'],
['#4fae4a','#47a243','#357f33','#8a6a3a','#55401c','#2f8a3a','#1b5a25','#2aa8d8','#3d7a2a','#25501a'],
['#b79af0','#ad8eea','#9a78dc','#e07acb','#a03d8a','#6fd36f','#3a9a3a','#5fc2ff','#8a6ad0','#5a3fa0'],
['#e8d48a','#e0ca7c','#c9b062','#b8893a','#7a5a1c','#8aab3a','#5a7a1c','#3ac0b8','#b8913a','#7a5f20'],
['#ffe9a8','#ffe08f','#f0c96a','#c98a55','#8a5a30','#3fbf5a','#238a3a','#27c7e8','#e0b070','#a07a40'],
['#9aa0a8','#8f959d','#7c828a','#5f6670','#363c44','#4f8f5a','#2f5f3a','#4a7ab0','#454b55','#272b32'],
['#eef8ff','#e2f2fc','#c4e0f2','#9ec9f0','#4f88c0','#5ad6b0','#2fa080','#3a7fe0','#b0d5ee','#6a9cc2'],
['#d9b27a','#d0a76d','#b88c52','#8a5a2a','#53330f','#6aa03a','#3f6a1c','#2f8fd0','#6a4420','#3d2510']
];
const mkc=a=>({f1:a[0],f2:a[1],deco:a[2],wall:a[3],wallD:a[4],bush:a[5],bushD:a[6],water:a[7],edge:a[8],edgeD:a[9]});
const GGN=['Pierścienie Lawy','Cukrowe Aleje','Filary Nocy','Rzeka Dżungli','Grzybowe Zarośla','Złote Ruiny','Tropikalne Wyspy','Kamienny Labirynt','Śnieżne Diagonale','Pirackie Skrzynie'];
const SDN=['Lawa Ostatniej Szansy','Cukrowa Arena','Nocny Las','Dżungla Śmierci','Grzybowy Bór','Pustynny Cmentarz','Wyspa Przetrwania','Kamienna Twierdza','Zamarznięty Szczyt','Zatoka Piratów'];
const GGM=GGN.map((n,i)=>({name:n,lay:i,seed:101+i*37,sd:false,c:mkc(PAL[i])}));
const SDM=SDN.map((n,i)=>({name:n,lay:(i+4)%10,seed:500+i*53,sd:true,c:mkc(PAL[i])}));

/* ---------- UKŁADY (x 0-15, y 0-9: lewa górna ćwiartka) ---------- */
const STY=[
 (x,y,h,dc)=>dc>5&&dc<6.6?(h(x,y)<.8?1:2):(dc>=6.6&&dc<8&&h(x,y)<.35?2:0),
 (x,y,h)=>x>4&&y%3===1?(x%7===3?2:1):(x>4&&h(x,y)<.08?2:0),
 (x,y,h)=>x>4&&x%3===1&&y%3===1?1:(x>4&&h(x,y)<.12?2:0),
 (x,y,h)=>(x===11||x===12)&&y!==3&&y!==6?3:(x===9&&y%2===0?2:(x>4&&h(x,y)<.07?1:0)),
 (x,y,h)=>x>3?(h(x,y)<.42?2:h(x,y)<.47?1:0):0,
 (x,y,h)=>x>3&&y===4&&x%5!==2?1:(x===8&&y<4&&y%2?1:(x>3&&h(x,y)<.1?2:0)),
 (x,y)=>{const v=Math.sin(x*.9)+Math.cos(y*1.1);return v>1.15?3:(v>.7&&x>3?2:0);},
 (x,y,h)=>x>3?(((x%2===0&&h(x,y)<.28)||(y%2===0&&h(x,y)<.22))?1:(h(x,y)<.06?2:0)):0,
 (x,y)=>x>3?((x+y)%6===0?1:(x+y)%6===3?2:0):0,
 (x,y,h)=>x>3&&(x%5===2||x%5===3)&&(y%4===1||y%4===2)?1:(x>3&&h(x,y)<.1?2:0)
];
const hsf=seed=>(x,y)=>{const s=Math.sin(x*127.1+y*311.7+seed*74.7)*43758.5453;return s-Math.floor(s);};
function genLay(A){
 const g=[];for(let y=0;y<ROWS;y++)g.push(new Array(COLS).fill(0));
 const sd=A.sd,f=STY[A.lay];
 for(let q=0;q<4;q++){
  const h=hsf(A.seed+(sd?q*17:0));
  for(let y=0;y<10;y++)for(let x=0;x<16;x++){
   const dc=Math.hypot(x+.5-16,y+.5-10);
   let t=0;
   if(dc>(sd?2.2:3.4)&&x>=1)t=f(x,y,h,dc)||0;
   if(sd&&t===0&&x>3&&dc>2.2&&h(x+9,y+4)<.05)t=2;
   if(!sd&&x<=5&&y>=5)t=0;
   const X=q&1?31-x:x,Y=q&2?19-y:y;
   g[Y][X]=t;
  }
 }
 for(let x=0;x<COLS;x++){g[0][x]=4;g[ROWS-1][x]=4;}
 for(let y=0;y<ROWS;y++){g[y][0]=4;g[y][COLS-1]=4;}
 for(let x=1;x<COLS-1;x++)for(const y of[6,9,10,13])if(isSolid(g[y][x]))g[y][x]=0;
 return g;
}
const _gm=genMap;
genMap=function(A){return A&&A.lay!==undefined?genLay(A):_gm(A);};

/* ---------- WYBÓR MAPY ---------- */
const KEY='brawlMap1';
let ST={gg:0,sd:0,r:false};
try{Object.assign(ST,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
const sv=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST));}catch(e){}};
function isSD(){
 const b=[...document.querySelectorAll('#sel .bar .btn')].find(x=>/TRYB/.test(x.textContent));
 return b?!/3 vs 3/.test(b.textContent):false;
}
function list(){
 return [0,1,2].map(i=>({o:i,name:ARENAS[i].name,c:ARENAS[i].c})).concat((isSD()?SDM:GGM).map(m=>({m,name:m.name,c:m.c})));
}
function cur(){
 const L=list(),k=isSD()?'sd':'gg',idx=Math.min(ST[k]||0,L.length-1);
 const it=ST.r?L[Math.random()*L.length|0]:L[idx];
 if(NET.role!=='solo'){arenaSel=it.o!==undefined?it.o:(Math.random()*3|0);return null;}
 if(it.o!==undefined&&!ST.r){arenaSel=it.o;return null;}
 const base=it.m||ARENAS[it.o];
 return Object.assign({},base,ST.r?{seed:(Math.random()*1e6|0)+1}:{});
}
const _sg=startGame;
startGame=function(){
 const A=cur();
 if(!A)return _sg.apply(this,arguments);
 const bak=ARENAS[0],bs=arenaSel;
 ARENAS[0]=A;arenaSel=0;
 try{_sg.apply(this,arguments);}finally{ARENAS[0]=bak;arenaSel=bs;}
};
function ui(){
 const ar=$('#arenas');if(!ar)return;
 ar.innerHTML='';
 const L=list(),k=isSD()?'sd':'gg',n=L.length,idx=Math.min(ST[k]||0,n-1),it=L[idx];
 const mk=(txt,fl,fn,bg,on)=>{
  const d=document.createElement('div');d.className='ar'+(on?' sel':'');d.style.flex=fl;
  if(bg)d.style.background=bg;d.textContent=txt;d.onclick=fn;ar.appendChild(d);
 };
 const step=dl=>()=>{ST.r=false;ST[k]=(idx+dl+n)%n;sv();buildSelect();};
 mk('◀','0 0 14%',step(-1),'#3a2a7a');
 mk(ST.r?'🎲 LOSOWA':it.name+' ('+(idx+1)+'/'+n+')','3 1 0',()=>{},'linear-gradient(135deg,'+it.c.f1+','+it.c.wall+')');
 mk('▶','0 0 14%',step(1),'#3a2a7a');
 mk('🎲','0 0 16%',()=>{ST.r=!ST.r;sv();buildSelect();},ST.r?'#e8a21f':'#3a2a7a',ST.r);
}
const _bs=buildSelect;
buildSelect=function(){_bs.apply(this,arguments);try{ui();}catch(e){}};
let lastM=isSD();
setInterval(()=>{const s=isSD();if(s!==lastM){lastM=s;buildSelect();}},300);
buildSelect();
})();
