document.addEventListener('DOMContentLoaded',()=>{
  const button=document.querySelector('[data-qp-mobile-toggle]');
  const nav=document.querySelector('[data-qp-mobile-nav]');
  const backdrop=document.querySelector('[data-qp-mobile-backdrop]');
  if(!button||!nav)return;
  const setOpen=(open)=>{
    nav.classList.toggle('is-mobile-open',open);
    button.classList.toggle('is-open',open);
    backdrop?.classList.toggle('is-open',open);
    button.setAttribute('aria-expanded',String(open));
    button.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
    document.body.classList.toggle('qp-mobile-nav-open',open);
  };
  button.addEventListener('click',()=>setOpen(!nav.classList.contains('is-mobile-open')));
  backdrop?.addEventListener('click',()=>setOpen(false));
  nav.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
});
