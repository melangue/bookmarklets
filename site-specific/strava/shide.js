/**
 * Hide visual pollution from the Strava feed.
 *
 * @title Hide Strava pollution
 */
(function shide() {
	var css = (function () { /*@charset "utf-8";
		.feed-entry.challenge,
		.feed-entry.suggested-follows,
		.feed .promo,
		.upsell {
			max-height: 1000vh;
			transition: all 0.2s ease-in;
		}

		.feed-entry.challenge:not(:hover),
		.feed-entry.suggested-follows:not(:hover),
		.feed .promo:not(:hover),
		.upsell:not(:hover) {
			opacity: 0.25;
			max-height: 12ex;
			overflow: hidden;
			border-top: 0.5ex solid #fc4c02;
		}

		.upsell:not(:hover) {
			max-height: 3ex;
		}
	*/;}).toString().replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '').replace(/\*\/\s*\;?\s*\}\s*$/, '').replace(/\u0025s/, '');

	document.head.appendChild(document.createElement('style')).textContent = css;
})();
