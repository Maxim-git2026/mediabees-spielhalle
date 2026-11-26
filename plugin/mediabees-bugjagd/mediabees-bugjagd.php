<?php
/**
 * Plugin Name: MediaBees Spielhalle
 * Description: Einbinden per Shortcode [mediabees_arcade], optional spiel="flitzer". Gibt es keine Elementor-404-Vorlage, zeigt die 404-Seite automatisch die Spielhalle.
 * Version: 2.28.2
 * Author: MediaBees
 * Author URI: https://mediabees.de
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: mediabees-bugjagd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MBBJ_VERSION', '2.28.2' );
define( 'MBBJ_FILE', __FILE__ );
define( 'MBBJ_TOP', 10 ); // Wie am Automaten: Nur die Top 10 werden gespeichert.

/**
 * Updates direkt aus GitHub: Gibt es dort ein neueres Release, zeigt WordPress unter „Plugins“
 * „Jetzt aktualisieren“ an. Das Repo ist öffentlich, deshalb braucht es keinen Schlüssel.
 */
$mbbj_puc = __DIR__ . '/vendor/plugin-update-checker/plugin-update-checker.php';
if ( is_readable( $mbbj_puc ) ) {
	require_once $mbbj_puc;
	$mbbj_updates = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
		'https://github.com/Maxim-git2026/mediabees-spielhalle/',
		MBBJ_FILE,
		'mediabees-bugjagd'
	);
	// Nur das fertige ZIP aus dem Release ist ein gültiges Update, nie der rohe Quellcode-Download.
	$mbbj_updates->getVcsApi()->enableReleaseAssets(
		'/^mediabees-arcade-[0-9.]+\.zip$/',
		\YahnisElsts\PluginUpdateChecker\v5p7\Vcs\Api::REQUIRE_RELEASE_ASSETS
	);
}

/**
 * Spiele und ihre Plausibilitätsgrenzen.
 * min_age:       So viele Sekunden muss eine Runde mindestens gedauert haben.
 * max_score:     Höhere Punktzahlen sind in diesem Spiel nicht realistisch.
 * sec_per_point: Für Spiele ohne feste Zeit: mindestens so viele Sekunden pro Punkt.
 */
function mbbj_games() {
	return array(
		'bugjagd' => array( 'title' => 'Käfer-Jagd', 'min_age' => 28, 'max_score' => 99, 'sec_per_point' => 0 ),
		'wespen'  => array( 'title' => 'Bienenstich', 'min_age' => 58, 'max_score' => 6000, 'sec_per_point' => 0 ),
		'revier'  => array( 'title' => 'Revierflug', 'min_age' => 2, 'max_score' => 999, 'sec_per_point' => 1.2 ),
		'polonaise' => array( 'title' => 'Bienentanz', 'min_age' => 3, 'max_score' => 9999, 'sec_per_point' => 0.01 ),
		'flitzer' => array( 'title' => 'A40-Flitzer', 'min_age' => 3, 'max_score' => 99999, 'sec_per_point' => 0.012 ),
		'abriss'  => array( 'title' => 'Website-Abriss', 'min_age' => 43, 'max_score' => 30000, 'sec_per_point' => 0 ),
		'nester'  => array( 'title' => 'Wespennest', 'min_age' => 3, 'max_score' => 99999, 'sec_per_point' => 0.004 ),
		'wacht'   => array( 'title' => 'Wespen-Invasion', 'min_age' => 3, 'max_score' => 99999, 'sec_per_point' => 0.003 ),
		'pfad'    => array( 'title' => 'Pollenrausch', 'min_age' => 5, 'max_score' => 300000, 'sec_per_point' => 0.003 ),
		'wabenbau' => array( 'title' => 'Wabenbau', 'min_age' => 5, 'max_score' => 999999, 'sec_per_point' => 0.002 ),
		'solitaer' => array( 'title' => 'Bienen-Solitär', 'min_age' => 5, 'max_score' => 5000, 'sec_per_point' => 0.02 ),
		'hopser'   => array( 'title' => 'Hummelhopser', 'min_age' => 3, 'max_score' => 20000, 'sec_per_point' => 0.04 ),
		'honigdieb' => array( 'title' => 'Honigdieb', 'min_age' => 3, 'max_score' => 50000, 'sec_per_point' => 0.03 ),
		'knaller'  => array( 'title' => 'Bienenboom', 'min_age' => 5, 'max_score' => 200000, 'sec_per_point' => 0.004 ),
		'flipper'  => array( 'title' => 'Honigflipper', 'min_age' => 5, 'max_score' => 2000000, 'sec_per_point' => 0.0002 ),
		'wurf'     => array( 'title' => 'Haldenduell', 'min_age' => 10, 'max_score' => 300000, 'sec_per_point' => 0.002 ),
		'blitz'    => array( 'title' => 'Bienen-Blitz', 'min_age' => 8, 'max_score' => 500000, 'sec_per_point' => 0.002 ),
		'wimmel'   => array( 'title' => 'Wimmelpott', 'min_age' => 10, 'max_score' => 500000, 'sec_per_point' => 0.002 ),
	);
}

/* ------------------------------------------------------------------ *
 * Ausgabe
 * ------------------------------------------------------------------ */

add_action( 'wp_enqueue_scripts', function () {
	wp_register_style( 'mbbj', plugins_url( 'assets/arcade.css', MBBJ_FILE ), array(), MBBJ_VERSION );
	wp_register_script( 'mbbj', plugins_url( 'assets/arcade.js', MBBJ_FILE ), array(), MBBJ_VERSION, true );
	if ( is_404() ) {
		wp_enqueue_style( 'mbbj' );
		wp_enqueue_script( 'mbbj' );
	}
} );

/* ------------------------------------------------------------------ *
 * Köder auf der ganzen Website: roter Knopf „Nicht drücken!“ und fliegende Biene
 * ------------------------------------------------------------------ */

function mbbj_teaser_settings() {
	$s = get_option( 'mbbj_teaser', array() );
	return wp_parse_args( is_array( $s ) ? $s : array(), array(
		'button'  => 1,
		'bee'     => 1,
		'url'       => '/spielhalle/',
		'place'     => 'footer', // footer = per Shortcode [mediabees_knopf], left/right = schwebt am Bildschirmrand
		'style'     => 'notaus', // notaus, klappe, arcade
		'bee_first' => 40,       // erste Biene nach so vielen Sekunden
		'bee_every' => 120,      // danach alle so vielen Sekunden
		'bee_max'   => 2,        // höchstens so viele Bienen pro Seitenaufruf
		'k_text_mode' => 'std',  // std = Standardtext, custom = eigener Text, none = ohne Schild
		'k_text'      => '',
		'k_size'      => 'm',    // s, m, l
		'k_colors'    => 0,      // 1 = eigene Farben
		'k_cap'       => '#E5322D',
		'k_tagbg'     => '#1A1A1A',
		'k_tagfg'     => '#FDC506',
		'k_accent'    => '#FDC506',
		'admin_theme' => 'auto', // Einstellungsseite: auto, light, dark
		'float_x'     => 14,     // schwebend: Abstand zum Seitenrand in px
		'float_y'     => 14,     // schwebend: Abstand nach unten in px
		'float_hide_mobile' => 0, // schwebend: auf dem Handy ausblenden
		'exclude'   => '',
	) );
}

function mbbj_knopf_styles() {
	return array(
		'notaus' => 'Not-Aus (gelb-schwarzer Kasten)',
		'klappe' => 'Geheimknopf unter Glasklappe',
		'arcade' => 'Arcade-Knopf (rund, rot)',
	);
}

function mbbj_teaser_url() {
	$url = (string) mbbj_teaser_settings()['url'];
	if ( ! preg_match( '#^https?://#i', $url ) ) {
		$url = home_url( '/' . ltrim( $url, '/' ) );
	}
	return $url;
}

/* HTML des Knopfs. Ein normaler Link, damit er auch ohne JavaScript zur Spielhalle führt. */
/* $over: einzelne Einstellungen nur für diesen Knopf ersetzen (z. B. aus dem Elementor-Widget) */
function mbbj_knopf_html( $style = '', $extra_class = '', $over = array() ) {
	$t      = array_merge( mbbj_teaser_settings(), array_filter( (array) $over, function ( $v ) {
		return '' !== $v && null !== $v;
	} ) );
	$styles = mbbj_knopf_styles();
	if ( ! isset( $styles[ $style ] ) ) {
		$style = $t['style'];
	}
	if ( ! isset( $styles[ $style ] ) ) {
		$style = 'notaus';
	}
	$std   = 'klappe' === $style ? 'Streng geheim!' : 'Nicht drücken!';
	$label = $std;
	if ( 'custom' === $t['k_text_mode'] && '' !== trim( (string) $t['k_text'] ) ) {
		$label = (string) $t['k_text'];
	}
	$no_label = 'none' === $t['k_text_mode'];
	return '<a class="mbbj-k mbbj-k--' . esc_attr( $style ) . ( $no_label ? ' is-nolabel' : '' ) . ( $extra_class ? ' ' . esc_attr( $extra_class ) : '' ) . '" href="' . esc_url( mbbj_teaser_url() ) . '" style="' . esc_attr( mbbj_knopf_vars( $t ) ) . '" data-std="' . esc_attr( $std ) . '" aria-label="' . esc_attr( ( $no_label ? $std : $label ) . ' (führt zur MediaBees-Spielhalle)' ) . '">'
		. '<span class="mbbj-k-box" aria-hidden="true"><span class="mbbj-k-cap"></span>' . ( 'klappe' === $style ? '<span class="mbbj-k-lid"></span>' : '' ) . '</span>'
		. '<span class="mbbj-k-label" aria-hidden="true">' . esc_html( $label ) . '</span></a>';
}

/* Hex-Farbe mischen: $t = 0 → $hex, 1 → $to */
function mbbj_hex_mix( $hex, $to, $t ) {
	$a = sscanf( ltrim( $hex, '#' ), '%02x%02x%02x' );
	$b = sscanf( ltrim( $to, '#' ), '%02x%02x%02x' );
	$o = '#';
	for ( $i = 0; $i < 3; $i++ ) {
		$o .= sprintf( '%02x', (int) round( $a[ $i ] + ( $b[ $i ] - $a[ $i ] ) * $t ) );
	}
	return $o;
}

function mbbj_size_factor( $size ) {
	$f = array( 's' => 0.8, 'm' => 1, 'l' => 1.25 );
	return isset( $f[ $size ] ) ? $f[ $size ] : 1;
}

/* CSS-Variablen für Größe und eigene Farben (die Optik selbst steht in teaser.css) */
function mbbj_knopf_vars( $t = null ) {
	$t   = $t ? $t : mbbj_teaser_settings();
	$css = '--mbbj-size:' . mbbj_size_factor( $t['k_size'] ) . ';';
	if ( $t['k_colors'] ) {
		$cap  = sanitize_hex_color( $t['k_cap'] ) ? $t['k_cap'] : '#E5322D';
		$css .= '--mbbj-cap-hi:' . mbbj_hex_mix( $cap, '#ffffff', 0.55 ) . ';--mbbj-cap-mid:' . mbbj_hex_mix( $cap, '#ffffff', 0.18 ) . ';--mbbj-cap:' . $cap . ';--mbbj-cap-lo:' . mbbj_hex_mix( $cap, '#000000', 0.38 ) . ';--mbbj-cap-edge:' . mbbj_hex_mix( $cap, '#000000', 0.58 ) . ';';
		foreach ( array( 'k_tagbg' => 'tagbg', 'k_tagfg' => 'tagfg', 'k_accent' => 'accent' ) as $key => $var ) {
			if ( sanitize_hex_color( $t[ $key ] ) ) {
				$css .= '--mbbj-' . $var . ':' . $t[ $key ] . ';';
			}
		}
	}
	return $css;
}

/*
 * Shortcode [mediabees_knopf] für den Footer (Elementor: Shortcode-Widget in der Footer-Vorlage).
 * Optional stil="notaus|klappe|arcade". Auf der Spielhalle selbst, der 404 und ausgeschlossenen Seiten bleibt er leer.
 */
add_shortcode( 'mediabees_knopf', function ( $atts = array() ) {
	$atts = shortcode_atts( array( 'stil' => '' ), is_array( $atts ) ? $atts : array(), 'mediabees_knopf' );
	$s    = mbbj_teaser_settings();
	if ( ! $s['button'] ) {
		return '';
	}
	if ( mbbj_in_builder() ) { // Vorschau im Elementor-Editor: Knopf immer zeigen, aber ohne Biene
		wp_enqueue_style( 'mbbj-teaser', plugins_url( 'assets/teaser.css', MBBJ_FILE ), array(), MBBJ_VERSION );
		return '<span class="mbbj-k-wrap">' . mbbj_knopf_html( sanitize_key( $atts['stil'] ) ) . '</span>';
	}
	if ( ! mbbj_teaser_active() ) {
		return '';
	}
	mbbj_teaser_enqueue();
	return '<span class="mbbj-k-wrap">' . mbbj_knopf_html( sanitize_key( $atts['stil'] ) ) . '</span>';
} );

/* Pfad ohne Domain und ohne Schrägstrich am Ende, z. B. "/kontakt" */
function mbbj_teaser_path( $url ) {
	$path = (string) wp_parse_url( (string) $url, PHP_URL_PATH );
	$path = '/' . trim( $path, '/' );
	return strtolower( $path );
}

/*
 * Läuft gerade der Elementor-Editor? Dazu zählen die Vorschau (?elementor-preview) und die AJAX-Anfragen,
 * mit denen Elementor ein Widget nach jeder Änderung neu zeichnet (dort ist is_admin() wahr).
 */
function mbbj_in_builder() {
	if ( isset( $_GET['elementor-preview'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return true;
	}
	if ( wp_doing_ajax() && isset( $_REQUEST['action'] ) && 'elementor_ajax' === $_REQUEST['action'] ) { // phpcs:ignore WordPress.Security.NonceVerification
		return true;
	}
	if ( class_exists( 'Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance ) ) {
		$e = \Elementor\Plugin::$instance;
		if ( ( isset( $e->editor ) && $e->editor->is_edit_mode() ) || ( isset( $e->preview ) && $e->preview->is_preview_mode() ) ) {
			return true;
		}
	}
	return false;
}

/* Im Elementor-Editor das Knopf-CSS immer laden, damit neu eingefügte Widgets sofort richtig aussehen */
add_action( 'elementor/preview/enqueue_styles', function () {
	wp_enqueue_style( 'mbbj-teaser', plugins_url( 'assets/teaser.css', MBBJ_FILE ), array(), MBBJ_VERSION );
} );

function mbbj_teaser_active() {
	if ( is_admin() || is_404() || is_feed() || is_customize_preview() || wp_doing_ajax() ) {
		return false;
	}
	if ( isset( $_GET['elementor-preview'] ) || isset( $_GET['preview'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return false;
	}
	$s = mbbj_teaser_settings();
	if ( ! $s['button'] && ! $s['bee'] ) {
		return false;
	}
	$here = mbbj_teaser_path( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
	if ( mbbj_teaser_path( $s['url'] ) === $here ) {
		return false;
	}
	foreach ( preg_split( '/\r\n|\r|\n/', (string) $s['exclude'] ) as $line ) {
		$line = trim( $line );
		if ( '' === $line ) {
			continue;
		}
		$ex = mbbj_teaser_path( $line );
		if ( '/' === $ex ? '/' === $here : ( $here === $ex || 0 === strpos( $here, $ex . '/' ) ) ) {
			return false;
		}
	}
	return true;
}

function mbbj_teaser_enqueue() {
	static $done = false;
	if ( $done ) {
		return;
	}
	$done = true;
	$s    = mbbj_teaser_settings();
	wp_enqueue_style( 'mbbj-teaser', plugins_url( 'assets/teaser.css', MBBJ_FILE ), array(), MBBJ_VERSION );
	wp_enqueue_script( 'mbbj-teaser', plugins_url( 'assets/teaser.js', MBBJ_FILE ), array(), MBBJ_VERSION, true );
	wp_add_inline_script( 'mbbj-teaser', 'window.MBBJ_TEASER=' . wp_json_encode( array(
		'url'   => esc_url_raw( mbbj_teaser_url() ),
		'bee'   => (bool) $s['bee'],
		'first' => max( 3, (int) $s['bee_first'] ),
		'every' => max( 10, (int) $s['bee_every'] ),
		'max'   => max( 1, min( 20, (int) $s['bee_max'] ) ),
		'test'  => isset( $_GET['mbbj_biene'] ), // phpcs:ignore WordPress.Security.NonceVerification -- nur zum Ausprobieren: Biene kommt sofort
	) ) . ';', 'before' );
}

add_action( 'wp_enqueue_scripts', function () {
	wp_register_style( 'mbbj-teaser', plugins_url( 'assets/teaser.css', MBBJ_FILE ), array(), MBBJ_VERSION );
	if ( mbbj_teaser_active() ) {
		mbbj_teaser_enqueue();
	}
}, 20 );

/* Schwebender Knopf (nur wenn in den Einstellungen „unten links/rechts“ gewählt ist) */
add_action( 'wp_footer', function () {
	$s = mbbj_teaser_settings();
	if ( ! $s['button'] || 'footer' === $s['place'] || ! mbbj_teaser_active() ) {
		return;
	}
	$side = 'right' === $s['place'] ? 'right' : 'left';
	$pos  = $side . ':' . max( 0, min( 400, (int) $s['float_x'] ) ) . 'px;bottom:' . max( 0, min( 400, (int) $s['float_y'] ) ) . 'px';
	echo '<div class="mbbj-k-float mbbj-k-float--' . $side . ( $s['float_hide_mobile'] ? ' is-hide-mobile' : '' ) . '" style="' . esc_attr( $pos ) . '">' . mbbj_knopf_html() . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput -- in mbbj_knopf_html escaped
}, 5 );

add_shortcode( 'mediabees_arcade', 'mbbj_render' );
add_shortcode( 'mediabees_bugjagd', 'mbbj_render' ); // alter Name aus Version 1

/**
 * Shortcode [mediabees_arcade]
 * spiel="polonaise" Dieses Spiel ist beim Laden ausgewählt (bugjagd = Käfer-Jagd, wespen = Bienenstich, revier = Revierflug, polonaise = Bienentanz, flitzer = A40-Flitzer, abriss = Website-Abriss, nester = Wespennest, wacht = Wespen-Invasion, pfad = Pollenrausch, wabenbau = Wabenbau, solitaer = Bienen-Solitär, hopser = Hummelhopser, honigdieb = Honigdieb, knaller = Bienenboom, flipper = Honigflipper, wurf = Haldenduell, blitz = Bienen-Blitz, wimmel = Wimmelpott).
 */
function mbbj_render( $atts = array() ) {
	// "intro" wird seit 2.7.0 ignoriert (kein 404-Kopf mehr), bleibt aber erlaubt, damit alte Shortcodes nicht brechen.
	$atts = shortcode_atts( array( 'intro' => '', 'spiel' => '' ), is_array( $atts ) ? $atts : array(), 'mediabees_arcade' );
	$mbbj_start = sanitize_key( (string) $atts['spiel'] );
	if ( ! isset( mbbj_games()[ $mbbj_start ] ) ) {
		$mbbj_start = '';
	}
	wp_enqueue_style( 'mbbj' );
	wp_enqueue_script( 'mbbj' );
	ob_start();
	include __DIR__ . '/templates/markup.php';
	return ob_get_clean();
}

/*
 * 404-Seite übernehmen. Header und Footer kommen weiter aus Elementor.
 * Legt ihr später eine Elementor-404-Vorlage an, wird die stattdessen gezeigt.
 */
add_filter( 'template_include', function ( $template ) {
	if ( is_404() && apply_filters( 'mbbj_take_over_404', true ) ) {
		return __DIR__ . '/templates/404.php';
	}
	return $template;
}, 99 );

/* ------------------------------------------------------------------ *
 * Rangliste: Speicher (nur Top 10 je Spiel)
 * ------------------------------------------------------------------ */

function mbbj_option( $game ) {
	return 'mbbj_top_' . $game;
}

function mbbj_get_top( $game ) {
	$list = get_option( mbbj_option( $game ), array() );
	return is_array( $list ) ? $list : array();
}

function mbbj_sort( $list ) {
	usort( $list, function ( $a, $b ) {
		if ( (int) $a['score'] === (int) $b['score'] ) {
			return (int) $a['time'] - (int) $b['time']; // Bei Gleichstand gewinnt, wer zuerst da war.
		}
		return (int) $b['score'] - (int) $a['score'];
	} );
	return $list;
}

// Speichert nur die Top 10. Alles, was rausfällt, ist damit gelöscht.
function mbbj_save_top( $game, $list ) {
	$list = array_values( array_slice( mbbj_sort( $list ), 0, MBBJ_TOP ) );
	update_option( mbbj_option( $game ), $list, false );
	return $list;
}

// Kurze Sperre, damit sich gleichzeitige Einträge nicht gegenseitig überschreiben.
function mbbj_lock( $game ) {
	global $wpdb;
	$key = 'mbbj_lock_' . $game;
	for ( $i = 0; $i < 40; $i++ ) {
		$ok = $wpdb->query( $wpdb->prepare( "INSERT IGNORE INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, %s, 'no')", $key, (string) time() ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		if ( 1 === (int) $ok ) {
			return true;
		}
		$since = (int) $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $key ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		if ( $since && time() - $since > 5 ) {
			mbbj_unlock( $game );
			continue;
		}
		usleep( 50000 );
	}
	return false;
}

// Ticket genau einmal einlösen. INSERT IGNORE ist atomar: Kommen zwei Anfragen gleichzeitig, gewinnt nur eine.
function mbbj_claim_ticket( $sig ) {
	global $wpdb;
	$ok = $wpdb->query( $wpdb->prepare( "INSERT IGNORE INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, %s, 'no')", 'mbbj_used_' . md5( $sig ), (string) time() ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	// Ab und zu alte Marken wegräumen (Tickets gelten ohnehin nur 30 Minuten).
	if ( 1 === wp_rand( 1, 50 ) ) {
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s AND CAST(option_value AS UNSIGNED) < %d", $wpdb->esc_like( 'mbbj_used_' ) . '%', time() - 2 * HOUR_IN_SECONDS ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	}
	return 1 === (int) $ok;
}

function mbbj_unlock( $game ) {
	global $wpdb;
	$wpdb->delete( $wpdb->options, array( 'option_name' => 'mbbj_lock_' . $game ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
}

function mbbj_public_top( $game ) {
	$out = array();
	foreach ( mbbj_sort( mbbj_get_top( $game ) ) as $e ) {
		$out[] = array(
			'id'    => (string) $e['id'],
			'name'  => (string) $e['name'],
			'score' => (int) $e['score'],
		);
	}
	return $out;
}

// Update von Version 1: alte Bug-Jagd-Liste übernehmen (nur die Top 10).
add_action( 'init', function () {
	if ( get_option( 'mbbj_version' ) === MBBJ_VERSION ) {
		return;
	}
	$old = get_option( 'mbbj_scores', null );
	if ( is_array( $old ) ) {
		mbbj_save_top( 'bugjagd', array_merge( mbbj_get_top( 'bugjagd' ), $old ) );
		delete_option( 'mbbj_scores' );
	}
	update_option( 'mbbj_version', MBBJ_VERSION );
} );

/* ------------------------------------------------------------------ *
 * Rangliste: Schutz vor Spam
 * ------------------------------------------------------------------ */

// Die IP wird nie gespeichert, nur gehasht (täglich wechselnd) als kurzlebiger Zähler.
function mbbj_ip_hash() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	// IPv6: Ein Anschluss hat viele Adressen (/64). Damit man das Limit nicht durch Adresswechsel umgeht, zählt der ganze Block.
	$bin = false !== strpos( $ip, ':' ) ? @inet_pton( $ip ) : false; // phpcs:ignore WordPress.PHP.NoSilencedErrors
	if ( $bin && 16 === strlen( $bin ) ) {
		$ip = bin2hex( substr( $bin, 0, 8 ) ) . '::/64';
	}
	return substr( hash_hmac( 'sha256', $ip . gmdate( 'Y-m-d' ), wp_salt( 'nonce' ) ), 0, 20 );
}

function mbbj_rate_ok( $bucket, $limit, $window ) {
	$key = 'mbbj_rl_' . $bucket . '_' . mbbj_ip_hash();
	$n   = (int) get_transient( $key );
	if ( $n >= $limit ) {
		return false;
	}
	set_transient( $key, $n + 1, $window );
	return true;
}

function mbbj_sign( $payload ) {
	return hash_hmac( 'sha256', $payload, wp_salt( 'auth' ) . '|mbbj' );
}

function mbbj_blocklist() {
	$words = array(
		'arsch', 'fick', 'fotze', 'hure', 'nutte', 'schlampe', 'wichs', 'penis', 'vagina', 'muschi',
		'porn', 'nazi', 'hitler', 'adolf', 'neger', 'nigg', 'schwuchtel', 'spast', 'behindert', 'kanake',
		'fuck', 'shit', 'bitch', 'cunt', 'pussy', 'whore', 'http', 'www', 'casino', 'viagra', 'bitcoin',
		'crypto', 'telegram', 'onlyfans', 'siegheil',
	);
	return apply_filters( 'mbbj_blocklist', $words );
}

function mbbj_clean_name( $raw ) {
	$name = trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( (string) $raw ) ) );
	$len  = function_exists( 'mb_strlen' ) ? mb_strlen( $name ) : strlen( $name );
	if ( $len < 2 || $len > 16 ) {
		return new WP_Error( 'mbbj_name', 'Der Name braucht 2 bis 16 Zeichen.' );
	}
	if ( ! preg_match( '/^[\p{L}\p{N} _\-!]+$/u', $name ) ) {
		return new WP_Error( 'mbbj_name', 'Bitte nur Buchstaben, Zahlen, Leerzeichen und - _ ! verwenden.' );
	}
	$flat = function_exists( 'mb_strtolower' ) ? mb_strtolower( $name ) : strtolower( $name );
	if ( preg_match( '/88|18/', $flat ) && preg_match( '/hh|ss|ah|^88$|^18$/', $flat ) ) {
		return new WP_Error( 'mbbj_name', 'Such dir bitte einen anderen Namen aus.' );
	}
	$flat = remove_accents( $flat );
	$flat = strtr( $flat, array( '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '7' => 't', '!' => 'i' ) );
	$flat = preg_replace( '/[^a-z]/', '', $flat );
	foreach ( mbbj_blocklist() as $w ) {
		if ( preg_match( '/^[a-z]+$/', $w ) && false !== strpos( $flat, $w ) ) {
			return new WP_Error( 'mbbj_name', 'Such dir bitte einen anderen Namen aus.' );
		}
	}
	return $name;
}

/* ------------------------------------------------------------------ *
 * Rangliste: REST-Schnittstelle
 * ------------------------------------------------------------------ */

add_action( 'rest_api_init', function () {
	register_rest_route( 'mb-bugjagd/v1', '/start', array(
		'methods'             => 'POST',
		'callback'            => 'mbbj_rest_start',
		'permission_callback' => '__return_true',
	) );
	register_rest_route( 'mb-bugjagd/v1', '/score', array(
		'methods'             => 'POST',
		'callback'            => 'mbbj_rest_score',
		'permission_callback' => '__return_true',
	) );
	register_rest_route( 'mb-bugjagd/v1', '/top', array(
		'methods'             => 'GET',
		'callback'            => 'mbbj_rest_top',
		'permission_callback' => '__return_true',
	) );
} );

function mbbj_response( $data, $status = 200 ) {
	$r = new WP_REST_Response( $data, $status );
	$r->header( 'Cache-Control', 'no-store, max-age=0' );
	return $r;
}

function mbbj_fail( $message, $status = 400 ) {
	return mbbj_response( array( 'ok' => false, 'message' => $message ), $status );
}

// Ohne Angabe: Bug-Jagd (so funktionieren auch noch gecachte Seiten von Version 1).
function mbbj_req_game( $req ) {
	$g = $req->get_param( 'game' );
	if ( null === $g || '' === $g ) {
		return 'bugjagd';
	}
	$g     = sanitize_key( (string) $g );
	$games = mbbj_games();
	return isset( $games[ $g ] ) ? $g : '';
}

// Jede Runde holt sich beim Start ein signiertes Ticket mit Zeitstempel und Spiel.
function mbbj_rest_start( WP_REST_Request $req ) {
	$game = mbbj_req_game( $req );
	if ( ! $game ) {
		return mbbj_fail( 'Unbekanntes Spiel.' );
	}
	if ( ! mbbj_rate_ok( 't', 600, HOUR_IN_SECONDS ) ) {
		return mbbj_fail( 'Ganz schön viele Runden gerade! Gönn dir eine kurze Pause und spiel gleich weiter.', 429 );
	}
	$payload = time() . '.' . wp_generate_password( 12, false ) . '.' . $game;
	return mbbj_response( array( 'ok' => true, 'token' => $payload . '.' . mbbj_sign( $payload ) ) );
}

function mbbj_rest_score( WP_REST_Request $req ) {
	foreach ( array( 'game', 'token', 'name', 'website', 'score' ) as $field ) {
		$v = $req->get_param( $field );
		if ( is_array( $v ) || is_object( $v ) ) {
			return mbbj_fail( 'Eintrag abgelehnt.' );
		}
	}
	// Honeypot: Menschen sehen das Feld nicht.
	if ( '' !== trim( (string) $req->get_param( 'website' ) ) ) {
		return mbbj_fail( 'Eintrag abgelehnt.' );
	}

	$game = mbbj_req_game( $req );
	if ( ! $game ) {
		return mbbj_fail( 'Unbekanntes Spiel.' );
	}
	$games = mbbj_games();
	$conf  = $games[ $game ];

	$parts = explode( '.', (string) $req->get_param( 'token' ) );
	$sig   = (string) array_pop( $parts );
	if ( ( 2 !== count( $parts ) && 3 !== count( $parts ) ) || ! hash_equals( mbbj_sign( implode( '.', $parts ) ), $sig ) ) {
		return mbbj_fail( 'Diese Runde ist nicht gültig. Spiel einfach nochmal.' );
	}
	$token_game = isset( $parts[2] ) ? $parts[2] : 'bugjagd';
	if ( $token_game !== $game ) {
		return mbbj_fail( 'Diese Runde ist nicht gültig. Spiel einfach nochmal.' );
	}

	$score = $req->get_param( 'score' );
	if ( ! is_numeric( $score ) || (int) $score != $score ) { // phpcs:ignore
		return mbbj_fail( 'Punktzahl ungültig.' );
	}
	$score = (int) $score;
	if ( $score < 1 || $score > $conf['max_score'] ) {
		return mbbj_fail( 'Punktzahl ungültig.' );
	}

	$age = time() - (int) $parts[0];
	if ( $age < $conf['min_age'] || ( $conf['sec_per_point'] && $age < $score * $conf['sec_per_point'] ) ) {
		return mbbj_fail( 'Das ging aber schnell. Eintrag abgelehnt.' );
	}
	if ( $age > 30 * MINUTE_IN_SECONDS ) {
		return mbbj_fail( 'Die Runde ist zu lange her. Spiel nochmal und trag dich direkt danach ein.' );
	}
	$used_key = 'mbbj_used_' . md5( $sig );
	if ( get_transient( $used_key ) ) {
		return mbbj_fail( 'Für diese Runde gibt es schon einen Eintrag.' );
	}

	$name = mbbj_clean_name( $req->get_param( 'name' ) );
	if ( is_wp_error( $name ) ) {
		return mbbj_fail( $name->get_error_message() );
	}

	// Großzügig, weil sich im Büro oder WLAN viele einen Anschluss teilen.
	// Der eigentliche Schutz ist das Ticket: Jeder Eintrag braucht eine echte Runde.
	if ( ! mbbj_rate_ok( 's', 30, 15 * MINUTE_IN_SECONDS ) ) {
		return mbbj_fail( 'Wow, heute ist hier richtig was los! Gönn dir eine kurze Pause, in ein paar Minuten kannst du dich wieder eintragen.', 429 );
	}
	$day_key = 'mbbj_day_' . gmdate( 'Ymd' );
	$day     = (int) get_transient( $day_key );
	if ( $day >= 1000 ) {
		return mbbj_fail( 'So viele Rekorde an einem Tag! Die Rangliste ruht sich kurz aus, morgen geht es weiter.', 429 );
	}
	if ( ! mbbj_claim_ticket( $sig ) ) {
		return mbbj_fail( 'Für diese Runde gibt es schon einen Eintrag.' );
	}
	set_transient( $day_key, $day + 1, DAY_IN_SECONDS );
	set_transient( $used_key, 1, HOUR_IN_SECONDS );

	$entry = array(
		'id'    => wp_generate_password( 10, false ),
		'name'  => $name,
		'score' => $score,
		'time'  => time(),
	);
	$locked = mbbj_lock( $game );
	wp_cache_delete( mbbj_option( $game ), 'options' );
	$list   = mbbj_get_top( $game );
	$list[] = $entry;
	$list   = mbbj_save_top( $game, $list );
	if ( $locked ) {
		mbbj_unlock( $game );
	}

	$rank = 0;
	foreach ( $list as $i => $e ) {
		if ( $e['id'] === $entry['id'] ) {
			$rank = $i + 1;
			break;
		}
	}

	return mbbj_response( array(
		'ok'      => true,
		'id'      => $rank ? $entry['id'] : '',
		'rank'    => $rank,
		'message' => $rank ? '' : 'Knapp vorbei, die Top 10 haben sich gerade geändert.',
		'top'     => mbbj_public_top( $game ),
	) );
}

function mbbj_rest_top( WP_REST_Request $req ) {
	$game = mbbj_req_game( $req );
	if ( ! $game ) {
		return mbbj_fail( 'Unbekanntes Spiel.' );
	}
	return mbbj_response( array( 'ok' => true, 'top' => mbbj_public_top( $game ) ) );
}

/* ------------------------------------------------------------------ *
 * Datenschutz: Textvorschlag im WordPress-Datenschutz-Leitfaden
 * (Einstellungen > Datenschutz > Leitfaden)
 * ------------------------------------------------------------------ */

function mbbj_privacy_text() {
	return '<h2>Spiele auf unserer Fehlerseite (Rangliste)</h2>'
		. '<p>Auf unserer 404-Fehlerseite kannst du kleine Browserspiele spielen. Die Spiele laufen in deinem Browser. Dafür werden keine Cookies gesetzt und keine Daten auf deinem Gerät gespeichert.</p>'
		. '<p>Wenn du nach einer Runde freiwillig einen Namen in die Rangliste einträgst, speichern wir diesen Namen zusammen mit Spiel, Punktzahl und Zeitpunkt und zeigen ihn öffentlich an. Bitte verwende dafür einen Spitznamen und nicht deinen echten Namen. Einen eingetragenen Namen kannst du nachträglich nicht selbst ändern oder löschen. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du jederzeit widerrufen kannst. Schreib uns dafür einfach eine Nachricht, dann löschen wir deinen Eintrag. Gespeichert werden nur die zehn besten Einträge je Spiel. Fällt ein Eintrag aus den Top 10, wird er sofort gelöscht.</p>'
		. '<p>Zum Schutz vor automatisierten Masseneinträgen verarbeiten wir beim Spielen kurzzeitig einen gehashten, täglich wechselnden Wert deiner IP-Adresse. Er wird nach spätestens einer Stunde ungültig, danach automatisch gelöscht und nie mit deinem Ranglisten-Eintrag verknüpft. Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).</p>';
}

add_action( 'admin_init', function () {
	if ( function_exists( 'wp_add_privacy_policy_content' ) ) {
		wp_add_privacy_policy_content( 'MediaBees Arcade (404-Spiele)', wp_kses_post( mbbj_privacy_text() ) );
	}
} );

/* ------------------------------------------------------------------ *
 * Backend: Werkzeuge > Arcade-Rangliste
 * ------------------------------------------------------------------ */

add_action( 'admin_menu', function () {
	add_management_page( 'Arcade-Rangliste', 'Arcade-Rangliste', 'manage_options', 'mbbj', 'mbbj_admin_page' );
} );

add_action( 'admin_init', function () {
	if ( empty( $_POST['mbbj_action'] ) || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	check_admin_referer( 'mbbj_admin' );
	$action = sanitize_key( wp_unslash( $_POST['mbbj_action'] ) );
	if ( 'teaser' === $action ) {
		$place = isset( $_POST['mbbj_place'] ) ? sanitize_key( wp_unslash( $_POST['mbbj_place'] ) ) : 'footer';
		$style = isset( $_POST['mbbj_style'] ) ? sanitize_key( wp_unslash( $_POST['mbbj_style'] ) ) : 'notaus';
		$url   = isset( $_POST['mbbj_url'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['mbbj_url'] ) ) ) : '';
		$col   = function ( $key, $def ) {
			$v = isset( $_POST[ $key ] ) ? sanitize_hex_color( wp_unslash( $_POST[ $key ] ) ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			return $v ? strtoupper( $v ) : $def;
		};
		$num   = function ( $key, $min, $max, $def ) {
			$v = isset( $_POST[ $key ] ) ? (int) $_POST[ $key ] : $def; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			return max( $min, min( $max, $v ) );
		};
		update_option( 'mbbj_teaser', array(
			'button'    => empty( $_POST['mbbj_button'] ) ? 0 : 1,
			'bee'       => empty( $_POST['mbbj_bee'] ) ? 0 : 1,
			'url'       => '' === $url ? '/spielhalle/' : $url,
			'place'     => in_array( $place, array( 'footer', 'left', 'right' ), true ) ? $place : 'footer',
			'style'     => isset( mbbj_knopf_styles()[ $style ] ) ? $style : 'notaus',
			'bee_first' => $num( 'mbbj_bee_first', 3, 3600, 40 ),
			'bee_every' => $num( 'mbbj_bee_every', 10, 3600, 120 ),
			'bee_max'   => $num( 'mbbj_bee_max', 1, 20, 2 ),
			'k_text_mode' => in_array( $tm = ( isset( $_POST['mbbj_k_text_mode'] ) ? sanitize_key( wp_unslash( $_POST['mbbj_k_text_mode'] ) ) : 'std' ), array( 'std', 'custom', 'none' ), true ) ? $tm : 'std',
			'k_text'      => isset( $_POST['mbbj_k_text'] ) ? mb_substr( sanitize_text_field( wp_unslash( $_POST['mbbj_k_text'] ) ), 0, 28 ) : '',
			'k_size'      => in_array( $sz = ( isset( $_POST['mbbj_k_size'] ) ? sanitize_key( wp_unslash( $_POST['mbbj_k_size'] ) ) : 'm' ), array( 's', 'm', 'l' ), true ) ? $sz : 'm',
			'k_colors'    => empty( $_POST['mbbj_k_colors'] ) ? 0 : 1,
			'k_cap'       => $col( 'mbbj_k_cap', '#E5322D' ),
			'k_tagbg'     => $col( 'mbbj_k_tagbg', '#1A1A1A' ),
			'k_tagfg'     => $col( 'mbbj_k_tagfg', '#FDC506' ),
			'k_accent'    => $col( 'mbbj_k_accent', '#FDC506' ),
			'float_x'     => $num( 'mbbj_float_x', 0, 400, 14 ),
			'float_y'     => $num( 'mbbj_float_y', 0, 400, 14 ),
			'float_hide_mobile' => empty( $_POST['mbbj_float_hide_mobile'] ) ? 0 : 1,
			'admin_theme' => in_array( $th = ( isset( $_POST['mbbj_admin_theme'] ) ? sanitize_key( wp_unslash( $_POST['mbbj_admin_theme'] ) ) : 'auto' ), array( 'auto', 'light', 'dark' ), true ) ? $th : 'auto',
			'exclude'   => isset( $_POST['mbbj_exclude'] ) ? sanitize_textarea_field( wp_unslash( $_POST['mbbj_exclude'] ) ) : '',
		), true );
		wp_safe_redirect( admin_url( 'options-general.php?page=mbbj-settings&done=1' ) );
		exit;
	}
	$game   = isset( $_POST['mbbj_game'] ) ? sanitize_key( wp_unslash( $_POST['mbbj_game'] ) ) : '';
	$games  = mbbj_games();
	if ( isset( $games[ $game ] ) ) {
		if ( 'delete' === $action && ! empty( $_POST['mbbj_id'] ) ) {
			$id = sanitize_text_field( wp_unslash( $_POST['mbbj_id'] ) );
			mbbj_save_top( $game, array_filter( mbbj_get_top( $game ), function ( $e ) use ( $id ) {
				return $e['id'] !== $id;
			} ) );
		} elseif ( 'clear' === $action ) {
			mbbj_save_top( $game, array() );
		}
	}
	wp_safe_redirect( admin_url( 'tools.php?page=mbbj&done=1' ) );
	exit;
} );

function mbbj_admin_page() {
	?>
	<div class="wrap">
		<h1>Arcade-Rangliste</h1>
		<p>Pro Spiel werden nur die Top 10 gespeichert. Wer rausfällt, wird automatisch gelöscht. Unpassende Namen oder Einträge, deren Löschung jemand verlangt, kannst du hier entfernen.</p>
		<p>Den Textvorschlag für die Datenschutzerklärung findest du unter <a href="<?php echo esc_url( admin_url( 'options-privacy.php?tab=policyguide' ) ); ?>">Einstellungen &gt; Datenschutz &gt; Leitfaden</a>.</p>
		<?php if ( isset( $_GET['done'] ) ) : // phpcs:ignore ?>
			<div class="notice notice-success is-dismissible"><p>Erledigt.</p></div>
		<?php endif; ?>
		<p>Knopf „Nicht drücken!“ und fliegende Biene stellst du unter <a href="<?php echo esc_url( admin_url( 'options-general.php?page=mbbj-settings' ) ); ?>">Einstellungen &gt; Spielhalle</a> ein.</p>
		<h2 style="margin-top:28px">Ranglisten</h2>
		<?php foreach ( mbbj_games() as $gid => $conf ) : ?>
			<?php $list = mbbj_sort( mbbj_get_top( $gid ) ); ?>
			<h2 style="margin-top:28px"><?php echo esc_html( $conf['title'] ); ?></h2>
			<table class="widefat striped" style="max-width:720px">
				<thead><tr><th style="width:60px">Platz</th><th>Name</th><th style="width:90px">Punkte</th><th style="width:160px">Datum</th><th style="width:90px"></th></tr></thead>
				<tbody>
				<?php if ( ! $list ) : ?>
					<tr><td colspan="5">Noch keine Einträge.</td></tr>
				<?php endif; ?>
				<?php foreach ( $list as $i => $e ) : ?>
					<tr>
						<td><?php echo (int) $i + 1; ?></td>
						<td><?php echo esc_html( $e['name'] ); ?></td>
						<td><?php echo esc_html( number_format_i18n( (int) $e['score'] ) ); ?></td>
						<td><?php echo esc_html( wp_date( 'd.m.Y H:i', (int) $e['time'] ) ); ?></td>
						<td>
							<form method="post">
								<?php wp_nonce_field( 'mbbj_admin' ); ?>
								<input type="hidden" name="mbbj_action" value="delete">
								<input type="hidden" name="mbbj_game" value="<?php echo esc_attr( $gid ); ?>">
								<input type="hidden" name="mbbj_id" value="<?php echo esc_attr( $e['id'] ); ?>">
								<button class="button button-small" type="submit">Löschen</button>
							</form>
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
			<?php if ( $list ) : ?>
				<form method="post" style="margin-top:10px" onsubmit="return confirm('Wirklich alle Einträge von <?php echo esc_attr( $conf['title'] ); ?> löschen?');">
					<?php wp_nonce_field( 'mbbj_admin' ); ?>
					<input type="hidden" name="mbbj_action" value="clear">
					<input type="hidden" name="mbbj_game" value="<?php echo esc_attr( $gid ); ?>">
					<button class="button" type="submit">Rangliste <?php echo esc_html( $conf['title'] ); ?> leeren</button>
				</form>
			<?php endif; ?>
		<?php endforeach; ?>
	</div>
	<?php
}

/* Elementor-Widget „Spielhallen-Knopf“ (nur wenn Elementor aktiv ist), in einer eigenen Gruppe „MediaBees“ ganz oben */
add_action( 'elementor/elements/categories_registered', function ( $elements_manager ) {
	$elements_manager->add_category( 'mediabees', array( 'title' => 'MediaBees', 'icon' => 'eicon-gamepad' ) );
} );
add_action( 'elementor/widgets/register', function ( $widgets_manager ) {
	require_once __DIR__ . '/includes/elementor-knopf.php';
	$widgets_manager->register( new MBBJ_Elementor_Knopf() );
} );
// Ältere Elementor-Versionen (vor 3.5) kennen nur diesen Weg
add_action( 'elementor/widgets/widgets_registered', function ( $widgets_manager ) {
	if ( defined( 'ELEMENTOR_VERSION' ) && version_compare( ELEMENTOR_VERSION, '3.5.0', '>=' ) ) {
		return;
	}
	require_once __DIR__ . '/includes/elementor-knopf.php';
	$widgets_manager->register_widget_type( new MBBJ_Elementor_Knopf() );
} );

/* ------------------------------------------------------------------ *
 * Backend: Einstellungen > Spielhalle
 * ------------------------------------------------------------------ */

add_action( 'admin_menu', function () {
	add_options_page( 'Spielhalle', 'Spielhalle', 'manage_options', 'mbbj-settings', 'mbbj_settings_page' );
} );

// Link „Einstellungen“ direkt in der Plugin-Liste
add_filter( 'plugin_action_links_' . plugin_basename( MBBJ_FILE ), function ( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=mbbj-settings' ) ) . '">Einstellungen</a>' );
	return $links;
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( 'settings_page_mbbj-settings' !== $hook ) {
		return;
	}
	wp_enqueue_style( 'mbbj-admin', plugins_url( 'assets/admin.css', MBBJ_FILE ), array(), MBBJ_VERSION );
	// Das Knopf-CSS direkt in die Seite schreiben statt als eigene Datei: auf der Live-Seite kam teaser.css im Backend nicht an (Vorschau leer).
	$knopf_css = file_get_contents( __DIR__ . '/assets/teaser.css' ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	if ( $knopf_css ) {
		wp_add_inline_style( 'mbbj-admin', $knopf_css );
	}
	wp_enqueue_script( 'mbbj-teaser', plugins_url( 'assets/teaser.js', MBBJ_FILE ), array(), MBBJ_VERSION, true );
	wp_enqueue_script( 'mbbj-admin', plugins_url( 'assets/admin.js', MBBJ_FILE ), array( 'mbbj-teaser' ), MBBJ_VERSION, true );
} );

/* Dunkles Design der Einstellungsseite: Klasse am <body>, damit auch der Hintergrund von WordPress mitzieht */
add_filter( 'admin_body_class', function ( $classes ) {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( $screen && 'settings_page_mbbj-settings' === $screen->id ) {
		$classes .= ' mbbj-theme-' . sanitize_html_class( mbbj_teaser_settings()['admin_theme'] );
	}
	return $classes;
} );

/* Kleiner Kopier-Chip für Shortcodes */
function mbbj_copy_chip( $code ) {
	return '<button type="button" class="mbbj-chip" data-copy="' . esc_attr( $code ) . '"><code>' . esc_html( $code ) . '</code><span class="mbbj-chip-hint">Kopieren</span></button>';
}

function mbbj_settings_page() {
	$games   = mbbj_games();
	$t       = mbbj_teaser_settings();
	$url     = mbbj_teaser_url();
	$page_id = url_to_postid( $url );
	$places  = array(
		'footer' => array( 'Im Footer', 'Sitzt fest im Footer deiner Website. Empfohlen.' ),
		'left'   => array( 'Schwebend links', 'Klebt unten links am Bildschirmrand.' ),
		'right'  => array( 'Schwebend rechts', 'Klebt unten rechts am Bildschirmrand.' ),
	);
	$descs   = array(
		'notaus' => 'Gelb-schwarzer Warnkasten. Passt zur Hausfarbe.',
		'klappe' => 'Plastikklappe geht beim Drüberfahren auf.',
		'arcade' => 'Runder Knopf mit Chromring wie am Automaten.',
	);
	?>
	<div class="wrap mbbj-admin">
		<h1 class="screen-reader-text">MediaBees Spielhalle</h1>

		<header class="mbbj-hero">
			<div class="mbbj-hero-text">
				<span class="mbbj-badge">Version <?php echo esc_html( MBBJ_VERSION ); ?></span>
				<h2>MediaBees <span>Spielhalle</span></h2>
				<p><?php echo (int) count( $games ); ?> Browserspiele im MediaBees-Look, jedes mit eigener Top-10-Rangliste wie am Automaten. Ohne Cookies, ohne Speicher auf dem Gerät, ohne externe Dienste.</p>
				<div class="mbbj-hero-links">
					<a class="mbbj-btn mbbj-btn--yellow" href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener">Spielhalle öffnen ↗</a>
					<a class="mbbj-btn mbbj-btn--ghost" href="<?php echo esc_url( admin_url( 'tools.php?page=mbbj' ) ); ?>">Ranglisten verwalten</a>
					<a class="mbbj-btn mbbj-btn--ghost" href="<?php echo esc_url( admin_url( 'options-privacy.php?tab=policyguide' ) ); ?>">Text für Datenschutz</a>
				</div>
			</div>
			<div class="mbbj-hero-art" aria-hidden="true"><div class="mbbj-hero-bee" data-bee></div></div>
			<div class="mbbj-theme" role="radiogroup" aria-label="Darstellung dieser Seite">
				<?php foreach ( array( 'light' => '☀ Hell', 'auto' => 'Auto', 'dark' => '☾ Dunkel' ) as $k => $lbl ) : ?>
					<label><input type="radio" form="mbbj-form" name="mbbj_admin_theme" value="<?php echo esc_attr( $k ); ?>" <?php checked( $k, $t['admin_theme'] ); ?>><span><?php echo esc_html( $lbl ); ?></span></label>
				<?php endforeach; ?>
			</div>
		</header>

		<?php if ( isset( $_GET['done'] ) ) : // phpcs:ignore ?>
			<div class="mbbj-toast">✓ Gespeichert. Änderungen sind sofort auf der Website (Cache ggf. leeren).</div>
		<?php endif; ?>

		<section class="mbbj-card">
			<h2>So richtest du es ein</h2>
			<ol class="mbbj-steps">
				<li class="<?php echo $page_id ? 'is-done' : ''; ?>">
					<strong>Seite für die Spielhalle</strong>
					<?php if ( $page_id ) : ?>
						<p>Gefunden: <a href="<?php echo esc_url( get_edit_post_link( $page_id ) ); ?>"><?php echo esc_html( get_the_title( $page_id ) ); ?></a> unter <code><?php echo esc_html( mbbj_teaser_path( $url ) ); ?>/</code>. Darauf muss das Shortcode-Widget mit diesem Code stehen:</p>
					<?php else : ?>
						<p class="mbbj-warn">Unter <code><?php echo esc_html( mbbj_teaser_path( $url ) ); ?>/</code> gibt es noch keine Seite. Bis dahin landen Besucher auf der 404, dort ist die Spielhalle auch. <a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=page' ) ); ?>">Neue Seite anlegen</a>, Titel „Spielhalle“, und mit Elementor ein Shortcode-Widget mit diesem Code einsetzen:</p>
					<?php endif; ?>
					<?php echo mbbj_copy_chip( '[mediabees_arcade]' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</li>
				<li>
					<strong>Knopf in den Footer</strong>
					<p>Elementor → Templates → Theme Builder → Footer bearbeiten → Widget „Shortcode“ an die gewünschte Stelle ziehen und einfügen:</p>
					<?php echo mbbj_copy_chip( '[mediabees_knopf]' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</li>
				<li>
					<strong>Aussehen und Biene einstellen</strong>
					<p>Unten auswählen und speichern. Fertig.</p>
				</li>
			</ol>
		</section>

		<form method="post" class="mbbj-form" id="mbbj-form">
			<?php wp_nonce_field( 'mbbj_admin' ); ?>
			<input type="hidden" name="mbbj_action" value="teaser">

			<section class="mbbj-card">
				<div class="mbbj-card-head">
					<div><h2>Roter Knopf</h2><p>Lockt Neugierige in die Spielhalle. Wer drückt, sieht kurz „STRENG GEHEIM!“.</p></div>
					<label class="mbbj-switch"><input type="checkbox" name="mbbj_button" value="1" <?php checked( $t['button'] ); ?>><span></span><em>Knopf zeigen</em></label>
				</div>

				<h3>Aussehen</h3>
				<div class="mbbj-choices mbbj-choices--3">
					<?php foreach ( mbbj_knopf_styles() as $k => $name ) : ?>
						<label class="mbbj-choice">
							<input type="radio" name="mbbj_style" value="<?php echo esc_attr( $k ); ?>" <?php checked( $k, $t['style'] ); ?>>
							<span class="mbbj-choice-box">
								<span class="mbbj-preview"><?php echo mbbj_knopf_html( $k, 'is-preview' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
								<strong><?php echo esc_html( $name ); ?></strong>
								<small><?php echo esc_html( $descs[ $k ] ); ?></small>
							</span>
						</label>
					<?php endforeach; ?>
				</div>

				<h3>Anpassen</h3>
				<div class="mbbj-custom">
					<div class="mbbj-field">
						<span class="mbbj-label">Beschriftung</span>
						<div class="mbbj-seg">
							<?php foreach ( array( 'std' => 'Standard', 'custom' => 'Eigener Text', 'none' => 'Ohne Text' ) as $k => $lbl ) : ?>
								<label><input type="radio" name="mbbj_k_text_mode" value="<?php echo esc_attr( $k ); ?>" <?php checked( $k, $t['k_text_mode'] ); ?>><span><?php echo esc_html( $lbl ); ?></span></label>
							<?php endforeach; ?>
						</div>
						<div class="mbbj-textwrap" data-show-if="custom">
							<input type="text" class="mbbj-input" name="mbbj_k_text" maxlength="28" value="<?php echo esc_attr( $t['k_text'] ); ?>" placeholder="z. B. Bloß nicht anfassen!">
							<p class="mbbj-help">Höchstens 28 Zeichen. Ideen: „Finger weg!“, „Geheim!“, „Nur für Profis“, „Pause?“</p>
						</div>
					</div>
					<div class="mbbj-field">
						<span class="mbbj-label">Größe</span>
						<div class="mbbj-seg">
							<?php foreach ( array( 's' => 'Klein', 'm' => 'Normal', 'l' => 'Groß' ) as $k => $lbl ) : ?>
								<label><input type="radio" name="mbbj_k_size" value="<?php echo esc_attr( $k ); ?>" <?php checked( $k, $t['k_size'] ); ?>><span><?php echo esc_html( $lbl ); ?></span></label>
							<?php endforeach; ?>
						</div>
					</div>
					<div class="mbbj-field mbbj-field--wide">
						<label class="mbbj-switch"><input type="checkbox" name="mbbj_k_colors" value="1" <?php checked( $t['k_colors'] ); ?>><span></span><em>Eigene Farben</em></label>
						<div class="mbbj-colors" data-colors>
							<div class="mbbj-presets">
								<span class="mbbj-help">Schnell wählen:</span>
								<?php
								$mbbj_presets = array(
									'MediaBees' => array( '#E5322D', '#1A1A1A', '#FDC506', '#FDC506' ),
									'Feuerwehr' => array( '#E5322D', '#FFFFFF', '#C1121F', '#C1121F' ),
									'Giftgrün'  => array( '#2ECC40', '#0F1A10', '#7CFF8A', '#2ECC40' ),
									'Eisblau'   => array( '#1E88E5', '#0D1B2A', '#8FD3FF', '#1E88E5' ),
									'Pink'      => array( '#FF3E9E', '#1A0B14', '#FFB3DA', '#FF3E9E' ),
									'Schwarz-Weiß' => array( '#222222', '#FFFFFF', '#111111', '#111111' ),
								);
								foreach ( $mbbj_presets as $pn => $pc ) :
									?>
									<button type="button" class="mbbj-preset" data-preset="<?php echo esc_attr( implode( ',', $pc ) ); ?>" title="<?php echo esc_attr( $pn ); ?>"><i style="background:<?php echo esc_attr( $pc[0] ); ?>"></i><i style="background:<?php echo esc_attr( $pc[1] ); ?>"></i><i style="background:<?php echo esc_attr( $pc[2] ); ?>"></i><span><?php echo esc_html( $pn ); ?></span></button>
								<?php endforeach; ?>
							</div>
							<div class="mbbj-colorgrid">
								<?php foreach ( array( 'k_cap' => 'Knopf', 'k_tagbg' => 'Schild', 'k_tagfg' => 'Schrift', 'k_accent' => 'Akzent (Streifen, Rahmen)' ) as $k => $lbl ) : ?>
									<label class="mbbj-color"><input type="color" name="mbbj_<?php echo esc_attr( $k ); ?>" value="<?php echo esc_attr( strtolower( $t[ $k ] ) ); ?>"><span><strong><?php echo esc_html( $lbl ); ?></strong><code data-hex><?php echo esc_html( strtoupper( $t[ $k ] ) ); ?></code></span></label>
								<?php endforeach; ?>
							</div>
						</div>
					</div>
				</div>
				<div class="mbbj-bgtoggle"><span class="mbbj-help">Vorschau auf:</span> <button type="button" data-bg="dark" class="is-on">dunklem Footer</button><button type="button" data-bg="light">hellem Footer</button></div>

				<h3>Wo soll er sitzen?</h3>
				<div class="mbbj-choices mbbj-choices--3">
					<?php foreach ( $places as $k => $p ) : ?>
						<label class="mbbj-choice">
							<input type="radio" name="mbbj_place" value="<?php echo esc_attr( $k ); ?>" <?php checked( $k, $t['place'] ); ?>>
							<span class="mbbj-choice-box">
								<span class="mbbj-mock mbbj-mock--<?php echo esc_attr( $k ); ?>" aria-hidden="true"><i></i><b></b></span>
								<strong><?php echo esc_html( $p[0] ); ?></strong>
								<small><?php echo esc_html( $p[1] ); ?></small>
							</span>
						</label>
					<?php endforeach; ?>
				</div>
				<div class="mbbj-float-set" data-float-set>
					<div class="mbbj-num"><label for="mbbj_float_x">Abstand zum Rand</label><span><input type="number" id="mbbj_float_x" min="0" max="400" name="mbbj_float_x" value="<?php echo (int) $t['float_x']; ?>"> px</span></div>
					<div class="mbbj-num"><label for="mbbj_float_y">Abstand nach unten</label><span><input type="number" id="mbbj_float_y" min="0" max="400" name="mbbj_float_y" value="<?php echo (int) $t['float_y']; ?>"> px</span></div>
					<label class="mbbj-switch"><input type="checkbox" name="mbbj_float_hide_mobile" value="1" <?php checked( $t['float_hide_mobile'] ); ?>><span></span><em>Auf dem Handy ausblenden</em></label>
					<p class="mbbj-help">Nur für den schwebenden Knopf. Tipp: Den Abstand nach unten erhöhen, wenn er ein Chat-Fenster oder einen Cookie-Hinweis verdeckt.</p>
				</div>
				<div class="mbbj-elementor-hint">
					<?php if ( defined( 'ELEMENTOR_VERSION' ) ) : ?>
						<span class="mbbj-status is-ok">Elementor <?php echo esc_html( ELEMENTOR_VERSION ); ?> erkannt, Widget ist aktiv</span>
					<?php else : ?>
						<span class="mbbj-status is-bad">Elementor nicht gefunden, das Widget gibt es nur mit Elementor</span>
					<?php endif; ?>
					<strong>Ganz frei platzieren?</strong> In Elementor gibt es das Widget <b>„Spielhallen-Knopf“</b>: in der Widget-Liste ganz oben in der Gruppe <b>„MediaBees“</b> oder über die Suche („Knopf“, „Spielhalle“). Vorher die Elementor-Seite einmal neu laden. Dort stellst du Look, Text, Farben und Größe nur für diesen einen Knopf ein. Unter <b>Erweitert → Positionierung</b> kannst du ihn mit px oder % frei verschieben, für PC, Tablet und Handy getrennt.
				</div>
			</section>

			<section class="mbbj-card">
				<div class="mbbj-card-head">
					<div><h2>Fliegende Biene</h2><p>Fliegt ab und zu durchs Bild, bleibt kurz stehen und lädt zum Spielen ein.</p></div>
					<label class="mbbj-switch"><input type="checkbox" name="mbbj_bee" value="1" <?php checked( $t['bee'] ); ?>><span></span><em>Biene fliegen lassen</em></label>
				</div>
				<div class="mbbj-bee-row">
					<div class="mbbj-bee-stage" aria-hidden="true">
						<div class="mbbj-bubble-demo">Psst! Lust auf ein Spiel?</div>
						<div class="mbbj-bee-demo" data-bee></div>
					</div>
					<div class="mbbj-bee-set">
						<div class="mbbj-num"><label for="mbbj_bee_first">Erste Biene nach</label><span><input type="number" id="mbbj_bee_first" min="3" max="3600" name="mbbj_bee_first" value="<?php echo (int) $t['bee_first']; ?>"> Sekunden</span></div>
						<div class="mbbj-num"><label for="mbbj_bee_every">Danach alle</label><span><input type="number" id="mbbj_bee_every" min="10" max="3600" name="mbbj_bee_every" value="<?php echo (int) $t['bee_every']; ?>"> Sekunden</span></div>
						<div class="mbbj-num"><label for="mbbj_bee_max">Höchstens</label><span><input type="number" id="mbbj_bee_max" min="1" max="20" name="mbbj_bee_max" value="<?php echo (int) $t['bee_max']; ?>"> Bienen pro Seite</span></div>
						<p class="mbbj-summary" data-summary></p>
						<a class="mbbj-btn mbbj-btn--dark" href="<?php echo esc_url( add_query_arg( 'mbbj_biene', '1', home_url( '/' ) ) ); ?>" target="_blank" rel="noopener">Biene jetzt auf der Startseite ansehen ↗</a>
					</div>
				</div>
			</section>

			<section class="mbbj-card">
				<h2>Feinschliff</h2>
				<div class="mbbj-grid2">
					<div>
						<label class="mbbj-label" for="mbbj_url">Adresse der Spielhalle</label>
						<input type="text" id="mbbj_url" name="mbbj_url" class="mbbj-input" value="<?php echo esc_attr( $t['url'] ); ?>">
						<p class="mbbj-help">Hierhin führen Knopf und Biene. Normalerweise <code>/spielhalle/</code>.</p>
					</div>
					<div>
						<label class="mbbj-label" for="mbbj_exclude">Nicht auf diesen Seiten</label>
						<textarea id="mbbj_exclude" name="mbbj_exclude" rows="4" class="mbbj-input" placeholder="/kontakt/"><?php echo esc_textarea( $t['exclude'] ); ?></textarea>
						<p class="mbbj-help">Eine Adresse pro Zeile, z. B. <code>/kontakt/</code>. Unterseiten zählen mit. <code>/</code> allein = nur die Startseite.</p>
					</div>
				</div>
			</section>

			<div class="mbbj-savebar">
				<span>Änderungen gelten sofort für die ganze Website.</span>
				<button type="submit" class="mbbj-btn mbbj-btn--yellow mbbj-btn--big">Speichern</button>
			</div>
		</form>
	</div>
	<?php
}

// Beim Löschen des Plugins räumt uninstall.php alles auf.
