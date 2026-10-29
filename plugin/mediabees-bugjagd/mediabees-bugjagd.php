<?php
/**
 * Plugin Name: MediaBees Arcade (404)
 * Description: Spielhalle (Käfer-Jagd, Bienenstich, Revierflug, Bienentanz, A40-Flitzer) mit Top-10-Rangliste pro Spiel. Einbinden per Shortcode [mediabees_arcade], optional spiel="flitzer". Gibt es keine Elementor-404-Vorlage, zeigt die 404-Seite automatisch die Spielhalle.
 * Version: 2.7.0
 * Author: MediaBees
 * Author URI: https://mediabees.de
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: mediabees-bugjagd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MBBJ_VERSION', '2.7.0' );
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
	$mbbj_updates->getVcsApi()->enableReleaseAssets( '/mediabees-arcade-[0-9.]+\.zip/' );
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

add_shortcode( 'mediabees_arcade', 'mbbj_render' );
add_shortcode( 'mediabees_bugjagd', 'mbbj_render' ); // alter Name aus Version 1

/**
 * Shortcode [mediabees_arcade]
 * spiel="polonaise" Dieses Spiel ist beim Laden ausgewählt (bugjagd = Käfer-Jagd, wespen = Bienenstich, revier = Revierflug, polonaise = Bienentanz, flitzer = A40-Flitzer).
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
		. '<p>Wenn du nach einer Runde freiwillig einen Namen in die Rangliste einträgst, speichern wir diesen Namen zusammen mit Spiel, Punktzahl und Zeitpunkt und zeigen ihn öffentlich an. Bitte verwende dafür einen Spitznamen und nicht deinen echten Namen. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du jederzeit widerrufen kannst. Schreib uns dafür einfach eine Nachricht, dann löschen wir deinen Eintrag. Gespeichert werden nur die zehn besten Einträge je Spiel. Fällt ein Eintrag aus den Top 10, wird er sofort gelöscht.</p>'
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

// Beim Löschen des Plugins räumt uninstall.php alles auf.
