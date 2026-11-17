(function(){
if(window.__p7)return;window.__p7=1;
const FLAG='brawlCheatOn',BK1='brawlCheatBak1',BK2='brawlCheatBak2',K1='brawlArenaSave1',K2='brawlArenaSave2';
const t=document.querySelector('#menu .title');
if(!t)return;
t.style.cursor='pointer';
const on=()=>localStorage.getItem(FLAG)==='1';
if(on())t.style.color='#8aff56';
const put=(k,v)=>{if(v===null||v===undefined)localStorage.removeItem(k);else localStorage.setItem(k,v);};
t.addEventListener('click',()=>{
 try{
  if(on()){
   put(K1,localStorage.getItem(BK1)==='__none__'?null:localStorage.getItem(BK1));
   put(K2,localStorage.getItem(BK2)==='__none__'?null:localStorage.getItem(BK2));
   localStorage.removeItem(BK1);localStorage.removeItem(BK2);localStorage.removeItem(FLAG);
   location.reload();return;
  }
  const code=prompt('Wpisz kod:');
  if(!code||code.trim().toLowerCase()!=='quorek'){if(code)alert('Zły kod');return;}
  const r1=localStorage.getItem(K1),r2=localStorage.getItem(K2);
  localStorage.setItem(BK1,r1===null?'__none__':r1);
  localStorage.setItem(BK2,r2===null?'__none__':r2);
  let s1={},s2={};
  try{s1=JSON.parse(r1||'{}')||{};}catch(e){}
  try{s2=JSON.parse(r2||'{}')||{};}catch(e){}
  s1.tr=9999;
  const lv={},g={},s={};
  BR.forEach(b=>{lv[b.id]=7;g[b.id]=1;s[b.id]=1;});
  s2.lv=lv;s2.g=g;s2.s=s;if(typeof s2.coins!=='number')s2.coins=100;
  localStorage.setItem(K1,JSON.stringify(s1));
  localStorage.setItem(K2,JSON.stringify(s2));
  localStorage.setItem(FLAG,'1');
  location.reload();
 }catch(e){alert('Nie udało się zapisać (tryb prywatny?)');}
});
})();
