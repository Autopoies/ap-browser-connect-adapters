(async () => {
	// After Escape (find dialog) or Select all: the editor must own focus
	// before any key or paste is sent. Also snapshot the verification baseline.
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	if (!(await G.waitFor(() => !G.dialog() && !G.openMenuItems().length && G.editorFocused(), 5000))) {
		G.fail('FOCUS_LOST', 'the document editor did not regain focus; nothing was changed');
	}
	if (R.mode && G.mode() !== R.mode) G.fail('MODE_NOT_SET', `document is in "${G.mode()}" mode, not "${R.mode}"; nothing was changed`);
	if (R.text !== undefined) {
		// Probe = the first visible line of what will be inserted.
		const plain = R.html
			? R.text.replace(/<(style|script)[\s\S]*?<\/\1>/gi, '').split(/<\/(?:p|div|h[1-6]|li|td|th|tr)>|<br\s*\/?>/i)
				.map((chunk) => chunk.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"))
			: R.text.split('\n');
		R.probe = G.squash(plain.find((line) => G.squash(line)) || '').slice(0, 60);
		if (!R.probe) G.fail('BAD_ARG', '--text has no visible text to insert');
		const occurrences = (doc) => G.squash(doc.body.textContent).split(R.probe).length - 1;
		R.occurrences = occurrences;
		// Baseline only matters for direct edits; never let a throttled
		// export block the write itself.
		const before = R.mode === 'edit' ? await G.tryExport(G.page.tab) : null;
		R.exportBefore = before ? occurrences(before) : null;
		R.save = G.watchSave();
		R.cardsBefore = JSON.stringify(G.cards().filter((c) => c.kind === 'suggestion').map((c) => c.text));
	}
	return { focused: true };
})()
