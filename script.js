/**
 * ============================================================
 * XYZ Gram Panchayat – Main JavaScript File
 * Author: Gram Panchayat Web Team
 * Version: 1.0
 * Features:
 *   1. Responsive hamburger menu
 *   2. Smooth active nav link highlighting on scroll
 *   3. Marquee ticker duplication for seamless loop
 *   4. Gallery filter with animation
 *   5. Contact form validation with real-time feedback
 *   6. Scroll-triggered reveal animations
 *   7. Back to top button
 *   8. Header shadow on scroll
 * ============================================================
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Shorthand for document.querySelector
 * @param {string} selector
 * @returns {Element|null}
 */
const qs  = (selector)        => document.querySelector(selector);
const qsa = (selector)        => document.querySelectorAll(selector);

/**
 * Throttle a function to avoid excessive calls (e.g. on scroll)
 * @param {Function} fn   - Function to throttle
 * @param {number}   wait - Milliseconds
 */
function throttle(fn, wait = 150) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn(...args); }
  };
}


/* ============================================================
   1. HAMBURGER MENU (Mobile Navigation)
   ============================================================ */
(function initMobileNav() {
  const hamburger = qs('#hamburger');
  const navMenu   = qs('#main-nav');
  const overlay   = qs('#nav-overlay');

  if (!hamburger || !navMenu) return;

  /** Open / close the mobile menu */
  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    navMenu.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
    // Accessibility: update aria-expanded
    hamburger.setAttribute('aria-expanded', String(open));
    // Prevent body scroll when menu is open
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // Toggle on hamburger click
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close when overlay is clicked
  overlay.addEventListener('click', () => toggleMenu(false));

  // Close when a nav link is clicked (navigate to section)
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) {
      toggleMenu(false);
    }
  });
})();


/* ============================================================
   2. ACTIVE NAV LINK ON SCROLL (Intersection Observer)
   ============================================================ */
(function initActiveNav() {
  const sections = qsa('main section[id]');
  const navLinks = qsa('.nav-link');

  if (!sections.length || !navLinks.length) return;

  /**
   * Map section IDs to nav links for O(1) lookup
   * @type {Map<string, Element>}
   */
  const linkMap = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap.set(href.slice(1), link);
    }
  });

  const observerOptions = {
    rootMargin: '-30% 0px -60% 0px', // Trigger when section is ~30% from top
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active from all
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active to the matching link
        const activeLink = linkMap.get(entry.target.id);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
})();


/* ============================================================
   3. HEADER SHADOW ON SCROLL
   ============================================================ */
(function initHeaderScroll() {
  const header = qs('.site-header');
  if (!header) return;

  const handleScroll = throttle(() => {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 4px 24px rgba(0,0,80,0.14)';
    } else {
      header.style.boxShadow = '0 2px 16px rgba(0,0,80,0.10)';
    }
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });
})();


/* ============================================================
   4. MARQUEE TICKER – Duplicate content for seamless loop
   ============================================================ */
(function initMarquee() {
  const track = qs('#marquee-track');
  if (!track) return;

  // Pause marquee on hover (accessibility)
  const wrap = track.parentElement;
  if (wrap) {
    wrap.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
    wrap.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
  }

  // Clone children so the ticker loops seamlessly
  const originalChildren = Array.from(track.children);
  originalChildren.forEach(child => {
    const clone = child.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();


/* ============================================================
   5. GALLERY FILTER
   ============================================================ */
(function initGalleryFilter() {
  const filterBtns  = qsa('.filter-btn');
  const galleryItems = qsa('.gallery-item');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show / hide items with a brief animation
      galleryItems.forEach(item => {
        const category = item.dataset.category;
        const shouldShow = (filter === 'all' || category === filter);

        if (shouldShow) {
          item.classList.remove('hidden');
          // Small stagger for reveal
          requestAnimationFrame(() => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.94)';
            requestAnimationFrame(() => {
              item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          });
        } else {
          item.classList.add('hidden');
          item.style.opacity = '';
          item.style.transform = '';
          item.style.transition = '';
        }
      });
    });
  });
})();


/* ============================================================
   6. CONTACT FORM VALIDATION
   ============================================================ */
(function initContactForm() {
  const form       = qs('#contact-form');
  if (!form) return;

  const fields = {
    name:    { el: qs('#full-name'),  errEl: qs('#err-name') },
    phone:   { el: qs('#phone'),      errEl: qs('#err-phone') },
    email:   { el: qs('#email'),      errEl: qs('#err-email') },
    subject: { el: qs('#subject'),    errEl: qs('#err-subject') },
    message: { el: qs('#message'),    errEl: qs('#err-message') },
    consent: { el: qs('#consent'),    errEl: qs('#err-consent') },
  };

  const submitBtn    = qs('#submit-btn');
  const formSuccess  = qs('#form-success');
  const refNumber    = qs('#ref-number');

  /** Show an error on a field */
  function showError(fieldKey, message) {
    const { el, errEl } = fields[fieldKey];
    el.classList.add('error');
    errEl.textContent = message;
  }

  /** Clear error on a field */
  function clearError(fieldKey) {
    const { el, errEl } = fields[fieldKey];
    el.classList.remove('error');
    errEl.textContent = '';
  }

  /** Validate a single field
   *  @returns {boolean} isValid
   */
  function validateField(key) {
    const { el } = fields[key];

    switch (key) {

      case 'name': {
        const val = el.value.trim();
        if (!val) {
          showError('name', 'Please enter your full name.');
          return false;
        }
        if (val.length < 3) {
          showError('name', 'Name must be at least 3 characters.');
          return false;
        }
        clearError('name');
        return true;
      }

      case 'phone': {
        const val = el.value.trim().replace(/\s+/g, '');
        // Accept formats: 9876543210 / +919876543210 / 09876543210
        const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
        if (!val) {
          showError('phone', 'Mobile number is required.');
          return false;
        }
        if (!phoneRegex.test(val)) {
          showError('phone', 'Enter a valid 10-digit Indian mobile number.');
          return false;
        }
        clearError('phone');
        return true;
      }

      case 'email': {
        const val = el.value.trim();
        // Email is optional, but validate if provided
        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          showError('email', 'Enter a valid email address.');
          return false;
        }
        clearError('email');
        return true;
      }

      case 'subject': {
        if (!el.value || el.value === '') {
          showError('subject', 'Please select a category.');
          return false;
        }
        clearError('subject');
        return true;
      }

      case 'message': {
        const val = el.value.trim();
        if (!val) {
          showError('message', 'Please describe your query or grievance.');
          return false;
        }
        if (val.length < 20) {
          showError('message', 'Message should be at least 20 characters.');
          return false;
        }
        clearError('message');
        return true;
      }

      case 'consent': {
        if (!el.checked) {
          showError('consent', 'Please confirm your agreement before submitting.');
          return false;
        }
        clearError('consent');
        return true;
      }

      default: return true;
    }
  }

  /** Real-time validation: validate on blur */
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    el.addEventListener('blur',  () => validateField(key));
    el.addEventListener('input', () => {
      // Clear error as user types (after first blur)
      if (el.classList.contains('error')) validateField(key);
    });
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', () => validateField(key));
    }
  });

  /** Full form validation */
  function validateAll() {
    const results = Object.keys(fields).map(key => validateField(key));
    return results.every(Boolean);
  }

  /** Generate a simple reference number */
  function generateRefNumber() {
    const prefix = 'GP-XYZ';
    const year   = new Date().getFullYear();
    const rand   = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${year}-${rand}`;
  }

  /** Handle form submission */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Show loading state
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.hidden    = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    // Simulate async form submission (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Success state
    btnText.hidden    = false;
    btnLoading.hidden = true;
    submitBtn.disabled = false;

    // Show success message
    const ref = generateRefNumber();
    if (refNumber) refNumber.textContent = ref;
    if (formSuccess) {
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Reset form fields
    form.reset();

    // Auto-hide success message after 10 seconds
    setTimeout(() => {
      if (formSuccess) formSuccess.hidden = true;
    }, 10000);
  });
})();


/* ============================================================
   7. SCROLL-TRIGGERED REVEAL ANIMATIONS
   Uses IntersectionObserver to add 'visible' class to .reveal
   elements when they enter the viewport.
   ============================================================ */
(function initRevealAnimations() {
  // Mark sections and cards for animation
  const animateTargets = qsa([
    '.about-grid',
    '.info-card',
    '.sarpanch-card',
    '.member-card',
    '.scheme-card',
    '.notice-item',
    '.gallery-item',
    '.contact-grid',
    '.sidebar-widget',
  ].join(','));

  animateTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children in grids
          const index = Array.from(entry.target.parentElement?.children ?? []).indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(index * 0.07, 0.4)}s`;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  animateTargets.forEach(el => revealObserver.observe(el));
})();


/* ============================================================
   8. BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  const handleScroll = throttle(() => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   9. SMOOTH SCROLL FOR NAV LINKS (fallback for older browsers)
   ============================================================ */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = qs(targetId);
      if (!target) return;

      e.preventDefault();

      // Account for sticky header height
      const header     = qs('.site-header');
      const headerH    = header ? header.offsetHeight : 0;
      const offsetTop  = target.getBoundingClientRect().top + window.scrollY - headerH - 10;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   10. NOTICE TICKER – Auto-highlight newest notice
   ============================================================ */
(function initNoticeHighlight() {
  const notices = qsa('.notice-item');
  if (!notices.length) return;

  // The first notice is the most recent; add a subtle pulse
  const latest = notices[0];
  if (latest) {
    latest.style.position = 'relative';
    // Add "New" badge
    const badge = document.createElement('span');
    badge.textContent = 'NEW';
    badge.style.cssText = `
      position: absolute;
      top: -8px;
      right: 16px;
      background: #c62828;
      color: #fff;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      padding: 2px 8px;
      border-radius: 4px;
    `;
    latest.appendChild(badge);
  }
})();


/* ============================================================
   11. CURRENT YEAR IN FOOTER (auto-updates)
   ============================================================ */
(function setCurrentYear() {
  const yearEls = qsa('.current-year');
  const year    = new Date().getFullYear();
  yearEls.forEach(el => { el.textContent = year; });
})();


/* ============================================================
   PAGE INIT LOG (remove in production)
   ============================================================ */
console.log('%c🏛️ XYZ Gram Panchayat Website Loaded', 'color:#FF9933; font-size:14px; font-weight:bold;');
console.log('%c   Government of Maharashtra | Official Portal', 'color:#138808; font-size:12px;');
