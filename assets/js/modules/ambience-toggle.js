/**
 * Aether Ambience Toggle
 *
 * Version: 0.21.0
 */

(function (window, document) {
    'use strict';

    if (!window.Aether) {
        return;
    }

    const STORAGE_KEY = 'aether.ambience';

    const ToggleModule = {

        name: 'ambience-toggle',

        started: false,

        element: null,

        enabled: false,

        resumeHandlersBound: false,

        observer: null,

        clickHandler: null,

        init() {
            this.render();
            this.restorePreference();
            this.bindEvents();
            this.observeEmbeddedControl();
            this.started = true;

            console.log('[Aether UI] Ambience Toggle ready.');
        },

        render() {
            const existingControl = document.querySelector(
                '.aether-ambience-control'
            );

            if (existingControl) {
                this.element = existingControl;
                return;
            }

            const control = document.createElement('button');

            control.type = 'button';
            control.className =
                'aether-ambience-control ' +
                'aether-ambience-control--fallback';
            control.setAttribute('aria-pressed', 'false');
            control.setAttribute(
                'aria-label',
                'Ambient sound: Off'
            );

            control.innerHTML = `
                <span class="aether-ambience-label">Ambience</span>
                <span class="aether-ambience-switch" aria-hidden="true">
                    <span class="aether-ambience-knob"></span>
                </span>
                <span class="aether-ambience-status">Off</span>
            `;

            document.body.appendChild(control);

            this.element = control;
        },

        bindEvents() {
            if (!this.element) {
                return;
            }

            if (!this.clickHandler) {
                this.clickHandler = () => {
                    this.toggle();
                };
            }

            this.element.addEventListener(
                'click',
                this.clickHandler
            );

            window.Aether.Events.on('audio:error', () => {
                if (!this.enabled) {
                    return;
                }

                this.bindResumeHandlers();
            });

            if (this.enabled) {
                this.bindResumeHandlers();
            }
        },


        observeEmbeddedControl() {
            if (
                this.element &&
                this.element.classList.contains(
                    'aether-ambience-control--embedded'
                )
            ) {
                return;
            }

            if (!document.body || this.observer) {
                return;
            }

            this.observer = new MutationObserver(() => {
                const embeddedControl = document.querySelector(
                    '.aether-ambience-control--embedded'
                );

                if (!embeddedControl) {
                    return;
                }

                this.adoptControl(embeddedControl);
            });

            this.observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true
                }
            );
        },

        adoptControl(control) {
            if (!control || control === this.element) {
                return;
            }

            const previousControl = this.element;

            if (previousControl && this.clickHandler) {
                previousControl.removeEventListener(
                    'click',
                    this.clickHandler
                );
            }

            this.element = control;

            if (this.clickHandler) {
                this.element.addEventListener(
                    'click',
                    this.clickHandler
                );
            }

            this.updateDisplay();

            if (
                previousControl &&
                previousControl.classList.contains(
                    'aether-ambience-control--fallback'
                )
            ) {
                previousControl.remove();
            }

            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }

            console.log(
                '[Aether UI] Embedded ambience control adopted.'
            );
        },

        bindResumeHandlers() {
            if (this.resumeHandlersBound) {
                return;
            }

            this.resumeHandlersBound = true;

            const resumeAmbience = () => {
                this.removeResumeHandlers(resumeAmbience);

                if (this.enabled) {
                    window.Aether.Events.emit(
                        'ambience:on',
                        {
                            source: 'user-interaction',
                            restored: true
                        }
                    );
                }
            };

            document.addEventListener(
                'click',
                resumeAmbience,
                { once: true }
            );

            document.addEventListener(
                'keydown',
                resumeAmbience,
                { once: true }
            );

            document.addEventListener(
                'touchstart',
                resumeAmbience,
                { once: true }
            );
        },

        removeResumeHandlers(handler) {
            document.removeEventListener(
                'click',
                handler
            );

            document.removeEventListener(
                'keydown',
                handler
            );

            document.removeEventListener(
                'touchstart',
                handler
            );

            this.resumeHandlersBound = false;
        },

        restorePreference() {
            let savedPreference = null;

            try {
                savedPreference = window.localStorage.getItem(
                    STORAGE_KEY
                );
            } catch (error) {
                console.warn(
                    '[Aether UI] Could not read ambience preference.',
                    error
                );
            }

            this.setEnabled(
                savedPreference === 'on',
                false,
                false
            );
        },

        toggle() {
            this.setEnabled(!this.enabled);
        },

        setEnabled(
            enabled,
            savePreference = true,
            emitEvent = true
        ) {
            if (!this.element) {
                return;
            }

            this.enabled = Boolean(enabled);

            if (savePreference) {
                try {
                    window.localStorage.setItem(
                        STORAGE_KEY,
                        this.enabled ? 'on' : 'off'
                    );
                } catch (error) {
                    console.warn(
                        '[Aether UI] Could not save ambience preference.',
                        error
                    );
                }
            }

            this.updateDisplay();

            if (!emitEvent) {
                return;
            }

            window.Aether.Events.emit(
                this.enabled
                    ? 'ambience:on'
                    : 'ambience:off',
                {
                    enabled: this.enabled,
                    source: 'ambience-toggle'
                }
            );
        },

        updateDisplay() {
            const status = this.element.querySelector(
                '.aether-ambience-status'
            );

            this.element.classList.toggle(
                'is-active',
                this.enabled
            );

            this.element.setAttribute(
                'aria-pressed',
                String(this.enabled)
            );

            this.element.setAttribute(
                'aria-label',
                this.enabled
                    ? 'Ambient sound: Playing'
                    : 'Ambient sound: Off'
            );

            if (status) {
                status.textContent =
                    this.enabled ? 'On' : 'Off';
            }
        },

        isEnabled() {
            return this.enabled;
        }

    };

    window.Aether.Modules.register(ToggleModule);

})(window, document);
