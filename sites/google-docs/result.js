(async () => {
	// Final step after Escape: confirm the dialog is gone, wait for Drive to
	// acknowledge the save, and return the stored outcome.
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	await G.waitFor(() => !G.dialog(), 3000);
	const changed = ['replaced', 'inserted', 'appended', 'commented', 'unverified'].includes(R.result?.status);
	const saved = changed ? !!(await G.waitFor(() => G.saved(), 10000, 250)) : G.saved();
	return {
		...G.base(),
		...(R.result || { status: 'failed' }),
		mode: G.mode(),
		previous_mode: R.previous_mode,
		saved,
	};
})()
