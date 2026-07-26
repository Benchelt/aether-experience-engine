/**
 * Aether Experience Engine
 * Default Layer Definitions
 *
 * Version: 0.22.0
 */

(function (window) {
    'use strict';

    if (
        !window.Aether ||
        !window.Aether.Layers
    ) {
        console.error(
            '[Aether] Layer Manager is unavailable.'
        );
        return;
    }

    const defaultLayers = {
        Audio: {
            type: 'audio',
            label: 'Audio',
            description: 'Controls sound, ambience and volume.'
        },

        Visual: {
            type: 'visual',
            label: 'Visual',
            description: 'Controls visual effects and presentation.'
        },

        Particles: {
            type: 'particles',
            label: 'Particles',
            description: 'Controls particle systems and motion effects.'
        },

        Atmosphere: {
            type: 'atmosphere',
            label: 'Atmosphere',
            description: 'Controls environmental mood and atmospheric effects.'
        },

        System: {
            type: 'system',
            label: 'System',
            description: 'Controls runtime and experience-level behaviour.'
        }
    };

    Object.entries(defaultLayers).forEach(
        ([name, definition]) => {
            if (!window.Aether.Layers.has(name)) {
                window.Aether.Layers.register(
                    name,
                    definition
                );
            }
        }
    );

    console.log(
        `[Aether] ${window.Aether.Layers.count()} default layers registered.`
    );

})(window);
