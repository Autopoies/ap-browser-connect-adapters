(async () => {
	// Edit menu is open. Confirm the requested mode took effect, then tag
	// "Find and replace" by its accelerator (⌘+Shift+H / Ctrl+H).
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	if (R.mode && !(await G.waitFor(() => G.mode() === R.mode, 4000))) {
		G.fail('MODE_NOT_SET', `could not switch to "${R.mode}" mode (still "${G.mode()}"); nothing was changed`);
	}
	const item = await G.waitFor(() => G.openMenuItems().find((i) => /(?:^|\+)H$/i.test(G.accel(i)) && !/alt|option|⌥/i.test(G.accel(i))), 4000);
	if (!item || G.disabled(item)) G.fail('UI_CHANGED', 'Edit menu has no usable "Find and replace" entry');
	G.tag(item);
	return { tagged: 'find-and-replace' };
})()
