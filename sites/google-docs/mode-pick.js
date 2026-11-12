(async () => {
	// The mode switcher menu is open (native click). Tag the wanted mode item
	// by its icon class — labels are localized — for the next native click.
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	const ICONS = { edit: '.docs-icon-edit-20', suggest: '.docs-icon-rate-review-20', view: '.docs-icon-editors-ia-view-show' };
	const item = await G.waitFor(() => G.openMenuItems().find((i) => i.querySelector(ICONS[R.mode])), 4000);
	if (!item) G.fail('UI_CHANGED', `mode menu has no "${R.mode}" entry`);
	if (G.disabled(item)) G.fail('MODE_UNAVAILABLE', `"${R.mode}" mode is not available to this account on this document`);
	G.tag(item);
	return { tagged: R.mode };
})()
