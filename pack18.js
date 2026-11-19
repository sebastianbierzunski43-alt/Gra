(function(){
if(window.__p18)return;window.__p18=1;
const bar=document.querySelector('#prof .bar');
if(!bar)return;
const b=document.createElement('button');
b.className='btn blue small';
b.style.marginLeft='8px';
b.textContent='👥 ZNAJOMI';
b.onclick=()=>{
 const m=[...document.querySelectorAll('#menu button')].find(x=>/ZNAJOMI/.test(x.textContent));
 if(m)m.click();
 else alert('Brakuje pack13.js (ekran znajomych)');
};
bar.appendChild(b);
})();
