/**
 * Show a minimal HTML page linking to the current page.
 *
 * @title Link this
 */
(function link() {
	/* Try to get the parameter string from the bookmarklet/search query. */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s && !s.match(/^[a-zA-Z][-+.a-zA-Z0-9]*:/)) {
		s = 'http://' + s;
	}

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

	var root = document.createDocumentFragment().appendChild(document.createElement('html'));

	var metaTitleElement = document.querySelector('meta[property="og:title"], meta[property="twitter:title"], meta[name="title"]');
	var titleElement = document.querySelector('title');
	var titleText = s || (metaTitleElement && metaTitleElement.content) || (titleElement && titleElement.textContent) || document.title;
	titleText = titleText.replace(/\s\s+/g, ' ').trim() || (location + '');

	var originalIconLink = s || document.querySelector('link[rel*="icon"]');

	/* Build a basic HTML document for easy element access. */
	root.innerHTML = '<html><title></title><link rel="icon"/><style>html { font-family: "Calibri", sans-serif; } img { max-width: 32px; max-height: 32px; } textarea { width: 100%; min-height: 30ex; padding: 1ex; border: 1px dotted grey; }</style><p><img/> <span><a></a></span></p><p>Link code:<br/><textarea rows="10" cols="80"></textarea></p><script>var textarea = document.querySelector("textarea"); if (textarea) { textarea.style.height = textarea.scrollHeight + "px"; }</script></html>';
	var title = root.querySelector('title');
	var iconLink = root.querySelector('link');
	var styleSheet = root.querySelector('style');
	var iconImage = root.querySelector('img');
	var link = root.querySelector('a');
	var textarea = root.querySelector('textarea');

	/* Link to the current page using its title. */
	link.href = s || location;
	link.textContent = title.textContent = s || titleText;
	var domain = (s && link.hostname) || document.domain || location.hostname;
	if (titleText) {
		link.parentNode.insertBefore(document.createTextNode(' [' + (domain || link.hostname) + ']'), link.nextSibling);
	}

	/* Link to the current page's referrer, if available. */
	if (document.referrer) {
		var viaLink = document.createElement('a');
		viaLink.setAttribute('href', document.referrer);
		viaLink.textContent = viaLink.hostname || viaLink.href;
		link.parentNode.parentNode.appendChild(document.createTextNode(' (via '));
		link.parentNode.parentNode.appendChild(viaLink);
		link.parentNode.parentNode.appendChild(document.createTextNode(')'));
	}

	/* Make sure the favicon HREF is absolute. If there was none, use Google S2. */
	iconLink.href = iconImage.src = originalIconLink && originalIconLink.href || 'http://www.google.com/s2/favicons?domain=' + (domain || link.hostname);

	/* Show the link code in various formats. */
	textarea.textContent = 'Plain text:\n"' + link.textContent + '": ' + link.href;
	var selectedText = getActiveSelection();
	if (selectedText) {
		textarea.textContent += '\n“' + selectedText + '”';
	}

	textarea.textContent += '\n\nHTML:\n' + link.parentNode.innerHTML;

	textarea.textContent += '\n\nMarkdown:\n[' + link.textContent + '](' + link.href + ')';

	/* Try to open a data: URI. Firefox 57 and up (and probably other
	 * browsers) disallows scripts to open data: URIs, so as a fall-back,
	 * replace the original document's HTML with our generated HTML. */
	var dataUri = 'data:text/html;charset=UTF-8,' + encodeURIComponent(root.innerHTML);
	location = dataUri;
	setTimeout(function () {
		textarea.textContent += '\n\nData URI for this link page:\n' + dataUri;

		HTMLDocument.prototype.open.call(document);
		HTMLDocument.prototype.write.call(document, root.outerHTML);
		HTMLDocument.prototype.close.call(document);
	}, 250);
})();
