(async () => {
	// Insert menu is open. Tag "Comment" (⌘+Option+M / Ctrl+Alt+M).
	const G = window.__apbGdocs;
	const item = await G.waitFor(() => G.openMenuItems().find((i) => /\+M$/i.test(G.accel(i)) && /alt|option|⌥/i.test(G.accel(i))), 4000);
	if (!item) G.fail('UI_CHANGED', 'Insert menu has no "Comment" entry');
	if (G.disabled(item)) G.fail('COMMENT_UNAVAILABLE', 'commenting is not available on this selection or for this account');
	G.tag(item);
	return { tagged: 'comment' };
})()
