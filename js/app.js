// resources/js/app.js
// Compiled by Vite. All shared JS from the original HTML files.

// ── Intersection Observer (scroll-fade) ─────────────────────
function initScrollFade({ threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold, rootMargin });
    document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));
}

// ── Navbar scroll shrink ─────────────────────────────────────
function initNavbar({ threshold = 60 } = {}) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > threshold);
    }, { passive: true });
}

// ── Mobile menu ──────────────────────────────────────────────
function initMobileMenu() {
    const menuBtn   = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen  = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        menuBtn.setAttribute('aria-expanded', String(!isHidden));
        iconOpen?.classList.toggle('hidden', !isHidden);
        iconClose?.classList.toggle('hidden', isHidden);
    });
    document.querySelectorAll('#mobile-menu a').forEach(a => {
        a.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
            iconOpen?.classList.remove('hidden');
            iconClose?.classList.add('hidden');
        });
    });
}

// ── Smooth scroll for anchor links ───────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const t = document.querySelector(this.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ── Read progress bar ────────────────────────────────────────
function initReadProgress(bodyId = 'article-body') {
    const bar  = document.getElementById('read-progress');
    const body = document.getElementById(bodyId);
    if (!bar || !body) return;

    let bodyTop = 0, scrollRange = 1;
    function cacheMeasurements() {
        bodyTop     = body.offsetTop;
        scrollRange = Math.max(body.offsetHeight - window.innerHeight, 1);
    }
    cacheMeasurements();
    window.addEventListener('resize', cacheMeasurements, { passive: true });

    let rafPending = false;
    function updateProgress() {
        const pct = Math.min(Math.max((window.scrollY - bodyTop) / scrollRange, 0), 1);
        bar.style.transform = `scaleX(${pct})`;
        rafPending = false;
    }
    window.addEventListener('scroll', () => {
        if (!rafPending) { rafPending = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
}

// ── Image fallback (broken images → placeholder) ─────────────
function initImageFallbacks() {
    function applyFallback(img) {
        img.onerror = null;
        img.style.display = 'none';
        const wrap  = img.parentElement;
        const bg    = img.dataset.fallbackBg    || 'linear-gradient(135deg,#f1f5f9,#e2e8f0)';
        const color = img.dataset.fallbackColor || '#94a3b8';
        wrap.style.background = bg;
        if (!wrap.querySelector('.img-placeholder')) {
            wrap.insertAdjacentHTML('beforeend', `
                <div class="img-placeholder" style="display:flex;align-items:center;justify-content:center;height:100%;position:absolute;inset:0;">
                    <svg width="44" height="44" fill="none" stroke="${color}" stroke-width="1.5" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </div>`);
        }
    }
    document.querySelectorAll('img[data-fallback-bg]').forEach(img => {
        img.addEventListener('error', () => applyFallback(img), { once: true });
    });
}

// ── Carousel (project screenshots) ───────────────────────────
function initCarousel() {
    const track   = document.getElementById('carousel-track');
    if (!track) return;
    const slides  = Array.from(track.querySelectorAll('.carousel-slide'));
    const dots    = Array.from(document.querySelectorAll('.carousel-dot'));
    const counter = document.getElementById('carousel-counter');
    const caption = document.getElementById('carousel-caption');
    let current   = 0;
    const total   = slides.length;

    function goTo(index) {
        current = (index + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        if (counter) counter.textContent = `${current + 1} / ${total}`;
        if (caption) caption.textContent = slides[current].dataset.caption || '';
    }

    document.getElementById('carousel-prev')?.addEventListener('click', () => goTo(current - 1));
    document.getElementById('carousel-next')?.addEventListener('click', () => goTo(current + 1));
    dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));

    // Swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    });

    // Click to open lightbox
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const img = slide.querySelector('img');
            if (!img || img.style.display === 'none' || !lightbox) return;
            lightboxImg.src = slide.dataset.src || img.src;
            lightboxImg.alt = slide.dataset.alt || '';
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });
}

// ── Lightbox ─────────────────────────────────────────────────
function initLightbox() {
    const lightbox      = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    if (!lightbox) return;

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }
    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

// ── Home hero parallax ────────────────────────────────────────
function initHeroParallax() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // Each element has:
    //   mx/my/mr   — scroll parallax multipliers
    //   fx/fy/fr   — idle float amplitudes (px / px / deg), kept very small
    //   fs         — float speed (lower = slower)
    //   fp         — float phase offset so elements don't all move in sync
    //   baseY      — any CSS translateY the element needs for layout positioning
    const parallaxMap = [
        { id: 'sn-tree',        mx: -60,  my:  80,  mr:  0,  fx: 3,  fy: 4,  fr: 0.4, fs: 0.0007, fp: 0.0,  baseY: 0    },
        { id: 'sn-moon',        mx:  80,  my: -60,  mr:  45, fx: 4,  fy: 3,  fr: 0.5, fs: 0.0009, fp: 1.1,  baseY: 0    },
        { id: 'sn-houses',      mx:  100, my:  60,  mr:  0,  fx: 3,  fy: 5,  fr: 0.3, fs: 0.0008, fp: 2.2,  baseY: 0    },
        { id: 'sn-left-swirl',  mx: -120, my: -40,  mr: -60, fx: 5,  fy: 3,  fr: 0.6, fs: 0.0006, fp: 3.3,  baseY: 0    },
        { id: 'sn-right-swirl', mx:  120, my:  40,  mr:  60, fx: 4,  fy: 4,  fr: 0.5, fs: 0.0007, fp: 4.4,  baseY: -50  },
    ];

    const targets = parallaxMap
        .map(cfg => ({ el: document.getElementById(cfg.id), ...cfg }))
        .filter(t => t.el !== null);

    if (!targets.length) return;

    const baseYUnit = { 'sn-right-swirl': '%' };  // '%' for right-swirl, 'px' for others

    function tick(ts) {
        const scrollY    = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        const progress   = Math.min(scrollY / (heroHeight * 0.6), 1);

        targets.forEach(({ el, id, mx, my, mr, fx, fy, fr, fs, fp, baseY }) => {
            // Idle float: sine waves at different phases/speeds
            const idleX = Math.sin(ts * fs + fp)           * fx * (1 - progress);
            const idleY = Math.sin(ts * fs * 1.3 + fp + 1) * fy * (1 - progress);
            const idleR = Math.sin(ts * fs * 0.7 + fp + 2) * fr * (1 - progress);

            // Scroll parallax
            const scrollX = mx * progress;
            const scrollY2 = my * progress;
            const scrollR = mr * progress;

            const unit = baseYUnit[id] || 'px';
            const baseTranslate = baseY !== 0 ? `translateY(${baseY}${unit}) ` : '';

            el.style.transform =
                `${baseTranslate}` +
                `translateX(${idleX + scrollX}px) ` +
                `translateY(${idleY + scrollY2}px) ` +
                `rotate(${idleR + scrollR}deg)`;
        });

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ── Footer starry-night parallax ─────────────────────────────
function initFooterParallax() {
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;

    // Each element slides in from its natural edge (left stays left, right stays right).
    // mx/my are the *resting offset* when progress=0 (off-position) and reach 0 at progress=1.
    // So we invert: startX/startY are where they begin, and they travel to 0,0 (their CSS position).
    // fx/fy/fr — idle float amplitudes; fs — float speed; fp — phase offset.
    const parallaxMap = [
        // star.png — top-left: slides in from the left
        { id: 'fn-star',      startX: -80, startY: -30, startR: -15, fx: 2.5, fy: 3,   fr: 0.35, fs: 0.0007, fp: 0.5 },
        // wave.png — bottom-right: slides in from the right & slightly below
        { id: 'fn-wave',      startX:  90, startY:  35, startR:  8,  fx: 3,   fy: 2.5, fr: 0.3,  fs: 0.0008, fp: 1.8 },
        // amallstar.png — top-right: slides in from the right & slightly above
        { id: 'fn-smallstar', startX:  70, startY: -28, startR:  18, fx: 2,   fy: 2,   fr: 0.4,  fs: 0.0006, fp: 3.1 },
    ];

    const targets = parallaxMap
        .map(cfg => ({ el: document.getElementById(cfg.id), ...cfg }))
        .filter(t => t.el !== null);

    if (!targets.length) return;

    function footerProgress(scrollY, sectionTop, sectionHeight) {
        const pageBottom = document.documentElement.scrollHeight - window.innerHeight;
        const fullyIn    = Math.min(sectionTop + sectionHeight - window.innerHeight, pageBottom);
        const start      = sectionTop - window.innerHeight;
        const raw        = (scrollY - start) / Math.max(fullyIn - start, 1);
        return Math.min(Math.max(raw, 0), 1);
    }

    function tick(ts) {
        const sectionTop    = contactSection.offsetTop;
        const sectionHeight = contactSection.offsetHeight;
        const scrollY       = window.scrollY;

        // progress: 0 = section hasn't entered viewport yet, 1 = fully in view
        // (or the bottom of the page is reached). Reverses when scrolling back up.
        const progress = footerProgress(scrollY, sectionTop, sectionHeight);

        // Ease the progress so it feels smooth at both ends
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        targets.forEach(({ el, startX, startY, startR, fx, fy, fr, fs, fp }) => {
            // Idle float — scaled down when elements haven't settled in yet
            const idleX = Math.sin(ts * fs + fp)           * fx * eased;
            const idleY = Math.sin(ts * fs * 1.3 + fp + 1) * fy * eased;
            const idleR = Math.sin(ts * fs * 0.7 + fp + 2) * fr * eased;

            // Scroll-driven slide-in: starts at startX/Y/R, travels to 0 as eased → 1
            const slideX = startX * (1 - eased);
            const slideY = startY * (1 - eased);
            const slideR = startR * (1 - eased);

            el.style.transform =
                `translateX(${idleX + slideX}px) ` +
                `translateY(${idleY + slideY}px) ` +
                `rotate(${idleR + slideR}deg)`;
        });

        requestAnimationFrame(tick);
    }

    // Set initial opacity from CSS; we'll drive it via JS on scroll
    targets.forEach(({ el }) => {
        const computedOpacity = parseFloat(getComputedStyle(el).opacity);
        el.dataset.targetOpacity = String(computedOpacity);
        el.style.opacity = '0';
    });

    function updateOpacity() {
        const progress = footerProgress(window.scrollY, contactSection.offsetTop, contactSection.offsetHeight);
        const eased      = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        targets.forEach(({ el }) => {
            const target = parseFloat(el.dataset.targetOpacity || '0.5');
            el.style.opacity = String(target * eased);
        });
    }

    window.addEventListener('scroll', updateOpacity, { passive: true });
    updateOpacity();

    requestAnimationFrame(tick);
}

// ── Home project slideshow ────────────────────────────────────
function initSlideshows() {
    const slideIndices = {};

    function showSlides(n, id) {
        const container = document.querySelector(`[data-slideshow="${id}"]`);
        if (!container) return;
        const slides = container.querySelectorAll('.slide');
        const dots   = container.querySelectorAll('.dot');
        if (!slides.length) return;

        slideIndices[id] = n;
        if (n > slides.length) slideIndices[id] = 1;
        if (n < 1) slideIndices[id] = slides.length;

        slides.forEach(s => { s.classList.remove('active'); s.style.opacity = '0'; s.style.zIndex = '0'; });
        dots.forEach(d => d.classList.remove('active'));

        const i = slideIndices[id] - 1;
        slides[i].classList.add('active');
        slides[i].style.opacity = '1';
        slides[i].style.zIndex  = '1';
        if (dots[i]) dots[i].classList.add('active');
    }

    // Assign globals immediately so onclick attributes can call them right away
    window.changeSlide  = (n, id) => showSlides((slideIndices[id] || 1) + n, id);
    window.currentSlide = (n, id) => showSlides(n, id);

    // DOM is already ready here (called from DOMContentLoaded below) — initialize directly
    document.querySelectorAll('[data-slideshow]').forEach(el => {
        const id = el.dataset.slideshow;
        slideIndices[id] = 1;
        showSlides(1, id);
    });
}

// ── My Work filter pills ──────────────────────────────────────
function initWorkFilter() {
    const pills       = document.querySelectorAll('.filter-pill');
    const cards       = document.querySelectorAll('#work-grid [data-category]');
    const emptyState  = document.getElementById('empty-state');
    const resultCount = document.getElementById('result-count');
    if (!pills.length) return;

    function updateCount(visible) {
        if (!resultCount) return;
        resultCount.textContent = visible === cards.length
            ? `${visible} items`
            : `${visible} of ${cards.length} items`;
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.dataset.filter;
            let visible = 0;
            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.style.display = match ? '' : 'none';
                if (match) visible++;
            });
            emptyState?.classList.toggle('visible', visible === 0);
            updateCount(visible);
        });
    });
    updateCount(cards.length);
}
// Auto-init on every page
document.addEventListener('DOMContentLoaded', () => {
    initScrollFade();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initImageFallbacks();

    // Page-specific: only runs if the elements exist on the page
    initHeroParallax();
    initFooterParallax();
    initSlideshows();
    initReadProgress('article-body');
    initReadProgress('project-body');
    initCarousel();
    initLightbox();
    initWorkFilter();
});