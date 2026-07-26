/**
 * Aether Experience Engine
 * Services Registry
 *
 * Version: 0.21.0
 */

(function (window) {
        'use strict';

        if (window.AetherServices) {
                return;
        }

        if (!window.AetherEvents) {
                console.error(
                        '[Aether] Event Dispatcher is unavailable.'
                );
                return;
        }

        const services = new Map();

        const Services = {
                register(name, service) {
                        if (
                                typeof name !== 'string' ||
                                name.trim() === ''
                        ) {
                                throw new TypeError(
                                        '[Aether] A service must have a valid name.'
                                );
                        }

                        if (!service) {
                                throw new TypeError(
                                        '[Aether] A service must have a value.'
                                );
                        }

                        const serviceName = name.trim();

                        if (services.has(serviceName)) {
                                throw new Error(
                                        `[Aether] Service "${serviceName}" is already registered.`
                                );
                        }

                        services.set(serviceName, service);

                        console.log(
                                `[Aether] Service "${serviceName}" registered.`
                        );

                        window.AetherEvents.emit('service:registered', {
                                name: serviceName,
                                service,
                        });

                        return service;
                },

                get(name) {
                        return services.get(name) || null;
                },

                has(name) {
                        return services.has(name);
                },

                list() {
                        return Array.from(services.keys());
                },

                count() {
                        return services.size;
                },
        };

        window.AetherServices = Services;
})(window);
