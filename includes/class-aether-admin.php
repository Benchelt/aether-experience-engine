<?php
/**
 * Aether Engine WordPress admin interface.
 *
 * @package Alchemy_Aether_Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provides the Aether Engine application interface.
 */
final class AW_Aether_Admin {

	/**
	 * Supported application views.
	 *
	 * @var array
	 */
	private $views = array(
		'dashboard',
		'experiences',
		'modules',
		'settings',
	);

	/**
	 * Register admin hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );

		// Handle settings form submissions.
		add_action( 'admin_init', array( $this, 'handle_settings_save' ) );
	}

	/**
	 * Register the Aether Engine menu.
	 *
	 * @return void
	 */
	public function register_menu() {
		add_menu_page(
			'Aether Engine',
			'Aether Engine',
			'manage_options',
			'alchemy-aether-engine',
			array( $this, 'render_application' ),
			'dashicons-superhero-alt',
			58
		);
	}

	/**
	 * Load admin CSS only on the Aether application page.
	 *
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public function enqueue_assets( $hook ) {
		if ( 'toplevel_page_alchemy-aether-engine' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'aw-aether-admin',
			AW_AETHER_URL . 'assets/css/admin.css',
			array(),
			filemtime( AW_AETHER_PATH . 'assets/css/admin.css' )
		);

		wp_enqueue_script(
			'aw-aether-admin',
			AW_AETHER_URL . 'assets/js/admin.js',
			array(),
			filemtime( AW_AETHER_PATH . 'assets/js/admin.js' ),
			true
		);
	}

	/**
	 * Return the current application view.
	 *
	 * @return string
	 */
	private function current_view() {
		$view = isset( $_GET['view'] )
			? sanitize_key( wp_unslash( $_GET['view'] ) )
			: 'dashboard';

		if ( ! in_array( $view, $this->views, true ) ) {
			return 'dashboard';
		}

		return $view;
	}

	/**
	 * Create a URL for an application view.
	 *
	 * @param string $view View name.
	 * @return string
	 */
	private function view_url( $view ) {
		return add_query_arg(
			array(
				'page' => 'alchemy-aether-engine',
				'view' => $view,
			),
			admin_url( 'admin.php' )
		);
	}

	/**
	 * Render the complete Aether application.
	 *
	 * @return void
	 */
	public function render_application() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$view = $this->current_view();
		?>
		<div class="wrap aw-aether-admin">
			<header class="aw-aether-app-header">
				<div>
					<p class="aw-aether-label">
						Environmental Experience Platform
					</p>

					<div class="aw-aether-brand-row">
						<h1>Aether Engine</h1>

						<span class="aw-aether-version">
							v<?php echo esc_html( AW_AETHER_VERSION ); ?>
						</span>
					</div>
				</div>

				<div class="aw-aether-engine-state">
					<span></span>
					Engine Online
				</div>
			</header>

			<?php $this->render_navigation( $view ); ?>

			<main class="aw-aether-view">
				<?php
				switch ( $view ) {
					case 'experiences':
						$this->render_experiences();
						break;

					case 'modules':
						$this->render_modules();
						break;

					case 'settings':
						$this->render_settings();
						break;

					case 'dashboard':
					default:
						$this->render_dashboard();
						break;
				}
				?>
			</main>
		</div>
		<?php
	}

	/**
	 * Render application navigation.
	 *
	 * @param string $current_view Current view.
	 * @return void
	 */
	private function render_navigation( $current_view ) {
		$navigation = array(
			'dashboard'   => 'Dashboard',
			'experiences' => 'Experiences',
			'modules'     => 'Modules',
			'settings'    => 'Settings',
		);
		?>
		<nav class="aw-aether-navigation" aria-label="Aether Engine">
			<?php foreach ( $navigation as $view => $label ) : ?>
				<a
					href="<?php echo esc_url( $this->view_url( $view ) ); ?>"
					class="<?php echo $current_view === $view ? 'is-active' : ''; ?>"
					<?php echo $current_view === $view ? 'aria-current="page"' : ''; ?>
				>
					<?php echo esc_html( $label ); ?>
				</a>
			<?php endforeach; ?>
		</nav>
		<?php
	}

	/**
	 * Render the dashboard.
	 *
	 * @return void
	 */
	private function render_dashboard() {
		?>
		<section class="aw-aether-hero">
			<div>
				<p class="aw-aether-label">System Overview</p>

				<h2>Aether Experience Engine</h2>

				<p class="aw-aether-intro">
					Immersive audio, atmospheric visuals and configurable
					experiences powered by one unified engine.
				</p>
			</div>

			<div class="aw-aether-status">
				<span></span>

				<div>
					<strong>Engine Online</strong>
					<small>
						Version <?php echo esc_html( AW_AETHER_VERSION ); ?>
					</small>
				</div>
			</div>
		</section>

		<section class="aw-aether-stats">
			<article>
				<span>Runtime</span>
				<strong>Ready</strong>
			</article>

			<article>
				<span>Modules</span>
				<strong>5</strong>
			</article>

			<article>
				<span>Experiences</span>
				<strong>1</strong>
			</article>

			<article>
				<span>Default</span>
				<strong>Temple</strong>
			</article>
		</section>

		<section class="aw-aether-panel">
			<p class="aw-aether-label">Active Experience</p>
			<h2>Temple</h2>

			<div class="aw-aether-details">
				<div>
					<span>Ambience</span>
					<strong>Enabled</strong>
				</div>

				<div>
					<span>Audio volume</span>
					<strong>40%</strong>
				</div>

				<div>
					<span>Visual preset</span>
					<strong>Temple</strong>
				</div>

				<div>
					<span>Particles</span>
					<strong>40 gold dust</strong>
				</div>
			</div>
		</section>
		<?php
	}

	/**
	 * Render the Experiences workspace.
	 *
	 * @return void
	 */
	private function render_experiences() {
		$experiences = AW_Aether::instance()
			->experiences()
			->all();

		$default_experience = AW_Aether_Settings::get(
			'default_experience',
			'Temple'
		);
		?>
		<section class="aw-aether-page-heading">
			<div>
				<p class="aw-aether-label">Experience Library</p>
				<h2>Experiences</h2>

				<p>
					Manage the atmospheric configurations available to the
					Aether runtime.
				</p>
			</div>

			<button class="aw-aether-button is-disabled" type="button" disabled>
				<span aria-hidden="true">+</span>
				New Experience
			</button>
		</section>

		<?php if ( empty( $experiences ) ) : ?>
			<section class="aw-aether-placeholder">
				<p class="aw-aether-label">No Experiences Found</p>
				<h3>Your experience library is empty.</h3>

				<p>
					Register an experience through the PHP provider to display
					it here.
				</p>
			</section>
		<?php else : ?>
			<section class="aw-aether-experience-grid">
				<?php
				$index = 0;

				foreach ( $experiences as $name => $experience ) :
					$index++;

					$audio = isset( $experience['audio'] )
						&& is_array( $experience['audio'] )
						? $experience['audio']
						: array();

					$visual = isset( $experience['visual'] )
						&& is_array( $experience['visual'] )
						? $experience['visual']
						: array();

					$particles = isset( $visual['particles'] )
						&& is_array( $visual['particles'] )
						? $visual['particles']
						: array();

					$audio_enabled     = ! empty( $audio['enabled'] );
					$visual_enabled    = ! empty( $visual['enabled'] );
					$particles_enabled = ! empty( $particles['enabled'] );

					$volume = isset( $audio['volume'] )
						? round( (float) $audio['volume'] * 100 )
						: 0;

					$particle_count = isset( $particles['count'] )
						? absint( $particles['count'] )
						: 0;

					$preset = isset( $visual['preset'] )
						? sanitize_text_field( $visual['preset'] )
						: 'none';

					$is_default = $name === $default_experience;
					?>
					<article class="aw-aether-experience-card">
						<div class="aw-aether-experience-preview">
							<div class="aw-aether-orb"></div>

							<?php if ( $is_default ) : ?>
								<span class="aw-aether-active-badge">
									<span></span>
									Default
								</span>
							<?php endif; ?>
						</div>

						<div class="aw-aether-experience-content">
							<div class="aw-aether-experience-title">
								<div>
									<p class="aw-aether-label">
										<?php
										echo esc_html(
											$is_default
												? 'Default Experience'
												: 'Available Experience'
										);
										?>
									</p>

									<h3><?php echo esc_html( $name ); ?></h3>
								</div>

								<span class="aw-aether-experience-version">
									<?php
									echo esc_html(
										str_pad(
											(string) $index,
											2,
											'0',
											STR_PAD_LEFT
										)
									);
									?>
								</span>
							</div>

							<p class="aw-aether-experience-description">
								Atmospheric configuration supplied by the
								Aether Experience Provider.
							</p>

							<div class="aw-aether-capabilities">
								<?php if ( $audio_enabled ) : ?>
									<span>Audio</span>
								<?php endif; ?>

								<?php if ( $visual_enabled ) : ?>
									<span>Visual</span>
								<?php endif; ?>

								<?php if ( $particles_enabled ) : ?>
									<span>Particles</span>
								<?php endif; ?>
							</div>

							<div class="aw-aether-experience-meta">
								<div>
									<span>Volume</span>
									<strong><?php echo esc_html( $volume ); ?>%</strong>
								</div>

								<div>
									<span>Particles</span>
									<strong><?php echo esc_html( $particle_count ); ?></strong>
								</div>

								<div>
									<span>Preset</span>
									<strong><?php echo esc_html( ucfirst( $preset ) ); ?></strong>
								</div>
							</div>

							<footer class="aw-aether-card-actions">
								<button
									class="aw-aether-button aw-aether-edit-button"
									type="button"
									disabled
								>
									Edit Experience
								</button>

								<span>Editor arriving next</span>
							</footer>
						</div>
					</article>
				<?php endforeach; ?>
			</section>
		<?php endif; ?>
		<?php
	}

	/**
	 * Render the Modules workspace.
	 *
	 * @return void
	 */
	private function render_modules() {
		$this->render_placeholder(
			'Runtime Components',
			'Modules',
			'Inspect and manage the services that power every Aether experience.'
		);
	}

	/**
	 * Render the Settings workspace.
	 *
	 * @return void
	 */
	private function render_settings() {

		$settings = AW_Aether_Settings::all();

		$experiences = AW_Aether::instance()
			->experiences()
			->all();

		?>
		<section class="aw-aether-page-heading">
			<div>
				<p class="aw-aether-label">Engine Configuration</p>

				<h2>Settings</h2>

				<p>
					Control the global behaviour of the Aether Experience Engine.
				</p>
			</div>
		</section>

		<?php if ( isset( $_GET['settings-updated'] ) ) : ?>
			<div class="notice notice-success is-dismissible">
				<p>Aether Engine settings saved successfully.</p>
			</div>
		<?php endif; ?>

		<form method="post" class="aw-aether-settings-form">

			<?php
			wp_nonce_field(
				'aw_aether_save_settings',
				'aw_aether_settings_nonce'
			);
			?>

			<section class="aw-aether-settings-grid">

				<article class="aw-aether-settings-panel">
					<p class="aw-aether-label">General</p>
					<h3>Engine State</h3>

					<label class="aw-aether-setting-toggle">
						<input
							type="checkbox"
							name="aw_aether_settings[enabled]"
							value="1"
							<?php checked( ! empty( $settings['enabled'] ) ); ?>
						>
						<span>
							<strong>Enable Engine</strong>
							<small>
								Load the Aether runtime on the front end.
							</small>
						</span>
					</label>

					<label class="aw-aether-setting-toggle">
						<input
							type="checkbox"
							name="aw_aether_settings[audio_enabled]"
							value="1"
							<?php checked( ! empty( $settings['audio_enabled'] ) ); ?>
						>
						<span>
							<strong>Enable Audio</strong>
							<small>
								Allow experiences to use ambient sound.
							</small>
						</span>
					</label>

					<label class="aw-aether-setting-toggle">
						<input
							type="checkbox"
							name="aw_aether_settings[visuals_enabled]"
							value="1"
							<?php checked( ! empty( $settings['visuals_enabled'] ) ); ?>
						>
						<span>
							<strong>Enable Visuals</strong>
							<small>
								Allow experiences to display atmospheric effects.
							</small>
						</span>
					</label>

					<label class="aw-aether-setting-toggle">
						<input
							type="checkbox"
							name="aw_aether_settings[ui_enabled]"
							value="1"
							<?php checked( ! empty( $settings['ui_enabled'] ) ); ?>
						>
						<span>
							<strong>Enable Interface</strong>
							<small>
								Display front-end Aether controls.
							</small>
						</span>
					</label>
				</article>

				<article class="aw-aether-settings-panel">
					<p class="aw-aether-label">Experience</p>
					<h3>Default Experience</h3>

					<label
						class="aw-aether-setting-field"
						for="aw-aether-default-experience"
					>
						<span>Experience</span>

						<select
							id="aw-aether-default-experience"
							name="aw_aether_settings[default_experience]"
						>
							<?php foreach ( $experiences as $name => $experience ) : ?>
								<option
									value="<?php echo esc_attr( $name ); ?>"
									<?php selected( $settings['default_experience'], $name ); ?>
								>
									<?php echo esc_html( $name ); ?>
								</option>
							<?php endforeach; ?>
						</select>

						<small>
							This experience loads when no page-specific override exists.
						</small>
					</label>
				</article>

				<article class="aw-aether-settings-panel">
					<p class="aw-aether-label">Audio</p>
					<h3>Default Volume</h3>

					<label
						class="aw-aether-setting-field"
						for="aw-aether-default-volume"
					>
						<span>
							Volume:
							<strong
								id="aw-aether-volume-value"
							>
								<?php echo esc_html( absint( $settings['default_volume'] ) ); ?>%
							</strong>
						</span>

						<input
							type="range"
							id="aw-aether-default-volume"
							name="aw_aether_settings[default_volume]"
							min="0"
							max="100"
							step="1"
							value="<?php echo esc_attr( absint( $settings['default_volume'] ) ); ?>"
						>

						<small>
							Sets the default master volume for ambient audio.
						</small>
					</label>
				</article>

			</section>

			<div class="aw-aether-settings-actions">
				<div>
					<strong>Ready to apply your changes?</strong>
					<small>
						Saved settings are used by the Aether runtime immediately.
					</small>
				</div>

				<button
					type="submit"
					name="aw_aether_save_settings"
					value="1"
					class="aw-aether-button"
				>
					Save Settings
				</button>
			</div>
		</form>
		<?php
	}

	/**
	 * Handle Settings form submissions.
	 *
	 * @return void
	 */
	public function handle_settings_save() {

		// No settings form was submitted.
		if ( ! isset( $_POST['aw_aether_save_settings'] ) ) {
			return;
		}

		// Only administrators may change Aether settings.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die(
				esc_html__( 'You are not permitted to change Aether Engine settings.', 'alchemy-aether-engine' )
			);
		}

		// Verify that the request originated from the Aether settings form.
		check_admin_referer(
			'aw_aether_save_settings',
			'aw_aether_settings_nonce'
		);

		$submitted = isset( $_POST['aw_aether_settings'] )
			? wp_unslash( $_POST['aw_aether_settings'] )
			: array();

		AW_Aether_Settings::update( $submitted );

		$redirect_url = add_query_arg(
			'settings-updated',
			'true',
			$this->view_url( 'settings' )
		);

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Render a placeholder workspace.
	 *
	 * @param string $label       Section label.
	 * @param string $title       Page title.
	 * @param string $description Page description.
	 * @return void
	 */
	private function render_placeholder( $label, $title, $description ) {
		?>
		<section class="aw-aether-page-heading">
			<div>
				<p class="aw-aether-label">
					<?php echo esc_html( $label ); ?>
				</p>

				<h2><?php echo esc_html( $title ); ?></h2>

				<p><?php echo esc_html( $description ); ?></p>
			</div>
		</section>

		<section class="aw-aether-placeholder">
			<span class="dashicons dashicons-admin-generic"></span>
			<h3><?php echo esc_html( $title ); ?> workspace</h3>
			<p>This part of the application will be developed in a future sprint.</p>
		</section>
		<?php
	}
}
