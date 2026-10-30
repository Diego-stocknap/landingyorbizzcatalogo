/* Animated recreation of the merchant dashboard (fictional demonstration). */
(() => {
  const root = document.querySelector('.dashboard-story');
  if (!root) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const keys = ['overview','statistics','appearance','products','assistant','location'];
  const labels = {
    overview:['Início','Tudo em um só lugar','Uma visão clara do seu negócio, sem complicação.'],
    statistics:['Estatísticas','Entenda quem visita, clica e compra','Acompanhe visitas, canais, pedidos e itens mais procurados.'],
    appearance:['Aparência','Três modelos de página','Escolha Perfil, Vitrine ou Profissional, com sua identidade.'],
    products:['Produtos e serviços','Seu catálogo organizado','Controle categorias, produtos, preços e disponibilidade.'],
    assistant:['Atendente IA','Atendimento mais organizado','Acompanhe conversas e o processo dos pedidos no plano Pro.'],
    location:['Localização','Fácil de encontrar','Ajude o cliente a localizar e chegar até sua empresa.']
  };
  let current = 0, playing = !reduceMotion, isVisible = false, waitingUntil = 0;
  let lastSwitch = performance.now();
  const delay = 600000; // V8: scripted guided navigation controls screen changes
  const nav = [...root.querySelectorAll('[data-panel]')];
  const views = [...root.querySelectorAll('[data-view]')];
  const title = root.querySelector('#dash-caption-title');
  const detail = root.querySelector('#dash-caption-detail');
  const crumb = root.querySelector('#workspace-label');
  const progress = root.querySelector('.dashboard-progress i');
  const playButton = root.querySelector('.panel-autoplay');
  const restartButton = root.querySelector('.panel-restart');
  function render(key,manual=false){
    const next = Math.max(0,keys.indexOf(key));
    current = next;
    nav.forEach(button => {
      const active=button.dataset.panel===key;
      button.classList.toggle('active',active);
      if(button.getAttribute('role')==='tab') button.setAttribute('aria-selected',String(active));
    });
    views.forEach(view => {
      const active=view.dataset.view===key;
      view.hidden=!active;
      view.classList.toggle('active',active);
    });
    crumb.textContent = labels[key][0];
    title.textContent = labels[key][1];
    detail.textContent = labels[key][2];
    lastSwitch=performance.now();
    progress.style.width='0%';
    if(manual) waitingUntil=lastSwitch+12000;
  }
  nav.forEach(button => button.addEventListener('click',()=>render(button.dataset.panel,true)));
  function updatePlayButton(){
    playButton.setAttribute('aria-pressed',String(playing));
    const symbol=playing?'pause':'play';
    playButton.innerHTML=`<svg class="ico" aria-hidden="true"><use href="#i-${symbol}"/></svg><span>${playing?'Pausar':'Reproduzir'}</span>`;
  }
  playButton.addEventListener('click',()=>{playing=!playing;lastSwitch=performance.now();waitingUntil=0;updatePlayButton();});
  restartButton.addEventListener('click',()=>{render('overview',false);waitingUntil=0;playing=!reduceMotion;updatePlayButton()});
  root.querySelectorAll('[data-theme]').forEach(btn=>btn.addEventListener('click',()=>{
    root.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('active',x===btn));
    const label=btn.querySelector('strong')?.textContent||'Vitrine';
    root.querySelector('.appearance-mini-screen>b').textContent=`Prévia do modelo ${label}`;
    const screen=root.querySelector('.appearance-mini-screen');
    screen.dataset.mode=btn.dataset.theme;
    waitingUntil=performance.now()+12000;
  }));
  root.querySelector('.workspace-publish')?.addEventListener('click',()=>{
    const el=root.querySelector('.workspace-publish');el.textContent='Demonstrativo';
    window.setTimeout(()=>el.textContent='Publicar',1900);
    waitingUntil=performance.now()+12000;
  });
  const observer=new IntersectionObserver(entries=>{isVisible=entries[0].isIntersecting},{threshold:.15});
  observer.observe(root);
  function animate(t){
    if(!document.hidden&&isVisible&&playing&&!reduceMotion){
      if(t>=waitingUntil){
        const elapsed=Math.max(0,t-lastSwitch);
        progress.style.width=`${Math.min(100,elapsed/delay*100)}%`;
        if(elapsed>=delay)render(keys[(current+1)%keys.length]);
      }
    }
    requestAnimationFrame(animate);
  }
  if(!reduceMotion)requestAnimationFrame(animate);
  // Decorative counter cycles through believable fictitious active visitors.
  const realtime=root.querySelector('.realtime-count');
  let count=3;
  window.setInterval(()=>{
    if(document.hidden||!isVisible||reduceMotion||!realtime)return;
    count=[2,3,4,5,3][Math.floor(Math.random()*5)];
    realtime.textContent=String(count);
  },9500);
  updatePlayButton();
  render('overview');
})();
