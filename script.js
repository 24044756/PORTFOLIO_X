/* Portfolio interactions. Every selector below matches index.html and styles.css. */
(function () {
    'use strict';

    // Enables the hidden-until-revealed states in CSS (content stays visible without JS).
    document.documentElement.classList.add('js');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var CONTACT_EMAIL = 'tiyiselaniqueentonrabopape@gmail.com';

    function $(selector, scope) { return (scope || document).querySelector(selector); }
    function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

    /* ---------- Navigation ---------- */
    function initMobileNav() {
        var toggle = $('#nav-toggle');
        var menu = $('#nav-menu');
        if (!toggle || !menu) return;

        function setOpen(open) {
            menu.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }
        function isOpen() { return menu.classList.contains('is-open'); }

        toggle.addEventListener('click', function () { setOpen(!isOpen()); });
        $$('.nav__link', menu).forEach(function (link) {
            link.addEventListener('click', function () { setOpen(false); });
        });
        document.addEventListener('click', function (event) {
            if (isOpen() && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 880 && isOpen()) setOpen(false);
        });
    }

    function initNavEffects() {
        var header = $('#site-header');
        var progress = $('#scroll-progress');
        var links = $$('.nav__link');
        var sections = links.map(function (l) { return $(l.getAttribute('href')); }).filter(Boolean);

        var ticking = false;
        function update() {
            if (header) header.classList.toggle('is-scrolled', window.scrollY > 20);
            if (progress) {
                var max = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
            }
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();

        if (!sections.length || !('IntersectionObserver' in window)) return;
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (link) {
                    var active = link.getAttribute('href') === '#' + entry.target.id;
                    link.classList.toggle('is-active', active);
                    if (active) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------- Reveal on scroll (each element animates once) ---------- */
    function initReveal() {
        var items = $$('.reveal');
        if (!items.length) return;
        if (!('IntersectionObserver' in window) || reduceMotion) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach(function (el, i) {
            el.style.transitionDelay = ((i % 3) * 80) + 'ms';
            observer.observe(el);
        });
    }

    /* ---------- Hero typing ---------- */
    function initTyping() {
        var target = $('#typed-text');
        if (!target) return;
        var phrases = ['Computer Science Student', 'Mathematics Student', 'Aspiring Software Developer', 'Mathematics Tutor', 'Problem Solver'];
        if (reduceMotion) { target.textContent = phrases[0]; return; }

        var p = 0, c = 0, deleting = false;
        function tick() {
            var phrase = phrases[p];
            c += deleting ? -1 : 1;
            target.textContent = phrase.slice(0, c);
            var delay = deleting ? 35 : 75;
            if (!deleting && c === phrase.length) { deleting = true; delay = 1600; }
            else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
            setTimeout(tick, delay);
        }
        tick();
    }

    /* ---------- Hero particles (canvas, paused when off-screen or tab hidden) ---------- */
    function initParticles() {
        var canvas = $('#particles');
        if (!canvas || reduceMotion || !canvas.getContext) return;
        var ctx = canvas.getContext('2d');
        var hero = $('#home');
        var dots = [], width = 0, height = 0, running = false, visible = true, raf = 0;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var count = Math.min(70, Math.round(width * height / 18000));
            dots = [];
            for (var i = 0; i < count; i++) {
                dots.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.5 + .6 });
            }
        }
        function frame() {
            ctx.clearRect(0, 0, width, height);
            for (var i = 0; i < dots.length; i++) {
                var a = dots[i];
                a.x += a.vx; a.y += a.vy;
                if (a.x < 0 || a.x > width) a.vx *= -1;
                if (a.y < 0 || a.y > height) a.vy *= -1;
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r, 0, 6.2832);
                ctx.fillStyle = 'rgba(165,180,252,.7)';
                ctx.fill();
                for (var j = i + 1; j < dots.length; j++) {
                    var b = dots[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
                    if (d < 12000) {
                        ctx.strokeStyle = 'rgba(139,92,246,' + (0.22 * (1 - d / 12000)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(frame);
        }
        function sync() {
            var shouldRun = visible && !document.hidden;
            if (shouldRun && !running) { running = true; raf = requestAnimationFrame(frame); }
            else if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
        }
        resize();
        var resizeTimer;
        window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
        document.addEventListener('visibilitychange', sync);
        if ('IntersectionObserver' in window && hero) {
            new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(hero);
        }
        sync();
    }

    /* ---------- Subtle parallax ---------- */
    function initParallax() {
        var layers = $$('[data-parallax]');
        if (!layers.length || reduceMotion) return;
        var ticking = false;
        function update() {
            var y = window.scrollY;
            layers.forEach(function (el) {
                var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
                var rect = el.parentElement.getBoundingClientRect();
                if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
                el.style.translate = '0 ' + (y * speed).toFixed(1) + 'px';
            });
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    /* ---------- Skill filter ---------- */
    function initSkillFilter() {
        var buttons = $$('.filter-btn');
        var cards = $$('.skill-card');
        if (!buttons.length || !cards.length) return;
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.getAttribute('data-filter');
                buttons.forEach(function (b) {
                    var on = b === button;
                    b.classList.toggle('is-active', on);
                    b.setAttribute('aria-pressed', String(on));
                });
                cards.forEach(function (card) {
                    card.classList.toggle('is-dimmed', filter !== 'all' && card.getAttribute('data-category') !== filter);
                });
            });
        });
    }

    /* ---------- Modules accordion controls ---------- */
    function initModules() {
        var groups = $$('.module-group');
        var expand = $('#expand-all');
        var collapse = $('#collapse-all');
        if (expand) expand.addEventListener('click', function () { groups.forEach(function (g) { g.open = true; }); });
        if (collapse) collapse.addEventListener('click', function () { groups.forEach(function (g) { g.open = false; }); });
    }

    /* ---------- Academic counters and bars ---------- */
    function initCounters() {
        var cards = $$('.stat-card');
        if (!cards.length) return;

        function setBar(card) {
            var bar = $('.stat-card__bar', card);
            if (bar) bar.style.setProperty('--fill', bar.getAttribute('data-fill') + '%');
        }
        function run(card) {
            var counter = $('.counter', card);
            setBar(card);
            if (!counter) return;
            var target = parseInt(counter.getAttribute('data-target'), 10);
            if (isNaN(target)) return;
            if (reduceMotion) { counter.textContent = target; return; }
            var start = null, duration = 1400;
            function step(ts) {
                if (start === null) start = ts;
                var t = Math.min((ts - start) / duration, 1);
                counter.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) requestAnimationFrame(step);
            }
            counter.textContent = '0';
            requestAnimationFrame(step);
        }

        if (!('IntersectionObserver' in window)) { cards.forEach(setBar); return; }
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { run(entry.target); obs.unobserve(entry.target); }
            });
        }, { threshold: 0.4 });
        cards.forEach(function (card) { observer.observe(card); });
    }

    /* ---------- Back to top ---------- */
    function initBackToTop() {
        var button = $('#back-to-top');
        if (!button) return;
        function onScroll() { button.classList.toggle('is-visible', window.scrollY > 600); }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            var home = $('#home');
            if (home) { home.setAttribute('tabindex', '-1'); home.focus({ preventScroll: true }); }
        });
    }

    /* ---------- WhatsApp widget ---------- */
    function initWhatsApp() {
        var widget = $('#wa-widget');
        var toggle = $('#wa-toggle');
        var panel = $('#wa-panel');
        var closeBtn = $('#wa-close');
        var tooltip = $('#wa-tooltip');
        if (!widget || !toggle || !panel) return;

        var closeTimer;
        function open() {
            clearTimeout(closeTimer);
            panel.classList.remove('is-closing');
            panel.hidden = false;
            widget.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
        }
        function close(returnFocus) {
            if (panel.hidden) return;
            toggle.setAttribute('aria-expanded', 'false');
            widget.classList.remove('is-open');
            panel.classList.add('is-closing');
            closeTimer = setTimeout(function () { panel.hidden = true; panel.classList.remove('is-closing'); }, reduceMotion ? 0 : 220);
            if (returnFocus) toggle.focus();
        }

        toggle.addEventListener('click', function () { if (panel.hidden) open(); else close(false); });
        if (closeBtn) closeBtn.addEventListener('click', function () { close(true); });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !panel.hidden) close(true);
        });
        document.addEventListener('click', function (event) {
            if (!panel.hidden && !widget.contains(event.target)) close(false);
        });

        // Show the tooltip briefly once so visitors notice the widget.
        if (tooltip && !reduceMotion) {
            setTimeout(function () { tooltip.classList.add('is-shown'); }, 3000);
            setTimeout(function () { tooltip.classList.remove('is-shown'); }, 7500);
        }
    }

    /* ---------- Contact form (mailto fallback, no backend) ---------- */
    function initContactForm() {
        var form = $('#contact-form');
        if (!form) return;
        var status = $('#form-status');
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        function setError(input, message) {
            var error = $('#' + input.id + '-error');
            if (error) error.textContent = message;
            if (message) input.setAttribute('aria-invalid', 'true');
            else input.removeAttribute('aria-invalid');
        }
        function validate(input) {
            var value = input.value.trim();
            var min = parseInt(input.getAttribute('minlength'), 10) || 0;
            var message = '';
            if (input.required && !value) message = 'This field is required.';
            else if (input.type === 'email' && !emailPattern.test(value)) message = 'Enter a valid email address, like name@example.com.';
            else if (min && value.length < min) message = 'Please enter at least ' + min + ' characters.';
            setError(input, message);
            return !message;
        }
        function showStatus(type, text) {
            if (!status) return;
            status.className = 'form-status form-status--' + type;
            status.textContent = text;
        }

        var fields = $$('input[required], textarea[required]', form);
        fields.forEach(function (input) {
            input.addEventListener('blur', function () { validate(input); });
            input.addEventListener('input', function () {
                if (input.getAttribute('aria-invalid') === 'true') validate(input);
            });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var results = fields.map(validate);
            var bad = results.indexOf(false);
            if (bad !== -1) {
                showStatus('error', 'Please fix the highlighted fields and try again.');
                fields[bad].focus();
                return;
            }
            var name = form.elements.name.value.trim();
            var email = form.elements.email.value.trim();
            var subject = form.elements.subject.value.trim();
            var body = form.elements.message.value.trim() + '\n\n' + name + '\n' + email;
            window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            showStatus('success', 'Your email app should now open with your message ready. Press Send there to deliver it. If nothing opened, email ' + CONTACT_EMAIL + ' directly.');
        });
    }

    /* ---------- Polish ---------- */
    function initYear() {
        var year = $('#year');
        if (year) year.textContent = new Date().getFullYear();
    }

    function initCursorGlow() {
        var glow = $('#cursor-glow');
        if (!glow || reduceMotion) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        var x = 0, y = 0, queued = false;
        function render() { glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; queued = false; }
        window.addEventListener('mousemove', function (event) {
            x = event.clientX; y = event.clientY;
            glow.classList.add('is-active');
            if (!queued) { queued = true; requestAnimationFrame(render); }
        }, { passive: true });
        document.addEventListener('mouseleave', function () { glow.classList.remove('is-active'); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initNavEffects();
        initReveal();
        initTyping();
        initParticles();
        initParallax();
        initSkillFilter();
        initModules();
        initCounters();
        initBackToTop();
        initWhatsApp();
        initContactForm();
        initYear();
        initCursorGlow();
    });
})();