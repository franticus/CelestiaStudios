document.addEventListener('DOMContentLoaded', () => {
  // burger
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  const body = document.querySelector('body');

  const openMenu = () => {
    burger.classList.add('active');
    nav.classList.add('active');
    body.style.height = '100vh';
    body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    burger.classList.remove('active');
    nav.classList.remove('active');
    body.style.height = '';
    body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    nav.classList.contains('active') ? closeMenu() : openMenu();
  });

  nav.addEventListener('click', e => {
    if (
      window.matchMedia('(max-width: 768px)').matches &&
      nav.classList.contains('active')
    ) {
      closeMenu();
    }
  });
});
