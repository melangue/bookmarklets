/**
 * Search the current site for the given text using the site's own search form,
 * if any.
 *
 * It first looks for an INPUT[type="search"]. If not found, it looks for
 * typical values in the INPUT attributes like "name", "id", "class", … If it
 * still could not find anything, it looks for those values in FORM attributes
 * like "id", "class", "action", …
 *
 * If no search inputs were found, it quietly logs a message to the console.
 *
 * @title Search site
 */
(function search() {
	/* Create a new IFRAME to get a "clean" Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override console.log and even
	 * the entire console object. "delete console.log" or "delete console"
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	var console = (function () {
		var iframe = document.getElementById('xxxJanConsole');
		if (!iframe) {
			iframe = document.createElement('iframe');
			iframe.id = 'xxxJanConsole';
			iframe.style.display = 'none';

			document.body.appendChild(iframe);
		}

		return iframe && iframe.contentWindow && iframe.contentWindow.console || {
			log: function () { }
		};
	})();

	/* Look for a dedicated search field. */
	var input;
	var invisibleInputs = [];
	var allSearchInputs = document.querySelectorAll('input[type="search"]');
	for (var i = 0; i < allSearchInputs.length; i++) {
		if (!allSearchInputs[i].offsetHeight) {
			console.log('Search site: found invisible dedicated search input: ', input);
			invisibleInputs.push(allSearchInputs[i]);
			continue;
		}

		input = allSearchInputs[i];
		break;
	}

	if (input) {
		console.log('Search site: found visible dedicated search input: ', input);
	}

	/* Look for common search field names. */
	if (!input) {
		var controlNames = [
			'q',
			'query',
			'search',
			's',
			'filter'
		];

		for (var i = 0; i < controlNames.length; i++) {
			input = document.querySelector('input[type="text"][name="' + controlNames[i] + '"]');

			if (input) {
				if (!input.offsetHeight) {
					console.log('Search site: found invisible search input with name "' + controlNames[i] + '": ', input);
					invisibleInputs.push(currInput);
					continue;
				}

				console.log('Search site: found visible search input with name "' + controlNames[i] + '": ', input);
				break;
			}
		}
	}

	var searchControlRegexps = [
		/(^|[_ -])(search|q(uery)?|filter|keywords?)(\S*(string|terms?|box|field))?([_ -]|$)/i,
	];

	/* Look for typical patterns in the INPUT attributes. */
	if (!input) {
		var inputAttributesToCheck = [
			'name',
			'id',
			'class',
			'placeholder',
			'title'
		];

		var allTextInputs = document.querySelectorAll('input:not([type]), input[type="text"]');

		for (var i = 0; !input && i < inputAttributesToCheck.length; i++) {
			var attributeToCheck = inputAttributesToCheck[i];

			for (var j = 0; !input && j < searchControlRegexps.length; j++) {
				var regexp = searchControlRegexps[j];

				for (var k = 0; !input && k < allTextInputs.length; k++) {
					var currInput = allTextInputs[k];

					var attributeValue = currInput.getAttribute(attributeToCheck) || '';

					if (attributeValue.match(regexp)) {
						if (!currInput.offsetHeight) {
							console.log('Search site: found invisible input with attribute ' + attributeToCheck + '="' + attributeValue + '" matching ' + regexp + ': ', input);
							invisibleInputs.push(currInput);
							continue;
						}

						input = currInput;

						console.log('Search site: found visible input with attribute ' + attributeToCheck + '="' + attributeValue + '" matching ' + regexp + ': ', input);
						break;
					}
				}
			}
		}
	}

	/* Look for typical patterns in the FORM attributes. */
	if (!input) {
		var formAttributesToCheck = [
			'action',
			'id',
			'class',
			'name',
			'title'
		];

		for (var i = 0; !input && i < formAttributesToCheck.length; i++) {
			var attributeToCheck = formAttributesToCheck[i];

			for (var j = 0; !input && j < searchControlRegexps.length; j++) {
				var regexp = searchControlRegexps[j];

				for (var k = 0; !input && k < document.forms.length; k++) {
					var currForm = document.forms[k];

					var attributeValue = currForm.getAttribute(attributeToCheck) || '';

					if (attributeValue.match(regexp)) {
						var currInput = currForm.querySelector('input:not([type]), input[type="text"]');

						if (currInput) {
							if (!currInput.offsetHeight) {
								console.log('Search site: found invisible input in search form with attribute ' + attributeToCheck + '="' + attributeValue + '" matching ' + regexp + ': ', input);
								invisibleInputs.push(currInput);
								continue;
							}

							console.log('Search site: found visible input in search form with attribute ' + attributeToCheck + '="' + attributeValue + '" matching ' + regexp + ': ', input);
							break;
						}
					}
				}
			}
		}
	}

	/* If no visible search field was found, settle for an invisible one. */
	if (!input && invisibleInputs.length) {
		input = invisibleInputs[0];
		console.log('Search site: defaulting to first invisible input found: ', input);
	}

	/* Bail out if no search field was found. */
	if (!input) {
		alert('Search site: could not find search form on the current page.');
		return;
	}

	/* Try to get the parameter string from the bookmarklet/search query.
	 * Fall back to the current text selection, if any. If those options
	 * both fail, prompt the user. */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(doc) {
		if (arguments.length === 0) {
			doc = document;
		}

		if (!doc || typeof doc.getSelection !== 'function') {
			return '';
		}

		if (!doc.activeElement) {
			return doc.getSelection() + '';
		}

		var activeElement = doc.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return doc.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (
			typeof activeElement.value === 'string'
			&& activeElement.selectionStart !== activeElement.selectionEnd
		) {
			return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
		}

		/* Get the normal selection. */
		return doc.getSelection() + '';
	}

	if (s === '') {
		s = getActiveSelection() + '' || prompt('Please enter your site search query:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	/* Fill the search field and submit the form, if a search term was given. */
	if (s) {
		/* Focus the search field. */
		input.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'center'
		});
		setTimeout(function () { input.focus(); }, 250);

		input.value = s;

		if (input.form && input.form.tagName && input.form.tagName.toLowerCase() === 'form') {
			/* Call the FORM's submit() method, but avoid conflicts with
			 * INPUTs with name="submit". */
			HTMLFormElement.prototype.submit.call(input.form);
		} else {
			/* Simulate pressing the Enter key using a variety of events. */
			var eventTypes = ['keypress', 'keyup', 'keydown'];

			/* Stop trying other event types as soon as the submission seems
			 * to be in progress. */
			var isUnloading = false;
			window.addEventListener('unload', function (event) {
				console.log('Caught unload event!');
				isUnloading = true;
			});

			/* Create and dispatch an event of the next type in the
			 * "eventTypes" array. */
			function dispatchNextEvent() {
				if (isUnloading) {
					return;
				}

				var eventType = eventTypes.shift();

				if (!eventType) {
					return;
				}

				/* Make certain Angular sites like Wikiwand update their
				 * internal copy of the search string. */
				console.log('Search site: dispatching synthetic input event');
				input.dispatchEvent(new Event('input', {}));

				/* Simulate pressing the Enter key. */
				console.log('Search site: dispatching synthetic ' + eventType + ' event');
				input.dispatchEvent(new KeyboardEvent(eventType, {
					keyCode: 13,
					charCode: 13,
					which: 13
				}));

				setTimeout(dispatchNextEvent, 250);
			}

			dispatchNextEvent();
		}
	}
})();
