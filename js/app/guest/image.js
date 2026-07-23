import { progress } from './progress.js';
import { cache } from '../../connection/cache.js';

export const image = (() => {

    /**
     * @type {NodeListOf<HTMLImageElement>|null}
     */
    let images = null;

    /**
     * @type {ReturnType<typeof cache>|null}
     */
    let c = null;

    /**
     * @type {object[]}
     */
    const urlCache = [];

    /**
     * @param {string} src 
     * @returns {Promise<HTMLImageElement>}
     */
    const loadedImage = (src) => new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
    });

    /**
     * Decode an image before the loading screen is removed so scrolling never
     * has to perform the first decode on demand.
     * @param {HTMLImageElement} img
     * @returns {Promise<void>}
     */
    const decodeImage = async (img) => {
        if (typeof img.decode !== 'function') {
            return;
        }

        try {
            await img.decode();
        } catch {
            // Some Safari versions reject decode() for an otherwise valid image.
        }
    };

    /**
     * @param {HTMLImageElement} el 
     * @param {string} src 
     * @returns {Promise<void>}
     */
    const appendImage = async (el, src, trackProgress) => {
        const img = await loadedImage(src);
        await decodeImage(img);
        el.width = img.naturalWidth;
        el.height = img.naturalHeight;
        el.classList.remove('opacity-0');
        el.src = img.src;
        await decodeImage(el);
        img.remove();

        if (trackProgress) {
            progress.complete('image');
        }
    };

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByFetch = (el, trackProgress) => {
        urlCache.push({
            url: el.getAttribute('data-src'),
            res: (url) => appendImage(el, url, trackProgress).catch((err) => {
                console.error(err);
                if (trackProgress) {
                    progress.invalid('image');
                }
            }),
            rej: (err) => {
                console.error(err);
                if (trackProgress) {
                    progress.invalid('image');
                }
            },
        });
    };

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByDefault = (el, trackProgress) => {
        el.onerror = () => trackProgress && progress.invalid('image');
        const completeImage = async () => {
            el.width = el.naturalWidth;
            el.height = el.naturalHeight;
            await decodeImage(el);
            if (trackProgress) {
                progress.complete('image');
            }
        };
        el.onload = completeImage;

        if (el.complete && el.naturalWidth !== 0 && el.naturalHeight !== 0) {
            el.onload = null;
            completeImage();
        } else if (el.complete) {
            if (trackProgress) {
                progress.invalid('image');
            }
        }
    };

    /**
     * @returns {boolean}
     */
    const hasDataSrc = () => Array.from(images).some((i) => i.hasAttribute('data-src'));

    /**
     * @returns {Promise<void>}
     */
    const load = async () => {
        const imgs = Array.from(images);

        /**
         * @param {function} filter 
         * @returns {Promise<void>}
         */
        const runGroup = async (filter, trackProgress) => {
            urlCache.length = 0;
            imgs.filter(filter).forEach((el) => el.hasAttribute('data-src')
                ? getByFetch(el, trackProgress)
                : getByDefault(el, trackProgress));
            await c.run(urlCache, progress.getAbort());
        };

        await runGroup((el) => el.getAttribute('fetchpriority') === 'high', true);

        const loadDeferred = () => runGroup(
            (el) => el.getAttribute('fetchpriority') !== 'high',
            false,
        ).catch((err) => console.error('Deferred image loading failed:', err));

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadDeferred, { timeout: 1200 });
        } else {
            window.setTimeout(loadDeferred, 0);
        }
    };

    /**
     * @param {string} blobUrl 
     * @returns {void}
     */
    const download = (blobUrl) => {
        c.download(blobUrl, `${window.location.hostname}_image_${Date.now()}`);
    };

    /**
     * @returns {object}
     */
    const init = () => {
        c = cache('image').withForceCache();
        images = document.querySelectorAll('img');
        images.forEach((img) => {
            if (img.getAttribute('fetchpriority') === 'high') {
                progress.add();
            }
        });

        return {
            load,
            download,
            hasDataSrc,
        };
    };

    return {
        init,
    };
})();
