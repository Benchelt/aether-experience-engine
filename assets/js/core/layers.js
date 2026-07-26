/**
 * Aether Experience Engine
 * Layer Manager
 *
 * Version: 0.22.0
 */

(function (window) {
    'use strict';

    if (window.AetherLayers) {
        return;
    }

    if (!window.AetherEvents) {
        console.error(
            '[Aether] Event Dispatcher is unavailable.'
        );
        return;
    }

    const layers = new Map();

    const Layers = {

        register(name, layer) {

            if (
                typeof name !== 'string' ||
                name.trim() === ''
            ) {
                throw new TypeError(
                    '[Aether] A layer must have a valid name.'
                );
            }

            if (
                !layer ||
                typeof layer !== 'object'
            ) {
                throw new TypeError(
                    '[Aether] A layer definition must be an object.'
                );
            }

            const layerName = name.trim();

            if (layers.has(layerName)) {
                throw new Error(
                    `[Aether] Layer "${layerName}" is already registered.`
                );
            }

            layers.set(layerName, layer);

            console.log(
                `[Aether] Layer "${layerName}" registered.`
            );

            window.AetherEvents.emit(
                'layer:registered',
                {
                    name: layerName,
                    layer
                }
            );

            return layer;

        },

        get(name) {
            return layers.get(name) || null;
        },

        has(name) {
            return layers.has(name);
        },

        list() {
            return Array.from(layers.keys());
        },

        count() {
            return layers.size;
        }

    };

    window.AetherLayers = Layers;

})(window);
