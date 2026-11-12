(async () => {
	const G = window.__apbGdocs;
	const R = window.__apbGdocsRun;
	// The live match counter is the oracle in both modes: replaced text (or
	// text struck by a suggestion) stops matching.
	const expected = R.all ? 0 : R.count - 1;
	let selfMatching = false;
	if (R.regex) {
		try {
			selfMatching = Boolean(R.with) && new RegExp(R.find).test(R.with);
		} catch (_) {
			selfMatching = false;
		}
	} else {
		selfMatching = R.with.includes(R.find);
	}
	const after = await G.waitFor(() => {
		const c = G.matchCount();
		return c !== null && c !== R.count ? { c } : null;
	}, selfMatching ? 1500 : 6000);
	const remaining = after ? after.c : G.matchCount();
	R.result = {
		status: selfMatching ? 'unverified' : remaining === expected ? 'replaced' : 'failed',
		verified: !selfMatching && remaining === expected,
		find: R.find,
		with: R.with,
		matches_before: R.count,
		matches_after: remaining,
		replaced: selfMatching ? null : Math.max(R.count - (remaining ?? R.count), 0),
		hint: selfMatching
			? 'The replacement contains the search text, so the counter cannot confirm it; check with `google-docs find` or `read`.'
			: remaining === expected ? '' : 'The match count did not drop as expected; inspect the document before retrying.',
	};
	return R.result;
})()
