/**
 * Aether Boot Coordinator
 *
 * Announces runtime readiness after the required modules have loaded
 * and activates the default experience.
 *
 * Version: 0.21.0
 */

(function (window, document) {
    'use strict';

    if (
        !window.Aether ||
        !window.Aether.Events ||
        !window.Aether.Experience
    ) {
        console.error(
            '[Aether Boot] Runtime dependencies were not found.'
        );

        return;
    }

    let booted = false;

    function boot() {
        if (booted) {
            return;
        }

        booted = true;

        const readiness = {
            version: window.Aether.version,
            modules: window.Aether.Modules.list(),
            services: window.Aether.Services.list(),
            experiences: window.Aether.Experience.list()
        };

        window.Aether.Events.emit(
            'runtime:ready',
            readiness
        );

        console.log(
            '[Aether] Runtime ready.',
            readiness
        );

        if (window.Aether.currentExperience()) {
            console.log(
                '[Aether Boot] An experience is already active.'
            );

            return;
        }

        const runtimeSettings =
            window.AetherRuntimeSettings &&
            typeof window.AetherRuntimeSettings === 'object'
                ? window.AetherRuntimeSettings
                : {};

        const configuredDefault =
            typeof runtimeSettings.defaultExperience === 'string'
                ? runtimeSettings.defaultExperience.trim()
                : '';

        const registeredExperiences =
            window.Aether.Experience.list();

        let defaultExperience =
            configuredDefault || 'Temple';

        if (!window.Aether.Experience.has(defaultExperience)) {
            const fallbackExperience =
                window.Aether.Experience.has('Temple')
                    ? 'Temple'
                    : registeredExperiences[0] || null;

            console.warn(
                `[Aether Boot] Configured default experience "${defaultExperience}" was not registered.`,
                {
                    fallback: fallbackExperience
                }
            );

            if (!fallbackExperience) {
                console.warn(
                    '[Aether Boot] No registered experience is available to activate.'
                );

                return;
            }

            defaultExperience = fallbackExperience;
        }

        window.Aether.load(defaultExperience);

        console.log(
            `[Aether Boot] Default experience "${defaultExperience}" activated.`
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            boot,
            { once: true }
        );
    } else {
        boot();
    }

})(window, document);
