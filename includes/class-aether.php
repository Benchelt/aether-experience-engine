<?php
/**
 * Core Alchemy Aether Engine bootstrap class.
 *
 * @package Alchemy_Aether_Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Starts and coordinates the Alchemy Aether Engine.
 */
final class AW_Aether {

	/**
	 * Shared engine instance.
	 *
	 * @var AW_Aether|null
	 */
	private static $instance = null;

	/**
	 * Logger service.
	 *
	 * @var AW_Aether_Logger|null
	 */
	private $logger = null;

	/**
	 * Frontend asset loader.
	 *
	 * @var AW_Aether_Assets|null
	 */
	private $assets = null;

        /**
         * WordPress admin interface.
         *
         * @var AW_Aether_Admin|null
         */
        private $admin = null;

        /**
         * WordPress UI integration.
         *
         * @var AW_Aether_UI|null
         */
        private $ui = null;

        /**
         * Experience definition provider.
         *
         * @var AW_Aether_Experience_Provider|null
         */
        private $experience_provider = null;

	/**
	 * Server-side module registry.
	 *
	 * @var AW_Aether_Module_Registry|null
	 */
	private $module_registry = null;

        /**
	 * Return the shared engine instance.
	 *
	 * @return AW_Aether
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Prevent direct construction.
	 */
	private function __construct() {
		$this->register_hooks();
	}

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	private function register_hooks() {
		add_action( 'plugins_loaded', array( $this, 'boot' ) );
	}

	/**
	 * Boot the engine.
	 *
	 * @return void
	 */
	public function boot() {
                $this->logger              = new AW_Aether_Logger();
                $this->assets              = new AW_Aether_Assets();
                $this->admin               = new AW_Aether_Admin();
                $this->ui                  = new AW_Aether_UI();
                $this->experience_provider = new AW_Aether_Experience_Provider();
                $this->module_registry = new AW_Aether_Module_Registry();

                $this->register_modules();

		$this->assets->register();
                $this->admin->register();
                $this->ui->register();

		$this->logger->info(
			'Alchemy Aether Engine browser runtime registered successfully.'
		);

		do_action( 'aw_aether_loaded', $this );
	}


	/**
	 * Register the built-in Aether modules.
	 *
	 * @return void
	 */
	private function register_modules() {

		$settings = AW_Aether_Settings::all();

		$this->module_registry->register(
			'events',
			array(
				'name'        => 'Event Dispatcher',
				'description' => 'Coordinates communication between runtime components.',
				'version'     => '0.2.0',
				'type'        => 'core',
			)
		);

		$this->module_registry->register(
			'services',
			array(
				'name'         => 'Services Registry',
				'description'  => 'Provides shared runtime services to Aether modules.',
				'version'      => '0.8.0',
				'type'         => 'core',
				'dependencies' => array( 'events' ),
			)
		);

		$this->module_registry->register(
			'experience',
			array(
				'name'         => 'Experience Manager',
				'description'  => 'Registers and activates atmospheric experiences.',
				'version'      => '0.8.0',
				'type'         => 'core',
				'dependencies' => array( 'services' ),
			)
		);

		$this->module_registry->register(
			'audio',
			array(
				'name'         => 'Audio Module',
				'description'  => 'Controls ambient audio playback and volume.',
				'version'      => '0.9.0',
				'type'         => 'feature',
				'enabled'      => ! empty( $settings['audio_enabled'] ),
				'dependencies' => array( 'experience' ),
			)
		);

		$this->module_registry->register(
			'visual',
			array(
				'name'         => 'Visual Module',
				'description'  => 'Renders atmospheric visuals and particle effects.',
				'version'      => '0.13.0',
				'type'         => 'feature',
				'enabled'      => ! empty( $settings['visuals_enabled'] ),
				'dependencies' => array( 'experience' ),
			)
		);

		$this->module_registry->register(
			'ambience-toggle',
			array(
				'name'         => 'Ambience Interface',
				'description'  => 'Provides the visitor-facing ambience control.',
				'version'      => '0.5.0',
				'type'         => 'interface',
				'enabled'      => ! empty( $settings['ui_enabled'] ),
				'dependencies' => array( 'audio' ),
			)
		);

		/**
		 * Fires after all built-in Aether modules have been registered.
		 *
		 * Third-party integrations can use the supplied registry to
		 * register additional server-side module metadata.
		 *
		 * @param AW_Aether_Module_Registry $registry Module registry.
		 */
		do_action(
			'aw_aether_register_modules',
			$this->module_registry
		);
	}

	/**
	 * Return the logger service.
	 *
	 * @return AW_Aether_Logger|null
	 */
	public function logger() {
		return $this->logger;
	}

	/**
	 * Return the asset loader.
	 *
	 * @return AW_Aether_Assets|null
	 */
	public function assets() {
		return $this->assets;
	}

        /**
         * Return the WordPress UI service.
         *
         * @return AW_Aether_UI|null
         */
        public function ui() {
                return $this->ui;
        }

	/**
	 * Return the experience provider.
	 *
	 * @return AW_Aether_Experience_Provider|null
	 */
	public function experiences() {
	        return $this->experience_provider;
	}

	/**
	 * Return the server-side module registry.
	 *
	 * @return AW_Aether_Module_Registry|null
	 */
	public function modules() {
		return $this->module_registry;
	}

	/**
	 * Prevent cloning the shared engine instance.
	 *
	 * @return void
	 */
	private function __clone() {}

	/**
	 * Prevent restoring the shared instance from serialized data.
	 *
	 * @return void
	 *
	 * @throws Exception When unserialization is attempted.
	 */
	public function __wakeup() {
		throw new Exception(
			'The Alchemy Aether Engine cannot be unserialized.'
		);
	}
}
