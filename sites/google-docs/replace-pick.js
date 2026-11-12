(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	const abort = (code, message) => {
		G.dialog()?.close?.click();
		G.fail(code, message);
	};
	const dialog = G.dialog();
	if (!dialog) G.fail('UI_CHANGED', 'Find and replace dialog closed unexpectedly');
	// Re-read everything immediately before the destructive click.
	if (dialog.find.value !== R.find || dialog.replace.value !== R.with) abort('INPUT_MISMATCH', 'dialog fields do not hold the requested text; nothing was changed');
	if ((dialog.matchRegex?.checked || false) !== !!R.regex) abort('INPUT_MISMATCH', 'dialog regex toggle does not match requested mode; nothing was changed');
	if (G.mode() !== R.mode) abort('MODE_NOT_SET', `document left "${R.mode}" mode; nothing was changed`);
	if ((await G.settledCount(3000)) !== R.count) abort('CHANGED', 'match count changed while preparing (someone else is editing); nothing was changed');
	const button = R.all ? dialog.replaceAll : dialog.replaceOne;
	if (button.disabled) abort('UI_CHANGED', 'Replace button is disabled');
	G.tag(button);
	return { tagged: R.all ? 'replace-all' : 'replace' };
})()
