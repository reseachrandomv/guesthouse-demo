(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const body=document.body,orb=document.getElementById('orb');
// Maldives time = UTC+5
const mvNow=()=>{const d=new Date(Date.now()+5*3600e3);return {h:d.getUTCHours(),m:d.getUTCMinutes()}};
const phaseOf=h=>h>=5&&h<7?'dawn':h>=7&&h<17?'day':h>=17&&h<19?'sunset':'night';
const names={dawn:'Dawn on the lagoon',day:'Bright island day',sunset:'Sunset over the reef',night:'Night under the stars'};
const sample={dawn:6,day:12,sunset:18,night:22.5};
let mode='live';
function place(hf){ // hf = fractional hour
  let t,isSun=hf>=6&&hf<18.5;
  if(isSun) t=(hf-5.6)/13.2; else {let n=hf>=18.5?hf-18.5:hf+5.5; t=n/11.5}
  t=Math.min(1,Math.max(0,t));
  const x=12+t*76, y=70-Math.sin(t*Math.PI)*52;
  orb.style.setProperty('--x',x+'%');orb.style.setProperty('--y',y+'%');
}
function render(){
  const {h,m}=mvNow();
  document.getElementById('clock').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} MVT · Maldives`;
  const p=mode==='live'?phaseOf(h):mode;
  body.dataset.phase=p;
  document.getElementById('phaseName').textContent=(mode==='live'?'':'Preview: ')+names[p];
  place(mode==='live'?h+m/60:sample[p]);
}
document.querySelectorAll('.phase-toggle button').forEach(b=>b.onclick=()=>{
  mode=b.dataset.p;document.querySelectorAll('.phase-toggle button').forEach(x=>x.classList.toggle('on',x===b));render();});
render();setInterval(render,30000);
// stars
const st=document.getElementById('stars');
for(let i=0;i<90;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.animationDelay=Math.random()*3+'s';s.style.opacity=.3+Math.random()*.7;st.appendChild(s)}
// nav
const nav=document.getElementById('nav'),bg=document.getElementById('burger');
const onS=()=>nav.classList.toggle('solid',scrollY>innerHeight*.75);addEventListener('scroll',onS,{passive:true});onS();
bg.onclick=()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)};
document.querySelectorAll('.links a').forEach(a=>a.onclick=()=>nav.classList.remove('open'));
// reveal + count
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);
  e.target.querySelectorAll('[data-count]').forEach(c=>{const n=+c.dataset.count;if(RM){c.textContent=n;return}let s=null;const f=t=>{s??=t;const k=Math.min(1,(t-s)/1200);c.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}),{threshold:.15});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%3)*90+'ms';io.observe(el)});
// ripple
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn,.chip');if(!b||RM)return;const r=b.getBoundingClientRect(),s=document.createElement('span'),d=Math.max(r.width,r.height);
  s.className='ripple';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),650)});
// experiences
const EX=[['🤿','House reef snorkel','Guided, 2 hrs',25],['🏝️','Sandbank picnic','Half day, lunch',60],['🎣','Sunset fishing','Dhoni, 3 hrs',40],['🐢','Turtle safari','Boat + guide',55],['🐬','Dolphin cruise','Golden hour',45],['🦈','Nurse shark dive','Certified divers',90],['🛶','Kayak & SUP','Per hour',15],['🍽️','Beach dinner','Lantern table',70]];
const grid=document.getElementById('expGrid'),chosen=new Set();
EX.forEach(([i,n,d,p],k)=>{const b=document.createElement('button');b.type='button';b.className='chip reveal';b.setAttribute('aria-pressed','false');
  b.innerHTML=`<span class="i">${i}</span><b>${n}</b><small>${d} · from USD ${p}</small>`;
  b.onclick=()=>{chosen.has(k)?chosen.delete(k):chosen.add(k);b.setAttribute('aria-pressed',chosen.has(k));upd()};grid.appendChild(b);io.observe(b)});
function upd(){const l=[...chosen].map(k=>EX[k][1]),t=[...chosen].reduce((a,k)=>a+EX[k][3],0);
  document.getElementById('trayCount').textContent=`${l.length} experience${l.length===1?'':'s'}`;
  document.getElementById('trayList').textContent=l.length?l.join(' · '):'Pick a few, we\'ll plan the rest.';
  document.getElementById('trayTotal').textContent=`USD ${t} pp`;document.getElementById('expField').value=l.join(', ')}
// room pick
document.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{document.getElementById('roomSel').value=b.dataset.room;
  document.querySelectorAll('.pick').forEach(x=>{x.classList.toggle('sel',x===b);x.textContent=x===b?'Selected ✓':'Choose this room'})});
// gallery
const lb=document.getElementById('lb');document.querySelectorAll('.g').forEach(g=>g.onclick=()=>{lb.querySelector('img').src=g.dataset.src;lb.querySelector('img').alt=g.querySelector('img').alt;lb.hidden=false});
lb.onclick=e=>{if(e.target.tagName!=='IMG')lb.hidden=true};addEventListener('keydown',e=>{if(e.key==='Escape')lb.hidden=true});
// form
const f=document.getElementById('form'),today=new Date().toISOString().slice(0,10);f.in.min=f.out.min=today;
f.onsubmit=e=>{e.preventDefault();const via=e.submitter?.dataset.via||'wa',err=document.getElementById('err');
  if(!f.name.value.trim()||!f.in.value||!f.out.value){err.textContent='Please add your name and dates.';return}
  if(f.out.value<=f.in.value){err.textContent='Your leaving date should be after arrival.';return}err.textContent='';
  const txt=`Hello Tharihiyaa! Enquiry from ${f.name.value.trim()}\nDates: ${f.in.value} to ${f.out.value}\nGuests: ${f.guests.value}\nRoom: ${f.room.value}\nExperiences: ${f.exp.value||'-'}\n${f.msg.value}`;
  // Demo: placeholder contacts. Replace with the real number / address.
  if(via==='wa')window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener');
  else location.href='mailto:hello@example.com?subject='+encodeURIComponent('Stay enquiry – '+f.name.value.trim())+'&body='+encodeURIComponent(txt)};
})();
