(function(){
if(window.__p25)return;window.__p25=1;
const SB_URL='https://yrgtufmvihgpjrfgtdyb.supabase.co';
const SB_KEY='sb_publishable_DVZQDDrMjlL_ZhxtCuMZkQ_S57O0Vej';
const KT='brawlTrophyCfg1';
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const myId=()=>(jget('brawlFriends1',{}).id||'');
const hdr={'apikey':SB_KEY};
const ok=/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SB_URL)&&SB_KEY.length>20;
window.__TR=jget(KT,null);
async function get(path){
 const r=await fetch(SB_URL+path,{headers:hdr});
 if(!r.ok)throw new Error('HTTP '+r.status);
 return r.json();
}
async function loadCfg(){
 try{
  const r=await get('/rest/v1/settings?key=eq.trophies&select=value&limit=1');
  if(r&&r[0]&&r[0].value){window.__TR=r[0].value;localStorage.setItem(KT,JSON.stringify(r[0].value));}
 }catch(e){}
}
const ov=document.createElement('div');
ov.style.cssText='position:fixed;inset:0;z-index:99999;background:#2a0a0a;color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;font-family:"Arial Black",Impact,sans-serif';
document.body.appendChild(ov);
let banned=false;
async function checkBan(){
 const id=myId();if(!id)return;
 try{
  const r=await get('/rest/v1/bans?qid=eq.'+encodeURIComponent(id)+'&select=reason,until&limit=1');
  const b=r&&r[0];
  if(b&&(!b.until||new Date(b.until).getTime()>Date.now())){
   banned=true;
   ov.innerHTML='';
   const t=document.createElement('div');t.style.cssText='font-size:34px;color:#ff6a6a;margin-bottom:12px';t.textContent='KONTO ZABLOKOWANE';
   const d=document.createElement('div');d.style.cssText='font:700 16px Arial,sans-serif;white-space:pre-line';
   d.textContent='ID: '+id+'\nPowód: '+(b.reason||'brak')+'\nDo: '+(b.until?new Date(b.until).toLocaleString():'bezterminowo');
   ov.appendChild(t);ov.appendChild(d);
   ov.style.display='flex';
  }else{banned=false;ov.style.display='none';}
 }catch(e){}
}
const _sg=startGame;
startGame=function(){if(banned)return;return _sg.apply(this,arguments);};
if(ok){loadCfg();checkBan();setInterval(checkBan,300000);setInterval(loadCfg,600000);}
})();
