(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	const box = await G.waitFor(() => {
		const el = document.querySelector('.docos-draftdiscussionview-input-pane .docos-input-textarea');
		return G.shown(el) ? el : null;
	}, 6000);
	if (!box) G.fail('UI_CHANGED', 'comment draft box did not open; nothing was posted');
	R.threadsBefore = G.cards().filter((c) => c.kind === 'comment' && G.squash(c.text) === G.squash(R.text)).length;
	return { draft: true };
})()
