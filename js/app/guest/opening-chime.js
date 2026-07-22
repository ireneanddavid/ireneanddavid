export const openingChime = (() => {
    const source = './assets/sfx/scroll-success.ogg';
    let audio = null;

    /** @returns {void} */
    const prepare = () => {
        if (audio) {
            return;
        }

        audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = 0.72;
        audio.load();
    };

    /** @returns {Promise<void>} */
    const play = () => {
        prepare();

        return new Promise((resolve) => {
            let settled = false;
            let fadeTimer = null;
            let fadeInterval = null;
            let stopTimer = null;
            const finish = () => {
                if (settled) {
                    return;
                }
                settled = true;
                window.clearTimeout(fadeTimer);
                window.clearInterval(fadeInterval);
                window.clearTimeout(stopTimer);
                audio.removeEventListener('ended', finish);
                audio.removeEventListener('error', finish);
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0.72;
                resolve();
            };
            fadeTimer = window.setTimeout(() => {
                let step = 0;
                fadeInterval = window.setInterval(() => {
                    step += 1;
                    audio.volume = 0.72 * Math.max(0, 1 - (step / 5));
                }, 30);
            }, 500);
            stopTimer = window.setTimeout(finish, 650);

            audio.addEventListener('ended', finish, { once: true });
            audio.addEventListener('error', finish, { once: true });
            audio.currentTime = 0;
            audio.volume = 0.72;

            const playPromise = audio.play();
            if (playPromise) {
                playPromise.catch(finish);
            }
        });
    };

    return {
        prepare,
        play,
    };
})();
