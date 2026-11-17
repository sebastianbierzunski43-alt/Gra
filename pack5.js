(function(){
if(window.__p5)return;window.__p5=1;
const menu=document.getElementById('menu');
const box=document.createElement('div');
box.style.cssText='position:absolute;top:max(env(safe-area-inset-top),8px);left:max(env(safe-area-inset-left),10px);display:flex;flex-direction:column;gap:6px;align-items:flex-start;z-index:6';
menu.appendChild(box);
const st=document.createElement('style');
st.textContent='#menu #play{margin-top:4vh}#menu .tl{font-size:min(4vh,15px)!important;padding:.2em .7em!important;border-bottom-width:5px!important}';
document.head.appendChild(st);
menu.querySelectorAll('.btn').forEach(b=>{
 if(b.id==='play')return;
 const t=b.textContent||'';
 if(t.indexOf('POSTACIE')===0){b.style.display='none';}
 else if(t.indexOf('ALEJA')>=0||t.indexOf('ULEPSZENIA')>=0){b.classList.add('tl');box.appendChild(b);}
});
})();
