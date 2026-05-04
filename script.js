(function () {
  'use strict';

  // ── Navbar scroll ───────────────────────────────────────
  const navbar = document.getElementById('navbar');
  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ── Mobile menu ─────────────────────────────────────────
  const toggle = document.getElementById('mobileToggle');
  const menu   = document.getElementById('navMenu');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menu.classList.add('open');
    toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menuOpen = false;
    menu.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  menu.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (menuOpen && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); }, { passive: true });

  // ── Smooth scroll ───────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, null, id);
    });
  });

  // ── Active nav on scroll ────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  function setActive() {
    const mid = window.scrollY + window.innerHeight / 3;
    let cur = '';
    sections.forEach(s => { if (s.offsetTop <= mid) cur = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${cur}`));
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // ── Intersection observer — reveal + stagger ────────────
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 90);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  const autoReveal = document.querySelectorAll(
    '.research-card, .project-card, .pub-item, .award-chip, .contact-block, .cert-card, .tl-item'
  );
  autoReveal.forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    io.observe(el);
  });

  // ── Hero — cycling identity ──────────────────────────────
  const cycleWord = document.getElementById('cycleWord');
  if (cycleWord) {
    // Edit these to change what cycles on the homepage
    const words = [
      'Geospatial Researcher',
      'GIS Specialist',
      'Remote Sensing Analyst',
      'Street Photographer',
      'Space Fanatic',
      'Data Scientist Enthusiast',
        'Occasional Writer'
    ];

    let wi = 0;
    let ci = 0;
    let deleting = false;
    let paused   = false;

    const TYPE_SPEED   = 70;   // ms per character while typing
    const DELETE_SPEED = 35;   // ms per character while deleting
    const PAUSE_AFTER  = 1800; // ms to hold on completed word
    const PAUSE_BEFORE = 300;  // ms before next word starts

    function tick() {
      const word = words[wi];

      if (paused) {
        paused = false;
        deleting = true;
        setTimeout(tick, PAUSE_AFTER);
        return;
      }

      if (!deleting) {
        ci++;
        cycleWord.textContent = word.slice(0, ci);
        if (ci === word.length) {
          paused = true;
          setTimeout(tick, PAUSE_AFTER);
        } else {
          setTimeout(tick, TYPE_SPEED);
        }
      } else {
        ci--;
        cycleWord.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          setTimeout(tick, PAUSE_BEFORE);
        } else {
          setTimeout(tick, DELETE_SPEED);
        }
      }
    }

    // Start after hero fade-in animations settle
    setTimeout(tick, 1400);
  }

  // ── Photography Slider ──────────────────────────────────
  const track    = document.getElementById('photoTrack');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const dotsWrap = document.getElementById('sliderDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const slides = Array.from(track.querySelectorAll('.photo-slide'));
    let current = 0;

    // Build dot indicators
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function getDots() { return Array.from(dotsWrap.querySelectorAll('.slider-dot')); }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, slides.length - 1));
      track.style.transform = `translateX(-${current * 100}%)`;
      getDots().forEach((d, i) => d.classList.toggle('active', i === current));
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    // Keyboard arrows when slider is in viewport
    document.addEventListener('keydown', e => {
      const slider = document.getElementById('photoSlider');
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    goTo(0); // initialise
  }

  // ── Marginalia — filter tabs (click active again = reset) ──
  const filterBar = document.getElementById('margFilters');
  const margEmpty = document.getElementById('margEmpty');

  if (filterBar) {
    let activeFilter = null; // null = show all

    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.mfilt');
      if (!btn) return;

      const filter = btn.dataset.filter;

      if (activeFilter === filter) {
        // Clicking the active filter a second time resets to show all
        activeFilter = null;
        filterBar.querySelectorAll('.mfilt').forEach(b => b.classList.remove('mfilt--active'));
      } else {
        activeFilter = filter;
        filterBar.querySelectorAll('.mfilt').forEach(b => b.classList.remove('mfilt--active'));
        btn.classList.add('mfilt--active');
      }

      const entries = document.querySelectorAll('.marg-entry');
      let visibleCount = 0;

      entries.forEach(entry => {
        entry.classList.remove('is-open'); // collapse open entries on filter change
        const show = activeFilter === null || entry.dataset.type === activeFilter;
        entry.classList.toggle('marg-hidden', !show);
        if (show) visibleCount++;
      });

      if (margEmpty) margEmpty.classList.toggle('visible', visibleCount === 0);
    });
  }

  // ── Marginalia — expand / collapse entries ───────────────
  document.querySelectorAll('.marg-entry').forEach(entry => {
    const head = entry.querySelector('.marg-entry-head');
    if (!head) return;
    head.addEventListener('click', () => {
      const isOpen = entry.classList.contains('is-open');
      // Close any currently open entry first
      document.querySelectorAll('.marg-entry.is-open').forEach(e => e.classList.remove('is-open'));
      // Then open the clicked one (unless it was already open — acts as toggle)
      if (!isOpen) entry.classList.add('is-open');
    });
  });

  // ── Publication image lightbox ───────────────────────────
  // Build the overlay once and reuse for every image click
  const lb = document.createElement('div');
  lb.className = 'pub-lightbox';
  lb.id = 'pubLightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML = `
    <div class="pub-lightbox-inner" id="lbInner">
      <button class="pub-lightbox-close" id="lbClose" aria-label="Close image">
        <i class="fas fa-times"></i>
      </button>
      <img id="lbImg" src="" alt="">
      <p class="pub-lightbox-caption" id="lbCaption"></p>
    </div>
  `;
  document.body.appendChild(lb);

  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose   = document.getElementById('lbClose');
  const lbInner   = document.getElementById('lbInner');

  function openLightbox(src, caption) {
    lbImg.src    = src;
    lbImg.alt    = caption;
    lbCaption.textContent = caption;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus(); // accessibility
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    // Clear src after transition so old image doesn't flash on next open
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  // Attach to every pub-img image
  document.querySelectorAll('.pub-img img').forEach(img => {
    img.addEventListener('click', () => {
      // Caption = venue line of that pub entry
      const venue = img.closest('.pub-item')
        ?.querySelector('.pub-venue')?.textContent.trim() || '';
      openLightbox(img.src, venue);
    });
  });

  // Close when clicking the dark backdrop (outside the image box)
  lb.addEventListener('click', e => {
    if (!lbInner.contains(e.target)) closeLightbox();
  });

  lbClose.addEventListener('click', closeLightbox);

  // Escape key closes lightbox but doesn't interfere with slider arrows
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  // ── Timeline cards — expand / collapse ──────────────────
  // Dynamically wraps each card's description + tags in a collapsible
  // block and injects a "Read more / Less" button. No HTML changes needed.
  document.querySelectorAll('.tl-card').forEach(card => {
    const desc = card.querySelector('p:not(.tl-org)'); // the description paragraph
    const tags = card.querySelector('.tl-tags');
    if (!desc) return;

    // Wrap description + tags in a collapsible div
    const wrap = document.createElement('div');
    wrap.className = 'tl-expandable';
    desc.parentNode.insertBefore(wrap, desc);
    wrap.appendChild(desc);
    if (tags) wrap.appendChild(tags);

    // Inject "Read more" button right after .tl-org
    const org = card.querySelector('.tl-org');
    const btn = document.createElement('button');
    btn.className = 'tl-read-more';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `Read more <i class="fas fa-chevron-down"></i>`;

    const insertAfter = org || card.querySelector('h3');
    insertAfter.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const expanded = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', expanded);
      btn.innerHTML = expanded
        ? `Read less <i class="fas fa-chevron-down"></i>`
        : `Read more <i class="fas fa-chevron-down"></i>`;
    });
  });

  // ── Research cards — expand / collapse ───────────────────
  // Same pattern: hides description + tags behind a "Learn more" toggle.
  document.querySelectorAll('.research-card').forEach(card => {
    const body = card.querySelector('.rcard-body');
    if (!body) return;

    const desc = body.querySelector('p');
    const tags = body.querySelector('.rcard-tags');
    const link = body.querySelector('.rcard-link'); // StoryMap link if present
    if (!desc) return;

    // Wrap description + tags (+ optional link) in collapsible div
    const wrap = document.createElement('div');
    wrap.className = 'rcard-expandable';
    desc.parentNode.insertBefore(wrap, desc);
    wrap.appendChild(desc);
    if (tags) wrap.appendChild(tags);
    if (link) wrap.appendChild(link);

    // Inject "Learn more" button after the h3
    const h3 = body.querySelector('h3');
    const btn = document.createElement('button');
    btn.className = 'rcard-read-more';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `Learn more <i class="fas fa-chevron-down"></i>`;
    h3.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', () => {
      const expanded = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', expanded);
      btn.innerHTML = expanded
        ? `Show less <i class="fas fa-chevron-down"></i>`
        : `Learn more <i class="fas fa-chevron-down"></i>`;
    });
  });

  // ── Footer year ─────────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();