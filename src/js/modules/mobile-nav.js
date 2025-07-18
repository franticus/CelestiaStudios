function mobileNav() {
  const navBtn = document.querySelector('.mobile-nav-btn');
  const nav = document.querySelector('.mobile-nav');
  const menuIcon = document.querySelector('.nav-icon');
  const navLinks = document.querySelectorAll('.mobile-nav a');

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

  // Закрытие меню при клике на любой пункт
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Закрытие меню при изменении размера окна >768px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

export default mobileNav;
