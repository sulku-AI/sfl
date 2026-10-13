/* ============================================================
   Laris & Emran — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. time together ────────────────────────────────────── */
  var START = new Date(2026, 8, 14, 0, 0, 0); // 14 September 2026, local time

  var fields = {
    days:    document.querySelector('[data-unit="days"]'),
    hours:   document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]')
  };
  var note = document.getElementById('counterNote');

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function monthsBetween(from, to) {
    var m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate()) m -= 1;
    return Math.max(0, m);
  }

  function tick() {
    var now = new Date();
    var diff = now - START;
    if (diff < 0) diff = 0;

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (fields.days)    fields.days.textContent = days.toLocaleString();
    if (fields.hours)   fields.hours.textContent = pad(hours);
    if (fields.minutes) fields.minutes.textContent = pad(minutes);
    if (fields.seconds) fields.seconds.textContent = pad(seconds);

    if (note) {
      var months = monthsBetween(START, now);
      note.textContent = months >= 1
        ? 'One month down — ' + months + (months === 1 ? ' month' : ' months') + ' of us, and counting.'
        : '…and counting, one second at a time.';
    }
  }

  tick();
  setInterval(tick, 1000);

  /* ── 2. envelope ─────────────────────────────────────────── */
  var envelope = document.getElementById('envelope');
  var envLetter = document.getElementById('envLetter');
  var panel = document.getElementById('letterPanel');
  var openBtn = document.getElementById('openLetter');
  var closeEnvBtn = document.getElementById('closeEnvelope');

  function setEnvelope(open) {
    if (!envelope) return;
    envelope.classList.toggle('is-open', open);
    envelope.setAttribute('aria-expanded', String(open));
    envelope.setAttribute('aria-label', open ? 'Envelope is open' : 'Open the envelope');
    if (envLetter) envLetter.setAttribute('aria-hidden', String(!open));
    if (panel) panel.hidden = !open;
  }

  if (envelope) {
    envelope.addEventListener('click', function () {
      if (envelope.classList.contains('is-open')) return;
      setEnvelope(true);
    });

    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!envelope.classList.contains('is-open')) setEnvelope(true);
      }
    });
  }

  if (closeEnvBtn) {
    closeEnvBtn.addEventListener('click', function () {
      setEnvelope(false);
      if (envelope) envelope.focus();
    });
  }

  /* ── 3. letter overlay ───────────────────────────────────── */
  var overlay = document.getElementById('overlay');
  var closeLetterBtn = document.getElementById('closeLetter');
  var lastFocused = null;

  function openLetter() {
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (closeLetterBtn) closeLetterBtn.focus();
  }

  function closeLetter() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (openBtn) openBtn.addEventListener('click', openLetter);
  if (closeLetterBtn) closeLetterBtn.addEventListener('click', closeLetter);

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeLetter();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLetter();
  });

  /* ── 4. reveal on scroll ─────────────────────────────────── */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      observer.observe(el);
    });
  }

  /* ── 5. floating hearts ──────────────────────────────────── */
  if (!reduceMotion) {
    var hero = document.querySelector('.hero');
    var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2S4.6 15.6 4.6 10.3A4.7 4.7 0 0 1 12 7.1a4.7 4.7 0 0 1 7.4 3.2c0 5.3-7.4 9.9-7.4 9.9z"/></svg>';

    if (hero) {
      hero.addEventListener('pointerdown', function (e) {
        var el = document.createElement('span');
        el.className = 'heart-pop';
        el.innerHTML = HEART;
        el.style.left = e.clientX + 'px';
        el.style.top = e.clientY + 'px';
        el.style.color = Math.random() > 0.65 ? 'var(--navy)' : 'var(--amber)';
        el.style.fontSize = (0.85 + Math.random() * 0.7) + 'rem';
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 1200);
      });
    }
  }
})();
