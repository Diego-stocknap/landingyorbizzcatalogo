/* V8 guided mouse: demonstration only. Leaves all other landing behavior untouched. */
(() => {
  const root=document.querySelector('.dashboard-story');
  if(!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cursor=root.querySelector('.tour-cursor');
  const content=root.querySelector('.dashboard-content');
  const nav=k=>root.querySelector('.dashboard-tabs [data-panel="'+k+'"]') || root.querySelector('.dashboard-sidebar [data-panel="'+k+'"]');
  const appearance=()=>root.querySelector('[data-view="appearance"]');
  const modes=['perfil','vitrine','profissional'];
  const workflow=[
    {kind:'hover',sel:'.realtime-count',delay:1700},
    {kind:'go',key:'appearance',delay:2100},
    ...modes.map(mode=>({kind:'mode',mode,delay:2000})),
    {kind:'go',key:'statistics',delay:2100},{kind:'hover',sel:'.stat-bars',delay:1900},
    {kind:'go',key:'products',delay:2100},{kind:'hover',sel:'.products-table',delay:1900},
    {kind:'go',key:'assistant',delay:2100},{kind:'hover',sel:'.assistant-messages',delay:1700},
    {kind:'go',key:'location',delay:2100},{kind:'hover',sel:'.dashboard-map',delay:1800},
    {kind:'go',key:'overview',delay:2500}
  ];
  let visible=false,stopped=false,step=0,timer=null;
  const panelPause=root.querySelector('.panel-autoplay');
  function running(){return visible&&!document.hidden&&!stopped&&panelPause?.getAttribute('aria-pressed')==='true'}
  const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)start();else{clearTimeout(timer);cursor.classList.remove('is-on')}},{threshold:.15});observer.observe(root);
  function move(el){if(!el)return false;let a=el.getBoundingClientRect(),r=root.getBoundingClientRect();cursor.style.transform='translate('+(a.left-r.left+Math.min(a.width*.45,Math.max(8,a.width-9)))+'px,'+(a.top-r.top+Math.min(a.height*.5,Math.max(6,a.height-4)))+'px)';cursor.classList.add('is-on');return true}
  function click(){cursor.classList.remove('is-click');void cursor.offsetWidth;cursor.classList.add('is-click');}
  function start(){if(timer||!running())return;timer=setTimeout(tick,550)}
  function tick(){timer=null;if(!running())return;const x=workflow[step%workflow.length];let target=null;
    if(x.kind==='go'){target=nav(x.key);move(target);timer=setTimeout(()=>{if(!running())return tick();click();target?.click();step++;timer=setTimeout(tick,x.delay)},900);return;}
    if(x.kind==='mode'){target=appearance()?.querySelector('[data-theme="'+x.mode+'"]');move(target);timer=setTimeout(()=>{if(!running())return tick();click();target?.click();step++;timer=setTimeout(tick,x.delay)},850);return;}
    target=root.querySelector('.dashboard-view.active '+x.sel);if(target){move(target)}step++;timer=setTimeout(tick,x.delay);
  }
  // Manual navigation pauses the guided cursor until the tour is restarted.
  root.addEventListener('pointerdown',e=>{if(e.isTrusted&&!e.target.closest('.panel-restart')){stopped=true;clearTimeout(timer);timer=null;cursor.classList.remove('is-on')}},true);
  root.querySelector('.panel-restart')?.addEventListener('click',()=>{clearTimeout(timer);timer=null;step=0;stopped=false;start()});
  panelPause?.addEventListener('click',()=>{if(panelPause.getAttribute('aria-pressed')==='true'){stopped=false;start()}else{clearTimeout(timer);timer=null;cursor.classList.remove('is-on')}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);timer=null}else start()});
})();
