/**
 * Aether Experience Engine
 * Experience Manager
 *
 * Version: 0.21.0
 */

(function (window) {
    'use strict';

    if (window.AetherExperience) {
        return;
    }

    if (!window.AetherEvents) {
        console.error(
            '[Aether] Event Dispatcher is unavailable.'
        );
        return;
    }

    const experiences = new Map();
    let activeExperience = null;

    function validateName(name) {
        if (
            typeof name !== 'string' ||
            name.trim() === ''
        ) {
            throw new TypeError(
                '[Aether] An experience requires a valid name.'
            );
        }

        return name.trim();
    }

    function copy(value) {
        if (typeof structuredClone === 'function') {
            return structuredClone(value);
        }

        return JSON.parse(JSON.stringify(value));
    }

    const Experience = {
        register(name, definition) {
            const experienceName = validateName(name);

            if (
                !definition ||
                typeof definition !== 'object' ||
                Array.isArray(definition)
            ) {
                throw new TypeError(
                    '[Aether] An experience definition must be an object.'
                );
            }

            if (experiences.has(experienceName)) {
                throw new Error(
                    `[Aether] Experience "${experienceName}" is already registered.`
                );
            }

            const storedDefinition = copy(definition);

            experiences.set(
                experienceName,
                storedDefinition
            );

            window.AetherEvents.emit(
                'experience:registered',
                {
                    name: experienceName,
                    definition: copy(storedDefinition)
                }
            );

            console.log(
                `[Aether] Experience "${experienceName}" registered.`
            );

            return copy(storedDefinition);
        },

        get(name) {
            const definition = experiences.get(
                validateName(name)
            );

            return definition ? copy(definition) : null;
        },

        has(name) {
            return experiences.has(validateName(name));
        },

        list() {
            return Array.from(experiences.keys());
        },

        count() {
            return experiences.size;
        },

        load(name, overrides = {}) {
            const experienceName = validateName(name);

            if (!experiences.has(experienceName)) {
                throw new Error(
                    `[Aether] Experience "${experienceName}" is not registered.`
                );
            }

            const definition = {
                ...copy(experiences.get(experienceName)),
                ...copy(overrides)
            };

            activeExperience = {
                name: experienceName,
                metadata: definition.metadata || {
                    name: experienceName
                },
                capabilities: definition.capabilities || {},
                configuration: definition.configuration || definition
            };

            window.AetherEvents.emit(
                'experience:loaded',
                copy(activeExperience)
            );

            console.log(
                `[Aether] Experience "${experienceName}" loaded.`
            );

            return this.current();
        },

        unload() {
            if (!activeExperience) {
                return null;
            }

            const unloaded = copy(activeExperience);

            activeExperience = null;

            window.AetherEvents.emit(
                'experience:unloaded',
                unloaded
            );

            console.log(
                `[Aether] Experience "${unloaded.name}" unloaded.`
            );

            return unloaded;
        },

        current() {
            return activeExperience
                ? copy(activeExperience)
                : null;
        },

        currentName() {
            return activeExperience
                ? activeExperience.name
                : null;
        }
    };

    window.AetherExperience = Experience;

})(window);
