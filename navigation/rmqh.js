/**
 * Remove the query string and hash from the current page's URL.
 *
 * This is the same as "rmhq".
 *
 * @title Remove query and hash
 */
(function rmqh() {
	var oldLocation = ('' + location);
	var newLocation = oldLocation.replace(/[#?].*/, '');

	if (newLocation !== oldLocation) {
		/* See if the user wants to replace the URL without reloading. */
		var s = (function () { /*%s*/; }).toString()
			.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
			.replace(/\*\/\s*\;?\s*\}\s*$/, '')
			.replace(/\u0025s/, '');
		if ((' ' + s + ' ').match(/ --(no|skip)-reload /)) {
			history.pushState({}, document.title, newLocation);
		} else {
			location = newLocation;
		}
	}
})();
