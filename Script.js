        (function () {
            'use strict';

            /* ---- Helpers ---- */
            function qs(sel, ctx) { return (ctx || document).querySelector(sel) }
            function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)) }
            function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) }
            function getAge(d) { var t = new Date(), a = t.getFullYear() - d.getFullYear(); if (t.getMonth() - d.getMonth() < 0 || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--; return a }
            function showErr(id, msg) { var el = qs('#' + id); if (el) el.textContent = msg }
            function clearErr(id) { var el = qs('#' + id); if (el) el.textContent = '' }
            function markErr(fieldId, errId, msg) {
                var f = qs('#' + fieldId);
                if (f) { f.classList.add('err'); f.setAttribute('aria-invalid', 'true') }
                showErr(errId, msg)
            }
            function markOk(fieldId, errId) {
                var f = qs('#' + fieldId);
                if (f) { f.classList.remove('err'); f.setAttribute('aria-invalid', 'false') }
                clearErr(errId)
            }

            /* =============================================
               1. NAVBAR
               ============================================= */
            var nav = qs('#navbar');
            function onScroll() {
                if (window.scrollY > 60) { nav.classList.add('scrolled') }
                else { nav.classList.remove('scrolled') }
                highlightNav()
            }
            function highlightNav() {
                var mid = window.scrollY + window.innerHeight * 0.4;
                var cur = '';
                qsa('section[id]').forEach(function (s) { if (s.offsetTop <= mid) cur = s.id });
                qsa('.nav-link').forEach(function (l) {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + cur)
                })
            }
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();

            /* =============================================
               2. HAMBURGER MENU
               ============================================= */
            var burger = qs('#hamburger');
            var navLinks = qs('#navLinks');
            var overlay = qs('#menuOverlay');

            function openMenu() {
                navLinks.classList.add('open');
                burger.classList.add('open');
                burger.setAttribute('aria-expanded', 'true');
                overlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
            function closeMenu() {
                navLinks.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
                overlay.classList.remove('show');
                document.body.style.overflow = '';
            }
            burger.addEventListener('click', function () {
                navLinks.classList.contains('open') ? closeMenu() : openMenu();
            });
            overlay.addEventListener('click', closeMenu);
            qsa('.nav-link').forEach(function (l) { l.addEventListener('click', closeMenu) });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu() });

            /* =============================================
               3. SMOOTH SCROLL
               ============================================= */
            document.addEventListener('click', function (e) {
                var a = e.target.closest('a[href^="#"]');
                if (!a) return;
                var target = document.querySelector(a.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                var navH = (nav ? nav.offsetHeight : 70);
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
            });

            /* =============================================
               4. SCROLL REVEAL
               ============================================= */
            var rvEls = qsa('.rv');
            if ('IntersectionObserver' in window) {
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (en) {
                        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) }
                    })
                }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
                rvEls.forEach(function (el) { io.observe(el) })
            } else {
                rvEls.forEach(function (el) { el.classList.add('in') })
            }

            /* =============================================
               5. COUNTER ANIMATION
               ============================================= */
            var counters = qsa('.stat-num[data-target]');
            var countersDone = false;
            function animateCounters() {
                if (countersDone) return;
                var heroStats = qs('.hero-stats');
                if (!heroStats) return;
                var rect = heroStats.getBoundingClientRect();
                if (rect.top < window.innerHeight - 50) {
                    countersDone = true;
                    counters.forEach(function (el) {
                        var target = parseInt(el.dataset.target, 10);
                        var start = performance.now();
                        var dur = 1800;
                        function tick(now) {
                            var p = Math.min((now - start) / dur, 1);
                            var eased = 1 - Math.pow(1 - p, 3);
                            el.textContent = Math.floor(eased * target).toLocaleString();
                            if (p < 1) requestAnimationFrame(tick);
                            else el.textContent = target.toLocaleString();
                        }
                        requestAnimationFrame(tick);
                    });
                }
            }
            window.addEventListener('scroll', animateCounters, { passive: true });
            setTimeout(animateCounters, 500);

            /* =============================================
               6. SPORTS TABS
               ============================================= */
            var tabBtns = qsa('.tab-btn');
            var panels = qsa('.sport-panel');
            tabBtns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var id = btn.dataset.tab;
                    tabBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false') });
                    panels.forEach(function (p) { p.classList.remove('active'); p.style.display = 'none' });
                    btn.classList.add('active');
                    btn.setAttribute('aria-selected', 'true');
                    var panel = qs('#sp-' + id);
                    if (panel) {
                        panel.classList.add('active');
                        panel.style.display = 'block';
                        /* re-trigger reveals inside panel */
                        qsa('.rv', panel).forEach(function (el) {
                            el.classList.remove('in');
                            setTimeout(function () { el.classList.add('in') }, 50);
                        });
                    }
                });
                /* keyboard nav */
                btn.addEventListener('keydown', function (e) {
                    var idx = tabBtns.indexOf(btn);
                    if (e.key === 'ArrowRight') { tabBtns[(idx + 1) % tabBtns.length].click(); tabBtns[(idx + 1) % tabBtns.length].focus() }
                    if (e.key === 'ArrowLeft') { tabBtns[(idx - 1 + tabBtns.length) % tabBtns.length].click(); tabBtns[(idx - 1 + tabBtns.length) % tabBtns.length].focus() }
                });
            });
            /* init hide all except active */
            panels.forEach(function (p) { if (!p.classList.contains('active')) p.style.display = 'none' });

            /* =============================================
               7. SPORT DETAILS POPUP
               ============================================= */
            var sportPopup = qs('#sportPopup');
            var sportPopupClose = qs('#sportPopupClose');
            var sportPopupImg = qs('#sportPopupImg');
            var sportPopupTitle = qs('#sportPopupTitle');
            var sportPopupPlayer = qs('#sportPopupPlayer');
            var sportPopupDetails = qs('#sportPopupDetails');
            var sportDetails = {
                'Badminton': { player: 'Lee Chong Wei', img: 'Lee.png', details: [['Rules', '21-point games, best of 3, no foot fault on serve.'], ['Team Members', '1 player singles or 2 players doubles.'], ['Timing', '7:00 AM - 11:00 PM daily.'], ['Ground', 'Indoor synthetic badminton courts.'], ['Famous Players', 'Lee Chong Wei, Lin Dan, Viktor Axelsen.']] },
                'Basketball': { player: 'Michael Jordan', img: 'jordan.png', details: [['Rules', 'Dribble while moving, shoot inside time limit, avoid fouls.'], ['Team Members', '5 players per side plus substitutes.'], ['Timing', '8:00 AM - 10:00 PM daily.'], ['Ground', 'Indoor full-size basketball court.'], ['Famous Players', 'Michael Jordan, LeBron James, Stephen Curry.']] },
                'Table Tennis': { player: 'Ma Long', img: 'Ma long.png', details: [['Rules', '11-point games, alternate serves, ball must bounce once.'], ['Team Members', '1 player singles or 2 players doubles.'], ['Timing', '6:00 AM - 10:00 PM daily.'], ['Ground', 'Indoor table tennis hall.'], ['Famous Players', 'Ma Long, Fan Zhendong, Jan-Ove Waldner.']] },
                'Boxing': { player: 'Muhammad Ali', img: 'ali.png', details: [['Rules', 'Legal punches above belt, rounds scored by clean hits.'], ['Team Members', '1 boxer versus 1 boxer.'], ['Timing', '5:00 PM - 9:00 PM daily.'], ['Ground', 'Indoor boxing ring and training area.'], ['Famous Players', 'Muhammad Ali, Mike Tyson, Manny Pacquiao.']] },
                'Martial Arts': { player: 'islam makhachev', img: 'islam.png', details: [['Rules', 'Controlled strikes, respect commands, safety gear required.'], ['Team Members', 'Individual training and 1 versus 1 bouts.'], ['Timing', '4:00 PM - 9:00 PM daily.'], ['Ground', 'Indoor dojo with padded mats.'], ['Famous Players', 'Khabib Nurmagomedov, Bruce Lee, Lyoto Machida.']] },
                'Squash': { player: 'Jahangir Khan', img: 'Jehangir.png', details: [['Rules', '11-point rally scoring, hit front wall, avoid interference.'], ['Team Members', '1 player versus 1 player.'], ['Timing', '7:00 AM - 10:00 PM daily.'], ['Ground', 'Indoor glass-back squash court.'], ['Famous Players', 'Jahangir Khan, Jansher Khan, Ramy Ashour.']] },
                'Cricket': { player: 'Mohammed Amir', img: 'amir.png', details: [['Rules', 'Bat and bowl by innings, score runs, wickets end turns.'], ['Team Members', '11 players per side plus substitutes.'], ['Timing', '6:00 AM - 10:00 PM daily.'], ['Ground', 'Outdoor cricket ground with turf pitches.'], ['Famous Players', 'Virat Kohli, Babar Azam, Wasim Akram.']] },
                'Football': { player: 'Neymar Jr.', img: 'neymar.png', details: [['Rules', 'No hands, score goals, fouls and offsides apply.'], ['Team Members', '11 players per side plus substitutes.'], ['Timing', '5:30 AM - 11:00 PM daily.'], ['Ground', 'Outdoor FIFA-style turf football field.'], ['Famous Players', 'Lionel Messi, Cristiano Ronaldo, Kylian Mbappe.']] },
                'Athletics': { player: 'Arshad Nadeem', img: 'arshad.png', details: [['Rules', 'Lane rules for races, valid attempts for field events.'], ['Team Members', 'Individual events and relay teams of 4.'], ['Timing', '5:00 AM - 8:00 PM daily.'], ['Ground', 'Outdoor 400m athletics track and field area.'], ['Famous Players', 'Usain Bolt, Eliud Kipchoge, Arshad Nadeem.']] },
                'Tennis': { player: 'Roger Federer', img: 'roger.png', details: [['Rules', 'Serve in box, play sets, ball must land in court.'], ['Team Members', '1 player singles or 2 players doubles.'], ['Timing', '6:00 AM - 10:00 PM daily.'], ['Ground', 'Outdoor tennis courts.'], ['Famous Players', 'Roger Federer, Serena Williams, Novak Djokovic.']] },
                'Hockey': { player: 'Waseem ahmed', img: 'Waseem.png', details: [['Rules', 'Use stick only, score from circle, fouls create free hits.'], ['Team Members', '11 players per side plus substitutes.'], ['Timing', '4:00 PM - 10:00 PM daily.'], ['Ground', 'Outdoor hockey ground.'], ['Famous Players', 'Dhyan Chand, Sohail Abbas, Jamie Dwyer.']] },
                'Volleyball': { player: 'Giba', img: 'giba.png', details: [['Rules', 'Three touches max, no net touch, rally scoring to 25.'], ['Team Members', '6 players per side plus substitutes.'], ['Timing', '5:00 PM - 10:00 PM daily.'], ['Ground', 'Outdoor volleyball court.'], ['Famous Players', 'Giba, Karch Kiraly, Earvin Ngapeth.']] }
            };
            function openSportPopup(name) {
                var data = sportDetails[name];
                if (!data || !sportPopup) return;
                sportPopupTitle.textContent = name;
                sportPopupPlayer.textContent = data.player;
                sportPopupImg.src = data.img;
                sportPopupImg.alt = data.player + ' - top ' + name + ' player';
                sportPopupDetails.innerHTML = data.details.map(function (row) { return '<li><b>' + row[0] + '</b><span>' + row[1] + '</span></li>' }).join('');
                sportPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                sportPopupClose.focus();
            }
            function closeSportPopup() {
                if (!sportPopup) return;
                sportPopup.style.display = 'none';
                document.body.style.overflow = '';
            }
            qsa('#sp-indoor .sport-list-card, #sp-outdoor .sport-list-card').forEach(function (card) {
                var nameEl = qs('strong', card);
                if (!nameEl) return;
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');
                card.setAttribute('aria-label', 'Open ' + nameEl.textContent + ' details');
                card.addEventListener('click', function () { openSportPopup(nameEl.textContent) });
                card.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSportPopup(nameEl.textContent) }
                });
            });
            if (sportPopupClose) sportPopupClose.addEventListener('click', closeSportPopup);
            if (sportPopup) sportPopup.addEventListener('click', function (e) { if (e.target === sportPopup) closeSportPopup() });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && sportPopup && sportPopup.style.display === 'flex') closeSportPopup();
            });

            /* =============================================
               7. PLAN SELECT → PRE-FILL FORM
               ============================================= */
            qsa('.btn-plan').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var plan = btn.dataset.plan;
                    var sel = qs('#rPlan');
                    if (sel) sel.value = plan;
                    var formWrap = qs('#regFormWrap');
                    if (formWrap) {
                        var navH = (nav ? nav.offsetHeight : 70);
                        window.scrollTo({ top: formWrap.getBoundingClientRect().top + window.scrollY - navH - 20, behavior: 'smooth' });
                        /* pulse highlight */
                        formWrap.style.transition = 'box-shadow .4s';
                        formWrap.style.boxShadow = '0 0 0 4px rgba(232,25,44,.45)';
                        setTimeout(function () { formWrap.style.boxShadow = ''; }, 1600);
                    }
                });
            });

            /* =============================================
               8. MEMBERSHIP FORM VALIDATION
               ============================================= */
            var mForm = qs('#membershipForm');
            var mSuccess = qs('#regSuccess');
            var mSubmitBtn = qs('#regSubmitBtn');
            if (mForm) {
                mForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    var valid = true;

                    /* Full name */
                    var name = qs('#rFullName').value.trim();
var nameRegex = /^[A-Za-z\s]+$/;

if (name.length < 2) {
    markErr('rFullName', 'e-rFullName', 'Please enter your full name (min 2 characters).');
    valid = false;
}
else if (!nameRegex.test(name)) {
    markErr('rFullName', 'e-rFullName', 'Name can contain only letters and spaces.');
    valid = false;
}
else {
    markOk('rFullName', 'e-rFullName');
}
                    /* Email */
                    var email = qs('#rEmail').value;
                    if (!isEmail(email)) { markErr('rEmail', 'e-rEmail', 'Please enter a valid email address.'); valid = false }
                    else markOk('rEmail', 'e-rEmail');

                    /* Phone */
                   var phone = qs('#rPhone').value.trim();

if (!/^\d+$/.test(phone)) {
    markErr('rPhone', 'e-rPhone', 'Phone number can contain digits only.');
    valid = false;
}
else if (phone.length < 10 || phone.length > 15) {
    markErr('rPhone', 'e-rPhone', 'Phone number must be between 10 and 15 digits.');
    valid = false;
}
else {
    markOk('rPhone', 'e-rPhone');
}

                    /* DOB */
                    var dobVal = qs('#rDOB').value;
                    if (!dobVal) { markErr('rDOB', 'e-rDOB', 'Please select your date of birth.'); valid = false }
                    else {
                        var age = getAge(new Date(dobVal));
                        if (age < 5 || age > 100) { markErr('rDOB', 'e-rDOB', 'Age must be between 5 and 100.'); valid = false }
                        else markOk('rDOB', 'e-rDOB');
                    }

                    /* Gender */
                    var gender = qs('#rGender').value;
                    if (!gender) { markErr('rGender', 'e-rGender', 'Please select your gender.'); valid = false }
                    else markOk('rGender', 'e-rGender');

                    /* Address */
                    var addr = qs('#rAddress').value.trim();
                    if (addr.length < 5) { markErr('rAddress', 'e-rAddress', 'Please enter a valid address (min 5 characters).'); valid = false }
                    else markOk('rAddress', 'e-rAddress');

                    /* Plan */
                    var plan = qs('#rPlan').value;
                    if (!plan) { markErr('rPlan', 'e-rPlan', 'Please select a membership plan.'); valid = false }
                    else markOk('rPlan', 'e-rPlan');

                    /* Terms */
                    var terms = qs('#rTerms').checked;
                    if (!terms) { showErr('e-rTerms', 'You must agree to the Terms & Conditions.'); valid = false }
                    else clearErr('e-rTerms');

                    if (valid) {
                        mSubmitBtn.disabled = true;
                        mSubmitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Submitting…';
                        setTimeout(function () {
                            mForm.style.display = 'none';
                            mSuccess.style.display = 'block';
                        }, 1200);
                    } else {
                        /* scroll to first visible error */
                        var firstErrEl = mForm.querySelector('.ferr:not(:empty)');
                        if (firstErrEl) firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }

            /* =============================================
               10. COMPLAINTS FORM VALIDATION
               ============================================= */
            var cmpForm = qs('#complaintsForm');
            var cmpSuccess = qs('#cmpSuccess');
            var cmpSubmitBtn = qs('#cmpSubmitBtn');
            if (cmpForm) {
                cmpForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    var valid = true;

                    /* Email optional but validate if filled */
                    var cmpEmail = qs('#cmpEmail').value;
                    if (cmpEmail && !isEmail(cmpEmail)) { markErr('cmpEmail', 'e-cmpEmail', 'Please enter a valid email address.'); valid = false }
                    else markOk('cmpEmail', 'e-cmpEmail');

                    /* Type */
                    var type = qs('#cmpType').value;
                    if (!type) { markErr('cmpType', 'e-cmpType', 'Please select complaint or suggestion.'); valid = false }
                    else markOk('cmpType', 'e-cmpType');

                    /* Category */
                    var cat = qs('#cmpCat').value;
                    if (!cat) { markErr('cmpCat', 'e-cmpCat', 'Please select a category.'); valid = false }
                    else markOk('cmpCat', 'e-cmpCat');

                    /* Message */
                    var msg = qs('#cmpMsg').value.trim();
                    if (msg.length < 10) { markErr('cmpMsg', 'e-cmpMsg', 'Please write at least 10 characters.'); valid = false }
                    else markOk('cmpMsg', 'e-cmpMsg');

                    if (valid) {
                        cmpSubmitBtn.disabled = true;
                        cmpSubmitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending…';
                        setTimeout(function () {
                            cmpForm.style.display = 'none';
                            cmpSuccess.style.display = 'block';
                        }, 1200);
                    }
                });
            }

            /* =============================================
               12. FEEDBACK FORM VALIDATION
               ============================================= */
            var fbForm = qs('#feedbackForm');
            var fbSuccess = qs('#fbSuccess');
            var fbSubmitBtn = qs('#fbSubmitBtn');
            if (fbForm) {
                fbForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    var valid = true;

                        var cmpName = qs('#cmpName').value.trim();
var nameRegex = /^[A-Za-z\s]+$/;

if (cmpName.length < 2) {
    markErr('cmpName', 'e-cmpName', 'Please enter your full name.');
    valid = false;
}
else if (!nameRegex.test(cmpName)) {
    markErr('cmpName', 'e-cmpName', 'Name can contain only letters and spaces.');
    valid = false;
}
else {
    markOk('cmpName', 'e-cmpName');
}

                    /* Email */
                   var cmpEmail = qs('#cmpEmail').value.trim();

if (!cmpEmail) {
    markErr('cmpEmail', 'e-cmpEmail', 'Email address is required.');
    valid = false;
}
else if (!isEmail(cmpEmail)) {
    markErr('cmpEmail', 'e-cmpEmail', 'Please enter a valid email address.');
    valid = false;
}
else {
    markOk('cmpEmail', 'e-cmpEmail');
}

                    /* Category */
                    var cat = qs('#fbCat').value;
                    if (!cat) { markErr('fbCat', 'e-fbCat', 'Please select a feedback category.'); valid = false }
                    else markOk('fbCat', 'e-fbCat');

                    /* Rating */
                    var rating = document.querySelector('input[name="rating"]:checked');
                    if (!rating) { showErr('e-fbRating', 'Please give us a star rating.'); valid = false }
                    else clearErr('e-fbRating');

                    /* Message */
                    var msg = qs('#fbMsg').value.trim();
                    if (msg.length < 10) { markErr('fbMsg', 'e-fbMsg', 'Please write at least 10 characters.'); valid = false }
                    else markOk('fbMsg', 'e-fbMsg');

                    if (valid) {
                        fbSubmitBtn.disabled = true;
                        fbSubmitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending…';
                        setTimeout(function () {
                            fbForm.style.display = 'none';
                            fbSuccess.style.display = 'block';
                        }, 1200);
                    }
                });
            }

            /* =============================================
               13. GALLERY LIGHTBOX
               ============================================= */
            var lb = qs('#lightbox');
            var lbImg = qs('#lbImg');
            var lbCap = qs('#lbCap');
            var lbClose = qs('#lbClose');
            var lbPrev = qs('#lbPrev');
            var lbNext = qs('#lbNext');
            var galItems = qsa('.gal-item');
            var lbIdx = 0;
            var lbData = galItems.map(function (it) {
                return {
                    src: it.dataset.src || it.querySelector('img').src,
                    alt: it.querySelector('img').alt || '',
                    cap: it.dataset.cap || qs('.gal-cap', it).textContent || ''
                }
            });

            function lbShow(idx) {
                lbIdx = idx;
                lbImg.src = lbData[idx].src;
                lbImg.alt = lbData[idx].alt;
                lbCap.textContent = lbData[idx].cap;
            }
            function lbOpen(idx) {
                lbShow(idx);
                lb.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                lbClose.focus();
            }
            function lbCloseFn() {
                lb.style.display = 'none';
                document.body.style.overflow = '';
            }
            function lbPrevFn() { lbShow((lbIdx - 1 + lbData.length) % lbData.length) }
            function lbNextFn() { lbShow((lbIdx + 1) % lbData.length) }

            galItems.forEach(function (it, idx) {
                it.addEventListener('click', function (e) {
                    if (e.target.closest('.gal-zoom') || e.target.tagName === 'FIGURE' || e.target.tagName === 'IMG' || it.contains(e.target)) lbOpen(idx);
                });
            });
            lbClose.addEventListener('click', lbCloseFn);
            lbPrev.addEventListener('click', lbPrevFn);
            lbNext.addEventListener('click', lbNextFn);
            lb.addEventListener('click', function (e) { if (e.target === lb) lbCloseFn() });
            document.addEventListener('keydown', function (e) {
                if (lb.style.display === 'none' || !lb.style.display) return;
                if (e.key === 'Escape') lbCloseFn();
                if (e.key === 'ArrowLeft') lbPrevFn();
                if (e.key === 'ArrowRight') lbNextFn();
            });
            /* touch swipe */
            var tsX = 0;
            lb.addEventListener('touchstart', function (e) { tsX = e.touches[0].clientX }, { passive: true });
            lb.addEventListener('touchend', function (e) {
                var diff = tsX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) { diff > 0 ? lbNextFn() : lbPrevFn() }
            }, { passive: true });

            /* =============================================
               14. BACK TO TOP
               ============================================= */
            var btt = qs('#backToTop');
            window.addEventListener('scroll', function () {
                btt.classList.toggle('show', window.scrollY > 400);
            }, { passive: true });
            btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }) });

            /* =============================================
               15. FOOTER YEAR
               ============================================= */
            var fyEl = qs('#fyear');
            if (fyEl) fyEl.textContent = new Date().getFullYear();

        })();
    
