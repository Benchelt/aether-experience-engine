<?php
/**
 * Frontend asset loader for the Alchemy Aether Engine.
 *
 * @package Alchemy_Aether_Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads the public Aether browser runtime.
 */
final class AW_Aether_Assets {

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ) );
	}

	/**
	 * Return a cache-busting version for an asset.
	 *
	 * @param string $relative_path Relative path from the plugin root.
	 * @return string
	 */
	private function asset_version( $relative_path ) {
		$absolute_path = AW_AETHER_PATH . $relative_path;

		if ( file_exists( $absolute_path ) ) {
			return (string) filemtime( $absolute_path );
		}

		return AW_AETHER_VERSION;
	}

	/**
	 * Enqueue core services, runtime and modules.
	 *
	 * @return void
	 */
	public function enqueue() {
		wp_enqueue_script(
			'aw-aether-events',
			AW_AETHER_URL . 'assets/js/core/events.js',
			array(),
			$this->asset_version( 'assets/js/core/events.js' ),
			true
		);

		wp_enqueue_script(
			'aw-aether-services',
			AW_AETHER_URL . 'assets/js/core/services.js',
			array( 'aw-aether-events' ),
			$this->asset_version( 'assets/js/core/services.js' ),
			true
		);

                wp_enqueue_script(
                        'aw-aether-experience',
                        AW_AETHER_URL . 'assets/js/core/experience.js',
                        array( 'aw-aether-events' ),
                        $this->asset_version( 'assets/js/core/experience.js' ),
                        true
                );

		wp_enqueue_script(
			'aw-aether-runtime',
			AW_AETHER_URL . 'assets/js/aether.js',
			array(
				'aw-aether-events',
				'aw-aether-services',
                                'aw-aether-experience',
			),
			$this->asset_version( 'assets/js/aether.js' ),
			true
		);

		wp_enqueue_script(
		        'aw-aether-default-experiences',
		        AW_AETHER_URL . 'assets/js/modules/default-experiences.js',
		        array( 'aw-aether-runtime' ),
		        $this->asset_version( 'assets/js/modules/default-experiences.js' ),
		        true
		);

                wp_localize_script(
                        'aw-aether-default-experiences',
                        'AetherExperienceDefinitions',
                        AW_Aether::instance()->experiences()->all()
                );

		wp_enqueue_script(
			'aw-aether-test-module',
			AW_AETHER_URL . 'assets/js/modules/test-module.js',
			array( 'aw-aether-runtime' ),
			$this->asset_version( 'assets/js/modules/test-module.js' ),
			true
		);

		wp_enqueue_script(
			'aw-aether-audio-module',
			AW_AETHER_URL . 'assets/js/modules/audio.js',
			array( 'aw-aether-runtime' ),
			$this->asset_version( 'assets/js/modules/audio.js' ),
			true
		);

		wp_enqueue_script(
			'aw-aether-visual-module',
			AW_AETHER_URL . 'assets/js/modules/visual.js',
			array( 'aw-aether-runtime' ),
			$this->asset_version( 'assets/js/modules/visual.js' ),
			true
		);

		wp_enqueue_script(
			'aw-aether-ambience-toggle',
			AW_AETHER_URL . 'assets/js/modules/ambience-toggle.js',
			array( 'aw-aether-audio-module' ),
			$this->asset_version( 'assets/js/modules/ambience-toggle.js' ),
			true
		);

		wp_enqueue_script(
		        'aw-aether-boot',
		        AW_AETHER_URL . 'assets/js/core/boot.js',
		        array(
		                'aw-aether-default-experiences',
		                'aw-aether-audio-module',
		                'aw-aether-visual-module',
		                'aw-aether-ambience-toggle',
		        ),
		        $this->asset_version( 'assets/js/core/boot.js' ),
		        true
		);

		wp_localize_script(
			'aw-aether-boot',
			'AetherRuntimeSettings',
			array(
				'defaultExperience' => AW_Aether_Settings::get(
					'default_experience',
					'Temple'
				),
			)
		);

		wp_enqueue_style(
			'aw-aether-visual',
			AW_AETHER_URL . 'assets/css/visual.css',
			array(),
			$this->asset_version( 'assets/css/visual.css' )
		);

		wp_enqueue_style(
			'aw-aether-ambience-toggle',
			AW_AETHER_URL . 'assets/css/ambience-toggle.css',
			array(),
			$this->asset_version( 'assets/css/ambience-toggle.css' )
		);
	}
}
