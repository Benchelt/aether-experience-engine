/**
 * Aether Default Experiences
 *
 * Version: 0.21.0
 */

(function (window) {
    'use strict';

    if (
        !window.Aether ||
        !window.Aether.Experience
    ) {
        return;
    }

    const definitions =
        window.AetherExperienceDefinitions || {};

    Object.entries(definitions).forEach(
        ([name, definition]) => {
            window.Aether.Experience.register(
                name,
                definition
            );
        }
    );

    console.log(
        `[Aether] ${Object.keys(definitions).length} experiences registered.`
    );

})(window);
