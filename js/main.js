/* ============================================================
   BOTTOMS UP YACHT CLUB — main.js
   Nav scroll, hamburger, scroll reveal, hero parallax, loader.
   ============================================================ */

(function () {
  'use strict';

  // ── Loader ────────────────────────────────────────────────
  const loader = document.getElementById('loader');

  if (loader) {
    // Dismiss after 1.4s
    const dismissLoader = () => {
      loader.classList.add('done');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 450);
    };

    if (document.readyState === 'complete') {
      setTimeout(dismissLoader, 1400);
    } else {
      window.addEventListener('load', () => {
        setTimeout(dismissLoader, 1400);
      });
    }
  }

  // ── Sticky nav ────────────────────────────────────────────
  const nav = document.getElementById('navbar');

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile hamburger ──────────────────────────────────────
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

  // ── Scroll cue hide ───────────────────────────────────────
  const scrollCue = document.querySelector('.hero__scrollcue');

  if (scrollCue) {
    const hideCue = () => {
      if (window.scrollY > 100) {
        scrollCue.classList.add('hidden');
      } else {
        scrollCue.classList.remove('hidden');
      }
    };
    window.addEventListener('scroll', hideCue, { passive: true });
  }

  // ── Scroll reveal via IntersectionObserver ────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -6% 0px' }
  );

  document.querySelectorAll('.appear').forEach((el) => {
    revealObserver.observe(el);
  });

  // ── Hero parallax (desktop only, respects reduce-motion) ─
  const heroBgImg = document.querySelector('.hero__bg img');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;

  if (heroBgImg && !prefersReduced && isDesktop) {
    let ticking = false;

    const onScrollHero = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            heroBgImg.style.transform = `scale(1.08) translateY(${y * 0.4 * 0.25}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScrollHero, { passive: true });
  }

  // ── Active nav link highlight ─────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

})();
