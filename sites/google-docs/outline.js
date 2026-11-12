(async () => {
	const G = window.__apbGdocs;
	const tab = "{{args.doc_tab}}".trim() || G.target?.tab || (G.onPage ? G.page.tab : '');
	const doc = await G.fetchExport(tab);
	const base = G.base();
	const headings = G.blocks(doc, { md: false }).filter((b) => b.type === 'heading').map((b) => ({
		level: b.level,
		text: b.text,
		anchor: b.id,
		url: b.id ? `${base.url}${tab ? `?tab=${tab}` : ''}#heading=${b.id}` : '',
	}));
	return { ...base, title: base.title || doc.title || '', tab, count: headings.length, headings };
})()
