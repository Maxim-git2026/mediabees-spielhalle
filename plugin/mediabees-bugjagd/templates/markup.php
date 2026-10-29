<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$mbbj_start   = isset( $mbbj_start ) ? (string) $mbbj_start : '';
$mbbj_privacy = function_exists( 'get_privacy_policy_url' ) ? get_privacy_policy_url() : '';
if ( ! $mbbj_privacy ) {
	$mbbj_privacy = home_url( '/datenschutzerklaerung/' );
}
?>
<section id="mb404" class="mb4" data-rest="<?php echo esc_url( rest_url( 'mb-bugjagd/v1/' ) ); ?>" data-home="<?php echo esc_url( home_url( '/' ) ); ?>" data-assets="<?php echo esc_url( plugins_url( 'assets/', MBBJ_FILE ) ); ?>" data-ver="<?php echo esc_attr( MBBJ_VERSION ); ?>"<?php echo $mbbj_start ? ' data-start-game="' . esc_attr( $mbbj_start ) . '"' : ''; ?>>
	<div class="mb4-wrap">


		<div class="mb4-arcade" hidden>
			<div class="mb4-arcade-head">
				<h2 class="mb4-h2" id="mb4-arcade-title">Spielhalle</h2>
				<p class="mb4-sub">Such dir ein Spiel aus und hol dir einen Platz in der Top 10.</p>
			</div>

			<div class="mb4-tiles" role="group" aria-labelledby="mb4-arcade-title" data-tiles></div>

			<div class="mb4-player" data-player>
				<div class="mb4-bar-top">
					<div class="mb4-now">
						<h3 class="mb4-game-title" data-game-title></h3>
						<div class="mb4-hud">
							<span><span class="mb4-hud-label">Punkte</span><span class="mb4-hud-val" data-score>0</span></span>
							<span data-time-box><span class="mb4-hud-label">Zeit</span><span class="mb4-hud-val" data-time>0</span></span>
							<span><span class="mb4-hud-label">Dein Rekord</span><span class="mb4-hud-val" data-best>0</span></span>
						</div>
					</div>
					<div class="mb4-tools">
						<button type="button" class="mb4-tool" data-help-btn><span class="mb4-tool-q" aria-hidden="true">?</span><span class="mb4-tool-txt">Anleitung</span></button>
						<button type="button" class="mb4-tool" data-pause disabled></button>
						<button type="button" class="mb4-tool" data-sound aria-pressed="false"></button>
						<button type="button" class="mb4-tool" data-fs></button>
					</div>
				</div>

				<div class="mb4-stage" data-stage tabindex="-1">
					<div class="mb4-timebar" data-bar-box aria-hidden="true"><span data-bar></span></div>
					<div class="mb4-screen" data-screen></div>
					<p class="mb4-toast" data-msg aria-hidden="true"></p>
					<div class="mb4-overlay" data-overlay>
						<div class="mb4-view" data-view="start">
							<p class="mb4-rank" data-start-title></p>
							<p class="mb4-result" data-start-text></p>
							<div class="mb4-help" data-help></div>
							<button type="button" class="mb4-btn mb4-btn--main" data-start>Spiel starten</button>
						</div>
						<div class="mb4-view" data-view="pause" hidden>
							<p class="mb4-rank">Pause</p>
							<div class="mb4-row">
								<button type="button" class="mb4-btn mb4-btn--main mb4-btn--sm" data-resume>Fortsetzen</button>
								<button type="button" class="mb4-btn mb4-btn--line mb4-btn--sm" data-restart>Neu starten</button>
							</div>
							<div class="mb4-help" data-help></div>
						</div>
						<div class="mb4-view" data-view="end" hidden>
							<p class="mb4-rank" data-rank></p>
							<p class="mb4-result" data-result></p>
							<p class="mb4-stats" data-stats></p>

							<form class="mb4-entry" data-entry hidden novalidate>
								<p class="mb4-entry-text" data-entry-text></p>
								<label class="mb4-label" for="mb4-name">Dein Spitzname</label>
								<div class="mb4-entry-row">
									<input class="mb4-input" id="mb4-name" name="name" type="text" maxlength="16" minlength="2" autocomplete="off" spellcheck="false" required aria-describedby="mb4-name-note">
									<button type="submit" class="mb4-btn mb4-btn--main" data-submit>Eintragen</button>
								</div>
								<div class="mb4-hp" aria-hidden="true">
									<label for="mb4-website">Website</label>
									<input id="mb4-website" name="website" type="text" tabindex="-1" autocomplete="off">
								</div>
								<p class="mb4-note" id="mb4-name-note">Bitte nicht deinen echten Namen, der Spitzname ist öffentlich sichtbar. <a href="<?php echo esc_url( $mbbj_privacy ); ?>">Datenschutz</a></p>
								<p class="mb4-feedback" data-feedback role="status"></p>
							</form>

							<div class="mb4-podium" data-podium-box>
								<p class="mb4-podium-h">Top 3</p>
								<ol class="mb4-list" data-podium></ol>
							</div>

							<div class="mb4-row">
								<button type="button" class="mb4-btn mb4-btn--main mb4-btn--sm" data-again>Nochmal spielen</button>
							</div>
							<a class="mb4-cta" data-cta href="<?php echo esc_url( home_url( '/kontakt/' ) ); ?>"></a>
						</div>
					</div>
				</div>
			</div>

			<div class="mb4-ranking" aria-labelledby="mb4-top-title">
				<h3 class="mb4-h3" id="mb4-top-title">Top 10 <span class="mb4-h3-game" data-top-game></span></h3>
				<ol class="mb4-list" data-list></ol>
				<p class="mb4-empty" data-empty hidden></p>
				<p class="mb4-side-note">Wie am Automaten: Die Top 10 bleiben stehen, bis jemand besser ist.</p>
			</div>
			<p class="mb4-sr" aria-live="polite" data-live></p>
		</div>

	</div>
</section>
