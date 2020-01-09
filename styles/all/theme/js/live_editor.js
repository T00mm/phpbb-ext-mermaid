/**
 * Mermaid Diagrams extension for phpBB.
 * @author Alfredo Ramos <alfredo.ramos@yandex.com>
 * @copyright 2019 Alfredo Ramos
 * @license GPL-2.0-only
 */

(function($) {
	'use strict';

	// The instance must already exist
	if (typeof window.mermaid === 'undefined') {
		window.mermaid.initialize({startOnLoad: false});
	}

	var $timer = null;

	// Get modal box template
	$(document.body).on('contextmenu', '.bbcode-mermaid', function($event) {
		$event.preventDefault();

		$.get('/forum/app.php/mermaid/editor', function(html) {
			$(html).appendTo('body').modal();
		});
	});

	// Generate preview
	$(document.body).on('input', '#mermaid-text', function() {
		clearTimeout($timer);

		// Helpers
		var $text = $(this).val().trim();
		var $cssClass = 'mermaid';
		var $container = $(this).parents('.' + $cssClass + '-editor').first()
			.find('.' + $cssClass + '-preview > figure').first();
		var $errors = $('.mermaid-errors').first();

		// Cleanup
		$errors.fadeOut('fast');

		// Input delay
		$timer = setTimeout(function() {
			// Reset
			if ($text.length <= 0) {
				$container.html('');
				$container.removeClass($cssClass);
				$container.removeAttr('data-processed');
				$errors.html('');
				return;
			}

			// Render diagram
			try {
				window.mermaid.mermaidAPI.render($cssClass + '-' + Date.now(), $text, function($html) {
					if ($html.length <= 0) {
						return;
					}

					// Check if already processed
					if (!$container.hasClass($cssClass)) {
						$container.addClass($cssClass);
					}

					// Add SVG code
					$container.html($html);

					// Keep attribute helper
					if ($container.html().length <= 0) {
						$container.removeAttr('data-processed');
					} else {
						$container.attr('data-processed', true);
					}
				});
			} catch ($error) {
				// Show parse errors
				if ($error && $errors.length > 0) {
					$errors.html($error);
					$errors.fadeIn('fast');

					// Reset
					$container.html('');
					$container.removeClass($cssClass);
					$container.removeAttr('data-processed');
				}
			}
		}, 250);
	});

	// Insert button
	$(document.body).on('click', '.btn-mermaid.btn-insert', function() {
		var $code = $(this).parents('.mermaid-live-editor').first()
			.find('#mermaid-text').first();
		var $svg = $(this).parents('.mermaid-live-editor').first()
			.find('.mermaid-preview > figure.mermaid').first();
		var $text = '';

		// Check if SVG was generated
		if ($code.length > 0 && $svg.length && $svg.data('processed') === true) {
			$text = $code.val().trim();

			// Prevent button spamming
			$(this).prop('disabled', true);
		}

		// Check if text is available
		if ($text <= 0) {
			return;
		}

		// Add text to message
		insert_text('[mermaid]' + $text + '[/mermaid]');
	});

	// Clear button
	$(document.body).on('click', '.btn-mermaid.btn-clear', function() {
		var $code = $(this).parents('.mermaid-live-editor').first()
			.find('#mermaid-text').first();

		// Clear textarea
		$code.val('');
		$code.trigger('input');
	});
})(jQuery);
