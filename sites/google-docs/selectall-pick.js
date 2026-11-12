(async () => {
	// Edit menu is open. Tag "Select all" (⌘A / Ctrl+A); a following
	// ArrowRight collapses the selection to the end of the document.
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	if (!(await G.waitFor(() => G.mode() === R.mode, 4000))) {
		G.fail('MODE_NOT_SET', `could not switch to "${R.mode}" mode (still "${G.mode()}"); nothing was changed`);
	}
	const item = await G.waitFor(() => G.openMenuItems().find((i) => /^(?:⌘|[^+]+\+)A$/i.test(G.accel(i))), 4000);
	if (!item || G.disabled(item)) G.fail('UI_CHANGED', 'Edit menu has no usable "Select all" entry');
	G.tag(item);
	return { tagged: 'select-all' };
})()
