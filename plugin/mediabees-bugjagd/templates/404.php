<?php
/**
 * 404-Vorlage der Bug-Jagd. Header und Footer kommen aus dem Theme bzw. Elementor.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'single' ) ) {
	echo '<main id="content" class="site-main mbbj-main">' . mbbj_render() . '</main>'; // phpcs:ignore
}

get_footer();
