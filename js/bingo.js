/* ================================================================
   BOTTOMS UP YACHT CLUB -- bingo.js
   Chickin Sh*t Bingo: a hand-drawn hen waddles the numbered grid,
   pecks, and every few stops "claims" a square as the winner.
   Tap a square to call your number.

   Honors prefers-reduced-motion (hen sits still) and pauses the
   wander loop whenever the board is scrolled out of view.
   ================================================================ */

(function () {
  'use strict';

  const board   = document.getElementById('bingoBoard');
  const caption = document.getElementById('bingoCaption');
  if (!board) return;

  const squares = Array.prototype.slice.call(board.querySelectorAll('.bingo-sq'));
  if (!squares.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* -- The hen ---------------------------------------------------- */
  const SVG =
    '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g stroke="#d9a73a" stroke-width="2.6" stroke-linecap="round">' +
        '<line x1="30" y1="49" x2="28" y2="60"/>' +
        '<line x1="38" y1="49" x2="40" y2="60"/>' +
        '<path d="M23 60h6m6 0h6" fill="none"/>' +
      '</g>' +
      '<path d="M47 36q15-13 11 5q-2 5-11 4z" fill="#e3d6b4"/>' +
      '<path d="M49 34q11-9 8 4" fill="none" stroke="#d9a73a" stroke-width="2"/>' +
      '<ellipse cx="34" cy="39" rx="18" ry="14" fill="#f4ecd8"/>' +
      '<path d="M41 35q-9 1-13 10q11 2 15-5z" fill="#e3d6b4"/>' +
      '<circle cx="20" cy="24" r="10" fill="#f4ecd8"/>' +
      '<g fill="#d6453a">' +
        '<circle cx="15" cy="13" r="3"/>' +
        '<circle cx="20" cy="11" r="3.3"/>' +
        '<circle cx="25" cy="14" r="2.6"/>' +
      '</g>' +
      '<path d="M11 23 L2 25 L11 28 Z" fill="#e8973a"/>' +
      '<ellipse cx="12.5" cy="30.5" rx="2.3" ry="3.3" fill="#d6453a"/>' +
      '<circle cx="18" cy="22" r="1.9" fill="#2a2118"/>' +
    '</svg>';

  const hen = document.createElement('div');
  hen.className = 'bingo-chicken';
  hen.innerHTML = '<div class="bingo-chicken__inner">' + SVG + '</div>';
  board.appendChild(hen);

  /* -- Geometry --------------------------------------------------- */
  let centers = [];
  function computeCenters() {
    centers = squares.map(function (sq) {
      return { cx: sq.offsetLeft + sq.offsetWidth / 2, cy: sq.offsetTop + sq.offsetHeight / 2 };
    });
  }
  function placeInstant(i) {
    const c = centers[i];
    if (!c) return;
    hen.style.transition = 'none';
    hen.style.transform = 'translate(' + c.cx + 'px,' + c.cy + 'px)';
    void hen.offsetWidth;            // flush, so the next move animates
    hen.style.transition = '';
  }

  /* -- State ------------------------------------------------------ */
  let current = randInt(0, squares.length - 1);
  let picked = -1;
  let stopsSinceWin = 0;
  let winEvery = randInt(3, 6);
  let running = false;
  let timers = [];
  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function clearWinner() {
    squares.forEach(function (s) { s.classList.remove('is-winner'); });
  }
  function declareWinner(i) {
    clearWinner();
    squares[i].classList.add('is-winner');
    const n = squares[i].getAttribute('data-n');
    if (caption) {
      caption.innerHTML = (i === picked)
        ? 'You called it. Square <strong>' + n + '</strong> takes the pot!'
        : 'The hen picks square <strong>' + n + '</strong>.';
    }
  }

  /* -- Wander loop ------------------------------------------------ */
  function tick() {
    if (!running) return;

    let next = current;
    while (next === current && squares.length > 1) next = randInt(0, squares.length - 1);

    const from = centers[current];
    const to   = centers[next];
    if (to.cx > from.cx) hen.classList.add('face-right');
    else hen.classList.remove('face-right');

    hen.classList.add('is-walking');
    hen.style.transform = 'translate(' + to.cx + 'px,' + to.cy + 'px)';
    current = next;

    later(function () {                       // arrival (matches CSS glide ~1s)
      hen.classList.remove('is-walking');
      hen.classList.add('is-pecking');
      later(function () { hen.classList.remove('is-pecking'); }, 340);

      stopsSinceWin++;
      if (stopsSinceWin >= winEvery) {
        stopsSinceWin = 0;
        winEvery = randInt(3, 6);
        declareWinner(current);
        later(function () {
          clearWinner();
          if (caption && picked < 0) caption.innerHTML = 'Let the hen wander&hellip;';
          later(tick, 400);
        }, 2300);
      } else {
        later(tick, randInt(550, 1100));
      }
    }, 1020);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    later(tick, 500);
  }
  function stop() {
    running = false;
    clearTimers();
    hen.classList.remove('is-walking', 'is-pecking');
  }

  /* -- Click to call a number ------------------------------------- */
  squares.forEach(function (sq, i) {
    sq.addEventListener('click', function () {
      squares.forEach(function (s) { s.classList.remove('is-picked'); });
      sq.classList.add('is-picked');
      picked = i;
      if (caption) {
        caption.innerHTML = 'You called square <strong>' + sq.getAttribute('data-n') +
          '</strong>. Now watch the hen&hellip;';
      }
    });
  });

  /* -- Lifecycle -------------------------------------------------- */
  computeCenters();
  placeInstant(current);

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      computeCenters();
      placeInstant(current);
    }, 150);
  }, { passive: true });

  if (reduceMotion) return;   // hen sits still; clicking still calls a number

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { computeCenters(); placeInstant(current); start(); }
        else stop();
      });
    }, { threshold: 0.2 });
    io.observe(board);
  } else {
    start();
  }

})();
