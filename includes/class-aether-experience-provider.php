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
		$fallback_experiences = array(
			'Temple' => array(
				'metadata' => array(
					'name'        => 'Temple',
					'title'       => 'Temple',
					'description' => 'A contemplative atmospheric experience with resonant audio, warm golden visuals and drifting temple dust.',
					'category'    => 'Meditation',
					'icon'        => 'temple',
					'author'      => 'Alchemy Wares',
					'version'     => '1.0.0',
				),

				'capabilities' => array(
					'audio'     => true,
					'visual'    => true,
					'particles' => true,
				),

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

			'Forest Shrine' => array(
				'metadata' => array(
					'name'        => 'Forest Shrine',
					'title'       => 'Forest Shrine',
					'description' => 'A tranquil woodland sanctuary with soft resonant audio and slow-moving pollen drifting through an ancient green canopy.',
					'category'    => 'Nature',
					'icon'        => 'forest-shrine',
					'author'      => 'Alchemy Wares',
					'version'     => '1.0.0',
				),

				'capabilities' => array(
					'audio'     => true,
					'visual'    => true,
					'particles' => true,
				),

				'ambience' => true,

				'audio' => array(
					'enabled' => true,
					'volume'  => 0.3,
				),

				'visual' => array(
					'enabled' => true,
					'preset'  => 'forest-shrine',

					'particles' => array(
						'enabled'  => true,
						'type'     => 'pollen',
						'count'    => 55,
						'colour'   => '132, 168, 116',
						'minSize'  => 0.8,
						'maxSize'  => 3.0,
						'minSpeed' => 0.04,
						'maxSpeed' => 0.18,
					),
				),
			),
		);

		/*
		 * Load packaged manifests first. Existing PHP definitions remain
		 * available as safe fallbacks.
		 */
		$experiences = $this->load_manifests();

		foreach ( $fallback_experiences as $name => $definition ) {
			if ( ! isset( $experiences[ $name ] ) ) {
				$experiences[ $name ] = $definition;
			}
		}

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
	 * Load experience definitions from package manifests.
	 *
	 * Invalid manifests are skipped so the existing PHP fallback
	 * definitions remain available.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private function load_manifests() {
		$directory = AW_AETHER_PATH . 'assets/experiences';

		if ( ! is_dir( $directory ) ) {
			return array();
		}

		$manifest_paths = glob(
			trailingslashit( $directory ) . '*/experience.json'
		);

		if ( false === $manifest_paths ) {
			return array();
		}

		sort( $manifest_paths );

		$experiences = array();

		foreach ( $manifest_paths as $manifest_path ) {
			if ( ! is_readable( $manifest_path ) ) {
				continue;
			}

			$json = file_get_contents( $manifest_path );

			if ( false === $json ) {
				continue;
			}

			$manifest = json_decode( $json, true );

			if (
				JSON_ERROR_NONE !== json_last_error() ||
				! is_array( $manifest )
			) {
				continue;
			}

			$definition = $this->normalise_manifest(
				$manifest,
				$manifest_path
			);

			if ( null === $definition ) {
				continue;
			}

			$name = $definition['metadata']['name'];

			$experiences[ $name ] = $definition;
		}

		return $experiences;
	}

	/**
	 * Convert a package manifest into the provider runtime structure.
	 *
	 * @param array  $manifest      Decoded manifest.
	 * @param string $manifest_path Absolute manifest path.
	 * @return array<string, mixed>|null
	 */
	private function normalise_manifest(
		array $manifest,
		$manifest_path
	) {
		if (
			empty( $manifest['name'] ) ||
			! is_string( $manifest['name'] ) ||
			empty( $manifest['metadata'] ) ||
			! is_array( $manifest['metadata'] ) ||
			empty( $manifest['configuration'] ) ||
			! is_array( $manifest['configuration'] )
		) {
			return null;
		}

		$name = sanitize_text_field( $manifest['name'] );

		if ( '' === $name ) {
			return null;
		}

		$metadata = $manifest['metadata'];

		$metadata['name'] = $name;

		if ( empty( $metadata['title'] ) ) {
			$metadata['title'] = $name;
		}

		$metadata['id'] = isset( $manifest['id'] )
			? sanitize_key( $manifest['id'] )
			: sanitize_key( $name );

		$metadata['schema_version'] = isset( $manifest['schema_version'] )
			? sanitize_text_field( $manifest['schema_version'] )
			: '1.0';

		$metadata['manifest'] = wp_normalize_path( $manifest_path );

		$definition = $manifest['configuration'];

		$definition['metadata'] = $metadata;

		$definition['capabilities'] = isset( $manifest['capabilities'] )
			&& is_array( $manifest['capabilities'] )
				? $manifest['capabilities']
				: array();

		return $definition;
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
