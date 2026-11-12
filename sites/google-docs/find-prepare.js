(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun || {};
	const dialog = await G.waitFor(() => G.dialog(), 6000);
	if (!dialog) G.fail('UI_CHANGED', 'Find and replace dialog did not open');
	// Exact matching: anchors must not silently match a different casing.
	if (!dialog.matchCase.checked) dialog.matchCase.click();
	if (!(await G.waitFor(() => G.dialog()?.matchCase.checked, 2000))) G.fail('UI_CHANGED', 'could not enable "Match case"');
	if (R.regex) {
		if (!dialog.matchRegex) G.fail('UI_CHANGED', 'could not locate "Match using regular expressions" checkbox');
		if (!dialog.matchRegex.checked) dialog.matchRegex.click();
		if (!(await G.waitFor(() => G.dialog()?.matchRegex?.checked, 2000))) {
			G.fail('UI_CHANGED', 'could not enable "Match using regular expressions"');
		}
	} else if (dialog.matchRegex?.checked) {
		// Prevent a prior --regex run from leaking into plain text searches.
		dialog.matchRegex.click();
		if (!(await G.waitFor(() => G.dialog()?.matchRegex?.checked === false, 2000))) {
			G.fail('UI_CHANGED', 'could not disable "Match using regular expressions"');
		}
	}
	G.tag(dialog.find, 'data-apb-gdocs-find');
	G.tag(dialog.replace, 'data-apb-gdocs-replace');
	return { dialog: true };
})()
