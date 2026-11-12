(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	const ok = await G.waitFor(() => G.mode() === R.mode, 5000);
	return { ...G.base(), status: ok ? 'ok' : 'failed', mode: G.mode(), previous_mode: R.previous_mode };
})()
