/* Yorbizz landing — standalone, dependency-free interactive demonstrations */
(() => {
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const catalogTemplate = $('#store-template');
  const previews = [];

  const menuButton = $('.menu-toggle');
  const mobileMenu = $('#mobile-nav');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const nowOpen = mobileMenu.hidden;
      mobileMenu.hidden = !nowOpen;
      menuButton.setAttribute('aria-expanded', String(nowOpen));
      menuButton.setAttribute('aria-label', nowOpen ? 'Fechar menu' : 'Abrir menu');
      menuButton.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-${nowOpen ? 'x' : 'menu'}"/></svg>`;
    });
    $$('#mobile-nav a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
      menuButton.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-menu"/></svg>';
    }));
  }

  function showMockNotice(screen, message = 'Esta é uma demonstração da página.') {
    let toast = $('.mock-toast', screen);
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'mock-toast';
      toast.style.cssText = 'position:sticky;bottom:12px;z-index:9;margin:0 auto;width:max-content;max-width:90%;border-radius:40px;background:#202b22;color:#fff;font-size:10px;font-weight:700;padding:8px 11px;box-shadow:0 5px 15px #0003;pointer-events:none';
      screen.querySelector('.store-page').appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.remove(), 2700);
  }

  function setActiveFeature(index) {
    $$('.demo-feature').forEach((f, i) => f.classList.toggle('is-current', i === index));
  }

  function setupStorePreview(device) {
    if (!catalogTemplate) return;
    const screen = $('.phone-screen', device);
    const host = $('.store-host', device);
    host.appendChild(catalogTemplate.content.cloneNode(true));
    const id = device.dataset.preview;
    const state = {
      device, screen, host, id, visible: false, paused: reducedMotion,
      lastTimestamp: 0, lastUserInteraction: 0, holdUntil: id === 'hero' ? performance.now() + 3000 : 0, resetting: false,
    };
    previews.push(state);
    const pauseForInteraction = () => {
      state.lastUserInteraction = performance.now();
      state.holdUntil = state.lastUserInteraction + 7500;
    };
    // Search and category selectors are working HTML controls, not a static screenshot.
    $$('.size-button', host).forEach(button => button.addEventListener('click', () => {
      $$('.size-button', host).forEach(el => el.classList.remove('is-active'));
      button.classList.add('is-active');
      pauseForInteraction();
    }));
    $$('.store-categories button', host).forEach(button => button.addEventListener('click', () => {
      $$('.store-categories button', host).forEach(el => el.classList.remove('is-active'));
      button.classList.add('is-active');
      const target = `[data-anchor="${button.dataset.scrollto}"]`;
      const el = $(target, host);
      if (el) screen.scrollTo({top: el.offsetTop - host.offsetTop - 10, behavior: reducedMotion ? 'instant' : 'smooth'});
      pauseForInteraction();
    }));
    const search = $('.store-search', host);
    if (search) search.addEventListener('input', () => {
      const q = search.value.trim().toLocaleLowerCase('pt-BR');
      $$('.store-product', host).forEach(item => {
        item.style.display = !q || item.dataset.keywords.includes(q) ? '' : 'none';
      });
      pauseForInteraction();
    });
    $$('.store-actions button, .store-map-actions button', host).forEach(btn => btn.addEventListener('click', () => {
      pauseForInteraction();
      if (btn.textContent.includes('Copiar endereço')) {
        const address = 'Rua das Flores, 120 — Centro, Belo Horizonte, MG (endereço fictício)';
        navigator.clipboard?.writeText(address).then(() => showMockNotice(screen, 'Endereço fictício copiado.')).catch(() => showMockNotice(screen));
      } else showMockNotice(screen);
    }));
    screen.addEventListener('wheel', pauseForInteraction, {passive:true});
    screen.addEventListener('touchstart', pauseForInteraction, {passive:true});
    screen.addEventListener('pointerdown', pauseForInteraction, {passive:true});
    if (id === 'demo') screen.addEventListener('scroll', () => {
      const max = screen.scrollHeight - screen.clientHeight;
      if (!max) return;
      const progress = screen.scrollTop / max;
      setActiveFeature(progress < .21 ? 0 : progress < .57 ? 1 : progress < .78 ? 2 : 3);
    }, {passive:true});
    return state;
  }
  $$('[data-preview]').forEach(setupStorePreview);

  let previousFrame = 0;
  function animatePreviews(now) {
    const dt = Math.min(40, now - (previousFrame || now));
    previousFrame = now;
    for (const state of previews) {
      if (!state.visible || state.paused || state.resetting || reducedMotion || now < state.holdUntil) continue;
      const max = state.screen.scrollHeight - state.screen.clientHeight;
      if (max <= 0) continue;
      if (state.screen.scrollTop + 3 >= max) {
        state.resetting = true;
        state.holdUntil = now + 2400;
        setTimeout(() => {
          state.screen.style.transition = 'opacity .25s ease';
          state.screen.style.opacity = '0';
          setTimeout(() => {
            state.screen.scrollTop = 0;
            state.screen.style.opacity = '1';
            setTimeout(() => { state.screen.style.transition = ''; state.resetting = false; }, 260);
          }, 250);
        }, 900);
      } else {
        state.screen.scrollTop += (state.id === 'hero' ? 83 : 91) * dt / 1000;
      }
    }
    requestAnimationFrame(animatePreviews);
  }
  if (!reducedMotion) requestAnimationFrame(animatePreviews);

  const inView = new IntersectionObserver((entries) => entries.forEach(entry => {
    const match = previews.find(s => s.device === entry.target);
    if (match) match.visible = entry.isIntersecting && entry.intersectionRatio >= .23;
  }), {threshold:[0,.1,.23,.6]});
  previews.forEach(s => inView.observe(s.device));

  const pauseButton = $('.demo-pause');
  const replayButton = $('.demo-replay');
  const demoState = previews.find(s => s.id === 'demo');
  function refreshPauseButton() {
    if (!pauseButton || !demoState) return;
    const paused = demoState.paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Reproduzir animação da prévia' : 'Pausar animação da prévia');
    pauseButton.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-${paused ? 'play' : 'pause'}"/></svg><span>${paused ? 'Reproduzir' : 'Pausar animação'}</span>`;
  }
  pauseButton?.addEventListener('click', () => {
    demoState.paused = !demoState.paused;
    if (!demoState.paused) demoState.holdUntil = 0;
    refreshPauseButton();
  });
  replayButton?.addEventListener('click', () => {
    demoState.resetting = false;
    demoState.holdUntil = performance.now() + 1000;
    demoState.screen.scrollTo({top:0,behavior:'smooth'});
    setActiveFeature(0);
  });
  if (reducedMotion) refreshPauseButton();
  $$('.demo-feature').forEach((button, index) => {
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    const action = () => {
      if (!demoState) return;
      const selectors = ['.store-cover','[data-anchor="promos"]','.store-fidelity','.store-location'];
      const target = $(selectors[index], demoState.host);
      if (!target) return;
      demoState.holdUntil = performance.now() + 6500;
      demoState.screen.scrollTo({top:target.offsetTop - demoState.host.offsetTop - 8,behavior:reducedMotion?'instant':'smooth'});
      setActiveFeature(index);
    };
    button.addEventListener('click', action);
    button.addEventListener('keydown', e => {if(e.key === 'Enter' || e.key === ' '){e.preventDefault();action();}});
  });

  // Visible-on-scroll effects (one time only).
  const elements = $$('.reveal');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries,observer) => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('visible'); observer.unobserve(entry.target);}
    }), {threshold:.08,rootMargin:'0px 0px -25px 0px'});
    elements.forEach(el => revealIO.observe(el));
  } else elements.forEach(el => el.classList.add('visible'));

  // Duplicate *actual* achievement artwork to form a seamless automatic marquee.
  const awards = $('#awards-track');
  if (awards && !awards.querySelector('.awards-set[aria-hidden]')) {
    const duplicate = $('.awards-set', awards).cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    $$('.award-card', duplicate).forEach(card => card.setAttribute('tabindex', '-1'));
    awards.appendChild(duplicate);
  }

  const chat = $('.ai-chat');
  if (chat) {
    const chatIO = new IntersectionObserver((entries,observer) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      $$('.bubble',chat).forEach((item,i) => setTimeout(() => item.classList.add('visible'),reducedMotion?0:380 + i*620));
    },{threshold:.25});
    chatIO.observe(chat);
  }

  const loyalty = $('.loyalty-card');
  if (loyalty) {
    const fidelityIO = new IntersectionObserver((entries,observer) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const count = $('.loyalty-count',loyalty);
      const bar = $('.loyalty-bar>span',loyalty);
      if (reducedMotion) { count.textContent = '5';bar.style.width='71.4%';return; }
      let value = 0;
      const step = () => {
        if (value >= 5) return;
        value++;
        count.textContent = String(value);
        bar.style.width = `${value / 7 * 100}%`;
        if (value < 5) setTimeout(step,560);
      };
      setTimeout(step,400);
    },{threshold:.38});
    fidelityIO.observe(loyalty);
  }
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
