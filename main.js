'use strict';

/* ── Lucide Icons ── */
lucide.createIcons();

/* ── Sticky Nav ── */
const nav = document.getElementById('nav');
window.addEventListener(
  'scroll',
  () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  },
  { passive: true },
);

/* ── Mobile Menu ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  hamburger.setAttribute('aria-expanded', menuOpen);
  mobileMenu.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  const spans = hamburger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'translateY(6px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
  } else {
    spans.forEach((s) => {
      s.style.transform = '';
      s.style.opacity = '';
    });
  }
});

window.closeMobile = function () {
  menuOpen = false;
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  hamburger.querySelectorAll('span').forEach((s) => {
    s.style.transform = '';
    s.style.opacity = '';
  });
};

/* ── Scroll Reveal ── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
);
revealEls.forEach((el) => revealObs.observe(el));

/* ── Portfolio Filter ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    portfolioItems.forEach((item) => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.style.transition = 'opacity .4s, transform .4s';
      item.style.opacity = show ? '1' : '0.2';
      item.style.transform = show ? 'scale(1)' : 'scale(.97)';
      item.style.pointerEvents = show ? '' : 'none';
    });
  });
});

/* ── Smooth anchor offsets for fixed nav ── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = window.scrollY + target.getBoundingClientRect().top - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

/* ── Form submission ── */
const form = document.querySelector('.inquiry-form form');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;

    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        btn.textContent = 'Inquiry Sent ✓';
        btn.style.background = '#2a5a2a';
        btn.style.color = '#a8e6a8';
        form.reset();
        const successMsg = form.querySelector('.form-success-message');
        successMsg.classList.add('visible');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          btn.style.opacity = '';
          successMsg.classList.remove('visible');
        }, 4000);
      } else {
        throw new Error(result.error || 'Failed to send');
      }
    } catch (error) {
      btn.textContent = 'Error! Try Again';
      btn.style.background = '#8b2635';
      btn.style.color = '#ffb4ab';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
        btn.style.opacity = '';
      }, 3000);
    }
  });
}

/* ── Parallax subtle on hero ── */
const hero = document.getElementById('hero');
const heroVideo = hero.querySelector('.hero-video-wrap');
window.addEventListener(
  'scroll',
  () => {
    if (window.scrollY < window.innerHeight) {
      heroVideo.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }
  },
  { passive: true },
);
