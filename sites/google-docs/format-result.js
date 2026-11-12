(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	if (R.queue.length || R.current) G.fail('INTERNAL', 'formatting queue was not drained');
	if (R.settle) await R.settle();
	const strip = R.strip || ((a) => ({ prop: a.prop, changed: a.changed, verified: a.verified }));
	const expectChange = R.done.some((a) => a.changed !== false);
	// Evidence of a change: a new/changed suggestion card (suggest mode) or a
	// different export (edit mode).
	let by = '';
	const deadline = Date.now() + (expectChange ? 12000 : 0);
	let nextExport = Date.now() + 1200;
	while (!by && Date.now() < deadline) {
		await G.sleep(300);
		if (JSON.stringify(G.cards().map((c) => c.text)) !== R.baseline.cards) by = 'suggestion';
		else if (G.mode() === 'edit' && R.baseline.html !== null && Date.now() >= nextExport) {
			nextExport = Date.now() + 2500;
			const doc = await G.tryExport(G.page.tab);
			if (doc && doc.documentElement.outerHTML !== R.baseline.html) by = 'export';
		}
		// Export unavailable (throttled): accept the save round-trip instead.
		if (!by && G.mode() === 'edit' && (R.baseline.html === null || G.throttled) && R.save.dirtied && G.saved()) by = 'save_indicator';
	}
	const saved = expectChange ? !!(await G.waitFor(() => G.saved(), 10000, 250)) : G.saved();
	return {
		...G.base(),
		status: !expectChange ? 'unchanged' : by ? 'formatted' : 'unverified',
		verified: !expectChange || !!by,
		verified_by: by,
		on: R.find,
		applied: R.done.map(strip),
		mode: G.mode(),
		previous_mode: R.previous_mode,
		saved,
		hint: !expectChange || by ? '' : (G.throttled ? 'Google throttled the export used for confirmation (HTTP 429). ' : '') + 'Formatting clicks were sent but no change was observed; inspect the document before retrying.',
	};
})()
