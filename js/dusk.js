/* ================================================================
   BOTTOMS UP YACHT CLUB -- dusk.js
   Hero showpiece: a code-driven dusk scene on the patio's waterfront.
   Sunset sky, shimmering waterline, a tiny sailboat (the "yacht club"
   wink), a string of twinkling patio lights, and a warm fire glow.

   Canvas 2D so it renders identically on iOS Safari and Android.
   Honors prefers-reduced-motion (paints one still frame) and pauses
   the animation loop whenever the hero scrolls out of view.
   ================================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('duskCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- Sizing (devicePixelRatio aware, DPR capped at 2) ----------- */
  let W = 0, H = 0, dpr = 1;
  let bulbs = [];   // string-light bulbs, rebuilt on resize
  let stars = [];   // faint dusk stars, rebuilt on resize

  function rand(min, max) { return min + Math.random() * (max - min); }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildScene();
  }

  function buildScene() {
    /* String lights: a few catenary swags across the top edge. */
    swagCount = Math.max(2, Math.round(W / 300));
    const spacing = 34;                 // px between bulbs along the width
    const count = Math.max(8, Math.round(W / spacing));
    bulbs = [];
    for (let i = 0; i <= count; i++) {
      bulbs.push({
        t: i / count,                   // 0..1 across the width
        phase: rand(0, Math.PI * 2),    // independent twinkle phase
        speed: rand(0.6, 1.5),          // twinkle speed
        warm: Math.random() < 0.78,     // most bulbs warm gold, some white
      });
    }

    /* Faint stars in the upper third of the sky. */
    const starCount = Math.round((W * H) / 26000);
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H * 0.34),
        r: rand(0.4, 1.2),
        phase: rand(0, Math.PI * 2),
      });
    }
  }

  let swagCount = 2;

  /* Horizon (waterline) sits at ~62% down. */
  function horizonY() { return Math.round(H * 0.62); }

  /* y of the light wire at horizontal fraction f (0..1). */
  function wireY(f) {
    const topY = H * 0.06;
    const sag = Math.min(46, H * 0.10);
    // position within the current swag -> 0..1, sine droop
    const local = (f * swagCount) % 1;
    return topY + sag * Math.sin(Math.PI * local);
  }

  /* -- Painters --------------------------------------------------- */

  function paintSky() {
    const g = ctx.createLinearGradient(0, 0, 0, horizonY());
    g.addColorStop(0.00, '#14102b'); // deep night indigo
    g.addColorStop(0.34, '#46295c'); // dusk purple
    g.addColorStop(0.62, '#b65a4e'); // terracotta
    g.addColorStop(0.83, '#e8894a'); // orange
    g.addColorStop(1.00, '#f7c46b'); // warm gold at the waterline
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizonY());
  }

  function paintStars(t) {
    for (const s of stars) {
      const tw = reduceMotion ? 0.6 : 0.45 + 0.35 * Math.sin(t * 1.3 + s.phase);
      ctx.globalAlpha = Math.max(0, tw) * 0.7;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function sunPos() {
    return { x: W * 0.66, y: horizonY() - H * 0.05, r: Math.min(W, H) * 0.075 };
  }

  function paintSun() {
    const s = sunPos();
    // wide atmospheric bloom
    const bloom = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 9);
    bloom.addColorStop(0, 'rgba(255,210,150,0.40)');
    bloom.addColorStop(0.5, 'rgba(255,180,120,0.12)');
    bloom.addColorStop(1, 'rgba(255,170,110,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, horizonY() + s.r);
    // tighter halo
    const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.6);
    halo.addColorStop(0, 'rgba(255,235,190,0.7)');
    halo.addColorStop(0.4, 'rgba(255,200,140,0.28)');
    halo.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, horizonY() + s.r);
    // crisp disk with a hot core
    const disk = ctx.createRadialGradient(s.x, s.y - s.r * 0.18, 0, s.x, s.y, s.r);
    disk.addColorStop(0, '#fffaf0');
    disk.addColorStop(0.45, '#ffe9b0');
    disk.addColorStop(0.85, '#ffce82');
    disk.addColorStop(1, '#ffb867');
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function paintWater(t) {
    const hy = horizonY();
    const wh = H - hy;
    const g = ctx.createLinearGradient(0, hy, 0, H);
    g.addColorStop(0.00, '#cf8552'); // warm reflected band at horizon
    g.addColorStop(0.30, '#7d5358');
    g.addColorStop(0.70, '#3c2c45');
    g.addColorStop(1.00, '#201a30'); // deep water at the bottom
    ctx.fillStyle = g;
    ctx.fillRect(0, hy, W, wh);

    // Faint horizontal ripple texture across the whole surface.
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#ffd9a0';
    const bands = 22;
    for (let i = 0; i < bands; i++) {
      const p = i / bands;
      const y = hy + p * wh + (reduceMotion ? 0 : Math.sin(t * 1.2 + i) * 1.3);
      ctx.fillRect(0, y, W, 1);
    }
    ctx.restore();

    // Sun's reflection: many low-alpha streaks blended additively -> a
    // smooth, luminous shimmer column with no visible banding.
    const s = sunPos();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rows = 56;
    const rowH = Math.max(1.4, (wh / rows) * 1.4); // overlap so rows blend
    for (let i = 0; i < rows; i++) {
      const p = i / rows;
      const y = hy + p * wh;
      const wobble = reduceMotion ? 0 : Math.sin(t * 1.7 + i * 0.7) * (3 + p * 12);
      const pulse  = reduceMotion ? 1 : (0.72 + 0.28 * Math.sin(t * 3.0 + i * 0.55));
      const wWidth = s.r * (0.85 + p * 3.0) * pulse;
      const alpha  = (1 - p) * 0.16;
      const streak = ctx.createLinearGradient(s.x - wWidth, 0, s.x + wWidth, 0);
      streak.addColorStop(0.0, 'rgba(255,196,120,0)');
      streak.addColorStop(0.5, 'rgba(255,226,170,' + alpha + ')');
      streak.addColorStop(1.0, 'rgba(255,196,120,0)');
      ctx.fillStyle = streak;
      ctx.fillRect(s.x - wWidth + wobble, y, wWidth * 2, rowH);
    }
    ctx.restore();
  }

  function paintBoat(t) {
    // Tiny sailboat silhouette on the water -- the "yacht club" wink.
    const hy = horizonY();
    const x = W * 0.24;
    const bob = reduceMotion ? 0 : Math.sin(t * 0.9) * 2;
    const y = hy + H * 0.03 + bob;
    const scale = Math.min(W, H) * 0.05;
    ctx.fillStyle = 'rgba(22,16,34,0.92)';
    // hull
    ctx.beginPath();
    ctx.moveTo(x - scale * 0.7, y);
    ctx.lineTo(x + scale * 0.7, y);
    ctx.lineTo(x + scale * 0.45, y + scale * 0.28);
    ctx.lineTo(x - scale * 0.45, y + scale * 0.28);
    ctx.closePath();
    ctx.fill();
    // mast + mainsail
    ctx.beginPath();
    ctx.moveTo(x, y - scale * 1.25);
    ctx.lineTo(x + scale * 0.52, y - scale * 0.05);
    ctx.lineTo(x, y - scale * 0.05);
    ctx.closePath();
    ctx.fill();
    // jib
    ctx.beginPath();
    ctx.moveTo(x - scale * 0.05, y - scale * 1.1);
    ctx.lineTo(x - scale * 0.45, y - scale * 0.05);
    ctx.lineTo(x - scale * 0.05, y - scale * 0.05);
    ctx.closePath();
    ctx.fill();
  }

  function paintLights(t) {
    // Wire
    ctx.lineWidth = Math.max(1, W / 900);
    ctx.strokeStyle = 'rgba(20,14,30,0.6)';
    ctx.beginPath();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const x = f * W;
      const y = wireY(f);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Bulbs
    for (const b of bulbs) {
      const x = b.t * W;
      const y = wireY(b.t) + 3;
      const tw = reduceMotion ? 0.85 : 0.6 + 0.4 * Math.sin(t * b.speed * 2 + b.phase);
      const core = b.warm ? '255,206,120' : '255,244,224';
      const glowR = (b.warm ? 11 : 9) * (0.85 + tw * 0.5);

      // glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      glow.addColorStop(0, 'rgba(' + core + ',' + (0.85 * tw) + ')');
      glow.addColorStop(1, 'rgba(' + core + ',0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // bulb core
      ctx.fillStyle = 'rgba(' + core + ',' + (0.7 + 0.3 * tw) + ')';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.4, W / 700), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function paintPatioGlow(t) {
    // Warm flickering glow rising from just below the frame (the fire pit).
    const flicker = reduceMotion ? 0.5 : 0.42 + 0.12 * Math.sin(t * 5.3) + 0.06 * Math.sin(t * 11.7);
    const gh = H * 0.26;
    const g = ctx.createLinearGradient(0, H - gh, 0, H);
    g.addColorStop(0, 'rgba(255,120,50,0)');
    g.addColorStop(1, 'rgba(255,120,50,' + (0.22 * flicker) + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, H - gh, W, gh);
  }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    paintSky();
    paintStars(t);
    paintSun();
    paintWater(t);
    paintBoat(t);
    paintPatioGlow(t);
    paintLights(t);
  }

  /* -- Loop + lifecycle ------------------------------------------- */
  let rafId = null;
  let running = false;
  let startTime = null;

  function loop(now) {
    if (startTime === null) startTime = now;
    const t = (now - startTime) / 1000;
    frame(t);
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    startTime = null;
    rafId = window.requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
  }

  /* Pause when the hero is off-screen; resume when it returns. */
  function observeVisibility() {
    if (!('IntersectionObserver' in window)) { start(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.01 });
    io.observe(canvas);
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (reduceMotion || !running) frame(0); // repaint still frame after resize
    }, 150);
  }, { passive: true });

  // Init
  resize();
  frame(0);                 // paint immediately so there is never a blank flash
  if (reduceMotion) return; // static scene, no loop
  observeVisibility();

})();
