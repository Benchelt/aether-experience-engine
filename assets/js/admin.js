/**
 * Aether Engine Admin Interface
 *
 * Provides small interactive enhancements for the WordPress
 * administration application.
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const slider = document.getElementById(
            'aw-aether-default-volume'
        );

        const value = document.getElementById(
            'aw-aether-volume-value'
        );

        if (!slider || !value) {
            return;
        }

        const updateValue = function () {
            value.textContent = slider.value + '%';
        };

        slider.addEventListener('input', updateValue);
        updateValue();
    });
})();
