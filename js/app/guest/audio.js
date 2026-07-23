export const audio = (() => {

    const statePlay = '<i class="fa-solid fa-circle-pause"></i>';
    const statePause = '<i class="fa-solid fa-circle-play"></i>';

    /**
     * @param {boolean} [playOnOpen=true]
     * @returns {Promise<void>}
     */
    const load = (playOnOpen = true) => {

        const url = document.body.getAttribute('data-audio');
        if (!url) {
            return;
        }

        const audioEl = new Audio();
        audioEl.loop = true;
        audioEl.muted = false;
        audioEl.autoplay = false;
        audioEl.controls = false;
        audioEl.preload = 'metadata';
        audioEl.src = url;

        let isPlay = false;
        let isPrimed = false;
        const music = document.getElementById('button-music');

        /**
         * @returns {Promise<void>}
         */
        const play = async () => {
            if (!navigator.onLine || !music) {
                return;
            }

            music.disabled = true;
            try {
                await audioEl.play();
                isPlay = true;
                music.disabled = false;
                music.innerHTML = statePlay;
            } catch (err) {
                isPlay = false;
                music.disabled = false;
                music.innerHTML = statePause;
                console.warn('Background music playback is waiting for another tap:', err);
            }
        };

        /**
         * @returns {void}
         */
        const pause = () => {
            isPlay = false;
            audioEl.pause();
            music.innerHTML = statePause;
        };

        document.addEventListener('undangan.open.prepare', () => {
            audioEl.preload = 'auto';
            audioEl.volume = 0;
            const primePromise = audioEl.play();
            if (primePromise) {
                primePromise
                    .then(() => {
                        isPrimed = true;
                    })
                    .catch(() => {
                        isPrimed = false;
                    });
            }
        });

        document.addEventListener('undangan.open', () => {
            music.classList.remove('d-none');

            if (playOnOpen) {
                audioEl.preload = 'auto';
                audioEl.currentTime = 0;
                audioEl.volume = 1;
                if (isPrimed && !audioEl.paused) {
                    isPlay = true;
                    music.innerHTML = statePlay;
                } else {
                    play();
                }
            }
        });

        music.addEventListener('offline', pause);
        music.addEventListener('click', () => isPlay ? pause() : play());

        // Auto-pause when user leaves the page (tab switch, minimize, lock phone)
        let wasPlaying = false;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && isPlay) {
                wasPlaying = true;
                pause();
            } else if (!document.hidden && wasPlaying) {
                wasPlaying = false;
                play();
            }
        });
    };

    /**
     * @returns {object}
     */
    const init = () => {
        return {
            load,
        };
    };

    return {
        init,
    };
})();
