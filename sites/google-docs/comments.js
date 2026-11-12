(async () => {
	const G = window.__apbGdocs;
	const tab = "{{args.doc_tab}}".trim() || G.target?.tab || (G.onPage ? G.page.tab : '');
	const doc = await G.fetchExport(tab);
	// The export marks each open comment with a [a]-style reference at the
	// end of its anchor and lists the bodies in footer blocks. It carries no
	// authors; those come from the live sidebar when the document is open.
	const live = G.onPage ? G.cards() : [];
	const liveComments = live.filter((card) => card.kind === 'comment');
	const comments = [...doc.querySelectorAll('a[id^="cmnt_ref"]')].map((ref) => {
		const n = ref.id.replace('cmnt_ref', '');
		const holder = ref.closest('p, li, h1, h2, h3, h4, h5, h6, td') || ref.parentElement;
		const body = doc.getElementById(`cmnt${n}`)?.closest('div');
		const clone = body?.cloneNode(true);
		clone?.querySelector(`a[id="cmnt${n}"]`)?.remove();
		const text = G.clean(clone?.textContent || '').trim();
		const match = liveComments.find((card) => card.text === text || card.replies.some((reply) => reply.text === text));
		return {
			ref: G.squash(ref.textContent),
			context: G.squash(holder?.textContent).slice(0, 400),
			text,
			author: match ? (match.text === text ? match.author : match.replies.find((reply) => reply.text === text)?.author || '') : '',
		};
	});
	const base = G.base();
	return {
		...base,
		title: base.title || doc.title || '',
		tab,
		count: comments.length,
		comments,
		live_threads: live,
		note: G.onPage ? '' : 'Document is not open in the operated tab: authors, replies and pending suggestions (live_threads) are unavailable.',
	};
})()
