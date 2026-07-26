/**
 * Aether Experience Engine
 * Event Dispatcher
 *
 * Version: 0.21.0
 */

(function (window) {
        'use strict';

        if (window.AetherEvents) {
                return;
        }

        const listeners = new Map();

        const Events = {
                on(eventName, listener) {
                        if (
                                typeof eventName !== 'string' ||
                                eventName.trim() === ''
                        ) {
                                throw new TypeError(
                                        '[Aether] An event name must be a non-empty string.'
                                );
                        }

                        if (typeof listener !== 'function') {
                                throw new TypeError(
                                        '[Aether] An event listener must be a function.'
                                );
                        }

                        const name = eventName.trim();

                        if (!listeners.has(name)) {
                                listeners.set(name, new Set());
                        }

                        listeners.get(name).add(listener);

                        return function unsubscribe() {
                                Events.off(name, listener);
                        };
                },

                once(eventName, listener) {
                        if (typeof listener !== 'function') {
                                throw new TypeError(
                                        '[Aether] An event listener must be a function.'
                                );
                        }

                        const unsubscribe = Events.on(
                                eventName,
                                function onceListener(payload) {
                                        unsubscribe();
                                        listener(payload);
                                }
                        );

                        return unsubscribe;
                },

                off(eventName, listener) {
                        if (typeof eventName !== 'string') {
                                return false;
                        }

                        const name = eventName.trim();
                        const eventListeners = listeners.get(name);

                        if (!eventListeners) {
                                return false;
                        }

                        const removed = eventListeners.delete(listener);

                        if (eventListeners.size === 0) {
                                listeners.delete(name);
                        }

                        return removed;
                },

                emit(eventName, payload = null) {
                        if (
                                typeof eventName !== 'string' ||
                                eventName.trim() === ''
                        ) {
                                throw new TypeError(
                                        '[Aether] An event name must be a non-empty string.'
                                );
                        }

                        const name = eventName.trim();
                        const eventListeners = listeners.get(name);

                        if (!eventListeners) {
                                return 0;
                        }

                        let notified = 0;

                        Array.from(eventListeners).forEach(function (listener) {
                                try {
                                        listener(payload);
                                        notified += 1;
                                } catch (error) {
                                        console.error(
                                                `[Aether] Event listener failed for "${name}".`,
                                                error
                                        );
                                }
                        });

                        return notified;
                },

                count(eventName) {
                        if (typeof eventName === 'string') {
                                const eventListeners = listeners.get(
                                        eventName.trim()
                                );

                                return eventListeners
                                        ? eventListeners.size
                                        : 0;
                        }

                        let total = 0;

                        listeners.forEach(function (eventListeners) {
                                total += eventListeners.size;
                        });

                        return total;
                },

                list() {
                        return Array.from(listeners.keys());
                },
        };

        window.AetherEvents = Events;

        if (window.Aether) {
        window.Aether.Events = Events;
        }
})(window);