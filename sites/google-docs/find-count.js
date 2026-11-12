(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	const abort = (code, message) => {
		G.dialog()?.close?.click();
		G.fail(code, message);
	};
	const dialog = G.dialog();
	if (!dialog) G.fail('UI_CHANGED', 'Find and replace dialog closed unexpectedly');
	if (dialog.find.value !== R.find) abort('INPUT_MISMATCH', 'the Find field does not hold the requested text (single-line text only); nothing was changed');
	const count = await G.settledCount();
	if (count === null) abort('COUNT_UNAVAILABLE', 'the match counter never appeared; nothing was changed');
	R.count = count;
	if (R.requireMatch && count === 0) {
		abort(
			'NOT_FOUND',
			R.regex
				? 'regex pattern did not match. Matching is case-sensitive; text removed by a pending suggestion does not match'
				: 'text not found. Matching is case-sensitive and single-line by default (pass --regex true with \\n to match across paragraphs); text removed by a pending suggestion does not match'
		);
	}
	if (R.requireUnique && count > 1) abort('AMBIGUOUS', `text matches ${count} places; use a longer, unique anchor${R.cmd === 'replace' ? ' or pass --all' : ''}`);
	if (R.cmd === 'find') R.result = { status: 'ok', text: R.find, count };
	return { count };
})()
