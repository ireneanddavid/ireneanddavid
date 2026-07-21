export const progress = (() => {

    /**
     * @type {HTMLElement|null}
     */
    let info = null;

    /**
     * @type {HTMLElement|null}
     */
    let bar = null;
    let loadingCopy = null;
    let loadingCopyZh = null;
    let loadingCopyEn = null;

    const loadingMessages = [
        { zh: '正在展開邀請函…', en: 'Preparing your invitation...' },
        { zh: '正在準備婚禮資訊…', en: 'Folding the invitation...' },
        { zh: '正在翻開我們的故事…', en: 'Adding a little sparkle...' },
        { zh: '請稍候片刻…', en: 'One moment, please. ✨' },
    ];

    let total = 0;
    let loaded = 0;
    let valid = true;

    /**
     * @type {Promise<void>|null}
     */
    let cancelProgress = null;

    /**
     * @returns {void}
     */
    const add = () => {
        total += 1;
    };

    /**
     * @returns {string}
     */
    const showInformation = () => {
        return `(${loaded}/${total}) [${parseInt((loaded / total) * 100).toFixed(0)}%]`;
    };

    /**
     * @returns {void}
     */
    const selectLoadingCopy = () => {
        if (!loadingCopy || !loadingCopyZh || !loadingCopyEn) {
            return;
        }

        const message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

        loadingCopyZh.textContent = message.zh;
        loadingCopyEn.textContent = message.en;
        loadingCopy.classList.add('is-ready');
    };

    /**
     * @param {string} type
     * @param {boolean} [skip=false]
     * @returns {void}
     */
    const complete = (type, skip = false) => {
        if (!valid) {
            return;
        }

        loaded += 1;
        info.innerText = `Loading ${type} ${skip ? 'skipped' : 'complete'} ${showInformation()}`;
        bar.style.width = Math.min((loaded / total) * 100, 100).toString() + '%';

        if (loaded === total) {
            valid = false;
            cancelProgress = null;
            document.dispatchEvent(new Event('undangan.progress.done'));
        }
    };

    /**
     * @param {string} type
     * @returns {void}
     */
    const invalid = (type) => {
        if (valid) {
            valid = false;
            bar.style.backgroundColor = 'red';
            info.innerText = `Error loading ${type} ${showInformation()}`;
            info.classList.remove('visually-hidden');
            document.dispatchEvent(new Event('undangan.progress.invalid'));
        }
    };

    /**
     * @returns {Promise<void>|null}
     */
    const getAbort = () => cancelProgress;

    /**
     * @returns {void}
     */
    const init = () => {
        info = document.getElementById('progress-info');
        bar = document.getElementById('progress-bar');
        loadingCopy = document.getElementById('loading-copy');
        loadingCopyZh = document.getElementById('loading-copy-zh');
        loadingCopyEn = document.getElementById('loading-copy-en');
        info.classList.remove('d-none');
        selectLoadingCopy();
        cancelProgress = new Promise((res) => document.addEventListener('undangan.progress.invalid', res));
    };

    return {
        init,
        add,
        invalid,
        complete,
        getAbort,
    };
})();
