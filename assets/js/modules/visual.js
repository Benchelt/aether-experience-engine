/**
 * Aether Visual Module
 *
 * Manages the shared rendering surface for Aether visual effects.
 *
 * Version: 0.21.0
 */

(function (window, document) {
    'use strict';

    if (
        !window.Aether ||
        !window.Aether.Modules ||
        !window.Aether.Events
    ) {
        console.error(
            '[Aether Visual] Runtime dependencies were not found.'
        );

        return;
    }

    const VisualModule = {
        name: 'visual',

        started: false,

        enabled: false,

        paused: false,

        canvas: null,

        context: null,

        subscriptions: [],

        resizeHandler: null,

        configuration: {},

        particles: [],

        particleConfiguration: {},

        animationFrame: null,

        lastFrameTime: 0,

        init() {
            this.resizeHandler = () => {
                this.resize();
            };

            this.subscriptions.push(
                window.Aether.Events.on(
                    'experience:loaded',
                    (experience) => {
                        if (
                            !experience ||
                            !experience.configuration
                        ) {
                            return;
                        }

                        this.applyExperience(
                            experience.configuration
                        );
                    }
                )
            );

            this.subscriptions.push(
                window.Aether.Events.on(
                    'experience:unloaded',
                    () => {
                        this.disable();
                    }
                )
            );

            this.subscriptions.push(
                window.Aether.Events.on(
                    'runtime:pause',
                    () => {
                        this.pause();
                    }
                )
            );

            this.subscriptions.push(
                window.Aether.Events.on(
                    'runtime:resume',
                    () => {
                        this.resume();
                    }
                )
            );

            console.log('[Aether Visual] Initialised.');
        },

        applyExperience(configuration) {
            const visualConfiguration =
                configuration &&
                typeof configuration.visual === 'object'
                    ? configuration.visual
                    : null;

            if (!visualConfiguration) {
                this.disable();

                console.log(
                    '[Aether Visual] Experience has no visual configuration.'
                );

                return;
            }

            this.configuration = {
                ...visualConfiguration
            };

            if (visualConfiguration.enabled === false) {
                this.disable();
                return;
            }

            this.enable();

            const particleConfiguration =
                visualConfiguration.particles &&
                typeof visualConfiguration.particles === 'object'
                    ? visualConfiguration.particles
                    : null;

            if (particleConfiguration) {
                this.configureParticles(
                    particleConfiguration
                );
            } else {
                this.stopAnimation();
                this.clearCanvas();
                this.particleConfiguration = {};
                this.particles = [];
            }

            window.Aether.Events.emit(
                'visual:configured',
                this.info()
            );

            console.log(
                '[Aether Visual] Experience configuration applied.',
                this.configuration
            );
        },

        createCanvas() {
            if (this.canvas) {
                return this.canvas;
            }

            const canvas = document.createElement('canvas');

            canvas.id = 'aether-visual-layer';
            canvas.className = 'aether-visual-layer';
            canvas.setAttribute('aria-hidden', 'true');

            document.body.appendChild(canvas);

            this.canvas = canvas;
            this.context = canvas.getContext('2d');

            this.resize();

            window.addEventListener(
                'resize',
                this.resizeHandler,
                { passive: true }
            );

            window.Aether.Events.emit(
                'visual:created',
                this.info()
            );

            console.log('[Aether Visual] Rendering surface created.');

            return canvas;
        },

        destroyCanvas() {
            window.removeEventListener(
                'resize',
                this.resizeHandler
            );

            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }

            this.canvas = null;
            this.context = null;

            window.Aether.Events.emit(
                'visual:destroyed',
                this.info()
            );

            console.log('[Aether Visual] Rendering surface destroyed.');
        },

        resize() {
            if (!this.canvas) {
                return;
            }

            const pixelRatio = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            const width = window.innerWidth;
            const height = window.innerHeight;

            this.canvas.width = Math.round(width * pixelRatio);
            this.canvas.height = Math.round(height * pixelRatio);

            this.canvas.style.width = `${width}px`;
            this.canvas.style.height = `${height}px`;

            if (this.context) {
                this.context.setTransform(
                    pixelRatio,
                    0,
                    0,
                    pixelRatio,
                    0,
                    0
                );
            }

            window.Aether.Events.emit(
                'visual:resized',
                {
                    width,
                    height,
                    pixelRatio
                }
            );
        },

        configureParticles(configuration = {}) {
            const count = Number(configuration.count);

            this.particleConfiguration = {
                enabled: configuration.enabled !== false,
                type: typeof configuration.type === 'string'
                    ? configuration.type
                    : 'dust',
                count: Number.isFinite(count)
                    ? Math.min(150, Math.max(0, Math.round(count)))
                    : 40,
                colour: typeof configuration.colour === 'string'
                    ? configuration.colour
                    : '198, 167, 94',
                minSize: Number.isFinite(Number(configuration.minSize))
                    ? Math.max(0.2, Number(configuration.minSize))
                    : 0.7,
                maxSize: Number.isFinite(Number(configuration.maxSize))
                    ? Math.max(0.3, Number(configuration.maxSize))
                    : 2.4,
                minSpeed: Number.isFinite(Number(configuration.minSpeed))
                    ? Math.max(0.01, Number(configuration.minSpeed))
                    : 0.08,
                maxSpeed: Number.isFinite(Number(configuration.maxSpeed))
                    ? Math.max(0.02, Number(configuration.maxSpeed))
                    : 0.28
            };

            if (
                this.particleConfiguration.maxSize <
                this.particleConfiguration.minSize
            ) {
                this.particleConfiguration.maxSize =
                    this.particleConfiguration.minSize;
            }

            if (
                this.particleConfiguration.maxSpeed <
                this.particleConfiguration.minSpeed
            ) {
                this.particleConfiguration.maxSpeed =
                    this.particleConfiguration.minSpeed;
            }

            this.createParticles();

            if (
                this.particleConfiguration.enabled &&
                this.enabled &&
                !this.paused
            ) {
                this.startAnimation();
            }

            window.Aether.Events.emit(
                'visual:particles:configured',
                this.particleInfo()
            );

            console.log(
                '[Aether Visual] Particle configuration applied.',
                this.particleConfiguration
            );

            return this.particleInfo();
        },

        createParticles() {
            this.particles = [];

            if (!this.particleConfiguration.enabled) {
                return;
            }

            for (
                let index = 0;
                index < this.particleConfiguration.count;
                index += 1
            ) {
                this.particles.push(
                    this.createParticle(true)
                );
            }
        },

        createParticle(randomiseVerticalPosition = false) {
            const width = window.innerWidth;
            const height = window.innerHeight;

            const minimumSize =
                this.particleConfiguration.minSize;
            const maximumSize =
                this.particleConfiguration.maxSize;

            const minimumSpeed =
                this.particleConfiguration.minSpeed;
            const maximumSpeed =
                this.particleConfiguration.maxSpeed;

            return {
                x: Math.random() * width,
                y: randomiseVerticalPosition
                    ? Math.random() * height
                    : height + 10,
                size:
                    minimumSize +
                    Math.random() * (maximumSize - minimumSize),
                speed:
                    minimumSpeed +
                    Math.random() * (maximumSpeed - minimumSpeed),
                drift: (Math.random() - 0.5) * 0.16,
                opacity: 0.08 + Math.random() * 0.35,
                phase: Math.random() * Math.PI * 2,
                phaseSpeed: 0.006 + Math.random() * 0.012
            };
        },

        resetParticle(particle) {
            const replacement = this.createParticle(false);

            Object.assign(particle, replacement);
        },

        startAnimation() {
            if (
                this.animationFrame !== null ||
                !this.context ||
                !this.enabled ||
                this.paused ||
                !this.particleConfiguration.enabled
            ) {
                return;
            }

            this.lastFrameTime = window.performance.now();

            this.animationFrame = window.requestAnimationFrame(
                (time) => {
                    this.animate(time);
                }
            );

            window.Aether.Events.emit(
                'visual:animation:started',
                this.particleInfo()
            );

            console.log('[Aether Visual] Particle animation started.');
        },

        stopAnimation() {
            if (this.animationFrame !== null) {
                window.cancelAnimationFrame(
                    this.animationFrame
                );

                this.animationFrame = null;
            }

            this.lastFrameTime = 0;
        },

        animate(time) {
            if (
                !this.enabled ||
                this.paused ||
                !this.context ||
                !this.particleConfiguration.enabled
            ) {
                this.animationFrame = null;
                return;
            }

            const elapsed = Math.min(
                32,
                Math.max(0, time - this.lastFrameTime)
            );

            this.lastFrameTime = time;

            this.clearCanvas();
            this.updateParticles(elapsed);
            this.drawParticles();

            this.animationFrame = window.requestAnimationFrame(
                (nextTime) => {
                    this.animate(nextTime);
                }
            );
        },

        clearCanvas() {
            if (!this.context || !this.canvas) {
                return;
            }

            this.context.clearRect(
                0,
                0,
                this.canvas.clientWidth,
                this.canvas.clientHeight
            );
        },

        updateParticles(elapsed) {
            const frameScale = elapsed / (1000 / 60);
            const height = window.innerHeight;
            const width = window.innerWidth;

            this.particles.forEach((particle) => {
                particle.y -= particle.speed * frameScale;
                particle.x += particle.drift * frameScale;
                particle.phase += particle.phaseSpeed * frameScale;

                if (
                    particle.y < -20 ||
                    particle.x < -20 ||
                    particle.x > width + 20
                ) {
                    this.resetParticle(particle);
                }

                if (particle.y > height + 20) {
                    this.resetParticle(particle);
                }
            });
        },

        drawParticles() {
            if (!this.context) {
                return;
            }

            const colour = this.particleConfiguration.colour;

            this.particles.forEach((particle) => {
                const shimmer =
                    0.72 +
                    Math.sin(particle.phase) * 0.28;

                const opacity =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            particle.opacity * shimmer
                        )
                    );

                this.context.beginPath();

                this.context.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );

                this.context.fillStyle =
                    `rgba(${colour}, ${opacity})`;

                this.context.fill();
            });
        },

        particleInfo() {
            return {
                enabled: Boolean(
                    this.particleConfiguration.enabled
                ),
                running: this.animationFrame !== null,
                count: this.particles.length,
                type:
                    this.particleConfiguration.type || null,
                configuration: {
                    ...this.particleConfiguration
                }
            };
        },

        enable() {
            if (!this.canvas) {
                this.createCanvas();
            }

            this.enabled = true;
            this.started = true;
            this.paused = false;

            if (this.canvas) {
                this.canvas.hidden = false;
            }

            window.Aether.Events.emit(
                'visual:enabled',
                this.info()
            );
        },

        disable() {
            this.stopAnimation();
            this.clearCanvas();

            this.enabled = false;
            this.started = false;
            this.paused = false;
            this.configuration = {};
            this.particleConfiguration = {};
            this.particles = [];

            this.destroyCanvas();

            window.Aether.Events.emit(
                'visual:disabled',
                this.info()
            );
        },

        pause() {
            if (!this.enabled || this.paused) {
                return;
            }

            this.paused = true;
            this.stopAnimation();

            window.Aether.Events.emit(
                'visual:paused',
                this.info()
            );

            console.log('[Aether Visual] Paused.');
        },

        resume() {
            if (!this.enabled || !this.paused) {
                return;
            }

            this.paused = false;
            this.startAnimation();

            window.Aether.Events.emit(
                'visual:resumed',
                this.info()
            );

            console.log('[Aether Visual] Resumed.');
        },

        start() {
            this.started = true;
        },

        stop() {
            this.disable();
        },

        isRunning() {
            return (
                this.started &&
                this.enabled &&
                !this.paused
            );
        },

        info() {
            return {
                enabled: this.enabled,
                running: this.isRunning(),
                paused: this.paused,
                canvas: Boolean(this.canvas),
                width: this.canvas
                    ? this.canvas.clientWidth
                    : 0,
                height: this.canvas
                    ? this.canvas.clientHeight
                    : 0,
                configuration: {
                    ...this.configuration
                },
                particles: this.particleInfo()
            };
        }
    };

    window.Aether.Modules.register(VisualModule);

})(window, document);
