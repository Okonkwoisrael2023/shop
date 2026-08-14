const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
});