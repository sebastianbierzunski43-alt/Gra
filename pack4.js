(function(){
if(window.__p10)return;window.__p10=1;
const KEY='brawlCreatorCodes1',WEEK=7*24*3600*1000;
const CODES={'quorek_yt':{n:'Quorek_YT',first:300,next:50}};
let U={};try{U=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(U));}catch(e){}};
const bar=document.querySelector('#sh .bar');
if(!bar)return;
const b=document.createElement('button');
b.className='btn blue small';
b.style.cssText='font-size:min(3.8vh,13px);padding:.2em .6em';
b.textContent='🎁 KOD TWÓRCY';
const coinsEl=document.getElementById('shc');
bar.insertBefore(b,coinsEl);
b.onclick=()=>{
 if(!window.__COIN){alert('Brakuje linijki window.__COIN w pack4.js');return;}
 const code=prompt('Wpisz kod twórcy:');
 if(code===null)return;
 const k=code.trim().toLowerCase(),def=CODES[k];
 if(!def){alert('Nieprawidłowy kod');return;}
 const used=U[k]||0;
 const left=used+WEEK-Date.now();
 if(used&&left>0){
  const d=Math.floor(left/86400000),h=Math.floor(left%86400000/3600000),m=Math.floor(left%3600000/60000);
  alert('Kod '+def.n+' był już użyty. Możesz go użyć ponownie za '+d+' d '+h+' h '+m+' min.');
  return;
 }
 const amount=used?def.next:def.first;
 U[k]=Date.now();save();
 window.__COIN.add(amount);
 if(coinsEl)coinsEl.textContent='🪙 '+window.__COIN.get();
 alert('Kod '+def.n+' aktywowany! Dostajesz '+amount+' monet.'+(used?'':' Następnym razem za 7 dni dostaniesz '+def.next+'.'));
};
 window.__COIN={get:()=>SV.coins,add:n=>{SV.coins+=n;save();refresh();}};
})();
