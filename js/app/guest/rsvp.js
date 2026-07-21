import { util } from '../../common/util.js';
import { lang } from '../../common/language.js';
import { storage } from '../../common/storage.js';
import { bs } from '../../libs/bootstrap.js';
import * as confetti from '../../libs/confetti.js';

export const rsvp = (() => {

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let information = null;

    /**
     * @type {string}
     */
    let APPS_SCRIPT_URL = '';

    /**
     * @type {string}
     */
    let RECAPTCHA_SITE_KEY = '';

    const validationTimers = new WeakMap();

    /**
     * @param {HTMLElement} field
     * @returns {void}
     */
    const clearFieldError = (field) => {
        if (!field) {
            return;
        }

        window.clearTimeout(validationTimers.get(field));
        validationTimers.delete(field);
        field.classList.remove('is-validation-error');
        field.removeAttribute('aria-invalid');
        field.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
        field.querySelector('.rsvp-inline-error')?.remove();
    };

    /**
     * @param {HTMLElement} field
     * @param {HTMLElement|null} control
     * @param {string} message
     * @param {HTMLElement|null} anchor
     * @returns {void}
     */
    const showFieldError = (field, control, message, anchor = null) => {
        clearFieldError(field);

        const error = document.createElement('p');
        error.className = 'rsvp-inline-error';
        error.setAttribute('role', 'status');
        error.textContent = `⚠ ${message}`;

        if (anchor) {
            anchor.insertAdjacentElement('afterend', error);
        } else {
            field.append(error);
        }

        field.classList.remove('is-validation-error');
        void field.offsetWidth;
        field.classList.add('is-validation-error');
        field.setAttribute('aria-invalid', 'true');
        control?.setAttribute('aria-invalid', 'true');

        if (control && typeof control.focus === 'function') {
            control.focus({ preventScroll: true });
        }
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const timer = window.setTimeout(() => {
            error.classList.add('is-hiding');
            window.setTimeout(() => clearFieldError(field), 240);
        }, 2600);
        validationTimers.set(field, timer);
    };

    /**
     * @param {string} type
     * @param {string} msg
     * @returns {string}
     */
    const alertMarkup = (type, msg) => {
        return `<div class="alert fade show rsvp-feedback rsvp-feedback-${util.escapeHtml(type)} mb-0 mt-2" role="alert"><div class="rsvp-feedback-copy">${msg}</div><button type="button" class="rsvp-feedback-close" aria-label="Close notification">×</button></div>`;
    };

    /**
     * @param {HTMLButtonElement} button
     * @returns {Promise<void>}
     */
    const send = async (button) => {
        const name = document.getElementById('form-name');
        const presence = document.getElementById('form-presence');
        const attendanceOptions = Array.from(document.querySelectorAll('input[name="attendance-choice"]'));
        const partyOptions = Array.from(document.querySelectorAll('input[name="party-size-choice"]'));
        const invitationOptions = Array.from(document.querySelectorAll('input[name="paper-choice"]'));
        const guestCount = document.getElementById('form-guest-count');
        const invitationType = document.getElementById('form-invitation-type');
        const email = document.getElementById('form-email');
        const address = document.getElementById('form-address');
        const isAttending = presence && presence.value === 'attending';
        const message = document.getElementById('form-message');
        const honeypot = document.getElementById('form-website');
        const alertWrapper = document.getElementById('rsvp-alert');

        // Check if already submitted on this device
        if (information.get('submitted')) {
            const updateMsg = 'You have already submitted your RSVP. Would you like to update your response?\n\n您已經回覆過了，確定要更新您的回覆嗎？';
            if (!window.confirm(updateMsg)) {
                return;
            }
        }

        // Honeypot check — bots fill hidden fields
        if (honeypot && honeypot.value.length > 0) {
            alertWrapper.innerHTML = alertMarkup('success', lang
                .on('zh-tw', '<strong>謝謝！</strong> 已收到您的回覆。')
                .on('en', '<strong>Thank you!</strong> Your RSVP has been received.')
                .get());
            return;
        }

        if (!name.value || name.value.trim().length === 0) {
            showFieldError(document.querySelector('.rsvp-name-field'), name, '請填寫姓名');
            return;
        }

        if (!presence || !presence.value) {
            const attendanceField = document.getElementById('attendance-field');
            showFieldError(attendanceField, attendanceField.querySelector('input[type="radio"]'), '請選擇是否出席');
            return;
        }

        if (isAttending && (!guestCount || !guestCount.value)) {
            const partyField = document.getElementById('party-size-field');
            showFieldError(partyField, partyField.querySelector('input[type="radio"]'), '請選擇同行人數');
            return;
        }

        // Check address if paper invitation requested
        if (isAttending && invitationType) {
            const v = invitationType.value;
            if (v === 'yes-paper' && address && !address.value.trim()) {
                showFieldError(document.getElementById('field-address'), address, '請填寫收件地址', address);
                return;
            }
        }

        // Disable form
        const btn = util.disableButton(button, 'Sending... 送出中...', true);
        [name, presence, ...attendanceOptions, guestCount, ...partyOptions, invitationType, ...invitationOptions, email, address, message].forEach((el) => {
            if (el) {
                el.disabled = true;
            }
        });

        try {
            // Get reCAPTCHA token if available
            let recaptchaToken = '';
            if (RECAPTCHA_SITE_KEY && window.grecaptcha) {
                recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'rsvp' });
            }

            const body = new URLSearchParams({
                name: name.value.trim(),
                attendance: isAttending ? 'yes' : 'no',
                guest_count: isAttending && guestCount ? guestCount.value : '1',
                invitation_type: isAttending && invitationType ? invitationType.value : '',
                email: isAttending && email ? email.value.trim() : '',
                address: isAttending && address ? address.value.trim() : '',
                message: message ? message.value.trim() : '',
                recaptcha_token: recaptchaToken,
            });

            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });

            const result = await response.json();

            if (result.result === 'error') {
                alertWrapper.innerHTML = alertMarkup('danger', `<strong>${lang.on('zh-tw', '抱歉！').on('en', 'Sorry!').get()}</strong> ${util.escapeHtml(result.message)}`);
            } else {
                alertWrapper.innerHTML = '';
                information.set('name', name.value.trim());
                information.set('presence', isAttending);
                information.set('submitted', true);

                // Toggle modal content based on attendance
                document.getElementById('modal-attending').classList.toggle('d-none', !isAttending);
                document.getElementById('modal-declined').classList.toggle('d-none', isAttending);

                bs.modal('rsvp-success-modal').show();
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    window.setTimeout(() => confetti.rsvpPetalAnimation(), 100);
                }
            }
        } catch {
            alertWrapper.innerHTML = alertMarkup('danger', lang
                .on('zh-tw', '<strong>抱歉！</strong> 提交時發生錯誤，請稍後再試。')
                .on('en', '<strong>Sorry!</strong> Something went wrong. Please try again later.')
                .get());
        }

        // Re-enable form
        btn.restore();
        [name, presence, ...attendanceOptions, guestCount, ...partyOptions, invitationType, ...invitationOptions, email, address, message].forEach((el) => {
            if (el) {
                el.disabled = false;
            }
        });
    };

    /**
     * @returns {void}
     */
    const init = () => {
        information = storage('information');
        APPS_SCRIPT_URL = document.body.getAttribute('data-rsvp-url') || '';
        RECAPTCHA_SITE_KEY = document.body.getAttribute('data-recaptcha-key') || '';

        document.getElementById('rsvp-alert')?.addEventListener('click', (event) => {
            const closeButton = event.target.closest('.rsvp-feedback-close');
            if (!closeButton) {
                return;
            }

            closeButton.closest('.rsvp-feedback')?.remove();
        });

        document.getElementById('form-name')?.addEventListener('input', () => clearFieldError(document.querySelector('.rsvp-name-field')));
        document.querySelectorAll('input[name="attendance-choice"]').forEach((option) => {
            option.addEventListener('change', () => clearFieldError(document.getElementById('attendance-field')));
        });
        document.querySelectorAll('input[name="party-size-choice"]').forEach((option) => {
            option.addEventListener('change', () => clearFieldError(document.getElementById('party-size-field')));
        });
        document.getElementById('form-address')?.addEventListener('input', () => clearFieldError(document.getElementById('field-address')));
    };

    return {
        init,
        send,
    };
})();
