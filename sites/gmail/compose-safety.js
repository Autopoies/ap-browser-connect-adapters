(() => {
	// Shared only within this adapter batch. Reinitialize on every invocation so
	// an earlier failed send cannot leave a usable compose target behind.
	const targetNames = ['body', 'subject', 'expand', 'cc-toggle', 'bcc-toggle', 'to', 'cc', 'bcc'];
	function clearTargets() {
		for (const el of document.querySelectorAll(targetNames.map(name => `[data-apb-gmail-${name}]`).join(','))) {
			for (const attr of [...el.attributes]) {
				if (attr.name.startsWith('data-apb-gmail-')) el.removeAttribute(attr.name);
			}
		}
	}
	clearTargets();

	function visible(el) {
		if (!el?.isConnected || window.getComputedStyle(el).visibility === 'hidden') return false;
		// visibility is overridable by descendants (Gmail does this); display
		// and opacity on an ancestor are not. Do not treat them identically.
		for (let cur = el; cur?.nodeType === 1; cur = cur.parentElement) {
			const style = window.getComputedStyle(cur);
			if (cur.hidden || cur.getAttribute('aria-hidden') === 'true' ||
				style.display === 'none' || style.opacity === '0') return false;
		}
		return true;
	}

	function waitFor(predicate, timeoutMs = 10000) {
		return new Promise((resolve) => {
			let observer, interval, timeout, settled = false;
			const done = (value) => {
				if (settled) return;
				settled = true;
				observer?.disconnect();
				clearInterval(interval);
				clearTimeout(timeout);
				resolve(value);
			};
			const check = () => { const value = predicate(); if (value) done(value); };
			observer = new MutationObserver(check);
			observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
			interval = setInterval(check, 150);
			timeout = setTimeout(() => done(null), timeoutMs);
			check();
		});
	}

	function addresses(value) {
		const emails = String(value).split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).map(s => {
			const email = (s.match(/<([^<>]+)>$/)?.[1] || s).toLowerCase();
			if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(email)) {
				throw new Error('Gmail preflight: invalid or unsupported recipient address');
			}
			return email;
		});
		return [...new Set(emails)].sort();
	}

	function recipientInput(scope, kind) {
		return scope.querySelector(`div[name="${kind}"] input[role="combobox"], input[name="${kind}"], textarea[name="${kind}"]`);
	}

	function recipients(scope) {
		const result = { to: [], cc: [], bcc: [], pending: [], unclassified: [] };
		const classified = new Set();
		for (const kind of ['to', 'cc', 'bcc']) {
			const roots = scope.querySelectorAll(`div[name="${kind}"], textarea[name="${kind}"], input[name="${kind}"]`);
			for (const root of roots) {
				// Current PeopleKit chips use data-hovercard-id; older Gmail uses
				// email/data-email. Never infer a chip's address from display names.
				for (const chip of root.querySelectorAll('[data-hovercard-id], [email], [data-email]')) {
					const value = chip.getAttribute('data-hovercard-id') || chip.getAttribute('email') || chip.getAttribute('data-email');
					if (!value?.includes('@')) continue;
					result[kind].push(...addresses(value));
					classified.add(chip);
				}
				const inputs = root.matches('input, textarea') ? [root] : root.querySelectorAll('input, textarea');
				for (const input of inputs) {
					if (!(input.value || '').trim()) continue;
					if (input.type === 'hidden') result[kind].push(...addresses(input.value));
					else result.pending.push(kind);
				}
			}
			result[kind] = [...new Set(result[kind])].sort();
		}
		for (const chip of scope.querySelectorAll('[data-hovercard-id], [email], [data-email]')) {
			if (chip.closest('[contenteditable="true"]')) continue;
			const value = chip.getAttribute('data-hovercard-id') || chip.getAttribute('email') || chip.getAttribute('data-email');
			if (value?.includes('@') && !classified.has(chip)) {
				// Gmail repeats committed addresses in its collapsed recipient
				// summary after focus leaves the header. Those are not extra chips.
				const known = [...result.to, ...result.cc, ...result.bcc];
				const summary = chip.closest('.oL, .aoD');
				if (!summary || !addresses(value).every(email => known.includes(email))) result.unclassified.push(value);
			}
		}
		return result;
	}

	function bodyText(editor) {
		// Chromium inserts each subsequent line in a DIV; an empty line is
		// <div><br></div>. innerText adds an extra newline for that empty DIV,
		// while textContent loses every DIV boundary. Serialize the native-input
		// structure instead, treating a block's lone BR as its placeholder.
		function text(node) {
			if (node.nodeType === 3) return node.nodeValue || '';
			if (node.nodeName === 'BR') return '\n';
			const children = [...node.childNodes];
			if (children.length === 1 && children[0].nodeName === 'BR') return '';
			return children.map((child, index) => {
				const block = /^(DIV|P)$/.test(child.nodeName);
				// A leading BR already starts the next line; the following DIV
				// must not add another separator (e.g. "\nfirst").
				const separator = block && index > 0 && children[index - 1].nodeName !== 'BR';
				return (separator ? '\n' : '') + text(child);
			}).join('');
		}
		return text(editor).replace(/\r\n?/g, '\n');
	}

	function threadHeader() {
		const headers = [...document.querySelectorAll('h2.hP')].filter(visible);
		return headers.length === 1 ? headers[0] : null;
	}

	function stage(scope, editor, expected, result, attachmentReady) {
		if (!scope || !editor || !visible(editor)) throw new Error('Gmail preflight: compose editor is not visible');
		editor.setAttribute('data-apb-gmail-body', '');
		window.__apbGmail.pending = { scope, editor, expected, result, attachmentReady };
	}

	window.__apbGmail = { visible, waitFor, addresses, recipientInput, recipients, bodyText, threadHeader, stage, clearTargets, pending: null };
	return { status: 'preparing', sent: false };
})();
