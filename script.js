/* Portfolio interactions. Every selector below matches index.html and styles.css. */
(function () {
    'use strict';

    // Enables the hidden-until-revealed state in CSS (content stays visible without JS).
    document.documentElement.classList.add('js');

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var CONTACT_EMAIL = 'tiyiselaniqueentonrabopape@gmail.com';

    function $(selector, scope) { return (scope || document).querySelector(selector); }
    function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

    /* 1. Mobile navigation */
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
            if (event.key === 'Escape' && isOpen()) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Reset when resizing up to desktop layout.
        window.addEventListener('resize', function () {
            if (window.innerWidth > 800 && isOpen()) setOpen(false);
        });
    }

    /* 2. Scroll reveal (each element animates once) */
    function initReveal() {
        var items = $$('.reveal');
        if (!items.length) return;
        if (!('IntersectionObserver' in window) || prefersReducedMotion) {
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

        items.forEach(function (el, index) {
            // Small stagger for siblings in the same grid.
            el.style.transitionDelay = ((index % 3) * 80) + 'ms';
            observer.observe(el);
        });
    }

    /* 3. Header background and active link */
    function initNavEffects() {
        var header = $('#site-header');
        var links = $$('.nav__link');
        var sections = links
            .map(function (link) { return $(link.getAttribute('href')); })
            .filter(Boolean);

        if (header) {
            var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 20); };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

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
        sections.forEach(function (section) { spy.observe(section); });
    }

    /* 4. Typing animation */
    function initTyping() {
        var target = $('#typed-text');
        if (!target) return;
        var phrases = ['Computer Science Student', 'Aspiring Software Developer', 'Java & C++ Programmer', 'Problem Solver'];

        if (prefersReducedMotion) {
            target.textContent = phrases[0];
            return;
        }

        var phraseIndex = 0, charIndex = 0, deleting = false;
        function tick() {
            var phrase = phrases[phraseIndex];
            charIndex += deleting ? -1 : 1;
            target.textContent = phrase.slice(0, charIndex);

            var delay = deleting ? 40 : 80;
            if (!deleting && charIndex === phrase.length) {
                deleting = true;
                delay = 1600;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                delay = 400;
            }
            setTimeout(tick, delay);
        }
        tick();
    }

    /* 5. Project cards: make the whole card a keyboard/click target for its GitHub link */
    function initProjectCards() {
        $$('.project-card').forEach(function (card) {
            var link = $('.project-card__link', card);
            if (!link) return;
            card.addEventListener('click', function (event) {
                if (event.target.closest('a')) return; // real links behave normally
                window.open(link.href, '_blank', 'noopener,noreferrer');
            });
            card.style.cursor = 'pointer';
        });
    }

    /* 6. Back to top */
    function initBackToTop() {
        var button = $('#back-to-top');
        if (!button) return;
        var onScroll = function () { button.classList.toggle('is-visible', window.scrollY > 600); };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            var home = $('#home');
            if (home) { home.setAttribute('tabindex', '-1'); home.focus({ preventScroll: true }); }
        });
    }

    /* 7. Contact form (mailto fallback, no backend) */
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
            var message = '';
            if (input.required && !value) message = 'This field is required.';
            else if (input.type === 'email' && !emailPattern.test(value)) message = 'Enter a valid email address, like name@example.com.';
            else if (input.name === 'message' && value.length < 10) message = 'Write at least 10 characters so I know how to help.';
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
            if (results.indexOf(false) !== -1) {
                showStatus('error', 'Please fix the highlighted fields and try again.');
                var firstInvalid = fields[results.indexOf(false)];
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            var name = form.elements.name.value.trim();
            var email = form.elements.email.value.trim();
            var subject = form.elements.subject.value.trim() || 'Portfolio enquiry from ' + name;
            var body = form.elements.message.value.trim() + '\n\n' + name + '\n' + email;
            window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            showStatus('success', 'Your email app should now open with your message ready. Press Send there to deliver it. If nothing opened, email ' + CONTACT_EMAIL + ' directly.');
        });
    }

    /* 8. Polish: dynamic year and desktop cursor glow */
    function initYear() {
        var year = $('#year');
        if (year) year.textContent = new Date().getFullYear();
    }

    function initCursorGlow() {
        var glow = $('#cursor-glow');
        if (!glow || prefersReducedMotion) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        var x = 0, y = 0, queued = false;
        function render() {
            glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
            queued = false;
        }
        window.addEventListener('mousemove', function (event) {
            x = event.clientX;
            y = event.clientY;
            glow.classList.add('is-active');
            if (!queued) { queued = true; requestAnimationFrame(render); }
        }, { passive: true });
        document.addEventListener('mouseleave', function () { glow.classList.remove('is-active'); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initReveal();
        initNavEffects();
        initTyping();
        initProjectCards();
        initBackToTop();
        initContactForm();
        initYear();
        initCursorGlow();
    });
})();