const menuBtn = document.querySelector('[data-menu]');
const nav = document.getElementById('mainNav');
if (menuBtn && nav) menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
