/**
 * Aether Audio Module
 *
 * Version: 0.21.0
 */

(function (window) {
    'use strict';

    if (!window.Aether) {
        return;
    }

    const player = new Audio();

    let fadeTimer = null;

    const AudioModule = {

        name: 'audio',

        started: false,

        targetVolume: 0.4,

        fadeDuration: 2000,

        subscriptions: [],

        init() {
            player.src = '/wp-content/plugins/alchemy-aether-engine/assets/audio/om-so-hum-15min.mp3';
            player.preload = 'auto';
            player.loop = true;
            player.volume = 0;

            this.subscriptions.push(
                window.Aether.Events.on('ambience:on', () => {
                    this.play();
                })
            );

            this.subscriptions.push(
                window.Aether.Events.on('ambience:off', () => {
                    this.pause();
                })
            );

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

            console.log('[Aether Audio] Initialised.');
        },

        applyExperience(configuration) {
            const audioConfiguration =
                configuration &&
                typeof configuration.audio === 'object'
                    ? configuration.audio
                    : null;

            if (!audioConfiguration) {
                console.log(
                    '[Aether Audio] Experience has no audio configuration.'
                );
                return;
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    audioConfiguration,
                    'volume'
                )
            ) {
                this.setVolume(audioConfiguration.volume);
            }

            if (audioConfiguration.enabled === false) {
                this.pause();
            }

            window.Aether.Events.emit(
                'audio:configured',
                {
                    enabled: audioConfiguration.enabled !== false,
                    volume: this.targetVolume
                }
            );

            console.log(
                '[Aether Audio] Experience configuration applied.',
                {
                    enabled: audioConfiguration.enabled !== false,
                    volume: this.targetVolume
                }
            );
        },

        clearFade() {
            if (fadeTimer !== null) {
                window.clearInterval(fadeTimer);
                fadeTimer = null;
            }
        },

        fadeTo(targetVolume, duration = this.fadeDuration, onComplete) {
            this.clearFade();

            const parsedTarget = Number(targetVolume);
            const parsedDuration = Number(duration);

            const safeTarget = Number.isFinite(parsedTarget)
                ? Math.min(1, Math.max(0, parsedTarget))
                : 0;

            const safeDuration = Number.isFinite(parsedDuration)
                ? Math.max(0, parsedDuration)
                : this.fadeDuration;

            const startVolume = player.volume;

            if (safeDuration === 0 || startVolume === safeTarget) {
                player.volume = safeTarget;

                if (typeof onComplete === 'function') {
                    onComplete();
                }

                return;
            }

            const interval = 50;
            const steps = Math.max(
                1,
                Math.ceil(safeDuration / interval)
            );

            const volumeChange =
                (safeTarget - startVolume) / steps;

            let currentStep = 0;

            fadeTimer = window.setInterval(() => {
                currentStep += 1;

                const nextVolume =
                    startVolume + (volumeChange * currentStep);

                player.volume = Math.min(
                    1,
                    Math.max(0, nextVolume)
                );

                if (currentStep >= steps) {
                    this.clearFade();
                    player.volume = safeTarget;

                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }
            }, interval);
        },

        play() {
            this.clearFade();

            if (!player.paused && this.started) {
                this.fadeTo(this.targetVolume);
                return Promise.resolve();
            }

            player.volume = 0;

            return player.play()
                .then(() => {
                    this.started = true;

                    this.fadeTo(
                        this.targetVolume,
                        this.fadeDuration,
                        () => {
                            console.log(
                                '[Aether Audio] Fade-in complete.'
                            );
                        }
                    );

                    window.Aether.Events.emit(
                        'audio:play',
                        this.info()
                    );

                    console.log('[Aether Audio] Playing.');
                })
                .catch((error) => {
                    this.started = false;

                    window.Aether.Events.emit(
                        'audio:error',
                        {
                            action: 'play',
                            error
                        }
                    );

                    console.error(
                        '[Aether Audio] Playback failed:',
                        error
                    );
                });
        },

        pause() {
            if (player.paused) {
                this.clearFade();
                player.volume = 0;
                this.started = false;
                return;
            }

            this.fadeTo(
                0,
                this.fadeDuration,
                () => {
                    player.pause();
                    this.started = false;

                    window.Aether.Events.emit(
                        'audio:pause',
                        this.info()
                    );

                    console.log('[Aether Audio] Paused.');
                }
            );

            console.log('[Aether Audio] Fading out.');
        },

        stop() {
            this.clearFade();

            player.pause();
            player.currentTime = 0;
            player.volume = 0;
            this.started = false;

            window.Aether.Events.emit(
                'audio:stop',
                this.info()
            );

            console.log('[Aether Audio] Stopped.');
        },

        setVolume(volume) {
            const parsedVolume = Number(volume);

            if (!Number.isFinite(parsedVolume)) {
                throw new TypeError(
                    '[Aether Audio] Volume must be a number.'
                );
            }

            const safeVolume = Math.min(
                1,
                Math.max(0, parsedVolume)
            );

            this.targetVolume = safeVolume;

            if (this.started && !player.paused) {
                this.fadeTo(
                    safeVolume,
                    Math.min(400, this.fadeDuration)
                );
            }

            window.Aether.Events.emit(
                'audio:volume',
                {
                    volume: safeVolume
                }
            );
        },

        isPlaying() {
            return this.started && !player.paused;
        },

        info() {
            return {
                name: this.name,
                playing: this.isPlaying(),
                volume: player.volume,
                targetVolume: this.targetVolume,
                fadeDuration: this.fadeDuration,
                source: player.src
            };
        }

    };

    window.Aether.Modules.register(AudioModule);

})(window);
