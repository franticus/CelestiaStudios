function mobileNav() {
  // Mobile nav button
  const navBtn = document.querySelector('.mobile-nav-btn');
  const nav = document.querySelector('.mobile-nav');
  const menuIcon = document.querySelector('.nav-icon');

  const closeMenu = () => {
    nav.classList.remove('mobile-nav--open');
    menuIcon.classList.remove('nav-icon--active');
    document.body.classList.remove('no-scroll');
  };

  navBtn.onclick = function() {
    nav.classList.toggle('mobile-nav--open');
    menuIcon.classList.toggle('nav-icon--active');
    document.body.classList.toggle('no-scroll');
  };

  // Автоматически закрывать меню при ширине >768
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

export default mobileNav;
