import { video } from './video.js';
import { image } from './image.js';
import { audio } from './audio.js';
import { openingChime } from './opening-chime.js';
import { rsvp } from './rsvp.js';
import { progress } from './progress.js';
import { util } from '../../common/util.js';
import { bs } from '../../libs/bootstrap.js';
import { loader } from '../../libs/loader.js';
import { theme } from '../../common/theme.js';
import { lang } from '../../common/language.js';
import { storage } from '../../common/storage.js';
import { offline } from '../../common/offline.js';
import * as confetti from '../../libs/confetti.js';
import { pool } from '../../connection/request.js';

export const guest = (() => {

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let information = null;

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let config = null;

    /** @returns {void} */
    const lockMobileHeroViewport = () => {
        let orientationTimer = null;

        const update = () => {
            if (!window.matchMedia('(max-width: 768px)').matches) {
                document.documentElement.style.removeProperty('--stable-hero-height');
                return;
            }

            const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight);
            document.documentElement.style.setProperty('--stable-hero-height', `${viewportHeight}px`);
        };

        update();
        window.addEventListener('orientationchange', () => {
            window.clearTimeout(orientationTimer);
            orientationTimer = window.setTimeout(update, 350);
        }, { passive: true });
    };

    /**
     * @returns {void}
     */
    const countDownDate = () => {
        const count = (new Date(document.body.getAttribute('data-time').replace(' ', 'T'))).getTime();

        /**
         * @param {number} num
         * @returns {string}
         */
        const pad = (num) => num < 10 ? `0${num}` : `${num}`;

        const day = document.getElementById('day');
        const hour = document.getElementById('hour');
        const minute = document.getElementById('minute');
        const second = document.getElementById('second');

        const updateCountdown = () => {
            const distance = Math.abs(count - Date.now());

            day.textContent = pad(Math.floor(distance / (1000 * 60 * 60 * 24)));
            hour.textContent = pad(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            minute.textContent = pad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            second.textContent = pad(Math.floor((distance % (1000 * 60)) / 1000));

            util.timeOut(updateCountdown, 1000 - (Date.now() % 1000));
        };

        util.timeOut(updateCountdown);
    };

    /**
     * @returns {void}
     */
    const showGuestName = () => {
        const raw = window.location.search.split('to=');
        let name = null;

        if (raw.length > 1 && raw[1].length >= 1) {
            name = window.decodeURIComponent(raw[1]);
        }

        if (name) {
            const guestName = document.getElementById('guest-name');
            const div = document.createElement('div');
            div.classList.add('m-2');

            const template = `<small class="mt-0 mb-1 mx-0 p-0">${util.escapeHtml(guestName?.getAttribute('data-message'))}</small><p class="guest-name-display m-0 p-0">${util.escapeHtml(name)}</p>`;
            util.safeInnerHTML(div, template);

            guestName?.appendChild(div);
        }

        // Pre-fill the RSVP form name only if ?to= is provided
        const form = document.getElementById('form-name');
        if (form && name) {
            form.value = name;
        }

        // RSVP form is always visible
        // ?to=Name just adds a personalized greeting and pre-fills the name
    };

    /**
     * @returns {Promise<void>}
     */
    const slide = async () => {
        const interval = 6000;
        const slides = document.querySelectorAll('.slide-desktop');

        if (!slides || slides.length === 0) {
            return;
        }

        const desktopEl = document.getElementById('root')?.querySelector('.d-sm-block');
        if (!desktopEl) {
            return;
        }

        desktopEl.dispatchEvent(new Event('undangan.slide.stop'));

        if (window.getComputedStyle(desktopEl).display === 'none') {
            return;
        }

        if (slides.length === 1) {
            await util.changeOpacity(slides[0], true);
            return;
        }

        let index = 0;
        for (const [i, s] of slides.entries()) {
            if (i === index) {
                s.classList.add('slide-desktop-active');
                await util.changeOpacity(s, true);
                break;
            }
        }

        let run = true;
        const nextSlide = async () => {
            await util.changeOpacity(slides[index], false);
            slides[index].classList.remove('slide-desktop-active');

            index = (index + 1) % slides.length;

            if (run) {
                slides[index].classList.add('slide-desktop-active');
                await util.changeOpacity(slides[index], true);
            }

            return run;
        };

        desktopEl.addEventListener('undangan.slide.stop', () => {
            run = false;
        });

        const loop = async () => {
            if (await nextSlide()) {
                util.timeOut(loop, interval);
            }
        };

        util.timeOut(loop, interval);
    };

    /**
     * @param {HTMLButtonElement} button
     * @returns {void}
     */
    const open = async (button) => {
        if (button.disabled) {
            return;
        }

        button.classList.add('is-opening');
        button.disabled = true;
        document.dispatchEvent(new Event('undangan.open.prepare'));
        const chime = openingChime.play();
        await new Promise((resolve) => util.timeOut(resolve, 140));
        document.body.scrollIntoView({ behavior: 'instant' });

        const welcome = document.getElementById('welcome');
        const root = document.getElementById('root');
        const welcomeRect = welcome.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        const seamY = buttonRect.top + (buttonRect.height / 2) - welcomeRect.top;
        welcome.style.setProperty('--cover-seam-y', `${seamY}px`);

        welcome.classList.add('is-revealing');
        root.classList.add('is-opening');
        root.classList.remove('opacity-0');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coverTransition = reducedMotion
            ? util.changeOpacity(welcome, false, 0.08)
            : new Promise((resolve) => util.timeOut(resolve, 600));
        await Promise.all([
            chime,
            coverTransition,
        ]);
        welcome.remove();
        document.getElementById('button-wedding-day')?.classList.remove('d-none');

        if (theme.isAutoMode()) {
            document.getElementById('button-theme').classList.remove('d-none');
        }

        slide();
        theme.spyTop();

        document.dispatchEvent(new Event('undangan.open'));
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => confetti.basicAnimation());
        });
    };

    /**
     * Let a deliberate tap anywhere on the Cover open the invitation while
     * preserving vertical swipe gestures and the accessible CTA button.
     * @returns {void}
     */
    const coverTapInteraction = () => {
        const welcome = document.getElementById('welcome');
        const button = welcome?.querySelector('.cover-open-button');
        if (!welcome || !button) {
            return;
        }

        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let moved = false;
        const movementThreshold = 10;

        welcome.addEventListener('pointerdown', (event) => {
            if (!event.isPrimary || event.button !== 0 || event.target.closest('.cover-open-button')) {
                return;
            }

            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            moved = false;
        });

        welcome.addEventListener('pointermove', (event) => {
            if (event.pointerId !== pointerId) {
                return;
            }

            const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
            moved ||= distance > movementThreshold;
        });

        welcome.addEventListener('pointerup', (event) => {
            if (event.pointerId !== pointerId) {
                return;
            }

            pointerId = null;
            if (!moved) {
                open(button);
            }
        });

        welcome.addEventListener('pointercancel', () => {
            pointerId = null;
            moved = false;
        });
    };

    /**
     * @param {HTMLDivElement} div
     * @returns {void}
     */
    const showStory = (div) => {
        if (navigator.vibrate) {
            navigator.vibrate(500);
        }

        confetti.tapTapAnimation(div, 100);
        util.changeOpacity(div, false).then((e) => e.remove());
    };

    /**
     * @returns {void}
     */
    const closeInformation = () => information.set('info', true);

    /**
     * @returns {void}
     */
    const animateSvg = () => {
        document.querySelectorAll('svg').forEach((el) => {
            if (el.hasAttribute('data-class')) {
                util.timeOut(() => el.classList.add(el.getAttribute('data-class')), parseInt(el.getAttribute('data-time')));
            }
        });
    };

    /**
     * @returns {void}
     */
    const buildCalendarLinks = () => {
        const calBtn = document.querySelector('[data-calendar]');
        if (!calBtn) {
            return;
        }

        const title = calBtn.getAttribute('data-cal-title') || 'Wedding';
        const start = calBtn.getAttribute('data-cal-start') || document.body.getAttribute('data-time');
        const end = calBtn.getAttribute('data-cal-end') || '';
        const location = calBtn.getAttribute('data-cal-location') || '';
        const details = calBtn.getAttribute('data-cal-details') || '';
        const eventTimeZone = 'Asia/Taipei';
        const icsHref = './assets/calendar/minchi-david-wedding.ics';

        // Google Calendar link
        const formatDate = (d) => (new Date(d.replace(' ', 'T') + ':00Z')).toISOString().replace(/[-:]/g, '').split('.').shift();
        const googleUrl = new URL('https://calendar.google.com/calendar/render');
        googleUrl.search = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            dates: `${formatDate(start)}/${end ? formatDate(end) : formatDate(start)}`,
            details: details,
            location: location,
            ctz: eventTimeZone,
        }).toString();

        const googleChoice = document.getElementById('calendar-choice-google');
        const icsChoice = document.getElementById('calendar-choice-ics');
        if (googleChoice) {
            googleChoice.setAttribute('href', googleUrl.toString());
        }
        if (icsChoice) {
            icsChoice.setAttribute('href', icsHref);
        }
        calBtn.setAttribute('aria-label', 'Choose a calendar for November 29, 2026');
        calBtn.addEventListener('click', () => bs.modal('calendar-choice-modal').show());

        // Build calendar links for the RSVP success modal
        const calContainer = document.getElementById('add-to-cal');
        if (calContainer) {
            const startDate = new Date(start.replace(' ', 'T'));
            const endDate = end ? new Date(end.replace(' ', 'T')) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

            // Yahoo Calendar
            const duration = Math.round((endDate - startDate) / 60000);
            const yahooHours = String(Math.floor(duration / 60)).padStart(2, '0');
            const yahooMins = String(duration % 60).padStart(2, '0');
            const yahooUrl = encodeURI([
                'https://calendar.yahoo.com/?v=60&view=d&type=20',
                '&title=' + title,
                '&st=' + formatDate(start),
                '&dur=' + yahooHours + yahooMins,
                '&desc=' + details,
                '&in_loc=' + location
            ].join(''));

            const calHtml = `
                <p class="calendar-helper-text mb-2 mt-0">Save the Date</p>
                <div class="calendar-provider-links d-flex flex-wrap justify-content-center gap-3">
                    <a href="${googleUrl.toString()}" target="_blank">Google</a>
                    <a href="${icsHref}" target="_blank">Apple</a>
                    <a href="${icsHref}" target="_blank">Outlook</a>
                    <a href="${yahooUrl}" target="_blank">Yahoo</a>
                </div>
            `;
            util.safeInnerHTML(calContainer, calHtml);
        }
    };

    /** @returns {void} */
    const journeyConfetti = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        document.querySelectorAll('#journey-stories .collapse').forEach((panel) => {
            panel.addEventListener('show.bs.collapse', () => {
                const toggle = document.querySelector(`[aria-controls="${panel.id}"]`);
                if (toggle) {
                    const sourceSide = panel.id === 'journey-story-one' ? 'right' : 'left';
                    confetti.journeyGoldAnimation(toggle, sourceSide);
                }
            });
        });
    };

    /** @returns {void} */
    const coupleHeartInteraction = () => {
        const heart = document.getElementById('couple-heart');
        if (!heart) {
            return;
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let interacted = false;
        let visible = false;
        let hintCount = 0;
        let hintTimer = null;
        const scheduleHint = (delay) => {
            window.clearTimeout(hintTimer);
            if (reducedMotion || interacted || !visible || hintCount >= 2) {
                return;
            }

            hintTimer = window.setTimeout(() => {
                if (interacted || !visible) {
                    return;
                }

                hintCount += 1;
                heart.classList.remove('is-hinting');
                void heart.offsetWidth;
                heart.classList.add('is-hinting');
                confetti.loveSparkleAnimation(heart, true);
                scheduleHint(4000);
            }, delay);
        };
        const hintObserver = reducedMotion || !('IntersectionObserver' in window)
            ? null
            : new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting && entry.intersectionRatio >= 0.7;
                if (visible) {
                    scheduleHint(1200);
                } else {
                    window.clearTimeout(hintTimer);
                }
            }, { threshold: [0, 0.7] });

        hintObserver?.observe(heart);

        heart.addEventListener('click', () => {
            interacted = true;
            window.clearTimeout(hintTimer);
            hintObserver?.disconnect();
            heart.classList.remove('is-hinting');
            heart.classList.remove('is-beating');
            void heart.offsetWidth;
            heart.classList.add('is-beating');

            if (!reducedMotion) {
                confetti.loveSparkleAnimation(heart);
            }
        });
        heart.addEventListener('animationend', () => {
            heart.classList.remove('is-beating', 'is-hinting');
        });
    };

    /** @returns {void} */
    const hiddenSideSpinInteraction = () => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hintTargets = [];
        let hintObserver = null;
        const getHintThreshold = (spin) => spin.classList.contains('hero-hidden-side-spin') ? 0.7 : 0.5;
        const isHintVisible = (spin) => {
            const rect = spin.getBoundingClientRect();
            const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
            return visibleHeight / rect.height >= getHintThreshold(spin);
        };
        const scheduleHint = (spin, isVisible) => {
            const hintState = spin.hiddenSideHintState;
            if (!hintState || hintState.played || hintState.interacted) {
                return;
            }

            window.clearTimeout(hintState.timer);
            hintState.timer = null;
            if (spin.classList.contains('hero-hidden-side-spin') && document.getElementById('welcome')) {
                return;
            }
            if (isVisible) {
                hintState.timer = window.setTimeout(() => {
                    if (!hintState.interacted && !spin.classList.contains('is-animating')) {
                        hintState.played = true;
                        if (!hintState.recurring) {
                            hintObserver?.unobserve(spin);
                        }
                        spin.classList.add('is-hinting');
                    }
                }, hintState.delay);
            }
        };
        hintObserver = reducedMotion || !('IntersectionObserver' in window)
            ? null
            : new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    scheduleHint(
                        entry.target,
                        entry.isIntersecting && entry.intersectionRatio >= getHintThreshold(entry.target),
                    );
                });
            }, { threshold: [0, 0.5, 0.7] });

        document.querySelectorAll('.hidden-side-spin').forEach((spin) => {
            let locked = false;
            let halfTurns = 0;
            const isHeroSpin = spin.classList.contains('hero-hidden-side-spin');
            const halfTurnsPerClick = isHeroSpin ? 13 : 7;
            const animationDuration = isHeroSpin ? 2920 : 1900;
            const hintState = {
                interacted: false,
                played: false,
                recurring: isHeroSpin,
                timer: null,
                delay: 2000,
            };

            if (!reducedMotion) {
                spin.hiddenSideHintState = hintState;
                hintTargets.push(spin);
                hintObserver?.observe(spin);
                if (isHeroSpin) {
                    document.addEventListener('undangan.open', () => scheduleHint(spin, true), { once: true });
                }
                spin.addEventListener('animationend', (event) => {
                    if (event.animationName === 'hidden-side-affordance' || event.animationName === 'hero-hidden-side-affordance') {
                        spin.classList.remove('is-hinting');
                        if (hintState.recurring && !hintState.interacted) {
                            hintState.played = false;
                            scheduleHint(spin, isHintVisible(spin));
                        }
                    }
                });
            }

            spin.addEventListener('click', () => {
                if (locked) {
                    return;
                }

                hintState.interacted = true;
                window.clearTimeout(hintState.timer);
                if (hintObserver) {
                    hintObserver.unobserve(spin);
                }
                spin.classList.remove('is-hinting');
                locked = true;
                const startAngle = halfTurns * 180;
                halfTurns += halfTurnsPerClick;
                const isFlipped = halfTurns % 2 === 1;
                spin.style.setProperty('--hidden-side-spin-start', `${startAngle}deg`);
                spin.style.setProperty('--hidden-side-spin-rotation', `${halfTurns * 180}deg`);
                spin.classList.add('is-animating');
                spin.setAttribute('aria-pressed', String(isFlipped));
                spin.setAttribute('aria-busy', 'true');

                if (isHeroSpin && !reducedMotion) {
                    window.setTimeout(() => {
                        if (spin.classList.contains('is-animating')) {
                            confetti.heroSpinGoldDustAnimation(spin);
                        }
                    }, 300);
                    window.setTimeout(() => {
                        if (spin.classList.contains('is-animating')) {
                            confetti.heroSpinGoldDustAnimation(spin);
                        }
                    }, Math.round(animationDuration * 0.393));
                }

                const unlock = () => {
                    locked = false;
                    spin.classList.remove('is-animating');
                    spin.removeAttribute('aria-busy');
                };

                window.setTimeout(unlock, reducedMotion ? 0 : animationDuration);
            });
        });

        if (!reducedMotion && !hintObserver && hintTargets.length > 0) {
            let hintFrame = null;
            const checkHintVisibility = () => {
                hintFrame = null;
                hintTargets.forEach((spin) => {
                    scheduleHint(spin, isHintVisible(spin));
                });
            };
            const requestHintCheck = () => {
                if (hintFrame === null) {
                    hintFrame = window.requestAnimationFrame(checkHintVisibility);
                }
            };

            window.addEventListener('scroll', requestHintCheck, { passive: true });
            window.addEventListener('resize', requestHintCheck, { passive: true });
            requestHintCheck();
        }
    };

    /** @returns {void} */
    const footerEasterEgg = () => {
        const trigger = document.getElementById('footer-easter-egg-trigger');
        const message = document.getElementById('footer-easter-egg-message');
        if (!trigger || !message) {
            return;
        }

        let taps = 0;
        let resetTimer = null;
        let hideTimer = null;

        trigger.addEventListener('dblclick', (event) => event.preventDefault());
        trigger.addEventListener('click', () => {
            taps += 1;
            window.clearTimeout(resetTimer);

            if (taps < 5) {
                resetTimer = window.setTimeout(() => {
                    taps = 0;
                }, 2200);
                return;
            }

            taps = 0;
            window.clearTimeout(hideTimer);
            message.classList.add('is-visible');
            hideTimer = window.setTimeout(() => message.classList.remove('is-visible'), 3500);
        });
    };

    /** @returns {void} */
    const guideClosingHeartEasterEgg = () => {
        const heart = document.getElementById('guide-closing-heart');
        const message = document.getElementById('guide-closing-easter-egg-message');
        if (!heart || !message) {
            return;
        }

        let taps = 0;
        let resetTimer = null;
        let hideTimer = null;

        heart.addEventListener('dblclick', (event) => event.preventDefault());
        heart.addEventListener('click', () => {
            heart.classList.remove('is-beating');
            void heart.offsetWidth;
            heart.classList.add('is-beating');

            taps += 1;
            window.clearTimeout(resetTimer);
            if (taps < 5) {
                resetTimer = window.setTimeout(() => {
                    taps = 0;
                }, 2200);
                return;
            }

            taps = 0;
            window.clearTimeout(hideTimer);
            message.classList.add('is-visible');
            hideTimer = window.setTimeout(() => message.classList.remove('is-visible'), 5500);

            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                confetti.loveSparkleAnimation(heart);
            }
        });
        heart.addEventListener('animationend', () => heart.classList.remove('is-beating'));
    };

    /** @returns {void} */
    const weddingDayShortcut = () => {
        const button = document.getElementById('button-wedding-day');
        const target = document.getElementById('wedding-date');
        const guideClosing = document.querySelector('.guide-closing-copy');
        if (!button || !target || !guideClosing) {
            return;
        }

        let guideFrame = null;
        let lastGuideScrollY = window.scrollY;

        const setGuideActive = (active) => {
            button.classList.toggle('is-guide-active', active);
        };

        const updateGuideState = () => {
            guideFrame = null;
            const currentScrollY = window.scrollY;
            const isMovingDown = currentScrollY > lastGuideScrollY + 1;
            const isBeforeGuideClosing = guideClosing.getBoundingClientRect().top > window.innerHeight * 0.72;

            if (isBeforeGuideClosing) {
                setGuideActive(false);
            } else if (isMovingDown) {
                setGuideActive(true);
            }
            lastGuideScrollY = currentScrollY;
        };

        window.addEventListener('scroll', () => {
            if (guideFrame === null) {
                guideFrame = window.requestAnimationFrame(updateGuideState);
            }
        }, { passive: true });

        let scrollFrame = null;
        let arrivalTimer = null;
        let restoreScrollBehavior = null;
        let isScrollingToWeddingDay = false;

        const stopShortcutScroll = () => {
            if (scrollFrame !== null) {
                window.cancelAnimationFrame(scrollFrame);
                scrollFrame = null;
            }
            isScrollingToWeddingDay = false;
            restoreScrollBehavior?.();
        };

        const interruptShortcutScroll = () => {
            if (isScrollingToWeddingDay) {
                stopShortcutScroll();
            }
        };

        window.addEventListener('touchstart', interruptShortcutScroll, { passive: true });
        window.addEventListener('wheel', interruptShortcutScroll, { passive: true });
        window.addEventListener('keydown', (event) => {
            if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
                interruptShortcutScroll();
            }
        });

        const showArrival = () => {
            target.classList.remove('is-shortcut-arrival');
            void target.offsetWidth;
            target.classList.add('is-shortcut-arrival');
            window.clearTimeout(arrivalTimer);
            arrivalTimer = window.setTimeout(() => target.classList.remove('is-shortcut-arrival'), 1250);
        };

        button.addEventListener('click', (event) => {
            event.preventDefault();
            stopShortcutScroll();

            const rootStyle = document.documentElement.style;
            const previousScrollBehavior = rootStyle.getPropertyValue('scroll-behavior');
            const previousScrollPriority = rootStyle.getPropertyPriority('scroll-behavior');
            rootStyle.setProperty('scroll-behavior', 'auto', 'important');
            restoreScrollBehavior = () => {
                if (previousScrollBehavior) {
                    rootStyle.setProperty('scroll-behavior', previousScrollBehavior, previousScrollPriority);
                } else {
                    rootStyle.removeProperty('scroll-behavior');
                }
                restoreScrollBehavior = null;
            };

            const startY = window.scrollY;
            const targetY = target.getBoundingClientRect().top + startY;
            const distance = targetY - startY;
            const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1050;
            const startedAt = performance.now();
            isScrollingToWeddingDay = true;

            const step = (now) => {
                const scrollProgress = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration);
                const eased = scrollProgress < 0.5
                    ? 4 * scrollProgress * scrollProgress * scrollProgress
                    : 1 - Math.pow(-2 * scrollProgress + 2, 3) / 2;
                window.scrollTo(0, startY + (distance * eased));

                if (scrollProgress < 1) {
                    scrollFrame = window.requestAnimationFrame(step);
                    return;
                }

                scrollFrame = null;
                isScrollingToWeddingDay = false;
                restoreScrollBehavior?.();
                window.history.replaceState(null, '', '#wedding-date');
                showArrival();
            };

            scrollFrame = window.requestAnimationFrame(step);
        });
    };

    /** @returns {void} */
    const heroScrollIndicator = () => {
        const indicator = document.querySelector('.hero-scroll-indicator');
        const target = document.getElementById('wedding-date');
        if (!indicator || !target) {
            return;
        }

        indicator.addEventListener('click', (event) => {
            event.preventDefault();
            target.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'start',
            });
        });
    };

    /**
     * Keep the next chapter title visible after the first Journey story opens.
     * @returns {void}
     */
    const journeyAccordionReveal = () => {
        const firstStory = document.getElementById('journey-story-one');
        const secondChapter = document.querySelector('[data-bs-target="#journey-story-two"]');
        if (!firstStory || !secondChapter) {
            return;
        }

        firstStory.addEventListener('shown.bs.collapse', () => {
            const bottomSafeArea = 24;
            const secondChapterBottom = secondChapter.getBoundingClientRect().bottom;
            const visibleBottom = window.innerHeight - bottomSafeArea;
            if (secondChapterBottom <= visibleBottom) {
                return;
            }

            window.scrollBy({
                top: secondChapterBottom - visibleBottom,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            });
        });
    };

    /**
     * @returns {object}
     */
    const loaderLibs = () => {
        progress.add();

        /**
         * @param {{aos: boolean, confetti: boolean}} opt
         * @returns {void}
         */
        const load = (opt) => {
            loader(opt)
                .then(() => progress.complete('libs'))
                .catch(() => progress.invalid('libs'));
        };

        return {
            load,
        };
    };

    /**
     * @returns {Promise<void>}
     */
    const booting = async () => {
        animateSvg();
        countDownDate();
        showGuestName();
        buildCalendarLinks();
        journeyConfetti();
        coupleHeartInteraction();
        hiddenSideSpinInteraction();
        footerEasterEgg();
        guideClosingHeartEasterEgg();
        weddingDayShortcut();
        heroScrollIndicator();
        journeyAccordionReveal();
        confetti.prepareBasicAnimation();
        openingChime.prepare();
        coverTapInteraction();

        // Don't restore previous attendance — always start fresh at "Select"

        if (information.get('info')) {
            document.getElementById('information')?.remove();
        }

        // wait until welcome screen is show.
        await util.changeOpacity(document.getElementById('welcome'), true);

        // remove loading screen and show welcome screen.
        await util.changeOpacity(document.getElementById('loading'), false).then((el) => el.remove());
    };

    /**
     * @returns {void}
     */
    const pageLoaded = () => {
        lockMobileHeroViewport();
        lang.init();
        offline.init();
        rsvp.init();
        progress.init();

        config = storage('config');
        information = storage('information');

        const vid = video.init();
        const img = image.init();
        const aud = audio.init();
        const lib = loaderLibs();

        if (window.matchMedia('(min-width: 576px)').matches) {
            window.addEventListener('resize', util.debounce(slide));
        }
        document.addEventListener('undangan.progress.done', () => booting());
        document.addEventListener('hide.bs.modal', () => document.activeElement?.blur());
        // No backend token needed — load everything directly
        vid.load();
        img.load();
        aud.load();
        lib.load({
            aos: !window.matchMedia('(max-width: 767px)').matches,
            confetti: document.body.getAttribute('data-confetti') === 'true',
            additionalFont: false,
        });
    };

    /**
     * @returns {object}
     */
    const init = () => {
        theme.init();

        document.addEventListener('DOMContentLoaded', () => {
            pool.init(pageLoaded, [
                'image',
                'video',
                'libs',
            ]);
        });

        return {
            util,
            theme,
            rsvp,
            guest: {
                open,
                showStory,
                closeInformation,
            },
        };
    };

    return {
        init,
    };
})();
