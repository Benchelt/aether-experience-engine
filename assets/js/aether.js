/**
 * Aether Experience Engine
 * Browser Runtime
 *
 * Version: 0.21.0
 */

(function (window) {
        'use strict';

        if (window.Aether) {
                return;
        }

        if (!window.AetherEvents) {
                console.error(
                        '[Aether] Event Dispatcher is unavailable.'
                );
                return;
        }

        const state = {
                started: false,
                paused: false,
        };

        const config = {
                platform: 'WordPress',
                debug: false,
        };

        const Config = {
                get(key, fallback = null) {
                        if (
                                typeof key !== 'string' ||
                                key.trim() === ''
                        ) {
                                return fallback;
                        }

                        const keys = key
                                .trim()
                                .split('.')
                                .filter(Boolean);

                        let value = config;

                        for (const part of keys) {
                                if (
                                        value === null ||
                                        typeof value !== 'object' ||
                                        !Object.prototype.hasOwnProperty.call(
                                                value,
                                                part
                                        )
                                ) {
                                        return fallback;
                                }

                                value = value[part];
                        }

                        return value;
                },

                has(key) {
                        const missing = Symbol('missing');

                        return this.get(key, missing) !== missing;
                },

                all() {
                        return structuredClone(config);
                },
        };

        const modules = new Map();
        const initializedModules = new WeakSet();
        const Services = window.AetherServices;
        const Experience = window.AetherExperience;
        const Layers = window.AetherLayers;

        const coreServices = {
                events: window.AetherEvents,
                experience: Experience,
                layers: Layers,
                config: Config,
        };

        Object.entries(coreServices).forEach(([name, service]) => {
                if (!Services.has(name)) {
                        Services.register(name, service);
                }
        });

        const Modules = {
                register(module) {
                        if (!module || typeof module !== 'object') {
                                throw new TypeError(
                                        '[Aether] A module must be an object.'
                                );
                        }

                        if (
                                typeof module.name !== 'string' ||
                                module.name.trim() === ''
                        ) {
                                throw new TypeError(
                                        '[Aether] A module must have a valid name.'
                                );
                        }

                        const name = module.name.trim();

                        if (modules.has(name)) {
                                throw new Error(
                                        `[Aether] Module "${name}" is already registered.`
                                );
                        }

                        modules.set(name, module);

                        try {
                                if (
                                        typeof module.init === 'function' &&
                                        !initializedModules.has(module)
                                ) {
                                        module.init();
                                        initializedModules.add(module);
                                }
                        } catch (error) {
                                modules.delete(name);

                                console.error(
                                        `[Aether] Module "${name}" failed to initialise.`,
                                        error
                                );

                                throw error;
                        }

                        console.log(
                                `[Aether] Module "${name}" registered.`
                        );

                        window.AetherEvents.emit('module:registered', {
                                name,
                                module,
                        });

                        return module;
                },

                get(name) {
                        return modules.get(name) || null;
                },

                has(name) {
                        return modules.has(name);
                },

                list() {
                        return Array.from(modules.keys());
                },

                count() {
                        return modules.size;
                },
        };

        const Aether = {
                version: '0.21.0',

                config,

                Config,

                Events: window.AetherEvents,

                Modules,

                Services,

                Experience,

                Layers,

                start() {
                        if (state.started) {
                                console.log('[Aether] Runtime already running.');
                                return;
                        }

                        state.started = true;
                        state.paused = false;

                        console.log('[Aether] Runtime started.');

                        this.Events.emit(
                                'runtime:start',
                                this.getState()
                        );
                },

                stop() {
                        if (!state.started) {
                                return;
                        }

                        state.started = false;
                        state.paused = false;

                        console.log('[Aether] Runtime stopped.');

                        this.Events.emit(
                                'runtime:stop',
                                this.getState()
                        );
                },

                pause() {
                        if (!state.started || state.paused) {
                                return;
                        }

                        state.paused = true;

                        console.log('[Aether] Runtime paused.');

                        this.Events.emit(
                                'runtime:pause',
                                this.getState()
                        );
                },

                resume() {
                        if (!state.started || !state.paused) {
                                return;
                        }

                        state.paused = false;

                        console.log('[Aether] Runtime resumed.');

                        this.Events.emit(
                                'runtime:resume',
                                this.getState()
                        );
                },

                isRunning() {
                        return state.started;
                },

                isPaused() {
                        return state.paused;
                },

                getState() {
                        return {
                                started: state.started,
                                paused: state.paused,
                        };
                },

                load(name, overrides = {}) {
                        return this.Experience.load(name, overrides);
                },

                unload() {
                        return this.Experience.unload();
                },

                reload() {
                        const current = this.currentExperience();

                        if (!current) {
                                console.warn(
                                        '[Aether] No active experience to reload.'
                                );

                                return null;
                        }

                        this.Experience.unload();

                        return this.Experience.load(
                                current.name,
                                current.configuration
                        );
                },

                modules() {
                        return this.Modules.list();
                },

                services() {
                        return this.Services.list();
                },

                events() {
                        return this.Events.list();
                },

                experiences() {
                        return this.Experience.list();
                },

                currentExperience() {
                        return this.Experience.current();
                },

                health() {
                        const runtimeState = this.getState();
                        const activeExperience = this.currentExperience();

                        return {
                                healthy: Boolean(
                                        this.Events &&
                                        this.Modules &&
                                        this.Services &&
                                        this.Experience
                                ),
                                runtime: runtimeState.started
                                        ? runtimeState.paused
                                                ? 'Paused'
                                                : 'Running'
                                        : 'Stopped',
                                modules: this.Modules.count(),
                                services: this.Services.count(),
                                eventListeners: this.Events.count(),
                                eventTypes: this.Events.list().length,
                                experiences: this.Experience.count(),
                                activeExperience: activeExperience
                                        ? activeExperience.name
                                        : null,
                        };
                },

                info() {
                        const runtimeState = state.started
                                ? state.paused
                                        ? 'Paused'
                                        : 'Running'
                                : 'Stopped';

                        const information = {
                                name: 'Aether Experience Engine',
                                version: this.version,
                                platform: this.config.platform,
                                runtime: runtimeState,
                                modules: this.Modules.count(),
                                services: this.Services.count(),
                                eventListeners: this.Events.count(),
                                scenes: 0,
                                atmospheres: 0,
                        };

                        console.table(information);

                        return information;
                },
        };

        window.Aether = Aether;

        Aether.start();
})(window);
