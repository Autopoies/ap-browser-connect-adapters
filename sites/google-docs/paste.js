(async () => {
	// Insert text at the caret through a paste event on the editor's text
	// target. Newlines become paragraph breaks; the caret's formatting applies.
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	if (!G.editorFocused()) G.fail('FOCUS_LOST', 'the document editor lost focus; nothing was changed');
	if (G.mode() !== R.mode) G.fail('MODE_NOT_SET', `document is in "${G.mode()}" mode, not "${R.mode}"; nothing was changed`);
	const target = G.editorTarget();
	const paste = (items) => {
		const data = new DataTransfer();
		for (const [type, value] of Object.entries(items)) data.setData(type, value);
		target.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
	};
	if (R.html) {
		// An HTML fragment's first block merges into the caret's paragraph, so
		// append opens a fresh paragraph first.
		if (R.newParagraph) {
			paste({ 'text/plain': '\n' });
			await G.sleep(400);
		}
		// Layout defaults Docs does not supply for pasted tables: with no
		// width the columns collapse to ~33pt (text wraps one character per
		// line), and with no border the grid is invisible. Unsized tables get
		// the full text width; fragments that never mention borders get the
		// same 1pt grid as a table inserted from the menu.
		const bordered = /border/i.test(R.text);
		const sized = R.text.replace(/<table\b([^>]*)>/gi, (tagText, attrs) => {
			let next = attrs;
			if (!/width/i.test(next)) {
				next = /style\s*=\s*"/i.test(next)
					? next.replace(/style\s*=\s*"/i, 'style="width:100%;')
					: `${next} style="width:100%"`;
			}
			if (!bordered) next = `${next} border="1"`;
			return `<table${next}>`;
		});
		paste({ 'text/html': `<meta charset="utf-8">${sized}`, 'text/plain': R.probe });
	} else {
		paste({ 'text/plain': R.text });
	}
	// Direct edits show up in the export; suggestions only in the sidebar.
	// The export endpoint is rate limited, so it is sampled sparingly.
	const deadline = Date.now() + 12000;
	let by = '';
	let nextExport = Date.now() + 1200;
	while (!by && Date.now() < deadline) {
		await G.sleep(300);
		const suggestions = G.cards().filter((c) => c.kind === 'suggestion').map((c) => c.text);
		if (JSON.stringify(suggestions) !== R.cardsBefore && suggestions.some((text) => G.squash(text).includes(R.probe.slice(0, 30)))) by = 'suggestion';
		else if (G.mode() === 'edit' && R.exportBefore !== null && Date.now() >= nextExport) {
			nextExport = Date.now() + 2500;
			const doc = await G.tryExport(G.page.tab);
			if (doc && R.occurrences(doc) > R.exportBefore) by = 'export';
		}
		// Export unavailable (throttled): accept the save round-trip instead.
		if (!by && G.mode() === 'edit' && (R.exportBefore === null || G.throttled) && R.save.dirtied && G.saved()) by = 'save_indicator';
	}
	R.result = {
		status: by ? (R.cmd === 'append' ? 'appended' : 'inserted') : 'unverified',
		verified: !!by,
		verified_by: by,
		after: R.find || '',
		chars: R.text.length,
		format: R.html ? 'html' : 'text',
		hint: by ? '' : (G.throttled ? 'Google throttled the export used for confirmation (HTTP 429). ' : '') + 'The paste was dispatched but could not be confirmed; check with `google-docs find` or `read` before retrying (a blind retry may duplicate text).',
	};
	return R.result;
})()
