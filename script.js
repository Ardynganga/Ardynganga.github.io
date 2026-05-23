/* ============================================================
   ANDEV PORTFOLIO — script.js
   ============================================================ */

/* ── LOADER ─────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loaderFill');
  if (!loader || !fill) return;

  // Animate the bar
  requestAnimationFrame(() => {
    fill.style.width = '100%';
  });

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('done');
      document.body.style.overflow = '';
      triggerReveal();
      animateStats();
    }, 2000);
  });

  document.body.style.overflow = 'hidden';
})();


/* ── CUSTOM CURSOR ──────────────────────────────────────── */
(function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (!cursor || !cursorDot) return;

  let mouseX = 0, mouseY = 0;
  let curX = 0,   curY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Smooth cursor follow
  function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover state
  const hoverEls = document.querySelectorAll('a, button, .project-card, .info-card, .social-btn, .contact-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Hide on mobile
  if ('ontouchstart' in window) {
    cursor.style.display    = 'none';
    cursorDot.style.display = 'none';
    document.body.style.cursor = '';
  }
})();


/* ── NAVBAR ─────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const burger    = document.getElementById('burger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActiveLink();
  });

  // Burger menu
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // Active link highlighting
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 100;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-link[data-section="${id}"]`);

      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }
})();


/* ── HERO CANVAS (Particles + Lines) ───────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.vx   = (Math.random() - 0.5) * 0.4;
      this.vy   = (Math.random() - 0.5) * 0.4;
      this.r    = Math.random() * 1.8 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawLines() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(loop);
  }

  resize();
  init();
  loop();

  const ro = new ResizeObserver(() => { cancelAnimationFrame(animId); resize(); init(); loop(); });
  ro.observe(canvas);
})();


/* ── REVEAL ON SCROLL ───────────────────────────────────── */
function triggerReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) {
            setTimeout(() => sib.classList.add('visible'), idx * 80);
          }
        });
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
}

// Trigger immediately for above-fold elements after short delay
setTimeout(triggerReveal, 100);


/* ── STATS COUNTER ──────────────────────────────────────── */
function animateStats() {
  const statNums = document.querySelectorAll('.stat-num');
  statNums.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 16);
  });
}


/* ── SKILLS BARS ANIMATION ──────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ── CONTACT FORM ───────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Envoi en cours…';

    // Simulate async send (replace with real API call)
    setTimeout(() => {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Envoyer le message';
      form.reset();
      if (success) success.classList.add('show');
      setTimeout(() => success && success.classList.remove('show'), 5000);
    }, 1800);
  });
})();


/* ── BACK TO TOP ────────────────────────────────────────── */
(function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ── SMOOTH SCROLL for anchor links ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ── PARALLAX on hero photo ─────────────────────────────── */
(function initParallax() {
  const photo = document.querySelector('.hero-photo-wrap');
  if (!photo) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      photo.style.transform = `translateY(${scrollY * 0.06}px)`;
    }
  }, { passive: true });
})();


/* ── TILT effect on project cards ──────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.project-card, .info-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -5;
      const rotateY = ((e.clientX - centerX) / (rect.width  / 2)) *  5;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ── TYPING effect on hero subtitle ────────────────────── */
(function initTyping() {
  const el = document.querySelector('.hero-subtitle');
  if (!el) return;

  const texts = [
    'Développeur Web & Mobile Fullstack · DRC',
    'Python · Django · Flutter · Dart',
    'Freelance — Disponible maintenant'
  ];
  let idx = 0, charIdx = 0, deleting = false;

  setTimeout(typeLoop, 3000); // start after loader

  function typeLoop() {
    const current = texts[idx];

    if (!deleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(typeLoop, 2500);
        return;
      }
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        idx = (idx + 1) % texts.length;
      }
    }
    setTimeout(typeLoop, deleting ? 40 : 70);
  }
})();
