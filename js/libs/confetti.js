const zIndex = 1057;

/**
 * @returns {any}
 */
const heartShape = () => {
    return window.confetti.shapeFromPath({
        path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
        matrix: [0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666, -5.533333333333333]
    });
};

/**
 * @returns {void}
 */
export const basicAnimation = () => {
    if (window.confetti) {
        window.confetti({
            origin: { y: 1 },
            zIndex: zIndex
        });
    }
};

/**
 * @param {number} [until=15]
 * @returns {void}
 */
export const openAnimation = (until = 15) => {
    if (!window.confetti) {
        return;
    }

    const duration = until * 1000;
    const animationEnd = Date.now() + duration;

    const heart = heartShape();
    const colors = ['#FFC0CB', '#C71585'];

    const randomInRange = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    const frame = () => {
        const timeLeft = animationEnd - Date.now();

        colors.forEach((color) => {
            const fromLeft = Math.random() < 0.5;
            window.confetti({
                particleCount: 1,
                startVelocity: 0,
                ticks: Math.max(50, 75 * (timeLeft / duration)),
                origin: {
                    x: fromLeft ? randomInRange(0, 0.22) : randomInRange(0.78, 1),
                    y: Math.abs(Math.random() - (timeLeft / duration)),
                },
                zIndex: zIndex,
                colors: [color],
                shapes: [heart],
                drift: randomInRange(-0.5, 0.5),
                gravity: randomInRange(0.35, 0.7),
                scalar: randomInRange(0.45, 0.8),
            });
        });

        if (timeLeft > 0) {
            requestAnimationFrame(frame);
        }
    };

    requestAnimationFrame(frame);
};

/**
 * @param {HTMLElement} div
 * @param {number} [duration=50]
 * @returns {void}
 */
export const tapTapAnimation = (div, duration = 50) => {
    if (!window.confetti) {
        return;
    }

    const end = Date.now() + duration;
    const domRec = div.getBoundingClientRect();
    const yPosition = Math.max(0.3, Math.min(1, (domRec.top / window.innerHeight) + 0.2));

    const heart = heartShape();
    const colors = ['#FF69B4', '#FF1493'];

    const frame = () => {
        colors.forEach((color) => {
            window.confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                shapes: [heart],
                origin: { x: domRec.left / window.innerWidth, y: yPosition },
                zIndex: zIndex,
                colors: [color]
            });
            window.confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                shapes: [heart],
                origin: { x: domRec.right / window.innerWidth, y: yPosition },
                zIndex: zIndex,
                colors: [color]
            });
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };

    requestAnimationFrame(frame);
};

/**
 * @param {HTMLElement} element
 * @param {'left'|'right'} sourceSide
 * @returns {void}
 */
export const journeyGoldAnimation = (element, sourceSide = 'right') => {
    if (!window.confetti) {
        return;
    }

    const rect = element.getBoundingClientRect();
    const fromRight = sourceSide === 'right';
    window.confetti({
        particleCount: 20,
        angle: fromRight ? 135 : 45,
        spread: 54,
        startVelocity: 21,
        ticks: 58,
        gravity: 0.76,
        scalar: 0.62,
        origin: {
            x: Math.max(0.08, Math.min(0.92, (fromRight ? rect.right - 12 : rect.left + 12) / window.innerWidth)),
            y: Math.max(0.12, Math.min(0.9, (rect.bottom - 10) / window.innerHeight)),
        },
        zIndex: zIndex,
        colors: ['#b8976a', '#d6bd91', '#eadfc9', '#9f7b4d'],
    });
};

/**
 * A restrained shower for the RSVP confirmation card.
 * @returns {void}
 */
export const rsvpPetalAnimation = () => {
    if (!window.confetti) {
        return;
    }

    const petal = window.confetti.shapeFromPath({
        path: 'M10 0 C16 4 18 12 10 20 C2 12 4 4 10 0 Z',
        matrix: [0.5, 0, 0, 0.5, -5, -5],
    });

    window.confetti({
        particleCount: 7,
        angle: 270,
        spread: 42,
        startVelocity: 5,
        ticks: 48,
        gravity: 0.38,
        drift: 0.08,
        scalar: 0.52,
        origin: { x: 0.5, y: 0.04 },
        zIndex: zIndex,
        shapes: [petal],
        colors: ['#b8976a', '#d6bd91', '#eadfc9'],
        disableForReducedMotion: true,
    });
};

/**
 * @param {HTMLElement} element
 * @returns {void}
 */
export const loveSparkleAnimation = (element) => {
    if (!window.confetti) {
        return;
    }

    const rect = element.getBoundingClientRect();
    window.confetti({
        particleCount: 14,
        spread: 68,
        startVelocity: 18,
        ticks: 55,
        gravity: 0.65,
        scalar: 0.62,
        shapes: ['star'],
        origin: {
            x: (rect.left + (rect.width / 2)) / window.innerWidth,
            y: (rect.top + (rect.height / 2)) / window.innerHeight,
        },
        zIndex: zIndex,
        colors: ['#b8976a', '#d6bd91', '#f1e8d5', '#9f7b4d'],
    });
};
