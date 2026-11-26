<?php
/**
 * Elementor-Widget „Spielhallen-Knopf“.
 * Gleicher Knopf wie der Shortcode [mediabees_knopf], aber Look, Text, Größe und Farben lassen sich je Widget einstellen.
 * Positionieren, Abstände und Ein-/Ausblenden pro Gerät übernimmt Elementor selbst (Reiter „Erweitert“).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MBBJ_Elementor_Knopf extends \Elementor\Widget_Base {

	public function get_name() {
		return 'mbbj_knopf';
	}

	public function get_title() {
		return 'Spielhallen-Knopf';
	}

	public function get_icon() {
		return 'eicon-button';
	}

	public function get_categories() {
		return array( 'general' );
	}

	public function get_keywords() {
		return array( 'knopf', 'spielhalle', 'mediabees', 'button', 'geheim', 'arcade', 'nicht drücken' );
	}

	public function get_style_depends() {
		return array( 'mbbj-teaser' );
	}

	protected function register_controls() {
		$c = '\Elementor\Controls_Manager';

		$this->start_controls_section( 'sec_knopf', array( 'label' => 'Knopf' ) );

		$this->add_control( 'look', array(
			'label'   => 'Aussehen',
			'type'    => $c::SELECT,
			'default' => '',
			'options' => array( '' => 'Wie in den Einstellungen' ) + mbbj_knopf_styles(),
		) );

		$this->add_control( 'text_mode', array(
			'label'   => 'Beschriftung',
			'type'    => $c::SELECT,
			'default' => '',
			'options' => array(
				''       => 'Wie in den Einstellungen',
				'std'    => 'Standard',
				'custom' => 'Eigener Text',
				'none'   => 'Ohne Text',
			),
		) );

		$this->add_control( 'text', array(
			'label'       => 'Eigener Text',
			'type'        => $c::TEXT,
			'default'     => '',
			'placeholder' => 'z. B. Finger weg!',
			'condition'   => array( 'text_mode' => 'custom' ),
			'description' => 'Höchstens 28 Zeichen.',
		) );

		$this->add_control( 'size', array(
			'label'   => 'Größe',
			'type'    => $c::SELECT,
			'default' => '',
			'options' => array(
				''  => 'Wie in den Einstellungen',
				's' => 'Klein',
				'm' => 'Normal',
				'l' => 'Groß',
			),
		) );

		$this->add_responsive_control( 'align', array(
			'label'     => 'Ausrichtung',
			'type'      => $c::CHOOSE,
			'options'   => array(
				'left'   => array( 'title' => 'Links', 'icon' => 'eicon-text-align-left' ),
				'center' => array( 'title' => 'Mitte', 'icon' => 'eicon-text-align-center' ),
				'right'  => array( 'title' => 'Rechts', 'icon' => 'eicon-text-align-right' ),
			),
			'selectors' => array( '{{WRAPPER}}' => 'text-align: {{VALUE}};' ),
		) );

		$this->add_control( 'hint', array(
			'type' => $c::RAW_HTML,
			'raw'  => '<div style="line-height:1.5">Frei verschieben (px, %, für jedes Gerät): Reiter <b>Erweitert → Positionierung</b>. Ziel-Adresse, Biene und „Nicht auf diesen Seiten“ stellst du unter <b>Einstellungen → Spielhalle</b> ein.</div>',
			'content_classes' => 'elementor-descriptor',
		) );

		$this->end_controls_section();

		$this->start_controls_section( 'sec_farben', array(
			'label' => 'Farben',
			'tab'   => $c::TAB_STYLE,
		) );

		$this->add_control( 'colors', array(
			'label'   => 'Farben',
			'type'    => $c::SELECT,
			'default' => '',
			'options' => array(
				''    => 'Wie in den Einstellungen',
				'std' => 'Standardfarben',
				'own' => 'Eigene Farben',
			),
		) );

		$colors = array(
			'cap'    => array( 'Knopf', '#E5322D' ),
			'tagbg'  => array( 'Schild', '#1A1A1A' ),
			'tagfg'  => array( 'Schrift', '#FDC506' ),
			'accent' => array( 'Akzent (Streifen, Rahmen)', '#FDC506' ),
		);
		foreach ( $colors as $key => $c2 ) {
			$this->add_control( 'c_' . $key, array(
				'label'     => $c2[0],
				'type'      => $c::COLOR,
				'default'   => $c2[1],
				'alpha'     => false,
				'global'    => array( 'active' => false ),
				'condition' => array( 'colors' => 'own' ),
			) );
		}

		$this->end_controls_section();
	}

	protected function render() {
		$s      = $this->get_settings_for_display();
		$global = mbbj_teaser_settings();
		$editor = mbbj_in_builder();

		if ( ! $editor ) {
			// Hauptschalter „Knopf zeigen“ und „Nicht auf diesen Seiten“ gelten auch für das Widget.
			if ( ! $global['button'] || ! mbbj_teaser_active() ) {
				return;
			}
			mbbj_teaser_enqueue();
		}

		$over = array(
			'k_text_mode' => isset( $s['text_mode'] ) ? $s['text_mode'] : '',
			'k_text'      => isset( $s['text'] ) ? mb_substr( sanitize_text_field( $s['text'] ), 0, 28 ) : '',
			'k_size'      => isset( $s['size'] ) ? $s['size'] : '',
		);
		$mode = isset( $s['colors'] ) ? $s['colors'] : '';
		if ( 'std' === $mode ) {
			$over['k_colors'] = 0;
		} elseif ( 'own' === $mode ) {
			$over['k_colors'] = 1;
			foreach ( array( 'cap', 'tagbg', 'tagfg', 'accent' ) as $key ) {
				$hex = isset( $s[ 'c_' . $key ] ) ? sanitize_hex_color( $s[ 'c_' . $key ] ) : '';
				if ( $hex ) {
					$over[ 'k_' . $key ] = $hex;
				}
			}
		}
		$look = isset( $s['look'] ) ? sanitize_key( $s['look'] ) : '';

		echo '<span class="mbbj-k-wrap">' . mbbj_knopf_html( $look, '', $over ) . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput -- in mbbj_knopf_html escaped
	}
}
