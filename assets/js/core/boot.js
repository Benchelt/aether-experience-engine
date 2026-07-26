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

        if (!window.Aether.Experience.has('Temple')) {
            console.warn(
                '[Aether Boot] Default experience "Temple" was not registered.'
            );

            return;
        }

        window.Aether.load('Temple');

        console.log(
            '[Aether Boot] Default experience "Temple" activated.'
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
