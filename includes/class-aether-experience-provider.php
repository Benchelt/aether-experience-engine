<?php
/**
 * Aether Engine Experience Provider.
 *
 * @package Alchemy_Aether_Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Supplies experience definitions to the browser runtime.
 */
final class AW_Aether_Experience_Provider {

	/**
	 * Return all registered experience definitions.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function all() {
		$experiences = array(
			'Temple' => array(
				'ambience' => true,

				'audio' => array(
					'enabled' => true,
					'volume'  => 0.4,
				),

				'visual' => array(
					'enabled' => true,
					'preset'  => 'temple',

					'particles' => array(
						'enabled'  => true,
						'type'     => 'dust',
						'count'    => 40,
						'colour'   => '198, 167, 94',
						'minSize'  => 0.7,
						'maxSize'  => 2.4,
						'minSpeed' => 0.08,
						'maxSpeed' => 0.28,
					),
				),
			),
		);

		/**
		 * Filter Aether experience definitions.
		 *
		 * @param array<string, array<string, mixed>> $experiences Experiences.
		 */
		$experiences = apply_filters(
			'aw_aether_experiences',
			$experiences
		);

		return $this->resolve_experiences(
			$experiences,
			AW_Aether_Settings::experience_overrides()
		);
	}

	/**
	 * Return one experience definition.
	 *
	 * @param string $name Experience name.
	 * @return array<string, mixed>|null
	 */
	public function get( $name ) {
		$experiences = $this->all();

		return isset( $experiences[ $name ] )
			? $experiences[ $name ]
			: null;
	}

	/**
	 * Return whether an experience exists.
	 *
	 * @param string $name Experience name.
	 * @return bool
	 */
	public function has( $name ) {
		return null !== $this->get( $name );
	}

	/**
	 * Return the number of experiences.
	 *
	 * @return int
	 */
	public function count() {
		return count( $this->all() );
	}

	/**
	 * Merge stored overrides into registered experience definitions.
	 *
	 * Overrides for unregistered experiences are ignored.
	 *
	 * @param array $experiences Registered experience definitions.
	 * @param array $overrides   Stored experience overrides.
	 * @return array
	 */
	private function resolve_experiences( array $experiences, array $overrides ) {

		foreach ( $experiences as $name => $definition ) {
			if (
				! isset( $overrides[ $name ] ) ||
				! is_array( $overrides[ $name ] )
			) {
				continue;
			}

			$experiences[ $name ] = $this->merge_definition(
				$definition,
				$overrides[ $name ]
			);
		}

		return $experiences;
	}

	/**
	 * Recursively merge known override values into a definition.
	 *
	 * Keys that do not exist in the provider definition are ignored.
	 *
	 * @param array $definition Provider definition.
	 * @param array $override   Stored override values.
	 * @return array
	 */
	private function merge_definition( array $definition, array $override ) {

		foreach ( $override as $key => $value ) {
			if ( ! array_key_exists( $key, $definition ) ) {
				continue;
			}

			if ( is_array( $definition[ $key ] ) ) {
				if ( ! is_array( $value ) ) {
					continue;
				}

				$definition[ $key ] = $this->merge_definition(
					$definition[ $key ],
					$value
				);

				continue;
			}

			if ( ! $this->is_valid_override_value(
				$definition[ $key ],
				$value
			) ) {
				continue;
			}

			$definition[ $key ] = $value;
		}

		return $definition;
	}

	/**
	 * Determine whether an override matches the provider value type.
	 *
	 * Invalid values are ignored so the provider default remains available.
	 *
	 * @param mixed $default_value  Provider default value.
	 * @param mixed $override_value Stored override value.
	 * @return bool
	 */
	private function is_valid_override_value(
		$default_value,
		$override_value
	) {
		return gettype( $default_value ) === gettype( $override_value );
	}
}
