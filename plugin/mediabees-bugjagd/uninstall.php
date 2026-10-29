<?php
/**
 * Wird ausgeführt, wenn das Plugin in WordPress gelöscht wird.
 * Entfernt alle Ranglisten, Einstellungen, Sperren und Spam-Zähler des Plugins,
 * damit nichts in der Datenbank zurückbleibt.
 */
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

// Ranglisten (mbbj_top_*), alte Liste aus Version 1 (mbbj_scores), Version (mbbj_version), Sperren (mbbj_lock_*).
$mbbj_patterns = array(
	$wpdb->esc_like( 'mbbj_' ) . '%',
	$wpdb->esc_like( '_transient_mbbj_' ) . '%',
	$wpdb->esc_like( '_transient_timeout_mbbj_' ) . '%',
	$wpdb->esc_like( 'external_updates-mediabees-bugjagd' ) . '%', // Zwischenspeicher der Update-Prüfung.
);
foreach ( $mbbj_patterns as $mbbj_pattern ) {
	$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $mbbj_pattern ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
}

wp_clear_scheduled_hook( 'puc_cron_check_updates-mediabees-bugjagd' );
wp_cache_flush();
