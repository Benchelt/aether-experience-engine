<?php
/**
 * Aether Engine server-side module registry.
 *
 * @package Alchemy_Aether_Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores metadata for modules available to the Aether runtime.
 */
final class AW_Aether_Module_Registry {

	/**
	 * Registered module definitions.
	 *
	 * @var array<string, array<string, mixed>>
	 */
	private $modules = array();

	/**
	 * Register a module.
	 *
	 * @param string $name       Unique module identifier.
	 * @param array  $definition Module metadata.
	 * @return bool
	 */
	public function register( $name, array $definition = array() ) {

		$name = sanitize_key( $name );

		if ( '' === $name || isset( $this->modules[ $name ] ) ) {
			return false;
		}

		$this->modules[ $name ] = $this->sanitize_definition(
			$name,
			$definition
		);

		/**
		 * Fires after an Aether server-side module is registered.
		 *
		 * @param string $name       Module identifier.
		 * @param array  $definition Sanitised module definition.
		 */
		do_action(
			'aw_aether_module_registered',
			$name,
			$this->modules[ $name ]
		);

		return true;
	}

	/**
	 * Return a registered module.
	 *
	 * @param string $name Module identifier.
	 * @return array<string, mixed>|null
	 */
	public function get( $name ) {

		$name = sanitize_key( $name );

		return isset( $this->modules[ $name ] )
			? $this->modules[ $name ]
			: null;
	}

	/**
	 * Return all registered modules.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function all() {
		return $this->modules;
	}

	/**
	 * Determine whether a module is registered.
	 *
	 * @param string $name Module identifier.
	 * @return bool
	 */
	public function has( $name ) {
		return null !== $this->get( $name );
	}

	/**
	 * Return the number of registered modules.
	 *
	 * @return int
	 */
	public function count() {
		return count( $this->modules );
	}

	/**
	 * Remove a module from the registry.
	 *
	 * @param string $name Module identifier.
	 * @return bool
	 */
	public function unregister( $name ) {

		$name = sanitize_key( $name );

		if ( ! isset( $this->modules[ $name ] ) ) {
			return false;
		}

		unset( $this->modules[ $name ] );

		do_action(
			'aw_aether_module_unregistered',
			$name
		);

		return true;
	}

	/**
	 * Sanitise a module definition.
	 *
	 * @param string $name       Module identifier.
	 * @param array  $definition Raw module metadata.
	 * @return array<string, mixed>
	 */
	private function sanitize_definition( $name, array $definition ) {

		$defaults = array(
			'name'         => ucwords( str_replace( '-', ' ', $name ) ),
			'description'  => '',
			'version'      => AW_AETHER_VERSION,
			'type'         => 'module',
			'status'       => 'registered',
			'enabled'      => true,
			'dependencies' => array(),
		);

		$definition = wp_parse_args(
			$definition,
			$defaults
		);

		$dependencies = is_array( $definition['dependencies'] )
			? array_map( 'sanitize_key', $definition['dependencies'] )
			: array();

		return array(
			'id'           => $name,
			'name'         => sanitize_text_field( $definition['name'] ),
			'description'  => sanitize_text_field( $definition['description'] ),
			'version'      => sanitize_text_field( $definition['version'] ),
			'type'         => sanitize_key( $definition['type'] ),
			'status'       => sanitize_key( $definition['status'] ),
			'enabled'      => (bool) $definition['enabled'],
			'dependencies' => array_values(
				array_unique(
					array_filter( $dependencies )
				)
			),
		);
	}
}
