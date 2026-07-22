export const successChime = (() => {
    const source = './assets/sfx/scroll-success.ogg';
    let audio = null;
    let played = false;

    /**
     * Preload and unlock the success sound during the invitation-opening gesture.
     * @returns {void}
     */
    const prepare = () => {
        if (audio) {
            return;
        }

        audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = 0;
        audio.load();

        audio.play()
            .then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0.72;
            })
            .catch(() => {
                audio.volume = 0.72;
            });
    };

    /**
     * Play the success sound once per page visit.
     * @returns {Promise<void>}
     */
    const play = async () => {
        if (!audio || played || document.hidden) {
            return;
        }

        played = true;
        audio.currentTime = 0;
        audio.volume = 0.72;
        try {
            await audio.play();
        } catch {
            played = false;
        }
    };

    return {
        prepare,
        play,
    };
})();
