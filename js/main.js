/* ================================================================
   BOTTOMS UP YACHT CLUB -- main.js  (v2)
   Nav scroll state, hamburger drawer, scroll reveal.
   No loader. No parallax. Clean and fast.
   ================================================================ */

(function () {
  'use strict';

  /* -- Sticky nav shadow ----------------------------------------- */
  const nav = document.getElementById('navbar');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -- Active nav link ------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (
      href === currentPage ||
      (currentPage === '' && href === 'index.html') ||
      (currentPage === 'index.html' && href === 'index.html')
    ) {
      a.classList.add('active');
    }
  });

  /* -- Hamburger / mobile drawer --------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (
        navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        e.target !== hamburger &&
        !hamburger.contains(e.target)
      ) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -- Scroll reveal (IntersectionObserver) ---------------------- */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    document.querySelectorAll('.appear').forEach((el) => revealObserver.observe(el));

    /* Stagger child cards within grid parents */
    document.querySelectorAll('.highlights-grid, .events-grid, .reviews-grid, .food-grid').forEach((grid) => {
      const cards = grid.querySelectorAll('.appear');
      cards.forEach((card, i) => {
        card.style.transitionDelay = (i * 60) + 'ms';
      });
    });
  } else {
    /* Reduced motion: show everything immediately */
    document.querySelectorAll('.appear').forEach((el) => {
      el.classList.add('is-visible');
    });
  }

  /* -- Menu board lightbox --------------------------------------- */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg) {
    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }
    document.querySelectorAll('.menu-board-item img').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

})();
