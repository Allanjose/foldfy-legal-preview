'use strict';
(() => {
  const small = matchMedia('(max-width:760px)');
  const toc = document.querySelector('.toc details');
  const adapt = () => { if (toc) toc.open = !small.matches; };
  adapt(); small.addEventListener('change', adapt);
  const dialogs = [...document.querySelectorAll('dialog')];
  const locks = () => { document.documentElement.style.overflow = dialogs.some(d => d.open) ? 'hidden' : ''; };
  const returnFocus = new WeakMap();
  const open = (id, opener = document.activeElement) => { const d = document.getElementById(id); if (!d || d.open) return; returnFocus.set(d, opener); d.showModal(); locks(); if(id === 'data-sheet') document.getElementById('data-title').focus(); };
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => open(b.dataset.open, b)));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.close).close()));
  dialogs.forEach(d => d.addEventListener('close', () => { locks(); const opener = returnFocus.get(d); if(opener?.isConnected) opener.focus({preventScroll:true}); }));
  // Fecha só a camada superior, mesmo quando o navegador agrupa CloseWatchers.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const top = dialogs.filter(d => d.open).at(-1);
    if (!top) return;
    event.preventDefault(); event.stopImmediatePropagation(); top.close(); locks();
  }, true);
  if (location.hash === '#inscricao') open('signup');
  // Na própria demo, o CTA do header abre o formulário sem depender de troca de hash.
  document.querySelectorAll('a[href$="#inscricao"]').forEach(a => a.addEventListener('click', e => { if (!document.getElementById('signup')) return; e.preventDefault(); open('signup', a); }));
  const form = document.getElementById('signup-form');
  if(form) form.addEventListener('submit', event => {
    event.preventDefault();
    const status = document.getElementById('form-status');
    const email = form.elements.email; status.textContent = ''; status.classList.remove('error'); email.removeAttribute('aria-invalid');
    const fail = (msg, el) => { status.classList.add('error'); status.textContent = 'Erro: ' + msg; if (el === email) email.setAttribute('aria-invalid','true'); el.focus(); };
    if (!email.value.trim() || !email.checkValidity()) return fail('digite um e-mail válido, como nome@exemplo.com.', email);
    if (!form.elements.beta.checked && !form.elements.jornal.checked) return fail('escolha pelo menos uma das duas listas para continuar.', form.elements.beta);
    if (!form.elements.adulto.checked) return fail('confirme que tem 18 anos ou mais.', form.elements.adulto);
    status.textContent = 'Demonstração concluída. Nenhum dado foi enviado ou salvo.';
  });
  const anchors = [...document.querySelectorAll('.toc a')];
  const sections = anchors.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
  let scheduled = false;
  const update = () => {
    scheduled = false;
    let current = sections[0];
    for(const s of sections) if(s.getBoundingClientRect().top <= 170) current = s;
    if(innerHeight + scrollY >= document.documentElement.scrollHeight - 8) current = sections.at(-1);
    for(const a of anchors) { if(current && a.hash === '#' + current.id) { if(!a.hasAttribute('aria-current') && !small.matches) { const box = a.closest('.sidebar, .body-columns > .toc'); if (box) { const r = a.getBoundingClientRect(), b = box.getBoundingClientRect(); if (r.top < b.top + 40 || r.bottom > b.bottom - 40) box.scrollTop += r.top - b.top - b.height / 2; } } a.setAttribute('aria-current','location'); } else a.removeAttribute('aria-current'); }
  };
  addEventListener('scroll', () => { if(!scheduled){scheduled=true;requestAnimationFrame(update);} }, {passive:true});
  addEventListener('resize', update); update();
  anchors.forEach(a => a.addEventListener('click', () => { if(small.matches && toc) toc.open=false; }));
})();
