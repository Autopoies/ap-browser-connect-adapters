(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	const posted = await G.waitFor(() =>
		!document.querySelector('.docos-draftdiscussionview-input-pane') &&
		G.cards().filter((c) => c.kind === 'comment' && G.squash(c.text) === G.squash(R.text)).length > R.threadsBefore, 8000, 200);
	R.result = {
		status: posted ? 'commented' : 'unverified',
		verified: !!posted,
		on: R.find,
		text: R.text,
		hint: posted ? '' : 'The comment thread was not observed; check `google-docs comments` before retrying (a draft may still be open).',
	};
	const saved = posted ? !!(await G.waitFor(() => G.saved(), 10000, 250)) : G.saved();
	return { ...G.base(), ...R.result, mode: G.mode(), saved };
})()
